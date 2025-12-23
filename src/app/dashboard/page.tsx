'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
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
    <div className={styles.container}>
      <Sidebar isOpen={sidebarOpen} />
      <div className={styles.mainContent}>
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className={styles.contentArea}>
          {/* Page Title */}
          <div className={styles.pageHeader}>
            <h1>Donation Dashboard</h1>
            <div className={styles.breadcrumb}>
              <span>หน้าหลัก</span>
              <span className={styles.separator}>&gt;</span>
              <span>แผงควบคุม</span>
            </div>
          </div>

          {/* Statistics Row */}
          <div className={styles.statsGrid}>
            <StatCard
              title="จำนวนศูนย์พักพิงทั้งหมด"
              value={loading ? '...' : stats.shelterCount.toLocaleString()}
              color="cyan"
            />
            <StatCard
              title="รายการสินค้าในคลัง"
              value={loading ? '...' : stats.totalInventoryItems.toLocaleString()}
              color="cyan"
            />
            <StatCard
              title="คำขอรอดำเนินการ"
              value={loading ? '...' : stats.pendingRequests.toLocaleString()}
              color="purple"
            />
            <StatCard
              title="สินค้าใกล้หมด (Low Stock)"
              value={loading ? '...' : stats.lowStockCount.toLocaleString()}
              color="red"
            />
          </div>

          {/* Resource Status and Items Section */}
          <div className={styles.socialGrid}>
            <div className={styles.customCard}>
              <h3 className={styles.cardTitle}>สถิติการเบิกจ่ายรายวัน</h3>
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
            <div className={styles.customCard}>
              <h3 className={styles.cardTitle}>รายการพัสดุแยกตามหมวดหมู่</h3>
              <div className={styles.neededItems}>
                {Object.keys(categories).length > 0 ? (
                  Object.entries(categories).map(([name, data]: [string, any]) => {
                    const totalQty = data.totalQuantity;
                    const percent = Math.min(100, (totalQty / 200) * 100);
                    const color = totalQty < 20 ? '#ef4444' : totalQty < 50 ? '#fbbf24' : '#4ade80';

                    return (
                      <div key={name} className={styles.itemRow}>
                        <span style={{ minWidth: '80px' }}>{name}</span>
                        <div className={styles.progressBase}>
                          <div className={styles.progressFill} style={{ width: `${percent}%`, backgroundColor: color }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>{totalQty}</span>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '20px' }}>ไม่มีข้อมูลหมวดหมู่</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
