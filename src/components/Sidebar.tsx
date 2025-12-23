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
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/centers', label: 'จัดการศูนย์พักพิง', icon: '🏠' },
    ],
  },
  {
    section: 'จัดการทรัพยากร',
    items: [
      { href: '/warehouse', label: 'คลังสินค้าส่วนกลาง', icon: '📦' },
      { href: '/create-request', label: 'สร้างคำขอเบิกสิ่งของ', icon: '📝' },
      { href: '/distribution', label: 'รายการคำขอเบิกสิ่งของ', icon: '🚚' },
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
  const [activePath, setActivePath] = useState<string>('');

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const isActive = (href: string) => {
    return activePath === href || activePath.startsWith(href + '/');
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
                    className={styles.navLink}
                    suppressHydrationWarning
                    data-active={isActive(item.href) ? 'true' : 'false'}
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
