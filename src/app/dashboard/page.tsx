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
                  color="blue"
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

          {/* Items by Category as StatCards */}
          <div className="mb-4">
            <h5 className="fw-bold mb-3" style={{ color: '#374151' }}>จำนวนพัสดุคงคลังแยกตามหมวดหมู่</h5>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-3">
              {Object.keys(categories).length > 0 ? (
                Object.entries(categories).map(([name, data]: [string, any]) => {
                  const totalQty = data.totalQuantity;

                  // Map specific colors to categories for consistency and variety
                  const categoryColorMap: any = {
                    'อาหาร': 'green',
                    'ยาและเวชภัณฑ์': 'orange',
                    'เครื่องนุ่งห่ม': 'pink',
                    'น้ำดื่ม': 'indigo',
                    'อื่นๆ': 'gray'
                  };

                  const color = categoryColorMap[name] || 'cyan';
                  const progress = (totalQty / 50000) * 100;

                  return (
                    <div key={name} className="col">
                      <StatCard
                        title={name}
                        value={totalQty.toLocaleString()}
                        color={color as any}
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

        </div>
      </div>
    </div>
  );
}
