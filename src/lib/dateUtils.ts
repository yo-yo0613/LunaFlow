/**
 * 時區安全日期處理工具庫
 * 徹底繞過 UTC 偏移 (-8h / +8h)，精確鎖定瀏覽器本地年、月、日數值
 */

export function toLocalYYYYMMDD(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalYYYYMMDD(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function addDaysLocal(dateStr: string, days: number): string {
  const date = parseLocalYYYYMMDD(dateStr);
  date.setDate(date.getDate() + days);
  return toLocalYYYYMMDD(date);
}

export function daysDifference(startDateStr: string, endDateStr: string): number {
  const start = parseLocalYYYYMMDD(startDateStr);
  const end = parseLocalYYYYMMDD(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseLocalYYYYMMDD(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const weekDay = dayNames[date.getDay()];
  return `${month}月${day}日 (週${weekDay})`;
}

export function formatShortMonthDay(dateStr: string): string {
  const date = parseLocalYYYYMMDD(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}
