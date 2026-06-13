export function toISODate(d) {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
}

export function parseISO(s) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date, days) {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

export function daysBetween(a, b) {
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86_400_000);
}

export function nextClosingDate(from, closingDay) {
  const base = new Date(from.getFullYear(), from.getMonth(), 1);
  const thisMonthClose = new Date(base.getFullYear(), base.getMonth(), closingDay);
  if (thisMonthClose >= from) return thisMonthClose;
  return new Date(base.getFullYear(), base.getMonth() + 1, closingDay);
}

export function nextDueDate(from, closingDay, offsetDays) {
  return addDays(nextClosingDate(from, closingDay), offsetDays);
}

export function formatDate(d, lang = 'zh') {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (lang === 'zh') {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
