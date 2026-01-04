'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './dashboard.module.css';
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
    <div className={`d-flex min-vh-100 ${styles.dashboardContainer}`}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={`flex-grow-1 d-flex flex-column ${styles.mainContent}`}>
        <div className={`flex-grow-1 overflow-auto p-4 p-md-5 ${styles.contentArea}`}>
          {/* Page Title */}
          <div className="mb-5">
            <h1 className="fw-bold mb-3 text-white" style={{ fontSize: '32px' }}>Donation Dashboard</h1>
          </div>

          {/* Statistics Row */}
          <div className="row g-3 mb-4">
            <div className="col-lg-3 col-md-6 col-sm-12">
              <StatCard
                title="จำนวนศูนย์พักพิงทั้งหมด"
                value={loading ? '...' : stats.shelterCount.toLocaleString()}
                color="cyan"
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <StatCard
                title="รายการสินค้าในคลัง"
                value={loading ? '...' : stats.totalInventoryItems.toLocaleString()}
                color="cyan"
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <StatCard
                title="คำขอรอดำเนินการ"
                value={loading ? '...' : stats.pendingRequests.toLocaleString()}
                color="purple"
              />
            </div>
            <div className="col-lg-3 col-md-6 col-sm-12">
              <StatCard
                title="สินค้าใกล้หมด (Low Stock)"
                value={loading ? '...' : stats.lowStockCount.toLocaleString()}
                color="red"
              />
            </div>
          </div>

          {/* Resource Status and Items Section */}
          <div className="row g-3">
            <div className="col-lg-6">
              <div className={`card border-0 h-100 ${styles.customCard}`}>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold mb-4">สถิติการเบิกจ่ายรายวัน</h5>
                  <div style={{ width: '100%', height: '300px', minWidth: 0 }}>
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center h-100" style={{ color: 'rgba(255,255,255,0.5)' }}>
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
            <div className="col-lg-6">
              <div className={`card border-0 h-100 ${styles.customCard}`}>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold mb-4">รายการพัสดุแยกตามหมวดหมู่</h5>
                  <div className={styles.neededItems}>
                    {Object.keys(categories).length > 0 ? (
                      Object.entries(categories).map(([name, data]: [string, any]) => {
                        const totalQty = data.totalQuantity;
                        const percent = Math.min(100, (totalQty / 200) * 100);
                        const color = totalQty < 20 ? '#ef4444' : totalQty < 50 ? '#fbbf24' : '#4ade80';

                        return (
                          <div key={name} className={styles.itemRow}>
                            <span className="text-nowrap" style={{ minWidth: '80px' }}>{name}</span>
                            <div className={`flex-grow-1 ${styles.progressBase}`}>
                              <div className={styles.progressFill} style={{ width: `${percent}%`, backgroundColor: color }}></div>
                            </div>
                            <span className="small ms-2" style={{ opacity: 0.8 }}>{totalQty}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-center text-muted mt-3">ไม่มีข้อมูลหมวดหมู่</p>
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
