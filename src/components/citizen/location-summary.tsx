// src/components/citizen/location-summary.tsx
'use client';

import type React from 'react';
import { Map, MapPin, Navigation } from 'lucide-react';
import { CitizenStatusResponse } from '@/types/rescue';

interface LocationSummaryProps {
  location: CitizenStatusResponse['location'];
}

function DetailItem({
  icon,
  label,
  value,
  className = '',
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-bold leading-6 text-slate-950">{value}</div>
    </div>
  );
}

export function LocationSummary({ location }: LocationSummaryProps) {
  const addressParts = [
    location.subdistrict && `ต.${location.subdistrict}`,
    location.district && `อ.${location.district}`,
    location.province && `จ.${location.province}`,
  ].filter(Boolean);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Location</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ตำแหน่งที่เกิดเหตุ
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <MapPin size={22} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailItem
          icon={<Navigation size={14} />}
          label="พิกัด"
          value={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
        />
        {location.addressLine && (
          <DetailItem icon={<MapPin size={14} />} label="ที่อยู่" value={location.addressLine} />
        )}
        {addressParts.length > 0 && (
          <DetailItem
            icon={<Map size={14} />}
            label="เขต / อำเภอ / จังหวัด"
            value={addressParts.join(' ')}
          />
        )}
        {location.locationDetails && (
          <DetailItem
            label="รายละเอียดสถานที่"
            value={location.locationDetails}
            className="sm:col-span-2"
          />
        )}
      </div>
    </section>
  );
}
