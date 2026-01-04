'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Sidebar.module.css';

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
);

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  {
    section: 'การจัดการหลัก',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '' },
      { href: '/centers', label: 'จัดการศูนย์พักพิง', icon: '' },
    ],
  },
  {
    section: 'จัดการทรัพยากร',
    items: [
      { href: '/warehouse', label: 'คลังสินค้าส่วนกลาง', icon: '' },
      { href: '/create-request', label: 'สร้างคำขอเบิกสิ่งของ', icon: '' },
      { href: '/distribution', label: 'รายการคำขอเบิกสิ่งของ', icon: '' },
      { href: '/quick-donation', label: 'บันทึกของเข้าด่วน', icon: '' },
    ],
  },
  {
    section: 'ผู้ดูแลระบบ',
    items: [
      { href: '/users', label: 'จัดการผู้ใช้งาน', icon: '' },
    ],
  },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [activePath, setActivePath] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setActivePath(pathname);
    setMounted(true);
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user from session');
      }
    }
  }, [pathname]);

  const isActive = (href: string) => {
    return activePath === href || activePath.startsWith(href + '/');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <aside className={`${isOpen ? styles.open : styles.closed} ${styles.sidebar} d-flex flex-column`}>
      {/* Logo */}
      <div className={`px-3 mb-4 ${styles.logo}`}>
        <span className={styles.logoText}>ems-donation</span>
      </div>

      {/* Navigation */}
      <nav className="d-flex flex-column gap-3 flex-grow-1">
        {menuItems.map((section) => (
          <div key={section.section} className={`px-2 ${styles.navSection}`}>
            <h3 className={`text-uppercase small fw-bold ${styles.navTitle}`}>{section.section}</h3>
            <ul className="list-unstyled m-0">
              {section.items.map((item) => (
                <li key={item.href} className="mb-2">
                  <a
                    href={item.href}
                    className={`text-decoration-none d-flex align-items-center gap-2 py-2 px-3 rounded ${styles.navLink}`}
                    suppressHydrationWarning
                    data-active={isActive(item.href) ? 'true' : 'false'}
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile Section at Bottom */}
      {mounted && user && (
        <div className={`px-3 py-3 border-top ${styles.userProfile}`}>
          <div className="d-flex align-items-center gap-2">
            <div className={styles.avatar}>U</div>
            <div className="flex-grow-1 min-w-0">
              <div className={`small fw-bold text-truncate ${styles.userName}`}>
                {user.firstName} {user.lastName}
              </div>
              <div className={`text-truncate small ${styles.userEmail}`}>
                {user.username}@ems
              </div>
            </div>
          </div>
          <button
            className={`btn btn-sm w-100 mt-2 d-flex align-items-center justify-content-center gap-2 ${styles.logoutButton}`}
            onClick={handleLogout}
          >
            <span className={styles.logoutIcon}>
              <LogoutIcon />
            </span>
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
