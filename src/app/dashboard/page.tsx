'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CriticalAlerts } from '@/components/dashboard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    shelterCount: 0,
    totalInventoryItems: 0,
    pendingRequests: 0,
    lowStockCount: 0,
    chartData: [
      { name: 'จันทร์', requests: 4 },
      { name: 'อังคาร', requests: 7 },
      { name: 'พุธ', requests: 5 },
      { name: 'พฤหัส', requests: 10 },
      { name: 'ศุกร์', requests: 6 },
    ]
  });
  const [categories, setCategories] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();

        if (data.success) {
          const { summary, inventory } = data.data;
          setStats(prev => ({
            ...prev,
            shelterCount: summary.totalShelters,
            totalInventoryItems: summary.totalInventoryItems,
            pendingRequests: summary.pendingDistributions,
            lowStockCount: summary.lowStockAlerts,
          }));
          setCategories(inventory.byCategory || {});

          // Generate alerts
          const newAlerts = [];
          if (summary.lowStockAlerts > 0) {
            newAlerts.push({
              id: 'low-stock',
              type: 'low_stock',
              severity: 'warning',
              title: `${summary.lowStockAlerts} สินค้าใกล้หมด`,
              description: 'มีสินค้าบางรายการใกล้ถึงจำนวนต่ำสุด',
              action: 'ดูรายละเอียด',
              actionUrl: '/warehouse',
            });
          }
          if (summary.pendingDistributions > 0) {
            newAlerts.push({
              id: 'pending-request',
              type: 'pending_request',
              severity: 'info',
              title: `${summary.pendingDistributions} คำขอรอดำเนินการ`,
              description: 'มีคำขอที่ยังไม่ได้อนุมัติ',
              action: 'ดูรายการ',
              actionUrl: '/distribution',
            });
          }
          setAlerts(newAlerts);
        }
      } catch (error) {
        console.warn('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleAlertAction = (id: string, action: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert?.actionUrl) {
      window.location.href = alert.actionUrl;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Donation Dashboard</h1>
            <p className="text-muted-foreground mt-1">ยินดีต้อนรับกลับมา</p>
          </div>

          {/* Critical Alerts */}
          <div className="mb-8">
            <CriticalAlerts
              alerts={alerts}
              onAction={handleAlertAction}
            />
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Shelters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">ศูนย์พักพิง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.shelterCount}</div>
                <p className="text-xs text-muted-foreground mt-1">รวมทั้งหมด</p>
              </CardContent>
            </Card>

            {/* Inventory Items */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">สินค้าในคลัง</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.totalInventoryItems}</div>
                <p className="text-xs text-muted-foreground mt-1">รายการ</p>
              </CardContent>
            </Card>

            {/* Pending Requests */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">คำขอรอดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{loading ? '...' : stats.pendingRequests}</div>
                <p className="text-xs text-muted-foreground mt-1">ต้องการอนุมัติ</p>
              </CardContent>
            </Card>

            {/* Low Stock */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">สินค้าใกล้หมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{loading ? '...' : stats.lowStockCount}</div>
                <p className="text-xs text-muted-foreground mt-1">ต้องเติมเพิ่ม</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>การกระทำด่วน</CardTitle>
                <CardDescription>ทำสิ่งที่บ่อยที่สุด</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap">
                  <Button asChild>
                    <Link href="/distribution">
                      📝 สร้างคำขอเบิก
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/quick-donation">
                      ⚡ บันทึกของเข้า
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/warehouse">
                      📦 ดูสต็อก
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/centers">
                      🏠 ศูนย์พักพิง
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Category Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Requests Chart */}
            <Card>
              <CardHeader>
                <CardTitle>สถิติการเบิกจ่ายรายวัน</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    กำลังโหลดข้อมูล...
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="requests" fill="#3b82f6" name="จำนวนคำขอ" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Category Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>รายการพัสดุแยกตามหมวดหมู่</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(categories).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(categories).map(([name, data]: [string, any]) => {
                      const totalQty = data.totalQuantity || 0;
                      const percent = Math.min(100, (totalQty / 200) * 100);
                      const color = totalQty < 20 ? 'bg-red-500' : totalQty < 50 ? 'bg-amber-500' : 'bg-green-500';

                      return (
                        <div key={name}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">{name}</span>
                            <span className="text-sm text-muted-foreground">{totalQty}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${color}`}
                              style={{ width: `${percent}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">ไม่มีข้อมูลหมวดหมู่</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
