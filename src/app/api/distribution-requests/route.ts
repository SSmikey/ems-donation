import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Valid status values
const VALID_STATUSES = ['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง', 'ส่งมอบแล้ว'];

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
                if (!item.itemName || typeof item.itemName !== 'string' || item.itemName.trim() === '') {
                    errors.push(`items[${index}].itemName is required and must be a non-empty string`);
                }
                if (item.quantity === undefined || typeof item.quantity !== 'number' || item.quantity <= 0) {
                    errors.push(`items[${index}].quantity must be a positive number`);
                }
            });
        }

        if (!data.urgency || typeof data.urgency !== 'string') {
            errors.push('urgency is required');
        } else if (!VALID_URGENCIES.includes(data.urgency)) {
            errors.push(`urgency must be one of: ${VALID_URGENCIES.join(', ')}`);
        }

        if (!data.requestBy || typeof data.requestBy !== 'string' || data.requestBy.trim() === '') {
            errors.push('requestBy is required and must be a non-empty string');
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
        const collectionName = 'DistributionRequests';

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
                    from: 'OperationCenters',
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
        const collectionName = 'DistributionRequests';

        // Verify that the shelter exists
        const shelter = await db.collection('OperationCenters').findOne({
            _id: new ObjectId(body.shelterId)
        });

        if (!shelter) {
            return NextResponse.json({
                error: 'Shelter not found',
                details: `No shelter found with ID: ${body.shelterId}`
            }, { status: 404 });
        }

        // Generate request number (R2501030001 format)
        const { RequestNumberGenerator } = await import('@/lib/utils/requestNumberGenerator');
        const generator = new RequestNumberGenerator(db);
        const requestNo = await generator.generateRequestNo();

        // Prepare items with itemId and reserved timestamps
        const itemsWithIds = body.items.map((item: any) => ({
            itemId: item.itemId || '',
            itemName: item.itemName,
            quantity: item.quantity,
            reservedAt: new Date(),
            releasedAt: undefined,
            deductedAt: undefined,
        }));

        // Prepare distribution request data
        const newRequest = {
            requestNo, // 🆕 NEW
            shelterId: body.shelterId,
            items: itemsWithIds,
            status: 'pending', // Changed to English
            urgency: body.urgency || 'medium',
            requestBy: body.requestBy,
            approvedBy: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection(collectionName).insertOne(newRequest);

        // Reserve stock for all items
        const { StockService } = await import('@/services/stockService');
        const stockService = new StockService(db);

        for (const item of itemsWithIds) {
            try {
                await stockService.reserveStock(
                    item.itemId,
                    item.quantity,
                    result.insertedId.toString(),
                    body.requestBy
                );
            } catch (error) {
                console.error(`Failed to reserve stock for item ${item.itemId}:`, error);
                // Continue with other items
            }
        }

        console.log(`Successfully created distribution request with ID: ${result.insertedId}, RequestNo: ${requestNo}`);

        return NextResponse.json({
            success: true,
            message: 'Distribution request created successfully',
            data: {
                _id: result.insertedId,
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
