'use client';
import { useState } from 'react';
import { INCIDENTS, DEFAULT_INCIDENT_ID, Incident } from '@/lib/config/incidents';

export function useIncident() {
  const [incidentId, setIncidentId] = useState<string>(DEFAULT_INCIDENT_ID);
  const incident: Incident | undefined = INCIDENTS.find((i) => i.value === incidentId);
  return { incidentId, setIncidentId, incident, incidents: INCIDENTS };
}
