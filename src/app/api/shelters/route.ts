import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db();

        // The user specified the collection name is 'OperationCenters'
        const collectionName = 'OperationCenters';
        const shelters = await db.collection(collectionName).find({}).toArray();

        console.log(`Successfully fetched ${shelters.length} centers from ${collectionName}`);

        return NextResponse.json({
            collection: collectionName,
            count: shelters.length,
            data: shelters
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch data from OperationCenters',
            details: String(error)
        }, { status: 500 });
    }
}
