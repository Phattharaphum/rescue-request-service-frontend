'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ClipboardList,
  Cross,
  LifeBuoy,
  LogOut,
  Menu,
  SearchCheck,
  ShieldCheck,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TEXT = {
  appName: 'Rescue Request',
  appNameTh: 'ระบบจัดการคำขอช่วยเหลือ',
};

interface NavLink {
  label: string;
  href: string;
  icon: typeof ClipboardList;
}

const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: 'แจ้งขอความช่วยเหลือ', href: '/citizen/request', icon: ClipboardList },
  { label: 'ติดตามสถานะ', href: '/citizen/track', icon: SearchCheck },
  { label: 'ผู้ดูแลระบบ', href: '/admin/login', icon: ShieldCheck },
];

const ADMIN_NAV_LINKS: NavLink[] = [
  { label: 'แจ้งขอความช่วยเหลือ', href: '/citizen/request', icon: ClipboardList },
  { label: 'ติดตามสถานะ', href: '/citizen/track', icon: SearchCheck },
  { label: 'แดชบอร์ดผู้ดูแล', href: '/admin/incident', icon: ShieldCheck },
  { label: 'Pub/Sub', href: '/admin/pubsub', icon: Activity },
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
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

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
        'sticky top-0 z-50 w-full border-b transition-colors duration-300',
        scrolled
          ? 'border-slate-200 bg-white/95 backdrop-blur-md'
          : 'border-slate-200 bg-white',
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label={`${TEXT.appNameTh} - หน้าหลัก`}
          className="group flex min-w-0 items-center gap-3"
        >
          <div className="relative grid h-12 w-12 shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <span className="bg-rose-500" />
            <span className="bg-amber-300" />
            <span className="bg-cyan-300" />
            <span className="bg-emerald-400" />
            <span className="absolute inset-1.5 flex items-center justify-center rounded-xl bg-slate-950 text-white">
              <LifeBuoy size={22} strokeWidth={2.3} />
            </span>
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white">
              <Cross size={10} strokeWidth={3} />
            </span>
          </div>
          <span className="min-w-0">
            <span className="block text-base font-black leading-5 tracking-normal text-slate-950 sm:text-lg">
              {TEXT.appName}
            </span>
            <span className="block truncate text-xs font-bold leading-5 text-slate-500">
              {TEXT.appNameTh}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => {
            const active = isNavLinkActive(pathname, link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'inline-flex h-11 items-center gap-2 rounded-2xl border px-3.5 text-sm font-black transition-colors',
                  active
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-950',
                )}
              >
                <Icon size={16} />
                {link.label}
              </Link>
            );
          })}
          {isAdminAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 text-sm font-black text-rose-700 transition-colors hover:bg-rose-100"
            >
              <LogOut size={16} />
              ออกจากระบบ
            </button>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-950 transition-colors hover:bg-white md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
        >
          {mobileOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          className="absolute left-0 top-[72px] w-full border-b border-slate-200 bg-white px-4 pb-4 md:hidden"
        >
          <div className="mb-3 grid h-2 grid-cols-4 overflow-hidden rounded-full">
            <span className="bg-rose-500" />
            <span className="bg-amber-300" />
            <span className="bg-cyan-300" />
            <span className="bg-emerald-400" />
          </div>
          <div className="grid gap-2">
            {navLinks.map((link) => {
              const active = isNavLinkActive(pathname, link.href);
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex min-h-14 items-center justify-between rounded-2xl border px-4 py-3 text-sm font-black transition-colors',
                    active
                      ? 'border-slate-950 bg-slate-950 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={19} />
                    {link.label}
                  </span>
                </Link>
              );
            })}
            {isAdminAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex min-h-14 items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition-colors hover:bg-rose-100"
              >
                <LogOut size={19} />
                ออกจากระบบผู้ดูแล
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
