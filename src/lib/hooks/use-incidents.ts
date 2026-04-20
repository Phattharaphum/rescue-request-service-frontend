'use client';

import { useQuery } from '@tanstack/react-query';
import { listIncidents } from '@/lib/api/incidents';

export function useIncidents() {
  const query = useQuery({
    queryKey: ['incidents'],
    queryFn: ({ signal }) => listIncidents({ signal }),
  });

  return {
    ...query,
    incidents: query.data ?? [],
  };
}
