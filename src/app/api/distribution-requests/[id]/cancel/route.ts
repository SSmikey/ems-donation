import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Valid status values
const ALLOWED_CANCEL_STATUSES = ['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง'];

// POST - Cancel distribution request and restore inventory
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid request ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        // Validate cancelledBy field
        if (!body.cancelledBy || typeof body.cancelledBy !== 'object') {
            return NextResponse.json({
                error: 'Validation failed',
                details: ['cancelledBy is required and must be a user object']
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const inventoryColl = db.collection('inventory');
        const requestsColl = db.collection('distributionrequests');
        const logsColl = db.collection('inventorylogs');

        // 1. Fetch distribution request
        const distributionRequest = await requestsColl.findOne({
            _id: new ObjectId(id)
        });

        if (!distributionRequest) {
            return NextResponse.json({
                error: 'Distribution request not found',
                details: `No distribution request found with ID: ${id}`
            }, { status: 404 });
        }

        // 2. Check if request can be cancelled
        if (!ALLOWED_CANCEL_STATUSES.includes(distributionRequest.status)) {
            return NextResponse.json({
                error: 'Cannot cancel request',
                details: `Cannot cancel requests with status '${distributionRequest.status}'. Allowed statuses: ${ALLOWED_CANCEL_STATUSES.join(', ')}`
            }, { status: 400 });
        }

        const isApproved = distributionRequest.status !== 'รอดำเนินการ';

        // 3. Process each item to restore stock or reservation
        for (const item of distributionRequest.items) {
            const invItem = await inventoryColl.findOne({ _id: new ObjectId(item.inventoryId) });
            if (!invItem) {
                console.warn(`Inventory item ${item.inventoryId} not found during cancellation. Skipping...`);
                continue;
            }

            const prevQuantity = invItem.quantity || 0;
            const prevReserved = invItem.reservedQuantity || 0;

            let newQuantity = prevQuantity;
            let newReserved = prevReserved;
            let logType: 'UNRESERVE' | 'RESTORE';

            if (isApproved) {
                // Restore physical stock (it was already deducted)
                newQuantity = prevQuantity + item.quantity;
                logType = 'RESTORE';
            } else {
                // Just unreserve (it was only reserved)
                newReserved = Math.max(0, prevReserved - item.quantity);
                logType = 'UNRESERVE';
            }

            // Update inventory
            await inventoryColl.updateOne(
                { _id: invItem._id },
                {
                    $set: {
                        quantity: newQuantity,
                        reservedQuantity: newReserved,
                        lastUpdated: new Date().toISOString()
                    }
                }
            );

            // Log the change
            await logsColl.insertOne({
                inventoryId: item.inventoryId,
                requestId: id,
                type: logType,
                changeQuantity: item.quantity,
                previousQuantity: prevQuantity,
                newQuantity: newQuantity,
                previousReservedQuantity: prevReserved,
                newReservedQuantity: newReserved,
                performedBy: {
                    userId: body.cancelledBy.userId,
                    username: body.cancelledBy.username
                },
                timestamp: new Date().toISOString(),
                note: `Request REQ-${id.slice(-4)} cancelled (Status: ${distributionRequest.status})`
            });
        }

        // 4. Update distribution request status
        await requestsColl.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'ยกเลิกแล้ว',
                    updatedAt: new Date().toISOString(),
                    cancelledBy: body.cancelledBy,
                    cancelNote: body.note || ''
                }
            }
        );

        console.log(`Successfully cancelled distribution request with ID: ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Distribution request cancelled and stock updated successfully',
            data: {
                requestId: id,
                previousStatus: distributionRequest.status,
                newStatus: 'ยกเลิกแล้ว'
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
