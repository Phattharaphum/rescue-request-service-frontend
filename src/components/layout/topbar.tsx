// src/components/layout/topbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TEXT = {
  appName: 'ระบบจัดการคำขอช่วยเหลือ',
};

const NAV_LINKS = [
  { label: 'แจ้งขอความช่วยเหลือ', href: '/citizen/request' },
  { label: 'ติดตามสถานะ', href: '/citizen/track' },
  { label: 'สำหรับเจ้าหน้าที่', href: '/staff' },
  { label: 'เหตุการณ์ (Pub/Sub)', href: '/pubsub' },
];

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // เพิ่มเงาบางๆ เวลาเลื่อนหน้าจอ
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo */}
        <Link
          href="/"
          aria-label={`${TEXT.appName} - หน้าหลัก`}
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <div className="rounded-lg bg-blue-600 p-1.5 text-white">
            <ShieldAlert size={20} />
          </div>
          <span className="text-base font-bold text-gray-900 sm:text-lg tracking-tight">
            {TEXT.appName}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
                  active 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-lg sm:hidden absolute w-full">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  active 
                    ? 'bg-blue-50 text-blue-700 font-semibold' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
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