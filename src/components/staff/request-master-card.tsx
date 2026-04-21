// src/components/staff/request-master-card.tsx
'use client';

import { Calendar, Hash, MapPin, Phone, Tag, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InfoItem } from '@/components/shared/info-item';
import { RescueRequestMaster } from '@/types/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatRequestType, formatSourceChannel } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';
import { Badge } from '../ui/badge';
import { CopyButton } from '@/components/shared/copy-button';

interface RequestMasterCardProps {
  master: RescueRequestMaster;
  requestId?: string;
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
    <Card className="border-gray-200 shadow-sm">
      <CardHeader title="ข้อมูลหลักของคำขอ (Master Data)" className="bg-gray-50/50 border-b border-gray-100" />
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          
          {/* ข้อมูลทั่วไป */}
          <InfoItem
            icon={<Hash size={16} className="text-gray-400" />}
            label="รหัสคำขออ้างอิง"
            value={
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {master.requestId}
                </span>
                <CopyButton text={master.requestId} />
              </div>
            }
          />
          <InfoItem
            icon={<Tag size={16} className="text-gray-400" />}
            label="เหตุการณ์ภัยพิบัติ"
            value={
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                  {master.incidentId}
                </span>
                <CopyButton text={master.incidentId} />
              </div>
            }
          />
          <InfoItem
            label="ประเภทความช่วยเหลือ"
            value={<span className="font-semibold text-blue-700">{formatRequestType(master.requestType)}</span>}
          />
          <InfoItem
            icon={<Users size={16} className="text-gray-400" />}
            label="จำนวนผู้ประสบภัย"
            value={<span className="font-semibold text-gray-900">{master.peopleCount} คน</span>}
          />
          <div className="sm:col-span-2 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <InfoItem label="รายละเอียดสถานการณ์" value={master.description} />
          </div>

          {master.specialNeeds && (
            <div className="sm:col-span-2 pt-2 border-t border-gray-100">
              <InfoItem
                label="ความต้องการพิเศษ"
                value={
                  specialNeedChips.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {specialNeedChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )
                }
              />
            </div>
          )}

          {/* พิกัดและที่อยู่ */}
          <div className="sm:col-span-2 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <InfoItem
              icon={<MapPin size={16} className="text-gray-400" />}
              label="พิกัด (Lat, Lng)"
              value={<span className="font-mono text-sm">{master.latitude.toFixed(6)}, {master.longitude.toFixed(6)}</span>}
            />
            {master.province && <InfoItem label="จังหวัด" value={master.province} />}
            {master.district && <InfoItem label="อำเภอ/เขต" value={master.district} />}
            {master.subdistrict && <InfoItem label="ตำบล/แขวง" value={master.subdistrict} />}
            {master.addressLine && (
              <div className="sm:col-span-2">
                <InfoItem label="ที่อยู่" value={master.addressLine} />
              </div>
            )}
            {master.locationDetails && (
              <div className="sm:col-span-2">
                <InfoItem label="จุดสังเกต / รายละเอียดสถานที่" value={master.locationDetails} />
              </div>
            )}
          </div>

          {/* ข้อมูลการติดต่อและระบบ */}
          <div className="sm:col-span-2 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
            <InfoItem label="ชื่อผู้แจ้ง / ผู้ติดต่อ" value={<span className="font-medium text-gray-900">{master.contactName}</span>} />
            <InfoItem
              icon={<Phone size={16} className="text-gray-400" />}
              label="เบอร์โทรศัพท์"
              value={<span className="font-mono font-medium text-gray-900">{master.contactPhone}</span>}
            />
            <InfoItem
              label="ช่องทางการแจ้ง"
              value={<Badge variant="gray" size="sm">{formatSourceChannel(master.sourceChannel)}</Badge>}
            />
            <InfoItem
              icon={<Calendar size={16} className="text-gray-400" />}
              label="เวลาที่ยื่นคำขอ"
              value={formatDateTime(master.submittedAt)}
            />
            {master.lastCitizenUpdateAt && (
              <div className="sm:col-span-2 bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                <InfoItem
                  label="ผู้ประสบภัยอัปเดตข้อมูลล่าสุดเมื่อ"
                  value={<span className="font-medium text-blue-800">{formatDateTime(master.lastCitizenUpdateAt)}</span>}
                />
              </div>
            )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
