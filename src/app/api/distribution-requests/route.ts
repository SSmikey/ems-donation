import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Valid status values
const VALID_STATUSES = ['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง', 'ส่งมอบแล้ว', 'ยกเลิกแล้ว'];

// Valid urgency values
const VALID_URGENCIES = ['ต่ำ', 'กลาง', 'สูง'];

// Validation helper function
function validateDistributionRequest(data: any, isUpdate = false) {
    const errors: string[] = [];

    // Required fields for creation
    if (!isUpdate) {
        if (!data.shelterId || typeof data.shelterId !== 'string' || data.shelterId.trim() === '') {
            errors.push('shelterId is required and must be a non-empty string');
        } else if (!ObjectId.isValid(data.shelterId)) {
            errors.push('shelterId must be a valid MongoDB ObjectId');
        }

        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
            errors.push('items is required and must be a non-empty array');
        } else {
            // Validate each item
            data.items.forEach((item: any, index: number) => {
                if (!item.inventoryId || typeof item.inventoryId !== 'string' || item.inventoryId.trim() === '') {
                    errors.push(`items[${index}].inventoryId is required and must be a non-empty string`);
                } else if (!ObjectId.isValid(item.inventoryId)) {
                    errors.push(`items[${index}].inventoryId must be a valid MongoDB ObjectId`);
                }
                if (!item.itemName || typeof item.itemName !== 'string' || item.itemName.trim() === '') {
                    errors.push(`items[${index}].itemName is required and must be a non-empty string`);
                }
                if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push(`items[${index}].quantity must be a positive number`);
                }
                if (!item.unit || typeof item.unit !== 'string' || item.unit.trim() === '') {
                    errors.push(`items[${index}].unit is required and must be a non-empty string`);
                }
            });
        }

        if (!data.urgency || typeof data.urgency !== 'string') {
            errors.push('urgency is required');
        } else if (!VALID_URGENCIES.includes(data.urgency)) {
            errors.push(`urgency must be one of: ${VALID_URGENCIES.join(', ')}`);
        }

        if (!data.requestBy || typeof data.requestBy !== 'object') {
            errors.push('requestBy is required and must be a user object');
        } else {
            // Validate user object fields
            if (!data.requestBy.userId || typeof data.requestBy.userId !== 'string') {
                errors.push('requestBy.userId is required');
            }
            if (!data.requestBy.username || typeof data.requestBy.username !== 'string') {
                errors.push('requestBy.username is required');
            }
            if (!data.requestBy.firstName || typeof data.requestBy.firstName !== 'string') {
                errors.push('requestBy.firstName is required');
            }
            if (!data.requestBy.lastName || typeof data.requestBy.lastName !== 'string') {
                errors.push('requestBy.lastName is required');
            }
            if (!data.requestBy.role || typeof data.requestBy.role !== 'string') {
                errors.push('requestBy.role is required');
            }
        }
    } else {
        // For updates, validate only if fields are provided
        if (data.status && !VALID_STATUSES.includes(data.status)) {
            errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
        }
        if (data.urgency && !VALID_URGENCIES.includes(data.urgency)) {
            errors.push(`urgency must be one of: ${VALID_URGENCIES.join(', ')}`);
        }
        if (data.items && (!Array.isArray(data.items) || data.items.length === 0)) {
            errors.push('items must be a non-empty array');
        }
    }

    return errors;
}

// GET - Fetch all distribution requests with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const urgency = searchParams.get('urgency');
        const shelterId = searchParams.get('shelterId');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'distributionrequests'; // Lowercase for consistency

        // Build query filter
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (urgency) {
            filter.urgency = urgency;
        }
        if (shelterId) {
            filter.shelterId = shelterId;
        }

        // Build aggregation pipeline for join with shelters
        const pipeline: any[] = [
            { $match: filter },
            {
                $addFields: {
                    // Convert string shelterId to ObjectId for join if possible
                    shelterObjId: {
                        $cond: {
                            if: { $eq: [{ $type: "$shelterId" }, "string"] },
                            then: { $toObjectId: "$shelterId" },
                            else: "$shelterId"
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'operationcenters', // Lowercase for consistency
                    localField: 'shelterObjId',
                    foreignField: '_id',
                    as: 'shelterInfo'
                }
            },
            {
                $addFields: {
                    shelterName: { $arrayElemAt: ['$shelterInfo.name', 0] }
                }
            },
            {
                $project: {
                    shelterInfo: 0,
                    shelterObjId: 0
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: offset },
            { $limit: limit }
        ];

        // Fetch requests with aggregation
        const requests = await db.collection(collectionName)
            .aggregate(pipeline)
            .toArray();

        const total = await db.collection(collectionName).countDocuments(filter);

        console.log(`Successfully fetched ${requests.length} distribution requests with shelter names (total: ${total})`);

        return NextResponse.json({
            success: true,
            collection: collectionName,
            count: requests.length,
            total: total,
            data: requests,
            pagination: {
                limit,
                offset,
                hasMore: offset + requests.length < total
            }
        });
    } catch (error) {
        console.error('GET Distribution Requests Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch distribution requests',
            details: String(error)
        }, { status: 500 });
    }
}

// POST - Create new distribution request
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input data
        const validationErrors = validateDistributionRequest(body, false);
        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'distributionrequests'; // Lowercase for consistency

        // Verify that the shelter exists
        const shelter = await db.collection('operationcenters').findOne({
            _id: new ObjectId(body.shelterId)
        });

        if (!shelter) {
            return NextResponse.json({
                error: 'Shelter not found',
                details: `No shelter found with ID: ${body.shelterId}`
            }, { status: 404 });
        }

        // Prepare distribution request data
        const newRequest = {
            shelterId: body.shelterId,
            items: body.items,
            status: 'รอดำเนินการ', // Default status
            urgency: body.urgency,
            requestBy: body.requestBy,
            approvedBy: null,
            createdAt: new Date().toISOString(), // ISO 8601 format
            updatedAt: new Date().toISOString() // ISO 8601 format
        };

        // --- Start Stock Reservation Logic ---
        const stockErrors: string[] = [];
        const inventoryColl = db.collection('inventory');
        const logsColl = db.collection('inventorylogs');

        // Check availability for each item
        for (const item of body.items) {
            const invItem = await inventoryColl.findOne({ _id: new ObjectId(item.inventoryId) });
            if (!invItem) {
                stockErrors.push(`Item "${item.itemName}" not found in inventory`);
                continue;
            }

            const available = (invItem.quantity || 0) - (invItem.reservedQuantity || 0);
            if (available < item.quantity) {
                stockErrors.push(`Insufficient stock for "${item.itemName}". Available: ${available}, Requested: ${item.quantity}`);
            }
        }

        if (stockErrors.length > 0) {
            return NextResponse.json({
                error: 'Stock reservation failed',
                details: stockErrors
            }, { status: 409 });
        }

        // Proceed to insert request and update reservedQuantity
        const result = await db.collection(collectionName).insertOne(newRequest);
        const requestId = result.insertedId;

        for (const item of body.items) {
            const invItem = await inventoryColl.findOne({ _id: new ObjectId(item.inventoryId) });
            const prevReserved = invItem.reservedQuantity || 0;
            const newReserved = prevReserved + item.quantity;

            await inventoryColl.updateOne(
                { _id: new ObjectId(item.inventoryId) },
                {
                    $set: {
                        reservedQuantity: newReserved,
                        lastUpdated: new Date().toISOString()
                    }
                }
            );

            // Log the reservation
            await logsColl.insertOne({
                inventoryId: item.inventoryId,
                requestId: requestId.toString(),
                type: 'RESERVE',
                changeQuantity: item.quantity,
                previousQuantity: invItem.quantity,
                newQuantity: invItem.quantity,
                previousReservedQuantity: prevReserved,
                newReservedQuantity: newReserved,
                performedBy: {
                    userId: body.requestBy.userId,
                    username: body.requestBy.username
                },
                timestamp: new Date().toISOString(),
                note: `Reserved for request REQ-${requestId.toString().slice(-4)}`
            });
        }
        // --- End Stock Reservation Logic ---

        console.log(`Successfully created distribution request with ID: ${requestId}`);

        return NextResponse.json({
            success: true,
            message: 'Distribution request created and stock reserved successfully',
            data: {
                _id: requestId,
                ...newRequest
            }
        }, { status: 201 });
    } catch (error) {
        console.error('POST Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to create distribution request',
            details: String(error)
        }, { status: 500 });
    }
}
