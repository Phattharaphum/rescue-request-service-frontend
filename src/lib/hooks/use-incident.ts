// src/lib/hooks/use-incident.ts
'use client';

import { useState } from 'react';
import type { Incident } from '@/lib/config/incidents';
import { useIncidents } from '@/lib/hooks/use-incidents';

export const ALL_INCIDENTS_VALUE = '__all__';

export function useIncident() {
  const { incidents, isLoading, isError, error, refetch } = useIncidents();
  const [selectedIncidentId, setIncidentId] = useState<string>(ALL_INCIDENTS_VALUE);
  const incidentId = selectedIncidentId === ALL_INCIDENTS_VALUE
    ? ALL_INCIDENTS_VALUE
    : incidents.some((item) => item.value === selectedIncidentId)
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
