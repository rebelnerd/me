import { IRecurrenceRule, RecurrenceFrequency } from '@app/interfaces';

/**
 * Calculate the next due date for a recurring task based on its recurrence rule.
 * Returns a YYYY-MM-DD string.
 *
 * @param rule - The recurrence rule
 * @param fromDate - The reference date (YYYY-MM-DD). Next date will be strictly after this date.
 */
export function calculateNextDueDate(
  rule: IRecurrenceRule,
  fromDate: string,
): string {
  const from = new Date(fromDate + 'T00:00:00');

  switch (rule.frequency) {
    case RecurrenceFrequency.Daily: {
      const next = new Date(from);
      next.setDate(next.getDate() + 1);
      return formatDate(next);
    }

    case RecurrenceFrequency.Weekly: {
      const targetDay = rule.dayOfWeek ?? 0;
      const next = new Date(from);
      next.setDate(next.getDate() + 1); // start from the day after
      while (next.getDay() !== targetDay) {
        next.setDate(next.getDate() + 1);
      }
      return formatDate(next);
    }

    case RecurrenceFrequency.Monthly: {
      const targetDay = rule.dayOfMonth ?? 1;
      const next = new Date(from);

      // Try the target day in the current month first
      next.setDate(1); // avoid overflow when setting month
      let month = next.getMonth();
      let year = next.getFullYear();

      // If we're already past the target day this month, go to next month
      const clampedCurrentMonth = Math.min(
        targetDay,
        daysInMonth(year, month),
      );
      if (from.getDate() >= clampedCurrentMonth) {
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }

      const clamped = Math.min(targetDay, daysInMonth(year, month));
      return formatDate(new Date(year, month, clamped));
    }

    default:
      throw new Error(`Unknown recurrence frequency: ${rule.frequency}`);
  }
}

/**
 * Calculate the first due date for a newly created recurring task.
 * Returns the next occurrence on or after today.
 */
export function calculateFirstDueDate(
  rule: IRecurrenceRule,
  today: string,
): string {
  const todayDate = new Date(today + 'T00:00:00');

  switch (rule.frequency) {
    case RecurrenceFrequency.Daily:
      return today;

    case RecurrenceFrequency.Weekly: {
      const targetDay = rule.dayOfWeek ?? 0;
      if (todayDate.getDay() === targetDay) return today;
      const next = new Date(todayDate);
      while (next.getDay() !== targetDay) {
        next.setDate(next.getDate() + 1);
      }
      return formatDate(next);
    }

    case RecurrenceFrequency.Monthly: {
      const targetDay = rule.dayOfMonth ?? 1;
      const year = todayDate.getFullYear();
      const month = todayDate.getMonth();
      const clamped = Math.min(targetDay, daysInMonth(year, month));
      if (todayDate.getDate() <= clamped) {
        return formatDate(new Date(year, month, clamped));
      }
      // Next month
      const nextMonth = month + 1 > 11 ? 0 : month + 1;
      const nextYear = month + 1 > 11 ? year + 1 : year;
      const nextClamped = Math.min(
        targetDay,
        daysInMonth(nextYear, nextMonth),
      );
      return formatDate(new Date(nextYear, nextMonth, nextClamped));
    }

    default:
      throw new Error(`Unknown recurrence frequency: ${rule.frequency}`);
  }
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
