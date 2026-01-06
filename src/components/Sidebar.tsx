'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  {
    section: 'การจัดการหลัก',
    items: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/centers', label: 'จัดการศูนย์พักพิง' },
    ],
  },
  {
    section: 'จัดการทรัพยากร',
    items: [
      { href: '/warehouse', label: 'คลังสินค้าส่วนกลาง' },
      { href: '/create-request', label: 'สร้างคำขอเบิกสิ่งของ' },
      { href: '/distribution', label: 'รายการคำขอเบิกสิ่งของ' },
      { href: '/quick-donation', label: 'บันทึกของเข้าด่วน' },
    ],
  },
  {
    section: 'ผู้ดูแลระบบ',
    items: [
      { href: '/users', label: 'จัดการผู้ใช้งาน' },
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
    <aside
      className="sidebar-dark position-sticky"
      style={{
        width: '260px',
        height: '100vh',
        top: 0,
        overflowY: 'auto',
        padding: '25px 0',
        transition: 'all 0.3s ease',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
      }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center px-3 mb-4" style={{ cursor: 'pointer' }}>
        <span className="h5 mb-0 fw-bold" style={{ color: '#212529' }}>ems-donation</span>
      </div>

      {/* Navigation */}
      <nav className="d-flex flex-column gap-4">
        {menuItems.map((section) => (
          <div key={section.section} className="px-2">
            <h6
              className="nav-section-title text-uppercase fw-bold ms-2 mb-2"
              style={{
                fontSize: '11px',
                letterSpacing: '1px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {section.section}
            </h6>
            <ul className="list-unstyled m-0">
              {section.items.map((item) => (
                <li key={item.href} className="mb-2">
                  <a
                    href={item.href}
                    className={`nav-link d-flex align-items-center gap-3 py-2 px-3 rounded-2 text-decoration-none ${
                      isActive(item.href) ? 'active' : ''
                    }`}
                    suppressHydrationWarning
                    style={{
                      color: isActive(item.href) ? '#6366f1' : '#495057',
                      backgroundColor: isActive(item.href)
                        ? '#f0f4ff'
                        : 'transparent',
                      borderLeft: isActive(item.href) ? '3px solid #6366f1' : 'none',
                      paddingLeft: isActive(item.href) ? 'calc(0.75rem - 3px)' : '0.75rem',
                      fontSize: '0.95rem',
                      fontWeight: isActive(item.href) ? '500' : '400',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = '#6366f1';
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = '#495057';
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
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
