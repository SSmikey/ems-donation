import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// PUT - Update request status to "กำลังจัดส่ง" (In Transit)
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid request ID format',
                details: 'ID must be a valid MongoDB ObjectId'
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

        // 2. Check if request is in approved status
        if (distributionRequest.status !== 'อนุมัติแล้ว') {
            return NextResponse.json({
                error: 'Cannot ship request',
                details: `Can only ship requests with status 'อนุมัติแล้ว'. Current status: ${distributionRequest.status}`
            }, { status: 400 });
        }

        // 3. Update request status to "กำลังจัดส่ง"
        await db.collection('DistributionRequests').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    status: 'กำลังจัดส่ง',
                    updatedAt: new Date()
                }
            }
        );

        console.log(`Successfully updated request ${id} status to "กำลังจัดส่ง"`);

        // Fetch updated request
        const updatedRequest = await db.collection('DistributionRequests').findOne({
            _id: new ObjectId(id)
        });

        return NextResponse.json({
            success: true,
            message: 'Request status updated to "กำลังจัดส่ง" successfully',
            data: {
                request: updatedRequest
            }
        });
    } catch (error) {
        console.error('Ship Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to ship distribution request',
            details: String(error)
        }, { status: 500 });
    }
}
