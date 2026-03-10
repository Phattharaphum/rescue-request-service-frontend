'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const NAV_LINKS = [
  { label: 'ภาคประชาชน', href: '/citizen/request' },
  { label: 'ภาคเจ้าหน้าที่', href: '/staff' },
  { label: 'Pub/Sub', href: '/pubsub' },
];

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" aria-label="ระบบจัดการคำขอช่วยเหลือ — กลับหน้าแรก" className="flex items-center gap-2 font-semibold text-white hover:opacity-90 transition-opacity">
          <Shield size={22} />
          <span className="text-sm sm:text-base">ระบบจัดการคำขอช่วยเหลือ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden rounded-lg p-1.5 text-blue-100 hover:bg-white/10 hover:text-white transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="sm:hidden border-t border-blue-600 bg-blue-700 px-4 pb-3 pt-2 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-white/20 text-white'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
