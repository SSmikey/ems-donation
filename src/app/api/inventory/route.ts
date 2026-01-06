import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { escapeRegExp } from '@/lib/utils/regex';

// Valid inventory categories
const VALID_CATEGORIES = ['อาหาร', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'น้ำดื่ม', 'อื่นๆ'];

// Validation helper function
function validateInventoryItem(data: any, isUpdate = false) {
    const errors: string[] = [];

    // Required fields for creation
    if (!isUpdate) {
        if (!data.itemName || typeof data.itemName !== 'string' || data.itemName.trim() === '') {
            errors.push('itemName is required and must be a non-empty string');
        }
        if (!data.category || typeof data.category !== 'string') {
            errors.push('category is required');
        } else if (!VALID_CATEGORIES.includes(data.category)) {
            errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
        }
        if (data.quantity === undefined || data.quantity === null) {
            errors.push('quantity is required');
        } else if (typeof data.quantity !== 'number' || data.quantity < 0) {
            errors.push('quantity must be a non-negative number');
        }
        if (!data.unit || typeof data.unit !== 'string' || data.unit.trim() === '') {
            errors.push('unit is required and must be a non-empty string');
        }
    } else {
        // For updates, validate only if fields are provided
        if (data.category && !VALID_CATEGORIES.includes(data.category)) {
            errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
        }
        if (data.quantity !== undefined && (typeof data.quantity !== 'number' || data.quantity < 0)) {
            errors.push('quantity must be a non-negative number');
        }
    }

    return errors;
}

// GET - Fetch all inventory items with optional filters
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search'); // Search by itemName
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'inventory'; // Lowercase for consistency

        // Build query filter
        const filter: any = {};
        if (category) {
            filter.category = category;
        }
        if (search) {
            // Use escapeRegExp to prevent regex injection
            filter.itemName = { $regex: escapeRegExp(search), $options: 'i' };
        }

        // Fetch items with pagination
        const items = await db.collection(collectionName)
            .find(filter)
            .sort({ lastUpdated: -1 }) // Most recently updated first
            .skip(offset)
            .limit(limit)
            .toArray();

        const total = await db.collection(collectionName).countDocuments(filter);

        console.log(`Successfully fetched ${items.length} inventory items (total: ${total})`);

        return NextResponse.json({
            success: true,
            collection: collectionName,
            count: items.length,
            total: total,
            data: items,
            pagination: {
                limit,
                offset,
                hasMore: offset + items.length < total
            }
        });
    } catch (error) {
        console.error('GET Inventory Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch inventory items',
            details: String(error)
        }, { status: 500 });
    }
}

// POST - Create new inventory item
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input data
        const validationErrors = validateInventoryItem(body, false);
        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'inventory'; // Lowercase for consistency

        // Check for duplicate item (same itemName and category)
        const existingItem = await db.collection(collectionName).findOne({
            itemName: body.itemName,
            category: body.category
        });

        if (existingItem) {
            return NextResponse.json({
                error: 'Duplicate item',
                details: `Item "${body.itemName}" in category "${body.category}" already exists. Use PUT to update quantity.`,
                existingItem: existingItem
            }, { status: 409 }); // 409 Conflict
        }

        // Prepare inventory item data
        const newItem = {
            itemName: body.itemName,
            category: body.category,
            quantity: body.quantity,
            unit: body.unit,
            lastUpdated: new Date().toISOString() // ISO 8601 format
        };

        const result = await db.collection(collectionName).insertOne(newItem);

        console.log(`Successfully created inventory item with ID: ${result.insertedId}`);

        return NextResponse.json({
            success: true,
            message: 'Inventory item created successfully',
            data: {
                _id: result.insertedId,
                ...newItem
            }
        }, { status: 201 });
    } catch (error) {
        console.error('POST Inventory Error:', error);
        return NextResponse.json({
            error: 'Failed to create inventory item',
            details: String(error)
        }, { status: 500 });
    }
}
