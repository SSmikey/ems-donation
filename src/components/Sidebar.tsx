'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  {
    section: 'การจัดการหลัก',
    items: [
      { href: '/dashboard', label: 'แผงควบคุม (Dashboard)', icon: '📊' },
      { href: '/centers', label: 'จัดการศูนย์พักพิง', icon: '🏠' },
    ],
  },
  {
    section: 'จัดการทรัพยากร',
    items: [
      { href: '/warehouse', label: 'คลังสินค้าส่วนกลาง', icon: '📦' },
      { href: '/distribution', label: 'การร้องขอและกระจายของ', icon: '🚚' },
      { href: '/quick-donation', label: 'บันทึกของเข้าด่วน', icon: '⚡' },
    ],
  },
  {
    section: 'ผู้ดูแลระบบ',
    items: [
      { href: '/users', label: 'จัดการผู้ใช้งาน', icon: '👥' },
    ],
  },
];

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoText}>ems-donation</span>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.map((section) => (
          <div key={section.section} className={styles.navSection}>
            <h3 className={styles.navTitle}>{section.section}</h3>
            <ul className={styles.navList}>
              {section.items.map((item) => (
                <li key={item.href} className={styles.navItem}>
                  <a
                    href={item.href}
                    className={`${styles.navLink} ${mounted && isActive(item.href) ? styles.active : ''}`}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
