import Link from 'next/link';
import { AlertTriangle, Activity, ClipboardList, SearchCheck, Siren } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';

const TEXT = {
  title:
    '\u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E31\u0E14\u0E01\u0E32\u0E23\u0E04\u0E33\u0E02\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E1C\u0E39\u0E49\u0E1B\u0E23\u0E30\u0E2A\u0E1A\u0E20\u0E31\u0E22',
  request: '\u0E41\u0E08\u0E49\u0E07\u0E04\u0E33\u0E02\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D',
  track: '\u0E15\u0E34\u0E14\u0E15\u0E32\u0E21\u0E2A\u0E16\u0E32\u0E19\u0E30\u0E04\u0E33\u0E02\u0E2D',
  list: '\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E04\u0E33\u0E02\u0E2D\u0E0A\u0E48\u0E27\u0E22\u0E40\u0E2B\u0E25\u0E37\u0E2D',
  name: '\u0E20\u0E31\u0E17\u0E23\u0E20\u0E39\u0E21\u0E34 \u0E01\u0E34\u0E48\u0E07\u0E0A\u0E31\u0E22',
  studentId: '\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E31\u0E01\u0E28\u0E36\u0E01\u0E29\u0E32 6609612160',
};

const HOME_ACTIONS = [
  {
    label: TEXT.request,
    description: 'Send emergency rescue request',
    href: '/citizen/request',
    icon: AlertTriangle,
    className: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
  },
  {
    label: TEXT.track,
    description: 'Track request progress',
    href: '/citizen/track',
    icon: SearchCheck,
    className: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  },
  {
    label: TEXT.list,
    description: 'Open staff request dashboard',
    href: '/staff',
    icon: ClipboardList,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  },
  {
    label: 'Pub/Sub',
    description: 'View real-time stream events',
    href: '/pubsub',
    icon: Activity,
    className: 'border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
  },
];

export default function HomePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-8 py-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-orange-100 p-2 text-orange-700">
              <Siren size={22} />
            </div>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">{TEXT.title}</h1>
              <p className="text-sm text-gray-600">
                {TEXT.name} {TEXT.studentId}
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {HOME_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`rounded-2xl border p-5 transition-all ${action.className}`}
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-white/80 p-2">
                    <Icon size={18} />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-base font-semibold">{action.label}</h2>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
