import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  subMonths,
  parseISO,
  differenceInDays,
  isBefore,
  isAfter,
} from 'date-fns';

export function formatDate(dateStr: string, pattern = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), pattern);
  } catch {
    return dateStr;
  }
}

export function formatRelativeDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  } catch {
    return dateStr;
  }
}

export function formatRelativeTime(dateStr: string): string {
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM');
  } catch {
    return dateStr;
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function getMonthRange(date = new Date()) {
  return {
    start: startOfMonth(date).toISOString(),
    end:   endOfMonth(date).toISOString(),
  };
}

export function getWeekRange(date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }).toISOString(),
    end:   endOfWeek(date, { weekStartsOn: 1 }).toISOString(),
  };
}

export function getYearRange(date = new Date()) {
  return {
    start: startOfYear(date).toISOString(),
    end:   new Date().toISOString(),
  };
}

export function getLast6MonthsRange() {
  return {
    start: subMonths(new Date(), 6).toISOString(),
    end:   new Date().toISOString(),
  };
}

export function daysUntil(dateStr: string): number {
  try {
    const target = parseISO(dateStr);
    const now = new Date();
    return differenceInDays(target, now);
  } catch {
    return 0;
  }
}

export function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  try {
    return isBefore(parseISO(dateStr), new Date());
  } catch {
    return false;
  }
}

export function nowISO(): string {
  return new Date().toISOString();
}
