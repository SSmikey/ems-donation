'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import RecentUsersCard from '@/components/RecentUsersCard';
import RatingCard from '@/components/RatingCard';
import styles from './dashboard.module.css';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
              value="524"
              percentage={12}
              trend="up"
              color="cyan"
            />
            <StatCard
              title="อาสาสมัครที่ลงทะเบียน"
              value="1,240"
              percentage={5}
              trend="up"
              color="purple"
            />
            <StatCard
              title="จำนวนคำร้องขอวันนี้"
              value="85"
              percentage={18}
              trend="up"
              color="cyan"
            />
          </div>

          {/* Resource Status and Map Section */}
          <div className={styles.socialGrid}>
            <div className={styles.customCard}>
              <h3 className={styles.cardTitle}>สถานะทรัพยากรในศูนย์ต่างๆ</h3>
              <div className={styles.resourceStatusList}>
                <div className={styles.statusItem}>
                  <div className={`${styles.circle} ${styles.green}`}>70%</div>
                  <p>ปกติ (Normal)</p>
                </div>
                <div className={styles.statusItem}>
                  <div className={`${styles.circle} ${styles.yellow}`}>20%</div>
                  <p>เตือน (Warning)</p>
                </div>
                <div className={styles.statusItem}>
                  <div className={`${styles.circle} ${styles.red}`}>10%</div>
                  <p>วิกฤต (Critical)</p>
                </div>
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
