'use client';

import Link from 'next/link';
import { Edit, Phone, MapPin, Users, Calendar, Hash, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { InfoItem } from '@/components/shared/info-item';
import { RescueRequestMaster } from '@/types/rescue';
import { formatRequestType, formatSourceChannel } from '@/lib/utils/format';
import { formatDateTime } from '@/lib/utils/date';

interface RequestMasterCardProps {
  master: RescueRequestMaster;
  requestId: string;
}

export function RequestMasterCard({ master, requestId }: RequestMasterCardProps) {
  return (
    <Card>
      <CardHeader
        title="ข้อมูลคำขอ"
        action={
          <Link href={`/staff/requests/${requestId}/edit`}>
            <Button variant="outline" size="sm" leftIcon={<Edit size={14} />}>
              แก้ไข
            </Button>
          </Link>
        }
      />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              <InfoItem label="ความต้องการพิเศษ" value={master.specialNeeds} />
            </div>
          )}

          {/* Location */}
          <InfoItem
            icon={<MapPin size={14} />}
            label="พิกัด"
            value={`${master.latitude.toFixed(6)}, ${master.longitude.toFixed(6)}`}
          />
          {master.province && (
            <InfoItem label="จังหวัด" value={master.province} />
          )}
          {master.district && (
            <InfoItem label="อำเภอ/เขต" value={master.district} />
          )}
          {master.subdistrict && (
            <InfoItem label="ตำบล/แขวง" value={master.subdistrict} />
          )}
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

          {/* Contact */}
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

          {/* Timestamps */}
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
