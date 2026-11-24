import { config } from '../config';

export interface KolkataTimeInfo {
  dateStr: string; // YYYY-MM-DD
  timeStr: string; // HH:MM
  hours: number;
  minutes: number;
  totalMinutes: number; // minutes from midnight (0 - 1439)
}

/**
 * Authoritatively computes current date and time in Asia/Kolkata timezone.
 * Uses native Intl.DateTimeFormat (independent of host OS local timezone).
 */
export function getCurrentKolkataTime(refDate: Date = new Date()): KolkataTimeInfo {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(refDate);
  const partMap: Record<string, string> = {};
  for (const p of parts) {
    partMap[p.type] = p.value;
  }

  const hourStr = partMap.hour === '24' ? '00' : partMap.hour;
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(partMap.minute, 10);
  const totalMinutes = hours * 60 + minutes;

  const dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
  const timeStr = `${hourStr.padStart(2, '0')}:${partMap.minute.padStart(2, '0')}`;

  return {
    dateStr,
    timeStr,
    hours,
    minutes,
    totalMinutes
  };
}

export interface ValidationResult {
  isValid: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Validates reservation date, start time, end time against authoritative Asia/Kolkata server time
 * and library operating hours.
 */
export function validateReservationTime(
  requestedDate: string,
  startTime: string,
  endTime: string,
  serverTime: KolkataTimeInfo = getCurrentKolkataTime()
): ValidationResult {
  // 1. Format validation (YYYY-MM-DD and HH:MM)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
    return {
      isValid: false,
      errorCode: 'INVALID_DATE_FORMAT',
      errorMessage: 'Reservation date must be in YYYY-MM-DD format.'
    };
  }

  if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
    return {
      isValid: false,
      errorCode: 'INVALID_TIME_FORMAT',
      errorMessage: 'Start time and end time must be in HH:MM format (24-hour).'
    };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  if (startH < 0 || startH > 23 || startM < 0 || startM > 59) {
    return {
      isValid: false,
      errorCode: 'INVALID_START_TIME',
      errorMessage: `Invalid start time: ${startTime}.`
    };
  }

  if (endH < 0 || endH > 23 || endM < 0 || endM > 59) {
    return {
      isValid: false,
      errorCode: 'INVALID_END_TIME',
      errorMessage: `Invalid end time: ${endTime}.`
    };
  }

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // 2. Start time must be strictly before end time
  if (startMinutes >= endMinutes) {
    return {
      isValid: false,
      errorCode: 'INVALID_TIME_RANGE',
      errorMessage: `End time (${endTime}) must be strictly after start time (${startTime}).`
    };
  }

  // 3. Operating Hours Validation
  const openingHour = config.libraryConfig.openingHour || 8;
  const closingHour = config.libraryConfig.closingHour || 22;
  const openingMinutes = openingHour * 60;
  const closingMinutes = closingHour * 60;

  const openHStr = String(openingHour).padStart(2, '0') + ':00';
  const closeHStr = String(closingHour).padStart(2, '0') + ':00';

  if (startMinutes < openingMinutes || endMinutes > closingMinutes) {
    return {
      isValid: false,
      errorCode: 'OUTSIDE_OPERATING_HOURS',
      errorMessage: `Reservation must fall within library operating hours (${openHStr} to ${closeHStr} IST).`
    };
  }

  // 4. Past Date Check: Reject all past dates in Asia/Kolkata
  if (requestedDate < serverTime.dateStr) {
    return {
      isValid: false,
      errorCode: 'PAST_DATE',
      errorMessage: `Reservation date cannot be in the past. Requested date: ${requestedDate}, Current date: ${serverTime.dateStr} (Asia/Kolkata).`
    };
  }

  // 5. Expired Slot Check for today
  // "If a reservation starts in the past, reject it even if its end time is in the future."
  if (requestedDate === serverTime.dateStr) {
    if (startMinutes <= serverTime.totalMinutes) {
      return {
        isValid: false,
        errorCode: 'EXPIRED_TIME_SLOT',
        errorMessage: `Reservation start time (${startTime}) has already passed for today (${serverTime.dateStr}). Current server time is ${serverTime.timeStr} IST. Please select a future time slot.`
      };
    }
  }

  return { isValid: true };
}
