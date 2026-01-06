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
        width: isOpen ? '260px' : '0',
        minWidth: isOpen ? '260px' : '0',
        height: '100vh',
        top: 0,
        overflow: 'hidden',
        overflowY: isOpen ? 'auto' : 'hidden',
        padding: isOpen ? '25px 0' : '25px 0',
        transition: 'all 0.3s ease',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        opacity: isOpen ? 1 : 0,
      }}
    >
      {/* Logo */}
      <div className="d-flex align-items-center px-4 mb-5" style={{ cursor: 'pointer' }}>
        <span className="h4 mb-0 fw-bold" style={{ color: '#111827', letterSpacing: '-0.5px' }}>ems-donation</span>
      </div>

      {/* Navigation */}
      <nav className="d-flex flex-column gap-4">
        {menuItems.map((section) => (
          <div key={section.section} className="px-2">
            <h6
              className="nav-section-title text-uppercase fw-bold ms-3 mb-3"
              style={{
                fontSize: '11px',
                letterSpacing: '1.2px',
                color: '#4b5563',
                marginTop: '10px',
                fontWeight: '700'
              }}
            >
              {section.section}
            </h6>
            <ul className="list-unstyled m-0">
              {section.items.map((item) => (
                <li key={item.href} className="mb-2">
                  <a
                    href={item.href}
                    className={`nav-link d-flex align-items-center gap-3 py-2 px-3 mx-2 rounded-3 text-decoration-none ${isActive(item.href) ? 'active' : ''
                      }`}
                    suppressHydrationWarning
                    style={{
                      color: isActive(item.href) ? '#ffffff' : '#1f2937',
                      backgroundColor: isActive(item.href)
                        ? '#4f46e5'
                        : 'transparent',
                      fontSize: '14.5px',
                      fontWeight: isActive(item.href) ? '600' : '500',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      border: isActive(item.href) ? '1px solid #4338ca' : '1px solid transparent',
                      boxShadow: isActive(item.href)
                        ? '0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1)'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = '#4f46e5';
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.color = '#1f2937';
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
