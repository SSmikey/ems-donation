import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Calculate inventory turnover rate
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '30');

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

        // Get current total inventory
        const inventoryItems = await db.collection('inventory').find({}).toArray();
        const totalInventory = inventoryItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

        // Fetch inventory logs within date range
        const logs = await db.collection('inventorylogs')
            .find({
                timestamp: { $gte: startDate.toISOString() }
            })
            .toArray();

        // Group by date
        const turnoverMap = new Map();

        // Initialize all dates
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (days - 1 - i));
            const dateStr = date.toISOString().split('T')[0];
            turnoverMap.set(dateStr, {
                date: dateStr,
                deducted: 0,
                reserved: 0,
                restored: 0,
                manual: 0
            });
        }

        // Count operations by date and type
        logs.forEach((log: any) => {
            const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
            if (turnoverMap.has(dateStr)) {
                const dayData = turnoverMap.get(dateStr);

                if (log.type === 'DEDUCT') {
                    dayData.deducted += Math.abs(log.changeQuantity);
                } else if (log.type === 'RESERVE') {
                    dayData.reserved += Math.abs(log.changeQuantity);
                } else if (log.type === 'RESTORE') {
                    dayData.restored += Math.abs(log.changeQuantity);
                } else if (log.type === 'MANUAL') {
                    dayData.manual += Math.abs(log.changeQuantity);
                }
            }
        });

        // Calculate turnover rate for each day
        const turnoverData = Array.from(turnoverMap.values()).map((dayData: any) => {
            const activity = dayData.deducted + dayData.reserved;
            const turnoverRate = totalInventory > 0 ? (activity / totalInventory) * 100 : 0;

            return {
                date: dayData.date,
                turnoverRate: parseFloat(turnoverRate.toFixed(2)),
                totalInventory,
                activity,
                deducted: dayData.deducted,
                reserved: dayData.reserved
            };
        });

        return NextResponse.json({
            success: true,
            data: turnoverData,
            meta: {
                days,
                totalInventory,
                averageTurnover: parseFloat(
                    (turnoverData.reduce((sum, d) => sum + d.turnoverRate, 0) / turnoverData.length).toFixed(2)
                )
            }
        });
    } catch (error) {
        console.error('Inventory Turnover Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to calculate inventory turnover',
            details: String(error)
        }, { status: 500 });
    }
}
