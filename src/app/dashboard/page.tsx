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
    chartData: [
      { name: 'จันทร์', requests: 4 },
      { name: 'อังคาร', requests: 7 },
      { name: 'พุธ', requests: 5 },
      { name: 'พฤหัส', requests: 10 },
      { name: 'ศุกร์', requests: 6 },
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
          const { summary, inventory } = data.data;
          setStats(prev => ({
            ...prev,
            shelterCount: summary.totalShelters,
            totalInventoryItems: summary.totalInventoryItems,
            pendingRequests: summary.pendingDistributions,
            lowStockCount: summary.lowStockAlerts,
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
    <div className="d-flex" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', color: '#ffffff' }}>
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex-grow-1 overflow-y-auto p-4" style={{ paddingTop: '30px', paddingBottom: '30px' }}>
          {/* Page Title */}
          <div className="mb-5">
            <h1 className="fw-bold" style={{ fontSize: '32px', margin: 0, marginBottom: '12px' }}>
              Donation Dashboard
            </h1>
          </div>

          {/* Statistics Row - Bootstrap Grid */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="จำนวนศูนย์พักพิงทั้งหมด"
                value={loading ? '...' : stats.shelterCount.toLocaleString()}
                color="cyan"
              />
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <StatCard
                title="รายการสินค้าในคลัง"
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
                title="สินค้าใกล้หมด (Low Stock)"
                value={loading ? '...' : stats.lowStockCount.toLocaleString()}
                color="red"
              />
            </div>
          </div>

          {/* Resource Status and Items Section */}
          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3" style={{ fontSize: '18px' }}>
                    สถิติการเบิกจ่ายรายวัน
                  </h5>
                  <div style={{ width: '100%', height: '300px', minWidth: 0 }}>
                    {loading ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        กำลังโหลดข้อมูล...
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                          <XAxis dataKey="name" stroke="#ccc" />
                          <YAxis stroke="#ccc" />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#333', border: 'none', color: '#fff' }}
                          />
                          <Bar dataKey="requests" fill="#8884d8" name="จำนวนคำขอ" />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="card shadow-sm border-0" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3" style={{ fontSize: '18px' }}>
                    รายการพัสดุแยกตามหมวดหมู่
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.keys(categories).length > 0 ? (
                      Object.entries(categories).map(([name, data]: [string, any]) => {
                        const totalQty = data.totalQuantity;
                        const percent = Math.min(100, (totalQty / 200) * 100);
                        const color = totalQty < 20 ? '#ef4444' : totalQty < 50 ? '#fbbf24' : '#4ade80';

                        return (
                          <div key={name} className="d-flex align-items-center gap-2">
                            <span style={{ minWidth: '80px', fontSize: '14px' }}>{name}</span>
                            <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${percent}%`, height: '100%', backgroundColor: color, borderRadius: '4px' }}></div>
                            </div>
                            <span style={{ width: '40px', fontSize: '14px', textAlign: 'right', opacity: 0.8 }}>{totalQty}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '20px', margin: 0 }}>
                        ไม่มีข้อมูลหมวดหมู่
                      </p>
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
