const OFFSET_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(?:Z|([+-])(\d{2}):(\d{2}))$/;

export function parseOffsetDateTime(value: string | null | undefined) {
  if (!value) return null;
  const match = OFFSET_DATE_TIME.exec(value);
  if (!match) return null;

  const [, yearPart, monthPart, dayPart, hourPart, minutePart, secondPart = "0", , , offsetHourPart, offsetMinutePart] = match;
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  const hour = Number(hourPart);
  const minute = Number(minutePart);
  const second = Number(secondPart);
  const offsetHour = Number(offsetHourPart ?? 0);
  const offsetMinute = Number(offsetMinutePart ?? 0);

  const calendarDate = new Date(0);
  calendarDate.setUTCFullYear(year, month - 1, day);
  if (calendarDate.getUTCFullYear() !== year || calendarDate.getUTCMonth() !== month - 1 || calendarDate.getUTCDate() !== day) return null;
  if (hour > 23 || minute > 59 || second > 59 || offsetHour > 23 || offsetMinute > 59) return null;

  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}
