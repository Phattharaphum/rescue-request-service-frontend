# rescue-request-service-frontend

ระบบเดโม่ Next.js สำหรับ Rescue Request Service - ระบบจัดการคำขอช่วยเหลือผู้ประสบภัย

## เทคโนโลยีที่ใช้

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **lucide-react** - ไอคอน
- **React Hook Form + Zod** - ฟอร์มและ validation
- **TanStack Query** - data fetching
- **Google Sans** - ฟอนต์หลัก

## การติดตั้ง

```bash
npm install
```

## การตั้งค่า Environment

```bash
cp .env.example .env.local
# แก้ไข NEXT_PUBLIC_API_BASE_URL ตามความต้องการ
```

## การรัน

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

## โครงสร้างโปรเจค

```
src/
  app/           # Next.js App Router pages
  components/    # React components
    ui/          # UI primitives
    shared/      # Shared components
    layout/      # Layout components
    citizen/     # ภาคประชาชน components
    staff/       # ภาคเจ้าหน้าที่ components
  lib/           # Utilities and API
    api/         # API client and endpoints
    config/      # Configuration
    hooks/       # Custom React hooks
    schemas/     # Zod validation schemas
    utils/       # Utility functions
  types/         # TypeScript types
```

## ฟีเจอร์หลัก

### ภาคประชาชน
- แจ้งคำขอช่วยเหลือ (`/citizen/request`)
- ตรวจสอบสถานะด้วยเบอร์โทร + tracking code (`/citizen/track`)
- ดูสถานะคำขอ (`/citizen/status/[requestId]`)
- ส่งข้อมูลอัปเดตเพิ่มเติม (`/citizen/status/[requestId]/updates`)

### ภาคเจ้าหน้าที่
- แผงควบคุมภาพรวม (`/staff`)
- รายการคำขอตาม incident (`/staff/incidents`)
- รายละเอียดคำขอ (`/staff/requests/[requestId]`)
- แก้ไขข้อมูล (`/staff/requests/[requestId]/edit`)
- ประวัติสถานะ (`/staff/requests/[requestId]/events`)
- สถานะปัจจุบัน (`/staff/requests/[requestId]/current`)
- ข้อมูล Idempotency (`/staff/requests/[requestId]/idempotency`)

### Pub/Sub Events
- แสดง event stream จาก SNS (`/pubsub`)
