'use client';

import { MapPin, Navigation, Map } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { InfoItem } from '@/components/shared/info-item';
import { CitizenStatusResponse } from '@/types/rescue';

interface LocationSummaryProps {
  location: CitizenStatusResponse['location'];
}

export function LocationSummary({ location }: LocationSummaryProps) {
  const addressParts = [
    location.subdistrict && `ต.${location.subdistrict}`,
    location.district && `อ.${location.district}`,
    location.province && `จ.${location.province}`,
  ].filter(Boolean);

  return (
    <Card>
      <CardHeader title="ตำแหน่งที่เกิดเหตุ" />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem
            icon={<Navigation size={14} />}
            label="พิกัด (ละติจูด / ลองจิจูด)"
            value={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
          />
          {location.addressLine && (
            <InfoItem
              icon={<MapPin size={14} />}
              label="ที่อยู่"
              value={location.addressLine}
            />
          )}
          {addressParts.length > 0 && (
            <InfoItem
              icon={<Map size={14} />}
              label="เขต / อำเภอ / จังหวัด"
              value={addressParts.join(' ')}
            />
          )}
          {location.locationDetails && (
            <InfoItem
              label="รายละเอียดสถานที่"
              value={location.locationDetails}
              className="sm:col-span-2"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
