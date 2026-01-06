import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Validation helper function
function validateShelterData(data: any, isUpdate = false) {
    const errors: string[] = [];

    // Required fields for creation
    if (!isUpdate) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('name is required and must be a non-empty string');
        }
        if (!data.district || typeof data.district !== 'string') {
            errors.push('district is required');
        }
        if (!data.subdistrict || typeof data.subdistrict !== 'string') {
            errors.push('subdistrict is required');
        }
        if (!data.shelterType || typeof data.shelterType !== 'string') {
            errors.push('shelterType is required');
        }
        if (!data.capacityStatus || typeof data.capacityStatus !== 'string') {
            errors.push('capacityStatus is required');
        }
    }

    // Validate phone numbers if provided
    if (data.phoneNumbers) {
        if (!Array.isArray(data.phoneNumbers)) {
            errors.push('phoneNumbers must be an array');
        }
    }

    // Validate responsible if provided
    if (data.responsible) {
        if (!Array.isArray(data.responsible)) {
            errors.push('responsible must be an array');
        }
    }

    // Validate capacity if provided
    if (data.capacity !== undefined && data.capacity !== null) {
        if (typeof data.capacity !== 'number' || data.capacity < 0) {
            errors.push('capacity must be a positive number');
        }
    }

    return errors;
}

// GET - Fetch all shelters
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'operationcenters'; // Lowercase for consistency

        const shelters = await db.collection(collectionName).find({}).toArray();

        console.log(`Successfully fetched ${shelters.length} centers from ${collectionName}`);

        return NextResponse.json({
            success: true,
            collection: collectionName,
            count: shelters.length,
            data: shelters
        });
    } catch (error) {
        console.error('GET Shelters Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch shelters',
            details: String(error)
        }, { status: 500 });
    }
}

// POST - Create new shelter
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input data
        const validationErrors = validateShelterData(body, false);
        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'OperationCenters';

        // Prepare shelter data
        const newShelter = {
            name: body.name,
            district: body.district,
            subdistrict: body.subdistrict,
            shelterType: body.shelterType,
            capacityStatus: body.capacityStatus,
            capacity: body.capacity || null,
            description: body.description || null,
            phoneNumbers: body.phoneNumbers || [],
            responsible: body.responsible || [],
            status: body.status || 'active',
            location: body.location || null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: body.createdBy || 'system'
        };

        const result = await db.collection(collectionName).insertOne(newShelter);

        console.log(`Successfully created shelter with ID: ${result.insertedId}`);

        return NextResponse.json({
            success: true,
            message: 'Shelter created successfully',
            data: {
                _id: result.insertedId,
                ...newShelter
            }
        }, { status: 201 });
    } catch (error) {
        console.error('POST Shelter Error:', error);
        return NextResponse.json({
            error: 'Failed to create shelter',
            details: String(error)
        }, { status: 500 });
    }
}

// PUT - Update existing shelter
export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id') || body._id;

        if (!id) {
            return NextResponse.json({
                error: 'Shelter ID is required',
                details: 'Provide id as query parameter or in request body'
            }, { status: 400 });
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid shelter ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        // Validate update data
        const validationErrors = validateShelterData(body, true);
        if (validationErrors.length > 0) {
            return NextResponse.json({
                error: 'Validation failed',
                details: validationErrors
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'OperationCenters';

        // Prepare update data (exclude _id)
        const updateData: any = { ...body };
        delete updateData._id;
        updateData.updatedAt = new Date().toISOString();

        const result = await db.collection(collectionName).updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({
                error: 'Shelter not found',
                details: `No shelter found with ID: ${id}`
            }, { status: 404 });
        }

        console.log(`Successfully updated shelter with ID: ${id}`);

        // Fetch updated document
        const updatedShelter = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });

        return NextResponse.json({
            success: true,
            message: 'Shelter updated successfully',
            data: updatedShelter
        });
    } catch (error) {
        console.error('PUT Shelter Error:', error);
        return NextResponse.json({
            error: 'Failed to update shelter',
            details: String(error)
        }, { status: 500 });
    }
}

// DELETE - Remove shelter
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({
                error: 'Shelter ID is required',
                details: 'Provide id as query parameter'
            }, { status: 400 });
        }

        // Validate ObjectId format
        if (!ObjectId.isValid(id)) {
            return NextResponse.json({
                error: 'Invalid shelter ID format',
                details: 'ID must be a valid MongoDB ObjectId'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');
        const collectionName = 'OperationCenters';

        // Check if shelter exists
        const shelter = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
        if (!shelter) {
            return NextResponse.json({
                error: 'Shelter not found',
                details: `No shelter found with ID: ${id}`
            }, { status: 404 });
        }

        const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(id) });

        console.log(`Successfully deleted shelter with ID: ${id}`);

        return NextResponse.json({
            success: true,
            message: 'Shelter deleted successfully',
            data: {
                deletedId: id,
                deletedCount: result.deletedCount
            }
        });
    } catch (error) {
        console.error('DELETE Shelter Error:', error);
        return NextResponse.json({
            error: 'Failed to delete shelter',
            details: String(error)
        }, { status: 500 });
    }
}
