'use client';

import type React from 'react';
import { Calendar, Hash, MapPin, Phone, Tag, Users } from 'lucide-react';
import { CopyButton } from '@/components/shared/copy-button';
import { Badge } from '@/components/ui/badge';
import { RescueRequestMaster } from '@/types/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatRequestType, formatSourceChannel } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';

interface RequestMasterCardProps {
  master: RescueRequestMaster;
}

function InfoBlock({
  icon,
  label,
  children,
  className = '',
}: {
  icon?: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="flex items-center gap-2 text-xs font-black text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm font-bold leading-6 text-slate-950">{children}</div>
    </div>
  );
}

export function RequestMasterCard({ master }: RequestMasterCardProps) {
  const parsedSpecialNeeds = parseSpecialNeeds(master.specialNeeds);
  const specialNeedChips =
    parsedSpecialNeeds.mode === 'chip'
      ? (parsedSpecialNeeds.items ?? [])
      : parsedSpecialNeeds.text
        ? [parsedSpecialNeeds.text]
        : [];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-cyan-700">Master data</p>
          <h2 className="mt-1 text-xl font-black tracking-normal text-slate-950">
            ข้อมูลหลักของคำขอ
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
          <Hash size={22} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoBlock icon={<Hash size={14} />} label="รหัสคำขออ้างอิง">
          <div className="flex flex-wrap items-center gap-2">
            <span className="break-all rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs font-black">
              {master.requestId}
            </span>
            <CopyButton text={master.requestId} />
          </div>
        </InfoBlock>

        <InfoBlock icon={<Tag size={14} />} label="เหตุการณ์ภัยพิบัติ">
          <div className="flex flex-wrap items-center gap-2">
            <span className="break-all rounded-xl bg-slate-100 px-3 py-1.5 font-mono text-xs font-black">
              {master.incidentId}
            </span>
            <CopyButton text={master.incidentId} />
          </div>
        </InfoBlock>

        <InfoBlock label="ประเภทความช่วยเหลือ">{formatRequestType(master.requestType)}</InfoBlock>
        <InfoBlock icon={<Users size={14} />} label="จำนวนผู้ประสบภัย">
          {master.peopleCount} คน
        </InfoBlock>

        <InfoBlock label="รายละเอียดสถานการณ์" className="sm:col-span-2">
          {master.description}
        </InfoBlock>

        {master.specialNeeds && (
          <InfoBlock label="ความต้องการพิเศษ" className="sm:col-span-2">
            {specialNeedChips.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {specialNeedChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : (
              '-'
            )}
          </InfoBlock>
        )}

        <InfoBlock icon={<MapPin size={14} />} label="พิกัด">
          <span className="font-mono">
            {master.latitude.toFixed(6)}, {master.longitude.toFixed(6)}
          </span>
        </InfoBlock>
        {master.province && <InfoBlock label="จังหวัด">{master.province}</InfoBlock>}
        {master.district && <InfoBlock label="อำเภอ / เขต">{master.district}</InfoBlock>}
        {master.subdistrict && <InfoBlock label="ตำบล / แขวง">{master.subdistrict}</InfoBlock>}
        {master.addressLine && (
          <InfoBlock label="ที่อยู่" className="sm:col-span-2">
            {master.addressLine}
          </InfoBlock>
        )}
        {master.locationDetails && (
          <InfoBlock label="จุดสังเกต / รายละเอียดสถานที่" className="sm:col-span-2">
            {master.locationDetails}
          </InfoBlock>
        )}

        <InfoBlock label="ชื่อผู้แจ้ง / ผู้ติดต่อ">{master.contactName}</InfoBlock>
        <InfoBlock icon={<Phone size={14} />} label="เบอร์โทรศัพท์">
          <span className="font-mono">{master.contactPhone}</span>
        </InfoBlock>
        <InfoBlock label="ช่องทางการแจ้ง">
          <Badge variant="gray" size="sm">
            {formatSourceChannel(master.sourceChannel)}
          </Badge>
        </InfoBlock>
        <InfoBlock icon={<Calendar size={14} />} label="เวลาที่ยื่นคำขอ">
          {formatDateTime(master.submittedAt)}
        </InfoBlock>
        {master.lastCitizenUpdateAt && (
          <InfoBlock label="ผู้ประสบภัยอัปเดตล่าสุดเมื่อ" className="sm:col-span-2">
            {formatDateTime(master.lastCitizenUpdateAt)}
          </InfoBlock>
        )}
      </div>
    </section>
  );
}
