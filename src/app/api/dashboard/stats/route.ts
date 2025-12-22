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
            db.collection('Inventory').find({}).toArray(),
            db.collection('DistributionRequests').find({}).toArray(),
            db.collection('OperationCenters').find({}).toArray()
        ]);

        // ===== INVENTORY STATISTICS =====
        const totalInventoryItems = inventoryItems.length;
        const lowStockItems = inventoryItems.filter(item => item.quantity < 20);
        const lowStockCount = lowStockItems.length;

        // Calculate total quantity across all items
        const totalInventoryQuantity = inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

        // Group inventory by category
        const inventoryByCategory = inventoryItems.reduce((acc: any, item) => {
            const category = item.category || 'อื่นๆ';
            if (!acc[category]) {
                acc[category] = { count: 0, totalQuantity: 0 };
            }
            acc[category].count += 1;
            acc[category].totalQuantity += item.quantity;
            return acc;
        }, {});

        // ===== DISTRIBUTION STATISTICS =====
        const totalDistributionRequests = distributionRequests.length;

        // Count by status
        const distributionByStatus = distributionRequests.reduce((acc: any, req) => {
            const status = req.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Count by urgency
        const distributionByUrgency = distributionRequests.reduce((acc: any, req) => {
            const urgency = req.urgency;
            acc[urgency] = (acc[urgency] || 0) + 1;
            return acc;
        }, {});

        // Pending requests (รอดำเนินการ)
        const pendingRequests = distributionRequests.filter(req => req.status === 'รอดำเนินการ');
        const pendingCount = pendingRequests.length;

        // High urgency pending requests
        const highUrgencyPendingCount = pendingRequests.filter(req => req.urgency === 'สูง').length;

        // ===== SHELTER STATISTICS =====
        const totalShelters = shelters.length;

        // Count by capacity status
        const sheltersByCapacity = shelters.reduce((acc: any, shelter) => {
            const status = shelter.capacityStatus;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Total capacity
        const totalCapacity = shelters.reduce((sum, shelter) => {
            return sum + (shelter.capacity || 0);
        }, 0);

        // ===== RECENT ACTIVITY =====
        // Get recent distribution requests (last 5)
        const recentRequests = distributionRequests
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
            .map(req => ({
                _id: req._id,
                shelterId: req.shelterId,
                status: req.status,
                urgency: req.urgency,
                itemCount: req.items.length,
                createdAt: req.createdAt
            }));

        console.log('Successfully calculated dashboard statistics');

        // Return comprehensive statistics
        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: {
                inventory: {
                    totalItems: totalInventoryItems,
                    totalQuantity: totalInventoryQuantity,
                    lowStockCount: lowStockCount,
                    lowStockItems: lowStockItems.map(item => ({
                        _id: item._id,
                        itemName: item.itemName,
                        category: item.category,
                        quantity: item.quantity,
                        unit: item.unit
                    })),
                    byCategory: inventoryByCategory
                },
                distribution: {
                    totalRequests: totalDistributionRequests,
                    pendingCount: pendingCount,
                    highUrgencyPendingCount: highUrgencyPendingCount,
                    byStatus: distributionByStatus,
                    byUrgency: distributionByUrgency,
                    recentRequests: recentRequests
                },
                shelters: {
                    totalShelters: totalShelters,
                    totalCapacity: totalCapacity,
                    byCapacityStatus: sheltersByCapacity
                },
                summary: {
                    // Quick overview numbers
                    totalInventoryItems: totalInventoryItems,
                    totalShelters: totalShelters,
                    pendingDistributions: pendingCount,
                    lowStockAlerts: lowStockCount
                }
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
