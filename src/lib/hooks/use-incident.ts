// src/lib/hooks/use-incident.ts
'use client';

import { useState } from 'react';
import type { Incident } from '@/lib/config/incidents';
import { useIncidents } from '@/lib/hooks/use-incidents';

export function useIncident() {
  const { incidents, isLoading, isError, error, refetch } = useIncidents();
  const [selectedIncidentId, setIncidentId] = useState<string>('');
  const incidentId = incidents.some((item) => item.value === selectedIncidentId)
    ? selectedIncidentId
    : (incidents[0]?.value ?? '');

  const incident: Incident | undefined = incidents.find((item) => item.value === incidentId);

  return {
    incidentId,
    setIncidentId,
    incident,
    incidents,
    isLoadingIncidents: isLoading,
    isIncidentsError: isError,
    incidentsError: error,
    refetchIncidents: refetch,
  };
}
