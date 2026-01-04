'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

const menuItems = [
  {
    section: 'การจัดการหลัก',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: '📊' },
      { href: '/centers', label: 'ศูนย์พักพิง', icon: '🏠' },
    ],
  },
  {
    section: 'คลังสินค้า',
    items: [
      { href: '/warehouse', label: 'ดูสต็อก', icon: '📦' },
      { href: '/quick-donation', label: 'บันทึกของเข้า', icon: '⚡' },
    ],
  },
  {
    section: 'คำขอเบิก',
    items: [
      { href: '/distribution', label: 'จัดการคำขอ', icon: '🚚' },
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
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-border">
        <span
          className={cn(
            'font-bold text-lg transition-all',
            isOpen ? 'block text-foreground' : 'hidden'
          )}
        >
          ems-donation
        </span>
        {!isOpen && <span className="text-lg">📦</span>}
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-2 space-y-6">
        {menuItems.map((section) => (
          <div key={section.section}>
            {isOpen && (
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
                {section.section}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    )}
                    title={item.label}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    {isOpen && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
