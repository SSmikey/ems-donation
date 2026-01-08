import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Calculate average response times for distribution requests
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30');
        const groupBy = searchParams.get('groupBy') || 'week'; // 'day' or 'week'

        // Validate parameters
        if (days < 1 || days > 365) {
            return NextResponse.json({
                success: false,
                error: 'Days parameter must be between 1 and 365'
            }, { status: 400 });
        }

        if (!['day', 'week'].includes(groupBy)) {
            return NextResponse.json({
                success: false,
                error: 'groupBy parameter must be either "day" or "week"'
            }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db('ems-donation');

        // Calculate start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Fetch approved requests within date range
        const requests = await db.collection('distributionrequests')
            .find({
                createdAt: { $gte: startDate.toISOString() },
                'approvedBy.approvedAt': { $exists: true }
            })
            .toArray();

        // Group by period
        const responseMap = new Map();

        requests.forEach((req: any) => {
            const createdAt = new Date(req.createdAt);
            const approvedAt = new Date(req.approvedBy?.approvedAt);

            // Calculate response time in hours
            const responseHours = (approvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

            // Determine period key
            let periodKey: string;
            if (groupBy === 'week') {
                const weekStart = new Date(createdAt);
                weekStart.setDate(createdAt.getDate() - createdAt.getDay());
                periodKey = weekStart.toISOString().split('T')[0];
            } else {
                periodKey = createdAt.toISOString().split('T')[0];
            }

            if (!responseMap.has(periodKey)) {
                responseMap.set(periodKey, {
                    period: periodKey,
                    responseTimes: [],
                    requestCount: 0
                });
            }

            const periodData = responseMap.get(periodKey);
            periodData.responseTimes.push(responseHours);
            periodData.requestCount += 1;
        });

        // Calculate averages
        const responseData = Array.from(responseMap.entries())
            .map(([period, data]: [string, any]) => {
                const avgResponseHours = data.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / data.responseTimes.length;

                return {
                    period,
                    avgResponseHours: parseFloat(avgResponseHours.toFixed(2)),
                    requestCount: data.requestCount,
                    minResponseHours: parseFloat(Math.min(...data.responseTimes).toFixed(2)),
                    maxResponseHours: parseFloat(Math.max(...data.responseTimes).toFixed(2))
                };
            })
            .sort((a, b) => a.period.localeCompare(b.period));

        // Calculate overall statistics
        const allResponseTimes = requests.map((req: any) => {
            const createdAt = new Date(req.createdAt);
            const approvedAt = new Date(req.approvedBy?.approvedAt);
            return (approvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        });

        const overallAvg = allResponseTimes.length > 0
            ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length
            : 0;

        return NextResponse.json({
            success: true,
            data: responseData,
            meta: {
                days,
                groupBy,
                totalApprovedRequests: requests.length,
                overallAvgResponseHours: parseFloat(overallAvg.toFixed(2)),
                targetResponseHours: 24
            }
        });
    } catch (error) {
        console.error('Response Times Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to calculate response times',
            details: String(error)
        }, { status: 500 });
    }
}
