'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const TEXT = {
  appName: '\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E04\u0E33\u0E02\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D',
  request: '\u0E41\u0E08\u0E49\u0E07\u0E04\u0E33\u0E02\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D',
  track: '\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E04\u0E33\u0E02\u0E2D',
  list: '\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E04\u0E33\u0E02\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D',
};

const NAV_LINKS = [
  { label: TEXT.request, href: '/citizen/request' },
  { label: TEXT.track, href: '/citizen/track' },
  { label: TEXT.list, href: '/staff' },
  { label: 'Pub/Sub', href: '/pubsub' },
];

export function Topbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-blue-700 text-white shadow-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`${TEXT.appName} - Home`}
          className="flex items-center gap-2 font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Shield size={22} />
          <span className="text-sm sm:text-base">{TEXT.appName}</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="rounded-lg p-1.5 text-blue-100 transition-colors hover:bg-white/10 hover:text-white sm:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-blue-600 bg-blue-700 px-4 pb-3 pt-2 sm:hidden">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-white/20 text-white' : 'text-blue-100 hover:bg-white/10 hover:text-white',
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
