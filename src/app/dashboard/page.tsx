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
    totalInventoryValue: 0,
    pendingRequests: 0,
    lowStockCount: 0,
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch Dashboard Stats from API
        const res = await fetch('/api/dashboard/stats');
        const contentType = res.headers.get("content-type");
        
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success) {
            setStats(data.data);
            return;
          }
        }
        
        throw new Error("API not ready");
      } catch (error) {
        console.warn('Error fetching stats, using fallback:', error);
        
        // Fallback: ถ้า API stats ยังไม่เสร็จ ให้ลองดึงแค่ shelter count ไปก่อน
        try {
          const shelterRes = await fetch('/api/shelters');
          const shelterContentType = shelterRes.headers.get("content-type");
          let count = 0;
          
          if (shelterContentType && shelterContentType.includes("application/json")) {
            const shelterData = await shelterRes.json();
            count = shelterData.data ? shelterData.data.length : 0;
          }
          
          setStats(prev => ({
              ...prev,
              shelterCount: count,
              // Mock data สำหรับกราฟ เพื่อให้ UI ไม่พังถ้า API ยังไม่มา
              chartData: [
                  { name: 'จันทร์', requests: 4 },
                  { name: 'อังคาร', requests: 7 },
                  { name: 'พุธ', requests: 5 },
                  { name: 'พฤหัส', requests: 10 },
                  { name: 'ศุกร์', requests: 6 },
              ] as any
          }));
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
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
            <h1>แผงควบคุมหลัก (Donation Dashboard)</h1>
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
              percentage={stats.shelterCount > 0 ? 100 : 0}
              trend="up"
              color="cyan"
            />
            <StatCard
              title="คำขอรอดำเนินการ"
              value={loading ? '...' : stats.pendingRequests.toLocaleString()}
              percentage={stats.pendingRequests > 5 ? 80 : 20}
              trend={stats.pendingRequests > 5 ? "up" : "down"}
              color="purple"
            />
            <StatCard
              title="สินค้าใกล้หมด (Low Stock)"
              value={loading ? '...' : stats.lowStockCount.toLocaleString()}
              percentage={stats.lowStockCount > 0 ? 100 : 0}
              trend="down"
              color="red"
            />
          </div>

          {/* Resource Status and Items Section */}
          <div className={styles.socialGrid}>
            <div className={styles.customCard}>
              <h3 className={styles.cardTitle}>สถิติการเบิกจ่ายรายวัน</h3>
              <div style={{ width: '100%', height: '300px' }}>
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
              </div>
            </div>
            <div className={styles.customCard}>
              <h3 className={styles.cardTitle}>สิ่งที่ต้องการเร่งด่วน</h3>
              <div className={styles.neededItems}>
                <div className={styles.itemRow}>
                  <span>อาหาร</span>
                  <div className={styles.progressBase}><div className={styles.progressFill} style={{ width: '80%', backgroundColor: '#4ade80' }}></div></div>
                  <span>80%</span>
                </div>
                <div className={styles.itemRow}>
                  <span>ยาและเวชภัณฑ์</span>
                  <div className={styles.progressBase}><div className={styles.progressFill} style={{ width: '45%', backgroundColor: '#fbbf24' }}></div></div>
                  <span>45%</span>
                </div>
                <div className={styles.itemRow}>
                  <span>น้ำดื่ม</span>
                  <div className={styles.progressBase}><div className={styles.progressFill} style={{ width: '30%', backgroundColor: '#60a5fa' }}></div></div>
                  <span>30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
