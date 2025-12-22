import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Valid status values
const VALID_STATUSES = ['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง', 'ส่งมอบแล้ว'];

// Valid urgency values
const VALID_URGENCIES = ['ต่ำ', 'กลาง', 'สูง'];

// Validation helper function for updates
function validateDistributionRequestUpdate(data: any) {
    const errors: string[] = [];

    // Validate status if provided
    if (data.status && !VALID_STATUSES.includes(data.status)) {
        errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    // Validate urgency if provided
    if (data.urgency && !VALID_URGENCIES.includes(data.urgency)) {
        errors.push(`urgency must be one of: ${VALID_URGENCIES.join(', ')}`);
    }

    // Validate items if provided
    if (data.items) {
        if (!Array.isArray(data.items) || data.items.length === 0) {
            errors.push('items must be a non-empty array');
        } else {
            data.items.forEach((item: any, index: number) => {
                if (!item.itemName || typeof item.itemName !== 'string' || item.itemName.trim() === '') {
                    errors.push(`items[${index}].itemName is required and must be a non-empty string`);
                }
                if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push(`items[${index}].quantity must be a positive number`);
                }
            });
        }
    }

    return errors;
}

// GET - Fetch single distribution request by ID
export async function GET(
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
        const collectionName = 'DistributionRequests';

        const distributionRequest = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

        if (!distributionRequest) {
            return NextResponse.json({
                error: 'Distribution request not found',
                details: `No distribution request found with ID: ${id}`
            }, { status: 404 });
        }

        console.log(`Successfully fetched distribution request with ID: ${id}`);

        return NextResponse.json({
            success: true,
            data: distributionRequest
        });
    } catch (error) {
        console.error('GET Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch distribution request',
            details: String(error)
        }, { status: 500 });
    }
}

// PUT - Update distribution request by ID
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

        // Validate update data
        const validationErrors = validateDistributionRequestUpdate(body);
        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'DistributionRequests';

        // Check if request exists
        const existingRequest = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
        if (!existingRequest) {
            return NextResponse.json({
                error: 'Distribution request not found',
                details: `No distribution request found with ID: ${id}`
            }, { status: 404 });
        }

        // Prepare update data (exclude _id)
        const updateData: any = { ...body };
        delete updateData._id;
        updateData.updatedAt = new Date();

        const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        console.log(`Successfully updated distribution request with ID: ${id}`);

        // Fetch updated document
        const updatedRequest = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            message: 'Distribution request updated successfully',
            data: updatedRequest
        });
    } catch (error) {
        console.error('PUT Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to update distribution request',
            details: String(error)
        }, { status: 500 });
    }
}

// DELETE - Remove distribution request by ID
export async function DELETE(
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
        const collectionName = 'DistributionRequests';

        // Check if request exists
        const distributionRequest = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
        if (!distributionRequest) {
            return NextResponse.json({
                error: 'Distribution request not found',
                details: `No distribution request found with ID: ${id}`
            }, { status: 404 });
        }

        // Only allow deletion if status is 'รอดำเนินการ'
        if (distributionRequest.status !== 'รอดำเนินการ') {
            return NextResponse.json({
                error: 'Cannot delete request',
                details: `Can only delete requests with status 'รอดำเนินการ'. Current status: ${distributionRequest.status}`
            }, { status: 403 }); // 403 Forbidden
        }

        const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

        console.log(`Successfully deleted distribution request with ID: ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Distribution request deleted successfully',
            data: {
                deletedId: id,
                deletedCount: result.deletedCount,
                deletedRequest: distributionRequest
            }
        });
    } catch (error) {
        console.error('DELETE Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to delete distribution request',
            details: String(error)
        }, { status: 500 });
    }
}
