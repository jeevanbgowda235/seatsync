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
