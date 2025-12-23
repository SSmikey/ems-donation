import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Valid inventory categories
const VALID_CATEGORIES = ['อาหาร', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'น้ำดื่ม', 'อื่นๆ'];

// Validation helper function for updates
function validateInventoryUpdate(data: any) {
    const errors: string[] = [];

    // Validate category if provided
    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
        errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }

    // Validate quantity if provided
    if (data.quantity !== undefined && (typeof data.quantity !== 'number' || data.quantity < 0)) {
        errors.push('quantity must be a non-negative number');
    }

    // Validate itemName if provided
    if (data.itemName !== undefined && (typeof data.itemName !== 'string' || data.itemName.trim() === '')) {
        errors.push('itemName must be a non-empty string');
    }

    // Validate unit if provided
    if (data.unit !== undefined && (typeof data.unit !== 'string' || data.unit.trim() === '')) {
        errors.push('unit must be a non-empty string');
    }

    return errors;
}

// GET - Fetch single inventory item by ID
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid item ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'Inventory';

        const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

        if (!item) {
            return NextResponse.json({
                error: 'Item not found',
                details: `No inventory item found with ID: ${id}`
            }, { status: 404 });
        }

        console.log(`Successfully fetched inventory item with ID: ${id}`);

        return NextResponse.json({
            success: true,
            data: item
        });
    } catch (error) {
        console.error('GET Inventory Item Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch inventory item',
            details: String(error)
        }, { status: 500 });
    }
}

// PUT - Update inventory item by ID
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
                error: 'Invalid item ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        // Validate update data
        const validationErrors = validateInventoryUpdate(body);
        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'Inventory';

        // Prepare update data (exclude _id)
        const updateData: any = { ...body };
        delete updateData._id;
        updateData.lastUpdated = new Date();

        // Check if trying to create duplicate (if itemName or category is being changed)
        if (updateData.itemName || updateData.category) {
            const currentItem = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

            if (!currentItem) {
                return NextResponse.json({
                    error: 'Item not found',
                    details: `No inventory item found with ID: ${id}`
                }, { status: 404 });
            }

            const newItemName = updateData.itemName || currentItem.itemName;
            const newCategory = updateData.category || currentItem.category;

            // Check for duplicates (excluding current item)
            const duplicate = await db.collection(collectionName).findOne({
                itemName: newItemName,
                category: newCategory,
                _id: { $ne: new ObjectId(id) }
            });

            if (duplicate) {
                return NextResponse.json({
                    error: 'Duplicate item',
                    details: `Item "${newItemName}" in category "${newCategory}" already exists`,
                    existingItem: duplicate
                }, { status: 409 }); // 409 Conflict
            }
        }

        const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({
                error: 'Item not found',
                details: `No inventory item found with ID: ${id}`
            }, { status: 404 });
        }

        console.log(`Successfully updated inventory item with ID: ${id}`);

        // Fetch updated document
        const updatedItem = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            message: 'Inventory item updated successfully',
            data: updatedItem
        });
    } catch (error) {
        console.error('PUT Inventory Item Error:', error);
        return NextResponse.json({
            error: 'Failed to update inventory item',
            details: String(error)
        }, { status: 500 });
    }
}

// DELETE - Remove inventory item by ID
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid item ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'Inventory';

        // Check if item exists
        const item = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
        if (!item) {
            return NextResponse.json({
                error: 'Item not found',
                details: `No inventory item found with ID: ${id}`
            }, { status: 404 });
        }

        const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

        console.log(`Successfully deleted inventory item with ID: ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Inventory item deleted successfully',
            data: {
                deletedId: id,
                deletedCount: result.deletedCount,
                deletedItem: item
            }
        });
    } catch (error) {
        console.error('DELETE Inventory Item Error:', error);
        return NextResponse.json({
            error: 'Failed to delete inventory item',
            details: String(error)
        }, { status: 500 });
    }
}
