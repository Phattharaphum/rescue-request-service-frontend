const TH_DATE_FORMAT = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Asia/Bangkok',
});

const TH_DATE_ONLY_FORMAT = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Bangkok',
});

export function parseISO(s: string): Date {
  return new Date(s);
}

export function formatDateTime(iso: string): string {
  try {
    return TH_DATE_FORMAT.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDate(iso: string): string {
  try {
    return TH_DATE_ONLY_FORMAT.format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatRelativeTime(iso: string): string {
  try {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} วินาทีที่แล้ว`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} ชั่วโมงที่แล้ว`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} วันที่แล้ว`;
    const diffMonth = Math.floor(diffDay / 30);
    if (diffMonth < 12) return `${diffMonth} เดือนที่แล้ว`;
    const diffYear = Math.floor(diffMonth / 12);
    return `${diffYear} ปีที่แล้ว`;
  } catch {
    return iso;
  }
}
