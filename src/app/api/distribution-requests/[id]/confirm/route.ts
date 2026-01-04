import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT - Confirm delivery and cut stock
export async function PUT(
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

        // Validate confirmedBy field
        if (!body.confirmedBy || typeof body.confirmedBy !== 'string' || body.confirmedBy.trim() === '') {
            return NextResponse.json({
                error: 'Validation failed',
                details: ['confirmedBy is required and must be a non-empty string']
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');

        // 1. Check if distribution request exists
        const distributionRequest = await db.collection('DistributionRequests').findOne({
            _id: new ObjectId(id)
        });

        if (!distributionRequest) {
            return NextResponse.json({
                error: 'Distribution request not found',
                details: `No distribution request found with ID: ${id}`
            }, { status: 404 });
        }

        // 2. Check if request is in dispatching status (กำลังจัดส่ง)
        if (distributionRequest.status !== 'กำลังจัดส่ง') {
            return NextResponse.json({
                error: 'Cannot confirm delivery',
                details: `Can only confirm delivery for requests with status 'กำลังจัดส่ง'. Current status: ${distributionRequest.status}`
            }, { status: 400 });
        }

        // 3. Cut stock from inventory
        const inventoryUpdates: any[] = [];

        for (const item of distributionRequest.items) {
            // Find inventory item by name (case-insensitive)
            const inventoryItem = await db.collection('Inventory').findOne({
                itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') }
            });

            if (!inventoryItem) {
                console.warn(`Item "${item.itemName}" not found in inventory during confirmation`);
                continue;
            }

            // Validate reserved stock
            const currentReserved = inventoryItem.reserved || 0;
            if (currentReserved < item.quantity) {
                return NextResponse.json({
                    error: 'Reserved stock mismatch',
                    details: `Reserved stock for "${item.itemName}" is ${currentReserved} but trying to cut ${item.quantity}`
                }, { status: 400 });
            }

            // Update inventory: reduce total quantity and reserved
            const newQuantity = inventoryItem.quantity - item.quantity;
            const newReserved = currentReserved - item.quantity;

            await db.collection('Inventory').updateOne(
                { _id: inventoryItem._id },
                {
                    $set: {
                        quantity: newQuantity,
                        reserved: newReserved,
                        lastUpdated: new Date()
                    }
                }
            );

            // Log the cut
            await db.collection('StockLogs').insertOne({
                itemName: item.itemName,
                itemId: inventoryItem._id.toString(),
                action: 'cut',
                previousQuantity: inventoryItem.quantity,
                newQuantity: newQuantity,
                change: -item.quantity,
                relatedRequestId: id,
                performedBy: body.confirmedBy,
                notes: `Stock cut when delivery confirmed for request ${id}`,
                createdAt: new Date()
            });

            inventoryUpdates.push({
                itemName: item.itemName,
                previousQuantity: inventoryItem.quantity,
                newQuantity: newQuantity,
                previousReserved: currentReserved,
                newReserved: newReserved,
                cut: item.quantity
            });

            console.log(`Cut "${item.itemName}": quantity ${inventoryItem.quantity} → ${newQuantity}, reserved ${currentReserved} → ${newReserved}`);
        }

        // 4. Update distribution request status
        await db.collection('DistributionRequests').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'สำเร็จ',
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Successfully confirmed delivery for request with ID: ${id}`);

        // Fetch updated request
        const updatedRequest = await db.collection('DistributionRequests').findOne({
            _id: new ObjectId(id)
        });

        return NextResponse.json({
            success: true,
            message: 'Delivery confirmed successfully and stock cut',
            data: {
                request: updatedRequest,
                inventoryUpdates: inventoryUpdates
            }
        });
    } catch (error) {
        console.error('Confirm Delivery Error:', error);
        return NextResponse.json({
            error: 'Failed to confirm delivery',
            details: String(error)
        }, { status: 500 });
    }
}
