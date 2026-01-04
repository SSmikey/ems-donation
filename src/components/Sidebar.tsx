'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import styles from './Sidebar.module.css';

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

  useEffect(() => {
    setActivePath(pathname);
  }, [pathname]);

  const isActive = (href: string) => {
    return activePath === href || activePath.startsWith(href + '/');
  };

  return (
    <aside className={`${isOpen ? styles.open : styles.closed} ${styles.sidebar}`}>
      {/* Logo */}
      <div className={`px-3 mb-4 ${styles.logo}`}>
        <span className={styles.logoText}>ems-donation</span>
      </div>

      {/* Navigation */}
      <nav className="d-flex flex-column gap-3">
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
    </aside>
  );
}
