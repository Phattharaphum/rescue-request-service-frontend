import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_AUTH_COOKIE_NAME,
  ADMIN_AUTH_COOKIE_VALUE,
} from '@/lib/config/admin-auth';

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const authenticated =
    cookieStore.get(ADMIN_AUTH_COOKIE_NAME)?.value === ADMIN_AUTH_COOKIE_VALUE;

  if (!authenticated) {
    redirect('/admin/login');
  }

  return <>{children}</>;
}
