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
          <h3 className={styles.navTitle}>NAVIGATION</h3>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="#" className={`${styles.navLink} ${styles.active}`}>
                <span className={styles.icon}>🏠</span>
                <span>Dashboard</span>
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.navTitle}>UI COMPONENTS</h3>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="#" className={styles.navLink}>
                <span className={styles.icon}>🎨</span>
                <span>Color</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#" className={styles.navLink}>
                <span className={styles.icon}>✏️</span>
                <span>Typography</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#" className={styles.navLink}>
                <span className={styles.icon}>⭐</span>
                <span>Icons</span>
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.navTitle}>PAGES</h3>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="/" className={styles.navLink}>
                <span className={styles.icon}>🔐</span>
                <span>Login</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#" className={styles.navLink}>
                <span className={styles.icon}>👤</span>
                <span>Register</span>
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.navSection}>
          <h3 className={styles.navTitle}>OTHER</h3>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <a href="#" className={styles.navLink}>
                <span className={styles.icon}>≡</span>
                <span>Menu levels</span>
              </a>
            </li>
            <li className={styles.navItem}>
              <a href="#" className={styles.navLink}>
                <span className={styles.icon}>📄</span>
                <span>Sample page</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
