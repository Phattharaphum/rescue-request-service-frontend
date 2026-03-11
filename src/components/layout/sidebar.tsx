// src\components\layout\sidebar.tsx
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, List } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const STAFF_NAV = [
  { label: 'ภาพรวม', href: '/staff', icon: LayoutDashboard, exact: true },
  { label: 'รายการตาม Incident', href: '/staff/incidents', icon: List, exact: false },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      <nav className="flex flex-col gap-1 p-3">
        {STAFF_NAV.map(({ label, href, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-teal-50 text-teal-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
