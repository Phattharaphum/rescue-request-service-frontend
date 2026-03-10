import Link from 'next/link';
import { Shield, Users, Activity, AlertTriangle, CheckCircle, UserCheck, Zap, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle size={48} className="text-yellow-300" />
          </div>
          <h1 className="text-3xl font-bold mb-3">ระบบจัดการคำขอช่วยเหลือผู้ประสบภัย</h1>
          <p className="text-blue-100 text-lg">Rescue Request Management System</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        {/* 3 Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/citizen/request" className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-blue-100 hover:border-blue-400">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users size={32} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">ภาคประชาชน</h2>
              <p className="text-sm text-gray-500">แจ้งคำขอช่วยเหลือ / ติดตามสถานะ</p>
            </div>
          </Link>

          <Link href="/staff" className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-green-100 hover:border-green-400">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Shield size={32} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">ภาคเจ้าหน้าที่</h2>
              <p className="text-sm text-gray-500">แผงควบคุมและจัดการคำขอ</p>
            </div>
          </Link>

          <Link href="/pubsub" className="group block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-purple-100 hover:border-purple-400">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Activity size={32} className="text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">ดู Pub/Sub Events</h2>
              <p className="text-sm text-gray-500">กระแสข้อมูลแบบ Real-time</p>
            </div>
          </Link>
        </div>

        {/* System Flow */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">ขั้นตอนการทำงาน</h2>
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {[
              { num: 1, label: 'แจ้งคำขอ', icon: AlertTriangle },
              { num: 2, label: 'คัดกรอง', icon: CheckCircle },
              { num: 3, label: 'มอบหมาย', icon: UserCheck },
              { num: 4, label: 'ปฏิบัติการ', icon: Zap },
              { num: 5, label: 'เสร็จสิ้น', icon: Star },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-teal-700">{step.num}</span>
                  </div>
                  <span className="text-xs text-gray-600">{step.label}</span>
                </div>
                {idx < 4 && <span className="text-gray-300 mb-4">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* State Machine */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">สถานะของคำขอ</h2>
          <div className="flex flex-wrap gap-2 items-center">
            {['SUBMITTED', 'TRIAGED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'].map((status, idx, arr) => (
              <div key={status} className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">{status}</span>
                {idx < arr.length - 1 && <span className="text-gray-400">→</span>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">* ยกเลิกได้ (CANCELLED) ได้จากทุกสถานะก่อน RESOLVED</p>
        </div>

        {/* Demo Incidents */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">เหตุการณ์ตัวอย่าง</h2>
          <div className="space-y-3">
            {[
              { id: 'INC-2026-001', label: 'อุทกภัยกรุงเทพ 2569' },
              { id: 'INC-2026-002', label: 'พายุภาคใต้ 2569' },
            ].map((inc) => (
              <div key={inc.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded font-mono">Demo</span>
                <span className="text-sm font-medium text-gray-800">{inc.label}</span>
                <span className="text-xs text-gray-400 font-mono">{inc.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
