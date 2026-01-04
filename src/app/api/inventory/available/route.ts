import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch inventory with available stock calculation
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');
        const limit = parseInt(searchParams.get('limit') || '100');
        const offset = parseInt(searchParams.get('offset') || '0');

        const client = await clientPromise;
        const db = client.db('ems-donation');

        // Build filter
        const filter: any = {};
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.itemName = { $regex: search, $options: 'i' };
        }

        // Fetch inventory items
        const items = await db
            .collection('Inventory')
            .find(filter)
            .sort({ lastUpdated: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        // Add calculated available stock to each item
        const itemsWithAvailable = items.map(item => ({
            ...item,
            reserved: item.reserved || 0,
            available: item.quantity - (item.reserved || 0) // Available = Total - Reserved
        }));

        const total = await db.collection('Inventory').countDocuments(filter);

        console.log(`Fetched ${itemsWithAvailable.length} inventory items with available stock calculation (total: ${total})`);

        return NextResponse.json({
            success: true,
            count: itemsWithAvailable.length,
            total: total,
            data: itemsWithAvailable,
            pagination: {
                limit,
                offset,
                hasMore: offset + itemsWithAvailable.length < total
            }
        });
    } catch (error) {
        console.error('GET Available Inventory Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch inventory with available stock',
            details: String(error)
        }, { status: 500 });
    }
}
