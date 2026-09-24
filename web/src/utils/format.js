// 서버가 내려준 시각(ISO 문자열)을 "2026.09.24 14:05" 형태로 바꾼다(브라우저 시간대 기준).
export function formatDateTime(value) {
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
