'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import SocialCard from '@/components/SocialCard';
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
            <h1>Default</h1>
            <div className={styles.breadcrumb}>
              <span>Home</span>
              <span className={styles.separator}>&gt;</span>
              <span>Dashboard</span>
              <span className={styles.separator}>&gt;</span>
              <span>Default</span>
            </div>
          </div>

          {/* Statistics Row */}
          <div className={styles.statsGrid}>
            <StatCard
              title="Daily Sales"
              value="$249.95"
              percentage={67}
              trend="up"
              color="cyan"
            />
            <StatCard
              title="Monthly Sales"
              value="$2,942.32"
              percentage={36}
              trend="down"
              color="purple"
            />
            <StatCard
              title="Yearly Sales"
              value="$8,638.32"
              percentage={80}
              trend="up"
              color="cyan"
            />
          </div>

          {/* Social Stats and Details Row */}
          <div className={styles.socialGrid}>
            <SocialCard
              platform="facebook"
              icon="f"
              likes={12281}
              percentage={7.2}
              target={35098}
              duration={350}
            />
            <SocialCard
              platform="twitter"
              icon="𝕏"
              likes={11200}
              percentage={6.2}
              target={34185}
              duration={800}
            />
            <SocialCard
              platform="google"
              icon="G+"
              likes={10500}
              percentage={5.9}
              target={25998}
              duration={900}
            />
          </div>

          {/* Bottom Section */}
          <div className={styles.bottomSection}>
            <RatingCard />
            <RecentUsersCard />
          </div>
        </div>
      </div>
    </div>
  );
}
