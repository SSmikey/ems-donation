import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET - Fetch dashboard statistics
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('ems-donation');

        // Parallel queries for better performance
        const [
            inventoryItems,
            distributionRequests,
            shelters
        ] = await Promise.all([
            db.collection('inventory').find({}).toArray(),
            db.collection('distributionrequests').find({}).toArray(),
            db.collection('operationcenters').find({}).toArray()
        ]);

        // ===== INVENTORY STATISTICS =====
        const totalInventoryItems = inventoryItems.length;
        const lowStockItems = inventoryItems.filter(item => (item.quantity - (item.reservedQuantity || 0)) < 20);
        const lowStockCount = lowStockItems.length;

        // Calculate total quantity across all items
        const totalInventoryQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

        // Group inventory by category with default values
        const defaultCategories = ['อาหาร', 'ยาและเวชภัณฑ์', 'เครื่องนุ่งห่ม', 'น้ำดื่ม', 'อื่นๆ'];
        const inventoryByCategory = inventoryItems.reduce((acc: any, item) => {
            const category = item.category || 'อื่นๆ';
            if (!acc[category]) {
                acc[category] = { count: 0, totalQuantity: 0 };
            }
            acc[category].count += 1;
            acc[category].totalQuantity += item.quantity;
            return acc;
        }, defaultCategories.reduce((acc: any, cat) => {
            acc[cat] = { count: 0, totalQuantity: 0 };
            return acc;
        }, {}));

        // ===== DISTRIBUTION STATISTICS =====
        const totalDistributionRequests = distributionRequests.length;

        // Count by status
        const distributionByStatus = distributionRequests.reduce((acc: any, req) => {
            const status = req.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Pending requests (รอดำเนินการ)
        const pendingRequests = distributionRequests.filter(req => req.status === 'รอดำเนินการ');
        const pendingCount = pendingRequests.length;

        // ===== CHART DATA (Last 7 Days) =====
        const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์'];
        const chartData = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(now.getDate() - i);
            const dayName = days[d.getDay()];
            const dateStr = d.toISOString().split('T')[0];

            const count = distributionRequests.filter(req => {
                const reqDate = new Date(req.createdAt).toISOString().split('T')[0];
                return reqDate === dateStr;
            }).length;

            chartData.push({ name: dayName, requests: count });
        }

        // ===== SHELTER STATISTICS =====
        const totalShelters = shelters.length;

        // ===== RECENT ACTIVITY =====
        const recentRequests = distributionRequests
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(req => ({
                _id: req._id,
                shelterId: req.shelterId,
                status: req.status,
                urgency: req.urgency,
                itemCount: req.items?.length || 0,
                createdAt: req.createdAt
            }));

        // Count high urgency requests
        const highUrgencyCount = distributionRequests.filter(req => req.urgency === 'สูง').length;

        console.log('Successfully calculated dashboard statistics');

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                inventory: {
                    totalItems: totalInventoryItems,
                    totalQuantity: totalInventoryQuantity,
                    lowStockCount: lowStockCount,
                    byCategory: inventoryByCategory
                },
                distribution: {
                    totalRequests: totalDistributionRequests,
                    pendingCount: pendingCount,
                    highUrgencyCount: highUrgencyCount,
                    byStatus: distributionByStatus,
                    recentRequests: recentRequests
                },
                shelters: {
                    totalShelters: totalShelters
                },
                summary: {
                    totalInventoryItems: totalInventoryItems,
                    totalShelters: totalShelters,
                    pendingDistributions: pendingCount,
                    highUrgencyCount: highUrgencyCount,
                    lowStockAlerts: lowStockCount
                },
                chartData: chartData
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return NextResponse.json({
            error: 'Failed to fetch dashboard statistics',
            details: String(error)
        }, { status: 500 });
    }
}
