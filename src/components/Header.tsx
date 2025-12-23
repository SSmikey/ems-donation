'use client';

import { useState, useEffect } from 'react';
import styles from './Header.module.css';

interface HeaderProps {
  onMenuClick: () => void;
}


const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

export default function Header({ onMenuClick }: HeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from session');
      }
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className={styles.right}>
        <div className={styles.userProfileWrapper}>
          <button
            className={styles.iconButtonLarge}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <UserIcon />
          </button>

          {mounted && profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <div className={styles.avatar}>
                  👤
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>
                    {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
                  </span>
                  <span className={styles.userEmail}>
                    {user ? user.username : 'guest'}@ems-donation.io
                  </span>
                </div>
              </div>
              <div className={styles.profileBody}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  <span className={styles.logoutIcon}>
                    <LogoutIcon />
                  </span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
