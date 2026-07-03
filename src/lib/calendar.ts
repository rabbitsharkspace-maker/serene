// Build a Google Calendar "add event" link for a deadline. Works on web + mobile with no file
// download and no login setup — the reliable way to make sure a fine/appeal cut-off surfaces in
// time. We span the all-day event from a few days BEFORE the due date up to it, so it shows up in
// the user's agenda early (an advance reminder), while the title still states the real deadline.
//
// All date math runs in UTC (Date.UTC + getUTC*) so a calendar date like '2026-07-17' never
// slips a day based on the viewer's local timezone.

const DAY_MS = 24 * 60 * 60 * 1000;

function ymdUTC(ms: number): string {
  const d = new Date(ms);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}${mm}${dd}`;
}

export function googleCalendarUrl(opts: {
  title: string;
  dueDate: string;        // ISO 'YYYY-MM-DD'
  details?: string;
  remindDaysBefore?: number; // how many days early the event should start showing (default 3)
}): string {
  const { title, dueDate, details = '', remindDaysBefore = 3 } = opts;
  const parts = dueDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return '';
  const [y, m, d] = parts;
  const dueMs = Date.UTC(y, m - 1, d);
  const startMs = dueMs - remindDaysBefore * DAY_MS;
  // Google all-day events treat the end date as exclusive, so +1 day to include the due date.
  const endExclusiveMs = dueMs + DAY_MS;
  const dates = `${ymdUTC(startMs)}/${ymdUTC(endExclusiveMs)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates,
    details,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
