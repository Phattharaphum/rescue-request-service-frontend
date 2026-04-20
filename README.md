# rescue-request-service-frontend

Frontend สำหรับระบบแจ้งขอความช่วยเหลือผู้ประสบภัย พัฒนาด้วย Next.js (App Router)

## ภาพรวมความสามารถ

- ฝั่งประชาชน
- แจ้งคำขอความช่วยเหลือ (`/citizen/request`)
- ติดตามสถานะคำขอ (`/citizen/track`, `/citizen/status/[requestId]`)
- ส่งข้อมูลอัปเดตเพิ่มเติม (`/citizen/status/[requestId]/updates`)
- ฝั่งผู้ดูแล
- ล็อกอินผู้ดูแล (`/admin/login`)
- แดชบอร์ดคำขอตาม Incident (`/admin/incident`)
- ติดตามสตรีมเหตุการณ์ Pub/Sub (`/admin/pubsub`)
- ส่วนผู้พัฒนาในหน้าแรก (`/`)
- แสดง API Base URL, SNS Topic ARN, ลิงก์เอกสาร API
- ปุ่มทดสอบ Health Check ผ่าน `/api/developer/health-ready`

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS v4
- TanStack Query
- React Hook Form + Zod
- AWS SDK v3 (SQS for SSE proxy route)

## เส้นทางหลัก (Routes)

- `/` หน้าแรก + Developer section
- `/citizen/request` ฟอร์มแจ้งขอความช่วยเหลือ
- `/citizen/success` หน้าสำเร็จหลังส่งคำขอ
- `/citizen/track` ค้นหาคำขอด้วยเบอร์โทร + Tracking Code
- `/citizen/status/[requestId]` ดูสถานะคำขอ
- `/citizen/status/[requestId]/updates` ส่งอัปเดตเพิ่มเติม
- `/admin/login` ล็อกอินผู้ดูแล
- `/admin/incident` แดชบอร์ดผู้ดูแล
- `/admin/incident/requests/[requestId]` รายละเอียดคำขอ
- `/admin/pubsub` สตรีมเหตุการณ์

หมายเหตุด้าน compatibility:

- `/staff` และ `/staff/*` จะถูก redirect ไป `/admin/incident...`
- `/pubsub` และ `/pubsub/*` จะถูก redirect ไป `/admin/pubsub...`
- หน้า `/admin/*` (ยกเว้น `/admin/login`) ต้องล็อกอินก่อนเข้าใช้งาน

## การตั้งค่า Environment

ไฟล์ `.env*` ถูก ignore ใน git (`.gitignore` มี `.env*`) ดังนั้นต้องตั้งค่า env ในเครื่อง/ระบบ deploy เอง

### ตัวแปรฝั่ง Client (NEXT_PUBLIC_*)

- `NEXT_PUBLIC_API_BASE_URL`
- Base URL ของ API หลัก
- ตัวอย่างแบบ relative: `/v1/`
- ตัวอย่างแบบ absolute: `https://<api-id>.execute-api.<region>.amazonaws.com/dev/v1/`
- `NEXT_PUBLIC_INCIDENTS_API_URL` (optional)
- URL สำหรับดึงรายการ incidents
- ถ้าไม่กำหนด จะ fallback เป็น `${NEXT_PUBLIC_API_BASE_URL}incidents`
- `NEXT_PUBLIC_SNS_TOPIC_ARN`
- แสดงใน UI ส่วนผู้พัฒนา และใช้งานหน้า Pub/Sub
- `NEXT_PUBLIC_SNS_STREAM_MODE`
- รองรับ `sse` หรือ `mock`
- ค่า default: `sse`
- `NEXT_PUBLIC_SNS_SSE_URL`
- URL ของ SSE stream (เช่น Lambda URL `/stream`)
- default: `/api/pubsub/stream`

### ตัวแปรฝั่ง Server

- `API_PROXY_TARGET`
- ใช้สำหรับ rewrite `/v1/*` ใน `next.config.ts`
- ตัวอย่าง: `https://<api-id>.execute-api.<region>.amazonaws.com/dev`
- `ADMIN_PASSWORD`
- รหัสล็อกอินผู้ดูแล
- default ในโค้ด: `6609612160` (ควร override ใน production)

### ตัวแปรสำหรับ `/api/pubsub/stream` (SQS polling)

- `AWS_REGION` (default `ap-southeast-1`)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SNS_STREAM_SQS_QUEUE_URL` (required ถ้าจะใช้ route นี้)
- `AWS_ENDPOINT_URL` (optional, ใช้กับ localstack)
- `SNS_STREAM_WAIT_SECONDS` (optional, default `20`)
- `SNS_STREAM_IDLE_DELAY_MS` (optional, default `1000`)

## โหมดการเชื่อมต่อ API

### โหมด A: Relative base + Next.js rewrite

เหมาะกับ runtime ที่รองรับ Next rewrites (เช่นรัน Next server ปกติ)

- `NEXT_PUBLIC_API_BASE_URL=/v1/`
- `API_PROXY_TARGET=https://.../dev`

ผลลัพธ์: frontend ยิง `/v1/*` แล้ว Next.js rewrite ไป backend จริง

### โหมด B: Absolute base URL (แนะนำสำหรับโฮสต์ที่ไม่มี rewrite)

เหมาะกับ static hosting / reverse proxy ที่ไม่ได้ส่งต่อ `/v1/*`

- `NEXT_PUBLIC_API_BASE_URL=https://.../dev/v1/`
- ตั้ง `NEXT_PUBLIC_INCIDENTS_API_URL` และ `NEXT_PUBLIC_SNS_SSE_URL` เป็น absolute URL

ผลลัพธ์: frontend ยิงไป backend ตรง ลดปัญหา HTTP 404 จาก `/v1/*`

## เริ่มใช้งาน Local

1. ติดตั้ง dependencies

```bash
npm install
```

2. สร้าง `.env.local` (ตัวอย่างแบบ absolute API)

```bash
NEXT_PUBLIC_API_BASE_URL=https://<api-id>.execute-api.ap-southeast-2.amazonaws.com/dev/v1/
NEXT_PUBLIC_INCIDENTS_API_URL=https://<api-id>.execute-api.ap-southeast-2.amazonaws.com/dev/v1/incidents
NEXT_PUBLIC_SNS_TOPIC_ARN=arn:aws:sns:ap-southeast-2:<account-id>:rescue-request-events-v1-dev
NEXT_PUBLIC_SNS_STREAM_MODE=sse
NEXT_PUBLIC_SNS_SSE_URL=https://<lambda-url>.lambda-url.ap-southeast-2.on.aws/stream
ADMIN_PASSWORD=<your-admin-password>
```

3. รัน development server

```bash
npm run dev
```

เปิดที่ `http://localhost:3000`

## Deploy

โปรเจกต์มีไฟล์ตัวอย่างสำหรับ deploy คือ `.env.deploy` (อยู่ในเครื่องเท่านั้น ไม่ถูก commit)

ขั้นตอนแนะนำ:

1. คัดลอกค่าจาก `.env.deploy` ไปตั้งในระบบ Environment Variables ของโฮสต์
2. Build และ deploy ใหม่
3. ตรวจสอบหน้า:
- `/citizen/request` และ `/citizen/track` เรียก API หลักได้
- `/admin/login` ล็อกอินได้
- `/admin/pubsub` ต่อ stream ได้

## Scripts

- `npm run dev` รันโหมดพัฒนา
- `npm run build` build production
- `npm run lint` lint โค้ด
- `npm run start` ปัจจุบันชี้ไป `node server.js`

หมายเหตุ: repository นี้ไม่มี `server.js` อยู่จริง  
ถ้าต้องการรัน production แบบมาตรฐาน Next.js ให้ใช้:

```bash
npx next start
```

หรือปรับ script `start` ใน `package.json` เป็น `next start`

## Troubleshooting

- อาการ: deploy แล้ว API หลัก 404 เกือบทุกเส้น แต่ incidents/SSE ใช้ได้
- สาเหตุที่พบบ่อย: `NEXT_PUBLIC_API_BASE_URL=/v1/` แต่โฮสต์ไม่มี rewrite `/v1/*`
- วิธีแก้: ใช้ `NEXT_PUBLIC_API_BASE_URL` แบบ absolute URL หรือกำหนด `API_PROXY_TARGET` ให้ runtime ที่รองรับ rewrites

- อาการ: เข้า `/admin/*` ไม่ได้
- ตรวจสอบว่า login ผ่าน `/admin/login` และ cookie `admin_auth` ถูกตั้งสำเร็จ

- อาการ: Health check ในหน้าแรกทดสอบไม่ได้
- ตรวจสอบ `API_PROXY_TARGET` หรือ `NEXT_PUBLIC_API_BASE_URL` ว่าตั้งถูกต้อง

## โครงสร้างโปรเจกต์หลัก

```text
src/
  app/           # App Router pages + API routes
  components/    # UI และ feature components
  lib/           # API client, config, hooks, schemas, utils
  types/         # TypeScript types
middleware.ts    # auth + route redirects
next.config.ts   # /v1 rewrite configuration
```
