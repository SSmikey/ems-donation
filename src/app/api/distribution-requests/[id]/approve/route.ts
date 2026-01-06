import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// POST - Approve distribution request and update inventory
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid request ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        // Validate approvedBy field as user object
        if (!body.approvedBy || typeof body.approvedBy !== 'object') {
            return NextResponse.json({
                error: 'Validation failed',
                details: ['approvedBy is required and must be a user object with userId, username, firstName, lastName, role, and approvedAt fields']
            }, { status: 400 });
        }

        // Validate user object fields
        const requiredFields = ['userId', 'username', 'firstName', 'lastName', 'role', 'approvedAt'];
        const missingFields = requiredFields.filter(field => !body.approvedBy[field]);
        if (missingFields.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: [`approvedBy is missing required fields: ${missingFields.join(', ')}`]
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');

        // 1. Check if distribution request exists
        const distributionRequest = await db.collection('distributionrequests').findOne({
            _id: new ObjectId(id)
        });

        if (!distributionRequest) {
            return NextResponse.json({
                error: 'Distribution request not found',
                details: `No distribution request found with ID: ${id}`
            }, { status: 404 });
        }

        // 2. Check if request is in pending status
        if (distributionRequest.status !== 'รอดำเนินการ') {
            return NextResponse.json({
                error: 'Cannot approve request',
                details: `Can only approve requests with status 'รอดำเนินการ'. Current status: ${distributionRequest.status}`
            }, { status: 400 });
        }

        // 3. Check stock availability for all items
        const stockCheckErrors: string[] = [];
        const inventoryUpdates: any[] = [];

        for (const item of distributionRequest.items) {
            // Find inventory item by ID (direct lookup - no regex injection risk)
            if (!item.inventoryId || !ObjectId.isValid(item.inventoryId)) {
                stockCheckErrors.push(`Invalid inventory ID for item "${item.itemName}"`);
                continue;
            }

            const inventoryItem = await db.collection('inventory').findOne({
                _id: new ObjectId(item.inventoryId)
            });

            if (!inventoryItem) {
                stockCheckErrors.push(`Item "${item.itemName}" (ID: ${item.inventoryId}) not found in inventory`);
                continue;
            }

            // Check if sufficient stock
            if (inventoryItem.quantity < item.quantity) {
                stockCheckErrors.push(
                    `Insufficient stock for "${item.itemName}". Required: ${item.quantity} ${inventoryItem.unit}, Available: ${inventoryItem.quantity} ${inventoryItem.unit}`
                );
                continue;
            }

            // Store for later update
            inventoryUpdates.push({
                _id: inventoryItem._id,
                itemName: item.itemName,
                currentQuantity: inventoryItem.quantity,
                requestedQuantity: item.quantity,
                newQuantity: inventoryItem.quantity - item.quantity
            });
        }

        // 4. If there are stock errors, return them
        if (stockCheckErrors.length > 0) {
            return NextResponse.json({
                error: 'Stock availability check failed',
                details: stockCheckErrors,
                requestItems: distributionRequest.items
            }, { status: 409 }); // 409 Conflict
        }

        // 5. Update inventory quantities (reduce stock)
        for (const update of inventoryUpdates) {
            await db.collection('inventory').updateOne(
                { _id: update._id },
                {
                    $set: {
                        quantity: update.newQuantity,
                        lastUpdated: new Date().toISOString() // ISO 8601 format
                    }
                }
            );

            console.log(`Reduced "${update.itemName}" from ${update.currentQuantity} to ${update.newQuantity}`);
        }

        // 6. Update distribution request status
        const result = await db.collection('distributionrequests').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'อนุมัติแล้ว',
                    approvedBy: body.approvedBy,
                    updatedAt: new Date().toISOString() // ISO 8601 format
                }
            }
        );

        console.log(`Successfully approved distribution request with ID: ${id}`);

        // Fetch updated request
        const updatedRequest = await db.collection('distributionrequests').findOne({
            _id: new ObjectId(id)
        });

        return NextResponse.json({
            success: true,
            message: 'Distribution request approved successfully',
            data: {
                request: updatedRequest,
                inventoryUpdates: inventoryUpdates.map(u => ({
                    itemName: u.itemName,
                    previousQuantity: u.currentQuantity,
                    newQuantity: u.newQuantity,
                    reduced: u.requestedQuantity
                }))
            }
        });
    } catch (error) {
        console.error('Approve Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to approve distribution request',
            details: String(error)
        }, { status: 500 });
    }
}
