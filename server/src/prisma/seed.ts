import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import crypto from 'crypto';

const prisma = new PrismaClient();
const isProduction = process.env.NODE_ENV === 'production';

async function main() {
  console.log(`🌱 Starting SeatSync Database Seed (Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'})...`);

  // Clean existing data in reverse order of foreign keys
  await prisma.checkIn.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.borrowingRecord.deleteMany();
  await prisma.borrowRequest.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.book.deleteMany();
  await prisma.bookCategory.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Existing data wiped.');

  // 1. Resolve Admin Credentials
  const adminEmail = process.env.ADMIN_EMAIL?.trim() || 'admin@seatsync.edu';
  let adminPassword = process.env.ADMIN_INITIAL_PASSWORD?.trim();

  if (isProduction) {
    if (!adminPassword || adminPassword === 'AdminPassword123!') {
      adminPassword = crypto.randomBytes(8).toString('hex') + '!A1';
      console.log('================================================================');
      console.log('⚠️ [PRODUCTION ADMIN CREDENTIAL GENERATED]');
      console.log(`📧 Admin Email:    ${adminEmail}`);
      console.log(`🔑 Admin Password: ${adminPassword}`);
      console.log('⚠️ IMPORTANT: Save these credentials immediately and change upon login.');
      console.log('================================================================');
    } else {
      console.log(`🔒 Production Admin configured from environment for: ${adminEmail}`);
    }
  } else {
    adminPassword = adminPassword || 'AdminPassword123!';
  }

  const adminSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(adminPassword, adminSalt);

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      studentId: 'STAFF-LIB-01',
      department: 'Library Administration',
      phone: '+1 (555) 234-5678',
      notifications: {
        create: {
          title: 'System Initialized',
          message: 'SeatSync administration dashboard is active and running.',
          type: 'SYSTEM'
        }
      }
    }
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // 2. Create Categories
  const categories = [
    { name: 'Computer Science & Software', slug: 'computer-science', description: 'Algorithms, data structures, software engineering, and web development', icon: 'Code' },
    { name: 'Artificial Intelligence & Data', slug: 'ai-data-science', description: 'Machine learning, deep learning, neural networks, and statistics', icon: 'Brain' },
    { name: 'Mathematics & Algorithms', slug: 'mathematics', description: 'Discrete math, calculus, linear algebra, and discrete optimization', icon: 'Sigma' },
    { name: 'Science & Engineering', slug: 'science-engineering', description: 'Physics, electronics, systems engineering, and hardware design', icon: 'Cpu' },
    { name: 'Design & Human-Computer Interaction', slug: 'design-ux', description: 'UI/UX design principles, design systems, and product thinking', icon: 'Palette' },
    { name: 'Literature & Philosophy', slug: 'literature-philosophy', description: 'Classical literature, ethics, philosophy, and history', icon: 'BookOpen' }
  ];

  const createdCategories: any[] = [];
  for (const cat of categories) {
    const created = await prisma.bookCategory.create({ data: cat });
    createdCategories.push(created);
  }
  console.log(`✅ ${createdCategories.length} book categories created.`);

  // 3. Create Books
  const csCat = createdCategories.find(c => c.slug === 'computer-science')!;
  const aiCat = createdCategories.find(c => c.slug === 'ai-data-science')!;
  const mathCat = createdCategories.find(c => c.slug === 'mathematics')!;
  const designCat = createdCategories.find(c => c.slug === 'design-ux')!;

  const booksData = [
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      categoryId: csCat.id,
      description: 'Even bad code can function. But if code is not clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost due to poorly written code. This book is a must for any developer, software engineer, project manager, team lead, or systems analyst with an interest in producing better code.',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&q=80&w=600',
      totalCopies: 5,
      availableCopies: 4,
      locationShelf: 'Shelf CS-101',
      rating: 4.8
    },
    {
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas, Andrew Hunt',
      isbn: '978-0135957059',
      categoryId: csCat.id,
      description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process: taking a requirement and producing working, maintainable code that delights users.',
      publisher: 'Addison-Wesley Professional',
      publicationYear: 2019,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      totalCopies: 4,
      availableCopies: 3,
      locationShelf: 'Shelf CS-102',
      rating: 4.9
    },
    {
      title: 'Introduction to Algorithms, Fourth Edition',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '978-0262046305',
      categoryId: csCat.id,
      description: 'A comprehensive update of the leading algorithms text, with new material on matchings in bipartite graphs, online algorithms, machine learning, and other topics.',
      publisher: 'The MIT Press',
      publicationYear: 2022,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
      totalCopies: 6,
      availableCopies: 6,
      locationShelf: 'Shelf CS-103',
      rating: 4.7
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      categoryId: csCat.id,
      description: 'Data is at the center of many challenges in system design today. Difficult issues need to be figured out, such as scalability, consistency, reliability, efficiency, and maintainability.',
      publisher: "O'Reilly Media",
      publicationYear: 2017,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=600',
      totalCopies: 3,
      availableCopies: 3,
      locationShelf: 'Shelf CS-104',
      rating: 4.9
    },
    {
      title: 'Artificial Intelligence: A Modern Approach (4th Edition)',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0134610993',
      categoryId: aiCat.id,
      description: 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence. Used in over 1,500 universities in 135 countries.',
      publisher: 'Pearson',
      publicationYear: 2020,
      coverImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=600',
      totalCopies: 4,
      availableCopies: 4,
      locationShelf: 'Shelf AI-201',
      rating: 4.8
    },
    {
      title: 'Deep Learning',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      isbn: '978-0262035613',
      categoryId: aiCat.id,
      description: 'An introduction to a broad range of topics in deep learning, covering mathematical and conceptual background, deep learning techniques used in industry, and research perspectives.',
      publisher: 'The MIT Press',
      publicationYear: 2016,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
      totalCopies: 3,
      availableCopies: 3,
      locationShelf: 'Shelf AI-202',
      rating: 4.6
    },
    {
      title: 'Linear Algebra and Its Applications',
      author: 'Gilbert Strang',
      isbn: '978-0030105678',
      categoryId: mathCat.id,
      description: 'Renowned professor and lecturer Gilbert Strang illustrates that linear algebra is a fascinating subject to understand by applying theory to practical matrix problems.',
      publisher: 'Cengage Learning',
      publicationYear: 2006,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=600',
      totalCopies: 4,
      availableCopies: 4,
      locationShelf: 'Shelf MA-301',
      rating: 4.7
    },
    {
      title: 'Don’t Make Me Think, Revisited',
      author: 'Steve Krug',
      isbn: '978-0321965516',
      categoryId: designCat.id,
      description: 'Since Don’t Make Me Think was first published in 2000, hundreds of thousands of Web designers and developers have relied on usability guru Steve Krug’s guide to help them understand the principles of intuitive navigation and information design.',
      publisher: 'New Riders',
      publicationYear: 2014,
      coverImage: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
      totalCopies: 4,
      availableCopies: 4,
      locationShelf: 'Shelf UX-401',
      rating: 4.8
    }
  ];

  const createdBooks: any[] = [];
  for (const b of booksData) {
    const book = await prisma.book.create({ data: b });
    createdBooks.push(book);
  }
  console.log(`✅ ${createdBooks.length} books added to catalogue.`);

  // 4. Create 40 Seats organized in Zones & Rows
  const seatDefinitions: any[] = [];
  const rows = ['A', 'B', 'C', 'D'];

  for (const row of rows) {
    for (let col = 1; col <= 10; col++) {
      const seatNumber = `${row}${col < 10 ? '0' + col : col}`;
      let section = 'Quiet Zone';
      let type: 'STANDARD' | 'POWER_OUTLET' | 'MONITOR_DESK' | 'SILENT_BOOTH' = 'STANDARD';
      let hasPower = true;
      let hasMonitor = false;

      if (row === 'A') {
        section = 'Quiet Study Zone';
        type = 'SILENT_BOOTH';
        hasPower = true;
        hasMonitor = false;
      } else if (row === 'B') {
        section = 'Collaborative Discussion Zone';
        type = 'POWER_OUTLET';
        hasPower = true;
        hasMonitor = false;
      } else if (row === 'C') {
        section = 'Digital Research Lab';
        type = 'MONITOR_DESK';
        hasPower = true;
        hasMonitor = true;
      } else {
        section = 'General Reading Area';
        type = 'STANDARD';
        hasPower = col % 2 === 0;
        hasMonitor = false;
      }

      seatDefinitions.push({
        seatNumber,
        floor: 1,
        section,
        type,
        hasPower,
        hasMonitor,
        isActive: true,
        row,
        column: col
      });
    }
  }

  for (const seatDef of seatDefinitions) {
    await prisma.seat.create({ data: seatDef });
  }
  console.log(`✅ 40 physical library seats created across 4 zones.`);

  // 5. Seed Demo Students & Bookings ONLY if not in production or SEED_DEMO_DATA=true
  const shouldSeedDemoData = process.env.SEED_DEMO_DATA === 'true' || !isProduction;

  if (shouldSeedDemoData) {
    console.log('📦 Seeding demo students and reservations...');

    const studentSalt = await bcrypt.genSalt(10);
    const studentPasswordHash = await bcrypt.hash('StudentPass123!', studentSalt);

    const studentAlex = await prisma.user.create({
      data: {
        name: 'Alex Morgan',
        email: 'alex.morgan@university.edu',
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        studentId: 'STU-2024-001',
        department: 'Computer Science',
        phone: '+1 (555) 432-1001',
        studentProfile: {
          create: {
            libraryCardNumber: 'LIB-2026-88102',
            yearOfStudy: '3rd Year',
            maxBorrowLimit: 3,
            status: 'ACTIVE',
            fineAmount: 0.0
          }
        },
        notifications: {
          create: [
            {
              title: 'Welcome to SeatSync!',
              message: 'Your library card LIB-2026-88102 is active. You can now reserve seats and borrow books.',
              type: 'SYSTEM'
            }
          ]
        }
      }
    });

    const studentSamantha = await prisma.user.create({
      data: {
        name: 'Samantha Wilson',
        email: 'sam.wilson@university.edu',
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        studentId: 'STU-2024-002',
        department: 'Software Engineering',
        phone: '+1 (555) 432-1002',
        studentProfile: {
          create: {
            libraryCardNumber: 'LIB-2026-88103',
            yearOfStudy: '2nd Year',
            maxBorrowLimit: 3,
            status: 'ACTIVE',
            fineAmount: 0.0
          }
        }
      }
    });

    const studentDavid = await prisma.user.create({
      data: {
        name: 'David Chen',
        email: 'david.chen@university.edu',
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
        studentId: 'STU-2024-003',
        department: 'Data Science & AI',
        phone: '+1 (555) 432-1003',
        studentProfile: {
          create: {
            libraryCardNumber: 'LIB-2026-88104',
            yearOfStudy: '4th Year',
            maxBorrowLimit: 3,
            status: 'ACTIVE',
            fineAmount: 0.0
          }
        }
      }
    });

    console.log('✅ Demo student accounts created.');

    const seatA01 = await prisma.seat.findUnique({ where: { seatNumber: 'A01' } });
    const seatB02 = await prisma.seat.findUnique({ where: { seatNumber: 'B02' } });
    const seatC05 = await prisma.seat.findUnique({ where: { seatNumber: 'C05' } });

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const qrAlexData = await QRCode.toDataURL(JSON.stringify({
      code: 'RES-2026-ALX01',
      seat: 'A01',
      date: todayStr,
      time: '09:00-11:00'
    }));

    await prisma.reservation.create({
      data: {
        reservationCode: 'RES-2026-ALX01',
        userId: studentAlex.id,
        seatId: seatA01!.id,
        date: todayStr,
        startTime: '09:00',
        endTime: '11:00',
        status: 'CHECKED_IN',
        checkInTime: new Date(),
        qrCodeData: qrAlexData,
        checkIns: {
          create: {
            checkInMethod: 'QR_SCAN',
            checkInTime: new Date(),
            deviceDetails: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
          }
        }
      }
    });

    const qrSamData = await QRCode.toDataURL(JSON.stringify({
      code: 'RES-2026-SAM02',
      seat: 'B02',
      date: todayStr,
      time: '14:00-17:00'
    }));

    await prisma.reservation.create({
      data: {
        reservationCode: 'RES-2026-SAM02',
        userId: studentSamantha.id,
        seatId: seatB02!.id,
        date: todayStr,
        startTime: '14:00',
        endTime: '17:00',
        status: 'CONFIRMED',
        qrCodeData: qrSamData
      }
    });

    const qrDavidData = await QRCode.toDataURL(JSON.stringify({
      code: 'RES-2026-DAV03',
      seat: 'C05',
      date: tomorrowStr,
      time: '13:00-15:00'
    }));

    await prisma.reservation.create({
      data: {
        reservationCode: 'RES-2026-DAV03',
        userId: studentDavid.id,
        seatId: seatC05!.id,
        date: tomorrowStr,
        startTime: '13:00',
        endTime: '15:00',
        status: 'CONFIRMED',
        qrCodeData: qrDavidData
      }
    });

    // Loans
    const bookCleanCode = createdBooks.find(b => b.title.includes('Clean Code'))!;
    const dueDateAlex = new Date();
    dueDateAlex.setDate(dueDateAlex.getDate() + 10);

    await prisma.borrowingRecord.create({
      data: {
        borrowCode: 'BRW-2026-ALX99',
        userId: studentAlex.id,
        bookId: bookCleanCode.id,
        borrowDate: new Date(),
        dueDate: dueDateAlex,
        status: 'BORROWED'
      }
    });

    const bookPragmatic = createdBooks.find(b => b.title.includes('Pragmatic'))!;
    const dueDateSam = new Date();
    dueDateSam.setDate(dueDateSam.getDate() + 7);

    await prisma.borrowingRecord.create({
      data: {
        borrowCode: 'BRW-2026-SAM77',
        userId: studentSamantha.id,
        bookId: bookPragmatic.id,
        borrowDate: new Date(),
        dueDate: dueDateSam,
        status: 'BORROWED'
      }
    });

    const bookAI = createdBooks.find(b => b.title.includes('Artificial Intelligence'))!;
    await prisma.borrowRequest.create({
      data: {
        requestCode: 'REQ-2026-DAV44',
        userId: studentDavid.id,
        bookId: bookAI.id,
        status: 'PENDING'
      }
    });
    console.log('✅ Demo loans and reservations created.');
  } else {
    console.log('🔒 Production mode: Demo student accounts and mock bookings skipped.');
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
