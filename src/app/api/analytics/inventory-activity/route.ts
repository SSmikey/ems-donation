import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch inventory activity logs grouped by date and type
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '14');

        // Validate days
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

        // Fetch logs within date range
        const logs = await db.collection('inventorylogs')
            .find({
                timestamp: { $gte: startDate.toISOString() }
            })
            .toArray();

        // Group by date and type
        const activityMap = new Map();

        // Initialize all dates
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            activityMap.set(dateStr, {
                date: dateStr,
                RESERVE: 0,
                UNRESERVE: 0,
                DEDUCT: 0,
                RESTORE: 0,
                MANUAL: 0,
                total: 0
            });
        }

        // Count operations by date and type
        logs.forEach((log: any) => {
            const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
            if (activityMap.has(dateStr)) {
                const dayData = activityMap.get(dateStr);
                const logType = log.type || 'MANUAL';

                if (dayData.hasOwnProperty(logType)) {
                    dayData[logType] += 1;
                    dayData.total += 1;
                }
            }
        });

        // Convert map to array
        const activityData = Array.from(activityMap.values());

        // Calculate summary
        const summary = {
            totalOperations: logs.length,
            byType: {
                RESERVE: logs.filter((l: any) => l.type === 'RESERVE').length,
                UNRESERVE: logs.filter((l: any) => l.type === 'UNRESERVE').length,
                DEDUCT: logs.filter((l: any) => l.type === 'DEDUCT').length,
                RESTORE: logs.filter((l: any) => l.type === 'RESTORE').length,
                MANUAL: logs.filter((l: any) => l.type === 'MANUAL').length,
            }
        };

        return NextResponse.json({
            success: true,
            data: activityData,
            meta: {
                days,
                startDate: startDate.toISOString(),
                endDate: new Date().toISOString(),
                summary
            }
        });
    } catch (error) {
        console.error('Inventory Activity Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch inventory activity',
            details: String(error)
        }, { status: 500 });
    }
}
