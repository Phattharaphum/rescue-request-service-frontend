'use client';

import { Calendar, Hash, MapPin, Phone, Tag, Users } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InfoItem } from '@/components/shared/info-item';
import { RescueRequestMaster } from '@/types/rescue';
import { formatDateTime } from '@/lib/utils/date';
import { formatRequestType, formatSourceChannel } from '@/lib/utils/format';
import { parseSpecialNeeds } from '@/lib/utils/special-needs';

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
    <Card>
      <CardHeader title="ข้อมูลคำขอ" />
      <CardContent>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <InfoItem
            icon={<Hash size={14} />}
            label="รหัสคำขอ"
            value={<span className="font-mono text-xs">{master.requestId}</span>}
          />
          <InfoItem
            icon={<Tag size={14} />}
            label="เหตุการณ์"
            value={master.incidentId}
          />
          <InfoItem
            label="ประเภทคำขอ"
            value={formatRequestType(master.requestType)}
          />
          <InfoItem
            icon={<Users size={14} />}
            label="จำนวนผู้ประสบภัย"
            value={`${master.peopleCount} คน`}
          />
          <div className="sm:col-span-2">
            <InfoItem label="รายละเอียด" value={master.description} />
          </div>

          {master.specialNeeds && (
            <div className="sm:col-span-2">
              <InfoItem
                label="ความต้องการพิเศษ"
                value={
                  specialNeedChips.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {specialNeedChips.map((chip) => (
                        <span
                          key={chip}
                          className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  ) : (
                    '-'
                  )
                }
              />
            </div>
          )}

          <InfoItem
            icon={<MapPin size={14} />}
            label="พิกัด"
            value={`${master.latitude.toFixed(6)}, ${master.longitude.toFixed(6)}`}
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
              <InfoItem label="รายละเอียดสถานที่" value={master.locationDetails} />
            </div>
          )}

          <InfoItem label="ชื่อผู้ติดต่อ" value={master.contactName} />
          <InfoItem
            icon={<Phone size={14} />}
            label="เบอร์โทรศัพท์"
            value={master.contactPhone}
          />
          <InfoItem
            label="ช่องทางการแจ้ง"
            value={formatSourceChannel(master.sourceChannel)}
          />

          <InfoItem
            icon={<Calendar size={14} />}
            label="ยื่นคำขอเมื่อ"
            value={formatDateTime(master.submittedAt)}
          />
          {master.lastCitizenUpdateAt && (
            <InfoItem
              label="ผู้ประสบภัยอัปเดตล่าสุด"
              value={formatDateTime(master.lastCitizenUpdateAt)}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
