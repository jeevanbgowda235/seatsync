import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SeatSync Database Seed...');

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

  // 1. Create Admin User
  const adminSalt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', adminSalt);

  const admin = await prisma.user.create({
    data: {
      name: 'Dr. Eleanor Vance',
      email: 'admin@seatsync.edu',
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
  console.log('✅ Admin user created: admin@seatsync.edu / AdminPassword123!');

  // 2. Create Demo Students
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
  console.log('✅ Demo students created: alex.morgan@university.edu / StudentPass123!');

  // 3. Create Book Categories
  const categoriesData = [
    { name: 'Computer Science', slug: 'computer-science', description: 'Core computer science fundamentals, algorithms and data structures' },
    { name: 'Software Engineering', slug: 'software-engineering', description: 'System design, software architecture, patterns and agile methods' },
    { name: 'Artificial Intelligence', slug: 'artificial-intelligence', description: 'Machine learning, neural networks, deep learning and LLMs' },
    { name: 'Cybersecurity & Networks', slug: 'cybersecurity-networks', description: 'Network protocols, cryptography and information security' },
    { name: 'Mathematics & Statistics', slug: 'mathematics-statistics', description: 'Discrete mathematics, linear algebra and probability' },
    { name: 'Business & Management', slug: 'business-management', description: 'Tech entrepreneurship, product management and leadership' }
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.bookCategory.create({ data: cat });
    categoryMap[cat.slug] = created.id;
  }
  console.log('✅ Book categories created.');

  // 4. Create Books
  const booksData = [
    {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      categoryId: categoryMap['software-engineering'],
      description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. This book is a must-have for any developer aiming for excellence.',
      publisher: 'Prentice Hall',
      publicationYear: 2008,
      coverImage: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
      totalCopies: 5,
      availableCopies: 4,
      locationShelf: 'Floor 1 — Shelf SE-101',
      rating: 4.8
    },
    {
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      categoryId: categoryMap['software-engineering'],
      description: 'The definitive guide to the architecture of modern data systems. Covers scalability, consistency, reliability, partitioning, replication and stream processing in deep technical clarity.',
      publisher: "O'Reilly Media",
      publicationYear: 2017,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      totalCopies: 4,
      availableCopies: 3,
      locationShelf: 'Floor 1 — Shelf SE-104',
      rating: 4.9
    },
    {
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein',
      isbn: '978-0262046305',
      categoryId: categoryMap['computer-science'],
      description: 'A comprehensive textbook and standard reference for algorithms and data structures globally. Rigorous analysis with mathematical proofs and pseudo-code explanations.',
      publisher: 'MIT Press',
      publicationYear: 2022,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=600&q=80',
      totalCopies: 6,
      availableCopies: 5,
      locationShelf: 'Floor 1 — Shelf CS-201',
      rating: 4.7
    },
    {
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell & Peter Norvig',
      isbn: '978-0134610993',
      categoryId: categoryMap['artificial-intelligence'],
      description: 'The most comprehensive, up-to-date introduction to the theory and practice of artificial intelligence, from search algorithms and knowledge representation to reinforcement learning and transformers.',
      publisher: 'Pearson',
      publicationYear: 2020,
      coverImage: 'https://images.unsplash.com/photo-1507842229451-7f01be7fe8e7?auto=format&fit=crop&w=600&q=80',
      totalCopies: 4,
      availableCopies: 3,
      locationShelf: 'Floor 2 — Shelf AI-301',
      rating: 4.9
    },
    {
      title: 'Computer Networking: A Top-Down Approach',
      author: 'James F. Kurose & Keith W. Ross',
      isbn: '978-0136681557',
      categoryId: categoryMap['cybersecurity-networks'],
      description: 'Focuses on application-layer paradigms before moving down to transport, network and link layers. Features deep coverage of modern network protocols, Wi-Fi, 5G and cybersecurity principles.',
      publisher: 'Pearson',
      publicationYear: 2021,
      coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
      totalCopies: 5,
      availableCopies: 5,
      locationShelf: 'Floor 2 — Shelf NET-401',
      rating: 4.6
    },
    {
      title: 'The Pragmatic Programmer: Your Journey to Mastery',
      author: 'David Thomas & Andrew Hunt',
      isbn: '978-0135957059',
      categoryId: categoryMap['software-engineering'],
      description: 'One of the most significant books on software craft. Covers career practices, code architecture, testing philosophies and debugging strategies for long-term developer effectiveness.',
      publisher: 'Addison-Wesley',
      publicationYear: 2019,
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
      totalCopies: 3,
      availableCopies: 2,
      locationShelf: 'Floor 1 — Shelf SE-102',
      rating: 4.9
    },
    {
      title: 'Deep Learning',
      author: 'Ian Goodfellow, Yoshua Bengio, Aaron Courville',
      isbn: '978-0262035613',
      categoryId: categoryMap['artificial-intelligence'],
      description: 'An authoritative mathematical and applied introduction to deep neural networks, convolutional networks, autoencoders, generative adversarial networks and optimization methods.',
      publisher: 'MIT Press',
      publicationYear: 2016,
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      totalCopies: 3,
      availableCopies: 3,
      locationShelf: 'Floor 2 — Shelf AI-305',
      rating: 4.7
    },
    {
      title: 'Linear Algebra and Its Applications',
      author: 'Gilbert Strang',
      isbn: '978-0030105678',
      categoryId: categoryMap['mathematics-statistics'],
      description: 'Renowned introduction to matrices, vector spaces, eigenvalues, singular value decomposition and linear transformations with practical applications in computation and engineering.',
      publisher: 'Cengage Learning',
      publicationYear: 2016,
      coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
      totalCopies: 4,
      availableCopies: 4,
      locationShelf: 'Floor 2 — Shelf MATH-101',
      rating: 4.8
    }
  ];

  const createdBooks = [];
  for (const b of booksData) {
    const book = await prisma.book.create({ data: b });
    createdBooks.push(book);
  }
  console.log(`✅ ${createdBooks.length} Books created.`);

  // 5. Create Seats (Floor 1 and Floor 2)
  console.log('🪑 Creating library seats...');
  const rows = ['A', 'B', 'C', 'D'];
  const createdSeats = [];

  // Floor 1: Rows A & B (Quiet Study), Rows C & D (Collaborative Area)
  for (const row of rows) {
    const section = (row === 'A' || row === 'B') ? 'Quiet Study Zone' : 'Collaborative Area';
    const type = (row === 'A') ? 'POWER_OUTLET' : 'STANDARD';

    for (let col = 1; col <= 6; col++) {
      const seatNumber = `${row}${col < 10 ? '0' + col : col}`;
      const seat = await prisma.seat.create({
        data: {
          seatNumber,
          floor: 1,
          section,
          type,
          hasPower: true,
          hasMonitor: false,
          isActive: true,
          row,
          column: col
        }
      });
      createdSeats.push(seat);
    }
  }

  // Floor 2: Rows E & F (Tech & Dual-Monitor Lab), Row G (Silent Individual Booths)
  const floor2Rows = ['E', 'F'];
  for (const row of floor2Rows) {
    for (let col = 1; col <= 6; col++) {
      const seatNumber = `${row}${col < 10 ? '0' + col : col}`;
      const seat = await prisma.seat.create({
        data: {
          seatNumber,
          floor: 2,
          section: 'Tech & Dual-Monitor Lab',
          type: 'MONITOR_DESK',
          hasPower: true,
          hasMonitor: true,
          isActive: true,
          row,
          column: col
        }
      });
      createdSeats.push(seat);
    }
  }

  // Row G (Silent Individual Booths)
  for (let col = 1; col <= 4; col++) {
    const seatNumber = `G0${col}`;
    const seat = await prisma.seat.create({
      data: {
        seatNumber,
        floor: 2,
        section: 'Silent Individual Booths',
        type: 'SILENT_BOOTH',
        hasPower: true,
        hasMonitor: false,
        isActive: col !== 4, // G04 set to maintenance to demonstrate grey status!
        row: 'G',
        column: col
      }
    });
    createdSeats.push(seat);
  }
  console.log(`✅ ${createdSeats.length} Library seats created across 2 floors.`);

  // 6. Create Seed Reservations
  const todayStr = new Date().toISOString().split('T')[0];

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Reservation 1: Alex Morgan on A01 today 09:00 - 11:00
  const seatA01 = createdSeats.find(s => s.seatNumber === 'A01')!;
  const qrAlexPayload = JSON.stringify({
    reservationCode: 'RES-2026-ALX01',
    seatNumber: 'A01',
    date: todayStr,
    startTime: '09:00',
    endTime: '11:00',
    userId: studentAlex.id
  });
  const qrAlexData = await QRCode.toDataURL(qrAlexPayload, { width: 300 });

  await prisma.reservation.create({
    data: {
      reservationCode: 'RES-2026-ALX01',
      userId: studentAlex.id,
      seatId: seatA01.id,
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
          deviceDetails: 'Student Mobile Browser'
        }
      }
    }
  });

  // Reservation 2: Samantha on B02 today 09:00 - 11:00 (demonstrates reserved seat)
  const seatB02 = createdSeats.find(s => s.seatNumber === 'B02')!;
  const qrSamData = await QRCode.toDataURL(JSON.stringify({ code: 'RES-2026-SAM02', seat: 'B02' }));
  await prisma.reservation.create({
    data: {
      reservationCode: 'RES-2026-SAM02',
      userId: studentSamantha.id,
      seatId: seatB02.id,
      date: todayStr,
      startTime: '09:00',
      endTime: '11:00',
      status: 'CONFIRMED',
      qrCodeData: qrSamData
    }
  });

  // Reservation 3: David on E03 tomorrow 13:00 - 15:00
  const seatE03 = createdSeats.find(s => s.seatNumber === 'E03')!;
  const qrDavidData = await QRCode.toDataURL(JSON.stringify({ code: 'RES-2026-DAV03', seat: 'E03' }));
  await prisma.reservation.create({
    data: {
      reservationCode: 'RES-2026-DAV03',
      userId: studentDavid.id,
      seatId: seatE03.id,
      date: tomorrowStr,
      startTime: '13:00',
      endTime: '15:00',
      status: 'CONFIRMED',
      qrCodeData: qrDavidData
    }
  });
  console.log('✅ Demo reservations created.');

  // 7. Create Demo Borrowing Records & Requests
  // Alex borrowed Clean Code
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

  // Samantha borrowed Pragmatic Programmer
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

  // David requested AI Modern Approach (Pending Admin Approval)
  const bookAI = createdBooks.find(b => b.title.includes('Artificial Intelligence'))!;
  await prisma.borrowRequest.create({
    data: {
      requestCode: 'REQ-2026-DAV44',
      userId: studentDavid.id,
      bookId: bookAI.id,
      status: 'PENDING'
    }
  });

  console.log('✅ Demo loans and pending borrow requests created.');
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
