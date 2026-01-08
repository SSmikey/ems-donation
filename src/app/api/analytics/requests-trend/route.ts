import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch distribution requests trend by day with urgency breakdown
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30');

        // Validate days parameter
        if (days < 1 || days > 365) {
            return NextResponse.json({
                success: false,
                error: 'Days parameter must be between 1 and 365'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');

        // Calculate start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Fetch requests within date range
        const requests = await db.collection('distributionrequests')
            .find({
                createdAt: { $gte: startDate.toISOString() }
            })
            .toArray();

        // Group by date and urgency
        const trendMap = new Map();

        // Initialize all dates with zero counts
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            trendMap.set(dateStr, { date: dateStr, high: 0, medium: 0, low: 0, total: 0 });
        }

        // Count requests by date and urgency
        requests.forEach((req: any) => {
            const dateStr = new Date(req.createdAt).toISOString().split('T')[0];
            if (trendMap.has(dateStr)) {
                const dayData = trendMap.get(dateStr);
                dayData.total += 1;

                if (req.urgency === 'สูง') {
                    dayData.high += 1;
                } else if (req.urgency === 'กลาง') {
                    dayData.medium += 1;
                } else if (req.urgency === 'ต่ำ') {
                    dayData.low += 1;
                }
            }
        });

        // Convert map to array
        const trendData = Array.from(trendMap.values());

        return NextResponse.json({
            success: true,
            data: trendData,
            meta: {
                days,
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
                totalRequests: requests.length
            }
        });
    } catch (error) {
        console.error('Requests Trend Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch requests trend',
            details: String(error)
        }, { status: 500 });
    }
}
