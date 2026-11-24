import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

console.log('🧪 Starting SeatSync Core Verification Test Suite...\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('--- 1. OVERLAPPING TIME SLOT VALIDATION (Double-Booking Prevention) ---');
  // Overlap condition: (newStart < existingEnd) && (newEnd > existingStart)
  const isOverlapping = (start1: string, end1: string, start2: string, end2: string) => {
    return start1 < end2 && end1 > start2;
  };

  const bookedStart = '09:00';
  const bookedEnd = '11:00';

  assert(isOverlapping('08:00', '10:00', bookedStart, bookedEnd), 'Detects partial overlap at start (08:00-10:00 with 09:00-11:00)');
  assert(isOverlapping('10:00', '12:00', bookedStart, bookedEnd), 'Detects partial overlap at end (10:00-12:00 with 09:00-11:00)');
  assert(isOverlapping('09:15', '10:45', bookedStart, bookedEnd), 'Detects enclosed subset overlap (09:15-10:45 inside 09:00-11:00)');
  assert(isOverlapping('08:00', '12:00', bookedStart, bookedEnd), 'Detects enclosing superset overlap (08:00-12:00 around 09:00-11:00)');
  assert(!isOverlapping('07:00', '09:00', bookedStart, bookedEnd), 'Allows adjacent prior slot (07:00-09:00 with 09:00-11:00)');
  assert(!isOverlapping('11:00', '13:00', bookedStart, bookedEnd), 'Allows adjacent subsequent slot (11:00-13:00 with 09:00-11:00)');
  assert(!isOverlapping('14:00', '16:00', bookedStart, bookedEnd), 'Allows completely distinct slot (14:00-16:00 with 09:00-11:00)');

  console.log('\n--- 2. AUTHENTICATION & SECURITY TESTS ---');
  const password = 'SecureStudentPassword2026!';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  assert(hash.startsWith('$2'), 'Bcrypt produces valid salted hash format');
  assert(await bcrypt.compare(password, hash), 'Bcrypt correctly matches valid password');
  assert(!(await bcrypt.compare('WrongPassword', hash)), 'Bcrypt rejects invalid password');

  const jwtSecret = 'test-secret-key-12345';
  const token = jwt.sign({ id: 'user-uuid-1', role: 'STUDENT', email: 'test@seatsync.edu' }, jwtSecret, { expiresIn: '1h' });
  const decoded = jwt.verify(token, jwtSecret) as any;

  assert(decoded.id === 'user-uuid-1', 'JWT payload contains correct user ID');
  assert(decoded.role === 'STUDENT', 'JWT payload retains STUDENT role');

  let invalidSignatureFailed = false;
  try {
    jwt.verify(token, 'tampered-secret-key');
  } catch (err) {
    invalidSignatureFailed = true;
  }
  assert(invalidSignatureFailed, 'JWT rejects token with tampered signature');

  console.log('\n--- 3. DATA INTEGRITY & ZOD VALIDATION SCHEMAS ---');
  const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    studentId: z.string().min(3)
  });

  assert(registerSchema.safeParse({ name: 'Alex Morgan', email: 'alex@seatsync.edu', password: 'secretpassword', studentId: 'STU-001' }).success, 'Valid registration payload passes schema');
  assert(!registerSchema.safeParse({ name: 'A', email: 'alex@seatsync.edu', password: '123', studentId: 'S' }).success, 'Short/invalid payload rejected by schema');

  console.log('\n--- 4. INVENTORY & OVERDUE CALCULATION LOGIC ---');
  const calculateLateFine = (dueDate: Date, returnDate: Date, finePerDay: number) => {
    if (returnDate <= dueDate) return 0;
    const diffDays = Math.ceil((returnDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays * finePerDay;
  };

  const due = new Date('2026-11-01T12:00:00Z');
  const onTime = new Date('2026-10-31T12:00:00Z');
  const threeDaysLate = new Date('2026-11-04T12:00:00Z');

  assert(calculateLateFine(due, onTime, 2.0) === 0, 'Zero fine for on-time return');
  assert(calculateLateFine(due, threeDaysLate, 2.0) === 6.0, 'Calculates exactly $6.00 fine for 3 days overdue ($2/day)');

  console.log('\n--- 5. CORS ORIGIN NORMALIZATION & MATCHING TESTS ---');
  const { normalizeOrigin, parseAllowedOrigins } = await import('../config');

  assert(
    normalizeOrigin('https://seatsync-vjgetntqa-zap-i.vercel.app/') === 'https://seatsync-vjgetntqa-zap-i.vercel.app',
    'Normalizes URL by stripping trailing slash'
  );
  assert(
    normalizeOrigin('https://seatsync-vjgetntqa-zap-i.vercel.app/dashboard?tab=seats') === 'https://seatsync-vjgetntqa-zap-i.vercel.app',
    'Normalizes URL by stripping path and query string'
  );
  assert(
    normalizeOrigin('SEATSYNC-VJGETNTQA-ZAP-I.VERCEL.APP') === 'https://seatsync-vjgetntqa-zap-i.vercel.app',
    'Prepends protocol and lowercases uppercase domain'
  );
  assert(
    normalizeOrigin('invalid://') === null,
    'Rejects invalid protocol/origin'
  );

  const allowed = parseAllowedOrigins();
  assert(
    allowed.includes('https://seatsync-2gjspnwlj-zap-j.vercel.app'),
    'Default trusted production list includes https://seatsync-2gjspnwlj-zap-j.vercel.app'
  );
  assert(
    allowed.includes('https://seatsync-vjgetntqa-zap-i.vercel.app'),
    'Default trusted production list includes https://seatsync-vjgetntqa-zap-i.vercel.app'
  );
  assert(
    allowed.includes('https://seatsync.vercel.app'),
    'Default trusted production list includes https://seatsync.vercel.app'
  );

  console.log('\n--- 6. TIME VALIDATION & ASIA/KOLKATA TIMEZONE TESTS ---');
  const { getCurrentKolkataTime, validateReservationTime } = await import('../utils/timeValidation');

  const kolkataNow = getCurrentKolkataTime();
  assert(/^\d{4}-\d{2}-\d{2}$/.test(kolkataNow.dateStr), `Kolkata date format is YYYY-MM-DD: ${kolkataNow.dateStr}`);
  assert(/^\d{2}:\d{2}$/.test(kolkataNow.timeStr), `Kolkata time format is HH:MM: ${kolkataNow.timeStr}`);
  assert(kolkataNow.hours >= 0 && kolkataNow.hours <= 23, `Kolkata hours within 0-23: ${kolkataNow.hours}`);
  assert(kolkataNow.minutes >= 0 && kolkataNow.minutes <= 59, `Kolkata minutes within 0-59: ${kolkataNow.minutes}`);

  // Test 6.1: Rejecting past dates
  const pastDateRes = validateReservationTime('2020-01-01', '10:00', '12:00', kolkataNow);
  assert(!pastDateRes.isValid && pastDateRes.errorCode === 'PAST_DATE', 'Rejects reservation on historic past date (2020-01-01)');

  // Test 6.2: Rejecting yesterday
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayKolkata = getCurrentKolkataTime(yesterdayDate);
  const yesterdayRes = validateReservationTime(yesterdayKolkata.dateStr, '10:00', '12:00', kolkataNow);
  assert(!yesterdayRes.isValid && yesterdayRes.errorCode === 'PAST_DATE', 'Rejects reservation for yesterday');

  // Test 6.3: Rejecting expired slot today
  // Mock current server time as today at 14:30 (totalMinutes = 870)
  const mockServerAfternoon = {
    dateStr: '2026-11-24',
    timeStr: '14:30',
    hours: 14,
    minutes: 30,
    totalMinutes: 870
  };
  const morningSlotRes = validateReservationTime('2026-11-24', '09:00', '11:00', mockServerAfternoon);
  assert(
    !morningSlotRes.isValid && morningSlotRes.errorCode === 'EXPIRED_TIME_SLOT',
    'Rejects expired morning slot (09:00-11:00) when server time is afternoon (14:30)'
  );

  // Test 6.4: Rejecting slot when start time is in past even if end time is in future
  const partiallyPastSlotRes = validateReservationTime('2026-11-24', '14:00', '16:00', mockServerAfternoon);
  assert(
    !partiallyPastSlotRes.isValid && partiallyPastSlotRes.errorCode === 'EXPIRED_TIME_SLOT',
    'Rejects slot (14:00-16:00) whose start time has already passed (at 14:30)'
  );

  // Test 6.5: Accepting future slot today if within operating hours
  const futureTodayRes = validateReservationTime('2026-11-24', '16:00', '18:00', mockServerAfternoon);
  assert(futureTodayRes.isValid, 'Accepts valid future slot today (16:00-18:00 at 14:30)');

  // Test 6.6: Accepting tomorrow's slot within operating hours
  const tomorrowRes = validateReservationTime('2026-11-25', '10:00', '12:00', mockServerAfternoon);
  assert(tomorrowRes.isValid, 'Accepts valid reservation for tomorrow (2026-11-25 10:00-12:00)');

  // Test 6.7: Rejecting slots outside library operating hours (library open 08:00 to 22:00)
  const tooEarlyRes = validateReservationTime('2026-11-25', '06:00', '08:00', mockServerAfternoon);
  assert(
    !tooEarlyRes.isValid && tooEarlyRes.errorCode === 'OUTSIDE_OPERATING_HOURS',
    'Rejects reservation earlier than opening hour (06:00-08:00 vs 08:00 open)'
  );

  const tooLateRes = validateReservationTime('2026-11-25', '22:00', '23:30', mockServerAfternoon);
  assert(
    !tooLateRes.isValid && tooLateRes.errorCode === 'OUTSIDE_OPERATING_HOURS',
    'Rejects reservation beyond closing hour (22:00-23:30 vs 22:00 close)'
  );

  // Test 6.8: Rejecting inverted time range (end <= start)
  const invertedRes = validateReservationTime('2026-11-25', '14:00', '12:00', mockServerAfternoon);
  assert(
    !invertedRes.isValid && invertedRes.errorCode === 'INVALID_TIME_RANGE',
    'Rejects inverted time range (14:00 to 12:00)'
  );
  const equalRes = validateReservationTime('2026-11-25', '14:00', '14:00', mockServerAfternoon);
  assert(
    !equalRes.isValid && equalRes.errorCode === 'INVALID_TIME_RANGE',
    'Rejects zero-duration time range (14:00 to 14:00)'
  );

  // Test 6.9: Rejecting malformed date or time formats
  const badFormatRes = validateReservationTime('25-11-2026', '10:00', '12:00', mockServerAfternoon);
  assert(
    !badFormatRes.isValid && badFormatRes.errorCode === 'INVALID_DATE_FORMAT',
    'Rejects non-YYYY-MM-DD date format'
  );

  console.log('\n--- 7. GOOGLE OAUTH SECURITY & INTEGRATION TESTS ---');
  const { verifyGoogleIdToken, isGoogleConfigured, getGoogleOAuthUrl } = await import('../utils/googleAuth');

  const configured = isGoogleConfigured();
  assert(typeof configured === 'boolean', 'Google auth configuration exposes boolean status');

  const oauthUrl = getGoogleOAuthUrl('https://seatsync.vercel.app/auth/callback', 'test-state-123');
  assert(oauthUrl.startsWith('https://accounts.google.com/o/oauth2/v2/auth'), 'Constructs valid Google OAuth 2.0 authorization endpoint URL');
  assert(oauthUrl.includes('redirect_uri=https'), 'OAuth URL includes encoded redirect_uri parameter');

  let emptyTokenFailed = false;
  try {
    await verifyGoogleIdToken('');
  } catch (err: any) {
    emptyTokenFailed = true;
    assert(err.message === 'ID_TOKEN_REQUIRED', 'Google auth strictly rejects empty/missing token');
  }
  assert(emptyTokenFailed, 'Rejects verification of empty ID token');

  let garbageTokenFailed = false;
  try {
    await verifyGoogleIdToken('definitely-not-a-valid-google-jwt-token');
  } catch (err: any) {
    garbageTokenFailed = true;
    assert(err.message.includes('GOOGLE_TOKEN_VERIFICATION_FAILED'), 'Google auth captures and reports token verification failure securely');
  }
  assert(garbageTokenFailed, 'Google auth securely rejects invalid/fake ID tokens');

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log(`========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
