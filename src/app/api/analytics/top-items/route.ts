import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch top requested items
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');
        const days = searchParams.get('days') ? parseInt(searchParams.get('days')!) : null;

        // Validate limit
        if (limit < 1 || limit > 50) {
            return NextResponse.json({
                success: false,
                error: 'Limit parameter must be between 1 and 50'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');

        // Build match stage for date filter
        const matchStage: any = {};
        if (days) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            startDate.setHours(0, 0, 0, 0);
            matchStage.createdAt = { $gte: startDate.toISOString() };
        }

        // Aggregate top requested items
        const pipeline: any[] = [];

        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }

        pipeline.push(
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.itemName',
                    totalRequested: { $sum: '$items.quantity' },
                    requestCount: { $sum: 1 },
                    unit: { $first: '$items.unit' }
                }
            },
            { $sort: { totalRequested: -1 } },
            { $limit: limit },
            {
                $project: {
                    _id: 0,
                    itemName: '$_id',
                    totalRequested: 1,
                    requestCount: 1,
                    unit: 1
                }
            }
        );

        const topItems = await db.collection('distributionrequests')
            .aggregate(pipeline)
            .toArray();

        return NextResponse.json({
            success: true,
            data: topItems,
            meta: {
                limit,
                days: days || 'all',
                count: topItems.length
            }
        });
    } catch (error) {
        console.error('Top Items Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch top items',
            details: String(error)
        }, { status: 500 });
    }
}
