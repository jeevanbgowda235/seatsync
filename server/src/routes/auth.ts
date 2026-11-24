import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import prisma from '../prisma/client';
import { config } from '../config';
import { authenticate, AuthRequest } from '../middleware/auth';
import { verifyGoogleIdToken, getGoogleOAuthUrl, exchangeCodeForGoogleTokens } from '../utils/googleAuth';

const router = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().min(3, 'Student ID must be at least 3 characters'),
  department: z.string().optional(),
  yearOfStudy: z.string().optional(),
  phone: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// POST /api/auth/register
router.post('/register', async (req, res: Response): Promise<void> => {
  try {
    const validated = registerSchema.parse(req.body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() }
    });

    if (existingEmail) {
      res.status(400).json({ success: false, message: 'Email is already registered' });
      return;
    }

    const existingStudentId = await prisma.user.findUnique({
      where: { studentId: validated.studentId.trim() }
    });

    if (existingStudentId) {
      res.status(400).json({ success: false, message: 'Student ID is already registered' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    const libraryCardNumber = `LIB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const user = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: validated.email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        studentId: validated.studentId.trim(),
        department: validated.department || 'Computer Science',
        phone: validated.phone || '',
        studentProfile: {
          create: {
            libraryCardNumber,
            yearOfStudy: validated.yearOfStudy || '2nd Year',
            maxBorrowLimit: config.libraryConfig.maxBorrowLimit,
            status: 'ACTIVE'
          }
        },
        notifications: {
          create: {
            title: 'Welcome to SeatSync!',
            message: `Your library card number is ${libraryCardNumber}. You can now reserve reading seats and request book borrowings.`,
            type: 'SYSTEM'
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to SeatSync.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        libraryCardNumber: user.studentProfile?.libraryCardNumber
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
      include: {
        studentProfile: true
      }
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        libraryCardNumber: user.studentProfile?.libraryCardNumber,
        yearOfStudy: user.studentProfile?.yearOfStudy,
        fineAmount: user.studentProfile?.fineAmount || 0
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        studentProfile: true,
        _count: {
          select: {
            reservations: { where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } } },
            borrowingRecords: { where: { status: 'BORROWED' } },
            notifications: { where: { isRead: false } }
          }
        }
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        libraryCardNumber: user.studentProfile?.libraryCardNumber,
        yearOfStudy: user.studentProfile?.yearOfStudy,
        maxBorrowLimit: user.studentProfile?.maxBorrowLimit || 3,
        fineAmount: user.studentProfile?.fineAmount || 0,
        activeReservationsCount: user._count.reservations,
        activeBorrowedBooksCount: user._count.borrowingRecords,
        unreadNotificationsCount: user._count.notifications
      }
    });
  } catch (error) {
    console.error('Auth /me error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving user profile' });
  }
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, department, phone, yearOfStudy } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(name && { name: name.trim() }),
        ...(department && { department: department.trim() }),
        ...(phone && { phone: phone.trim() }),
        studentProfile: {
          update: {
            ...(yearOfStudy && { yearOfStudy: yearOfStudy.trim() })
          }
        }
      },
      include: {
        studentProfile: true
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        department: updated.department,
        phone: updated.phone,
        yearOfStudy: updated.studentProfile?.yearOfStudy
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// GET /api/auth/google/status - Check if Google OAuth is configured
router.get('/google/status', (_req, res: Response): void => {
  res.json({
    success: true,
    isConfigured: !!config.googleClientId,
    clientId: config.googleClientId || null
  });
});

// POST /api/auth/google - Authenticate using verified Google ID Token
router.post('/google', async (req, res: Response): Promise<void> => {
  try {
    const credential = req.body.credential || req.body.idToken || req.body.token;

    if (!credential) {
      res.status(400).json({
        success: false,
        code: 'TOKEN_REQUIRED',
        message: 'Google credential/ID token is required.'
      });
      return;
    }

    if (!config.googleClientId) {
      res.status(503).json({
        success: false,
        code: 'GOOGLE_OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.'
      });
      return;
    }

    // Verify token cryptographically with Google's official public keys
    const googleUser = await verifyGoogleIdToken(credential);

    // Look for existing user by verified email
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      include: {
        studentProfile: true
      }
    });

    let isNewUser = false;

    if (!user) {
      // Create new user through verified Google Identity
      isNewUser = true;
      const libraryCardNumber = `LIB-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      const studentId = `STU-${Math.floor(100000 + Math.random() * 900000)}`;
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(randomPassword, salt);

      user = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          passwordHash,
          role: 'STUDENT',
          studentId,
          department: 'General Studies',
          avatarUrl: googleUser.avatarUrl || null,
          studentProfile: {
            create: {
              libraryCardNumber,
              yearOfStudy: '1st Year',
              maxBorrowLimit: config.libraryConfig.maxBorrowLimit,
              status: 'ACTIVE'
            }
          },
          notifications: {
            create: {
              title: 'Welcome to SeatSync!',
              message: `Your Google account has been linked to library card ${libraryCardNumber}. You can now reserve reading seats and borrow academic textbooks.`,
              type: 'SYSTEM'
            }
          }
        },
        include: {
          studentProfile: true
        }
      });
    } else {
      // If user exists and doesn't have an avatarUrl yet, save Google's picture
      if (!user.avatarUrl && googleUser.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: googleUser.avatarUrl },
          include: { studentProfile: true }
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(isNewUser ? 201 : 200).json({
      success: true,
      message: isNewUser ? 'Account registered successfully with Google!' : 'Google login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        avatarUrl: user.avatarUrl,
        libraryCardNumber: user.studentProfile?.libraryCardNumber,
        fineAmount: user.studentProfile?.fineAmount || 0
      }
    });
  } catch (error: any) {
    console.error('Google Auth Error:', error.message || error);
    res.status(401).json({
      success: false,
      code: 'GOOGLE_AUTH_FAILED',
      message: error.message || 'Google token verification failed'
    });
  }
});

export default router;
