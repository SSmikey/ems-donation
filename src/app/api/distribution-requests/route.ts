import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Valid status values
const VALID_STATUSES = ['รอดำเนินการ', 'อนุมัติแล้ว', 'กำลังจัดส่ง', 'สำเร็จ', 'ยกเลิก'];

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

// POST - Create new distribution request and reserve stock
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

        // STEP 1: Check stock availability (not reserved stock) for all items
        const stockCheckErrors: string[] = [];
        const inventoryUpdates: any[] = [];

        for (const item of body.items) {
            // Find inventory item by name (case-insensitive)
            const inventoryItem = await db.collection('Inventory').findOne({
                itemName: { $regex: new RegExp(`^${item.itemName}$`, 'i') }
            });

            if (!inventoryItem) {
                stockCheckErrors.push(`Item "${item.itemName}" not found in inventory`);
                continue;
            }

            // Check if sufficient available stock (quantity - reserved)
            const availableStock = inventoryItem.quantity - (inventoryItem.reserved || 0);
            if (availableStock < item.quantity) {
                stockCheckErrors.push(
                    `Insufficient available stock for "${item.itemName}". Required: ${item.quantity} ${inventoryItem.unit}, Available: ${availableStock} ${inventoryItem.unit} (Total: ${inventoryItem.quantity}, Reserved: ${inventoryItem.reserved || 0})`
                );
                continue;
            }

            // Store for later update (reserve stock)
            inventoryUpdates.push({
                _id: inventoryItem._id,
                itemName: item.itemName,
                currentQuantity: inventoryItem.quantity,
                currentReserved: inventoryItem.reserved || 0,
                requestedQuantity: item.quantity,
                newReserved: (inventoryItem.reserved || 0) + item.quantity
            });
        }

        // If there are stock errors, return them
        if (stockCheckErrors.length > 0) {
            return NextResponse.json({
                error: 'Stock availability check failed',
                details: stockCheckErrors,
                requestItems: body.items
            }, { status: 409 }); // 409 Conflict
        }

        // STEP 2: Reserve stock for all items
        for (const update of inventoryUpdates) {
            await db.collection('Inventory').updateOne(
                { _id: update._id },
                {
                    $set: {
                        reserved: update.newReserved,
                        lastUpdated: new Date()
                    }
                }
            );

            // Log the reservation
            await db.collection('StockLogs').insertOne({
                itemName: update.itemName,
                itemId: update._id.toString(),
                action: 'reserve',
                previousQuantity: update.currentQuantity,
                currentReserved: update.currentReserved,
                newReserved: update.newReserved,
                change: update.requestedQuantity,
                performedBy: body.requestBy,
                notes: `Reserved for distribution request (will be created)`,
                createdAt: new Date()
            });

            console.log(`Reserved "${update.itemName}": ${update.currentReserved} → ${update.newReserved}`);
        }

        // STEP 3: Create distribution request
        const newRequest = {
            shelterId: body.shelterId,
            items: body.items,
            status: 'รอดำเนินการ', // Default status
            urgency: body.urgency,
            requestBy: body.requestBy,
            approvedBy: null,
            cancelledBy: null,
            cancellationReason: null,
            cancelledAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection(collectionName).insertOne(newRequest);

        console.log(`Successfully created distribution request with ID: ${result.insertedId} (stock reserved for ${body.items.length} items)`);

        return NextResponse.json({
            success: true,
            message: 'Distribution request created successfully and stock reserved',
            data: {
                _id: result.insertedId,
                ...newRequest
            },
            stockReservations: inventoryUpdates.map(u => ({
                itemName: u.itemName,
                reserved: u.requestedQuantity,
                totalReserved: u.newReserved,
                available: u.currentQuantity - u.newReserved
            }))
        }, { status: 201 });
    } catch (error) {
        console.error('POST Distribution Request Error:', error);
        return NextResponse.json({
            error: 'Failed to create distribution request',
            details: String(error)
        }, { status: 500 });
    }
}
