import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT - Cancel distribution request and unreserve stock
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

        // Validate required fields
        if (!body.cancelledBy || typeof body.cancelledBy !== 'string' || body.cancelledBy.trim() === '') {
            return NextResponse.json({
                error: 'Validation failed',
                details: ['cancelledBy is required and must be a non-empty string']
            }, { status: 400 });
        }

        if (!body.cancellationReason || typeof body.cancellationReason !== 'string' || body.cancellationReason.trim() === '') {
            return NextResponse.json({
                error: 'Validation failed',
                details: ['cancellationReason is required and must be a non-empty string']
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

        // 2. Check if request can be cancelled
        // Can only cancel if status is 'รอดำเนินการ' (pending) or 'อนุมัติแล้ว' (approved)
        const canBeCancelled = ['รอดำเนินการ', 'อนุมัติแล้ว'].includes(distributionRequest.status);
        if (!canBeCancelled) {
            return NextResponse.json({
                error: 'Cannot cancel request',
                details: `Can only cancel requests with status 'รอดำเนินการ' or 'อนุมัติแล้ว'. Current status: ${distributionRequest.status}`
            }, { status: 400 });
        }

        // 3. Unreserve stock from inventory
        const inventoryUpdates: any[] = [];

        for (const item of distributionRequest.items) {
            // Find inventory item by name (case-insensitive)
            const inventoryItem = await db.collection('Inventory').findOne({
                itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') }
            });

            if (!inventoryItem) {
                console.warn(`Item "${item.itemName}" not found in inventory during cancellation`);
                continue;
            }

            // Validate reserved stock
            const currentReserved = inventoryItem.reserved || 0;
            if (currentReserved < item.quantity) {
                console.warn(
                    `Reserved stock mismatch for "${item.itemName}": reserved=${currentReserved}, trying to unreserve=${item.quantity}`
                );
            }

            // Update inventory: reduce reserved
            const newReserved = Math.max(0, currentReserved - item.quantity);

            await db.collection('Inventory').updateOne(
                { _id: inventoryItem._id },
                {
                    $set: {
                        reserved: newReserved,
                        lastUpdated: new Date()
                    }
                }
            );

            // Log the unreservation
            await db.collection('StockLogs').insertOne({
                itemName: item.itemName,
                itemId: inventoryItem._id.toString(),
                action: 'unreserve',
                previousQuantity: inventoryItem.quantity,
                newQuantity: inventoryItem.quantity,
                change: 0,
                relatedRequestId: id,
                performedBy: body.cancelledBy,
                notes: `Stock unreserved when request cancelled. Reason: ${body.cancellationReason}`,
                createdAt: new Date()
            });

            inventoryUpdates.push({
                itemName: item.itemName,
                previousReserved: currentReserved,
                newReserved: newReserved,
                unreserved: Math.min(currentReserved, item.quantity)
            });

            console.log(`Unreserved "${item.itemName}": reserved ${currentReserved} → ${newReserved}`);
        }

        // 4. Update distribution request status
        const cancelledAt = new Date();
        await db.collection('DistributionRequests').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'ยกเลิก',
                    cancelledBy: body.cancelledBy,
                    cancellationReason: body.cancellationReason,
                    cancelledAt: cancelledAt,
                    updatedAt: cancelledAt
                }
            }
        );

        console.log(`Successfully cancelled distribution request with ID: ${id}`);

        // Fetch updated request
        const updatedRequest = await db.collection('DistributionRequests').findOne({
            _id: new ObjectId(id)
        });

        return NextResponse.json({
            success: true,
            message: 'Distribution request cancelled successfully and stock unreserved',
            data: {
                request: updatedRequest,
                inventoryUpdates: inventoryUpdates
            }
        });
    } catch (error) {
        console.error('Cancel Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to cancel distribution request',
            details: String(error)
        }, { status: 500 });
    }
}
