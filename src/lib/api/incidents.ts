import { INCIDENTS_API_URL } from '@/lib/config/env';
import type { Incident } from '@/lib/config/incidents';

interface IncidentApiItem {
  incidentId?: unknown;
  incidentName?: unknown;
  incidentDescription?: unknown;
}

interface IncidentsResponse {
  items?: IncidentApiItem[];
}

function toIncident(item: IncidentApiItem): Incident | null {
  const value = typeof item.incidentId === 'string' ? item.incidentId.trim() : '';
  const name = typeof item.incidentName === 'string' ? item.incidentName.trim() : '';
  const description =
    typeof item.incidentDescription === 'string' ? item.incidentDescription.trim() : '';

  if (!value || !name) {
    return null;
  }

  const shortDescription = description ? `${description.slice(0, 10)}..` : '';
  const label = shortDescription ? `${name} - ${shortDescription}` : name;

  return { value, label };
}

export async function listIncidents(options?: {
  signal?: AbortSignal;
}): Promise<Incident[]> {
  const res = await fetch(INCIDENTS_API_URL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal: options?.signal,
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to load incidents: HTTP ${res.status}`);
  }

  const payload = (await res.json()) as IncidentsResponse;
  if (!Array.isArray(payload.items)) {
    return [];
  }

  return payload.items
    .map(toIncident)
    .filter((incident): incident is Incident => incident !== null);
}
