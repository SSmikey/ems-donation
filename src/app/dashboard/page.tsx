'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({
    shelterCount: 0,
    totalInventoryItems: 0,
    pendingRequests: 0,
    lowStockCount: 0,
    highUrgencyCount: 0,
    approvedRequests: 0,
    inTransitRequests: 0,
    totalDeliveries: 0,
    chartData: [
      { name: 'จันทร์', requests: 0 },
      { name: 'อังคาร', requests: 0 },
      { name: 'พุธ', requests: 0 },
      { name: 'พฤหัส', requests: 0 },
      { name: 'ศุกร์', requests: 0 },
    ]
  });
  const [categories, setCategories] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();

        if (data.success) {
          const { summary, inventory, chartData, distribution } = data.data;
          const byStatus = distribution?.byStatus || {};

          setStats(prev => ({
            ...prev,
            shelterCount: summary.totalShelters,
            totalInventoryItems: inventory.totalQuantity,
            pendingRequests: summary.pendingDistributions,
            lowStockCount: summary.lowStockAlerts,
            highUrgencyCount: summary.highUrgencyCount || 0,
            approvedRequests: byStatus['อนุมัติแล้ว'] || 0,
            inTransitRequests: byStatus['กำลังจัดส่ง'] || 0,
            totalDeliveries: byStatus['ส่งมอบแล้ว'] || 0,
            chartData: chartData || prev.chartData
          }));
          setCategories(inventory.byCategory || {});
        }
      } catch (error) {
        console.warn('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#ffffff', color: '#111827' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-grow-1 overflow-y-auto p-4" style={{ paddingTop: '30px', paddingBottom: '30px', backgroundColor: '#f8f9fa' }}>
          {/* Main Statistics */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#374151' }}>สถิติภาพรวม</h5>
            <div className="row g-3">
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="จำนวนศูนย์พักพิงทั้งหมด"
                  value={loading ? '...' : stats.shelterCount.toLocaleString()}
                  color="cyan"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="จำนวนพัสดุในคลังทั้งหมด"
                  value={loading ? '...' : stats.totalInventoryItems.toLocaleString()}
                  color="cyan"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="คำขอรอดำเนินการ"
                  value={loading ? '...' : stats.pendingRequests.toLocaleString()}
                  color="purple"
                />
              </div>
              <div className="col-12 col-sm-6 col-xl-3">
                <StatCard
                  title="คำขอที่มีความเร่งด่วนสูง"
                  value={loading ? '...' : stats.highUrgencyCount.toLocaleString()}
                  color="red"
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#374151' }}>จำนวนพัสดุคงคลังแยกตามหมวดหมู่</h5>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3">
              {Object.keys(categories).length > 0 ? (
                Object.entries(categories).map(([name, data]: [string, any]) => {
                  const totalQty = data.totalQuantity;
                  // Color logic: Red if low, Green if healthy, Purple/Cyan as middle, Gray for "อื่นๆ"
                  let color: 'red' | 'purple' | 'green' | 'gray' = totalQty < 100 ? 'red' : totalQty < 500 ? 'purple' : 'green';
                  if (name === 'อื่นๆ') color = 'gray';

                  const progress = (totalQty / 50000) * 100;

                  return (
                    <div key={name} className="col">
                      <StatCard
                        title={name}
                        value={totalQty.toLocaleString()}
                        color={color}
                        progress={progress}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="col-12">
                  <div className="card shadow-sm p-4 text-center text-muted" style={{ background: '#ffffff', border: '1px solid #e9ecef' }}>
                    ไม่มีข้อมูลพัสดุในหมวดหมู่
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Daily Distribution Chart - Full Width */}
          <div className="row g-3">
            <div className="col-12">
              <div className="card shadow-sm" style={{ background: '#ffffff', border: '1px solid #e9ecef' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3" style={{ fontSize: '18px', color: '#111827' }}>
                    สถิติการเบิกจ่ายรายวัน (ย้อนหลัง 7 วัน)
                  </h5>
                  <div style={{ width: '100%', height: '350px', minWidth: 0 }}>
                    {loading ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#868e96' }}>
                        กำลังโหลดข้อมูล...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" vertical={false} />
                          <XAxis
                            dataKey="name"
                            stroke="#374151"
                            tick={{ fontSize: 13, fontWeight: 500 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#374151"
                            tick={{ fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip
                            cursor={{ fill: '#f3f4f6' }}
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: 'none',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                              borderRadius: '8px',
                              color: '#212529'
                            }}
                          />
                          <Bar
                            dataKey="requests"
                            fill="#00d4ff"
                            name="จำนวนคำขอ"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
