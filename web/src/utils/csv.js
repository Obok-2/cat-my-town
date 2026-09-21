function escapeCell(value) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// rows: 2차원 배열. 엑셀에서 한글이 깨지지 않도록 UTF-8 BOM을 붙인다.
export function downloadCsv(filename, rows) {
  const body = rows.map((row) => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob(['﻿' + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
