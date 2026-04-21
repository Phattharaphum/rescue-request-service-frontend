'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Menu, X, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TEXT = {
  appName: 'ระบบจัดการคำขอช่วยเหลือ',
};

interface NavLink {
  label: string;
  href: string;
}

const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: 'แจ้งขอความช่วยเหลือ', href: '/citizen/request' },
  { label: 'ติดตามสถานะ', href: '/citizen/track' },
  { label: 'เข้าสู่ระบบผู้ดูแล', href: '/admin/login' },
];

const ADMIN_NAV_LINKS: NavLink[] = [
  { label: 'แจ้งขอความช่วยเหลือ', href: '/citizen/request' },
  { label: 'ติดตามสถานะ', href: '/citizen/track' },
  { label: 'แดชบอร์ดผู้ดูแล', href: '/admin/incident' },
  { label: 'เหตุการณ์ (Pub/Sub)', href: '/admin/pubsub' },
];

function isNavLinkActive(pathname: string, href: string): boolean {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }

  if (href === '/citizen/track') {
    return pathname === '/citizen/status' || pathname.startsWith('/citizen/status/');
  }

  return false;
}

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const loadAdminSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/session', {
        method: 'GET',
        cache: 'no-store',
      });
      if (!response.ok) {
        setIsAdminAuthenticated(false);
        return;
      }
      const payload = (await response.json()) as { authenticated?: boolean };
      setIsAdminAuthenticated(!!payload.authenticated);
    } catch {
      setIsAdminAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    void loadAdminSession();
  }, [loadAdminSession, pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = isAdminAuthenticated ? ADMIN_NAV_LINKS : PUBLIC_NAV_LINKS;

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
      });
    } finally {
      setIsAdminAuthenticated(false);
      setMobileOpen(false);
      router.push('/');
      router.refresh();
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100'
          : 'bg-white border-b border-gray-100',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
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

        <nav className="hidden items-center gap-2 sm:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(pathname, link.href);
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
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            >
              <LogOut size={15} />
              ออกจากระบบผู้ดูแล
            </button>
          )}
        </nav>

        <button
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-gray-100 bg-white px-4 pb-4 pt-2 shadow-lg sm:hidden absolute w-full">
          {navLinks.map((link) => {
            const active = isNavLinkActive(pathname, link.href);
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
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={16} />
              ออกจากระบบผู้ดูแล
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
