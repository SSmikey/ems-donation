'use client';

import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoText}>ems-donation</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          <h3 className={styles.navTitle}>การจัดการหลัก</h3>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="/dashboard" className={`${styles.navLink} ${styles.active}`}>
                <span className={styles.icon}>📊</span>
                <span>แผงควบคุม (Dashboard)</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="/centers" className={styles.navLink}>
                <span className={styles.icon}>🏠</span>
                <span>จัดการศูนย์พักพิง</span>
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.navTitle}>จัดการทรัพยากร</h3>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="/warehouse" className={styles.navLink}>
                <span className={styles.icon}>📦</span>
                <span>คลังสินค้าส่วนกลาง</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="/distribution" className={styles.navLink}>
                <span className={styles.icon}>🚚</span>
                <span>การร้องขอและกระจายของ</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="/quick-donation" className={styles.navLink}>
                <span className={styles.icon}>⚡</span>
                <span>บันทึกของเข้าด่วน</span>
              </a>
            </li>
          </ul>
        </div>

      </nav>
    </aside>
  );
}
