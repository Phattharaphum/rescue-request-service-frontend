# rescue-request-service-frontend

Frontend เดโม่ด้วย Next.js สำหรับระบบจัดการคำขอช่วยเหลือผู้ประสบภัย

## เทคโนโลยีที่ใช้

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- TanStack Query
- React Hook Form + Zod
- lucide-react

## เริ่มต้นใช้งาน

### 1) ติดตั้ง dependencies

```bash
npm install
```

### 2) ตั้งค่า Environment (`.env.local`)

โปรเจกต์นี้ไม่มี `.env.example` ใน repository ปัจจุบัน ให้สร้าง/แก้ไข `.env.local` ด้วยตัวแปรสำคัญดังนี้:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/v1/
NEXT_PUBLIC_SNS_TOPIC_ARN=arn:aws:sns:ap-southeast-1:000000000000:rescue-request-events-v1
NEXT_PUBLIC_SNS_STREAM_MODE=sse
NEXT_PUBLIC_SNS_SSE_URL=/api/pubsub/stream
```

ถ้าต้องการให้หน้า `/pubsub` ดึงข้อมูลจาก SQS ผ่าน API route (`/api/pubsub/stream`) ให้เพิ่มตัวแปรฝั่งเซิร์ฟเวอร์:

```bash
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SNS_STREAM_SQS_QUEUE_URL=...
```

### 3) รันโปรเจกต์

```bash
npm run dev
```

เปิดที่ `http://localhost:3000`

## หน้าที่เข้าถึงได้ตอนนี้

### หน้าเริ่มต้น
- หน้าหลัก: `/`

### ภาคประชาชน
- แจ้งคำขอช่วยเหลือ: `/citizen/request`
- หน้าสำเร็จหลังส่งคำขอ: `/citizen/success`
- ค้นหาคำขอด้วยเบอร์โทร + tracking code: `/citizen/track`
- ดูสถานะคำขอ: `/citizen/status/[requestId]`
- ส่งข้อมูลอัปเดตเพิ่มเติม: `/citizen/status/[requestId]/updates`

### ภาคเจ้าหน้าที่
- แดชบอร์ดจัดการคำขอ: `/staff`
- รายละเอียดคำขอ: `/staff/requests/[requestId]`

### Pub/Sub
- สตรีมเหตุการณ์: `/pubsub`

## หมายเหตุสำคัญ

- สคริปต์ `npm run start` ใน `package.json` ปัจจุบันอ้างอิง `server.js` แต่ยังไม่มีไฟล์นี้ใน repository
- ถ้าต้องการรัน production ควรปรับสคริปต์ `start` ให้ใช้ `next start` ก่อน

## โครงสร้างโปรเจกต์หลัก

```text
src/
  app/           # Next.js App Router pages และ API routes
  components/    # UI และ feature components
  lib/           # API client, config, hooks, schemas, utils
  types/         # TypeScript types
```
