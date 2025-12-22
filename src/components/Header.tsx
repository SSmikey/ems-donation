'use client';

import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          ☰
        </button>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconButton}>
          ☀️
        </button>
        <button className={styles.iconButton}>
          ⚙️
        </button>
        <button className={styles.notificationButton}>
          🔔
          <span className={styles.notificationBadge}>1</span>
        </button>
        <button className={styles.userButton}>
          👤
        </button>
      </div>
    </header>
  );
}
