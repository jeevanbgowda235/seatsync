import { Router, Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/books/categories - List all categories with book counts
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.bookCategory.findMany({
      include: {
        _count: {
          select: { books: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// GET /api/books - Search, filter, sort and paginate books
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, availability, sort, page = '1', limit = '12' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * pageSize;

    const whereClause: any = {};

    if (search) {
      const q = (search as string).trim();
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
        { isbn: { contains: q, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'ALL') {
      whereClause.category = {
        slug: category as string
      };
    }

    if (availability === 'AVAILABLE') {
      whereClause.availableCopies = { gt: 0 };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'title_asc') orderBy = { title: 'asc' };
    else if (sort === 'title_desc') orderBy = { title: 'desc' };
    else if (sort === 'year_desc') orderBy = { publicationYear: 'desc' };
    else if (sort === 'copies_desc') orderBy = { availableCopies: 'desc' };
    else if (sort === 'rating_desc') orderBy = { rating: 'desc' };

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where: whereClause,
        include: {
          category: {
            select: { id: true, name: true, slug: true }
          }
        },
        orderBy,
        skip,
        take: pageSize
      }),
      prisma.book.count({ where: whereClause })
    ]);

    res.json({
      success: true,
      books,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch books' });
  }
});

// GET /api/books/:id - Get book details
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id as string;
    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        category: true,
        _count: {
          select: {
            borrowingRecords: { where: { status: 'BORROWED' } }
          }
        }
      }
    });

    if (!book) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error('Error fetching book detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch book detail' });
  }
});

const bookSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  author: z.string().min(2, 'Author is required'),
  isbn: z.string().min(5, 'ISBN is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  publisher: z.string().min(2, 'Publisher is required'),
  publicationYear: z.number().int().min(1800).max(new Date().getFullYear() + 1),
  coverImage: z.string().url('Cover image must be a valid URL'),
  totalCopies: z.number().int().min(1, 'At least 1 copy required'),
  locationShelf: z.string().min(2, 'Location shelf is required'),
  rating: z.number().min(1).max(5).default(4.5)
});

// POST /api/books - Admin create book
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const validated = bookSchema.parse(req.body);

    const existingIsbn = await prisma.book.findUnique({
      where: { isbn: validated.isbn.trim() }
    });

    if (existingIsbn) {
      res.status(400).json({ success: false, message: `Book with ISBN ${validated.isbn} already exists` });
      return;
    }

    const book = await prisma.book.create({
      data: {
        ...validated,
        availableCopies: validated.totalCopies
      },
      include: {
        category: true
      }
    });

    res.status(201).json({ success: true, message: 'Book added successfully', book });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: error.errors[0].message });
      return;
    }
    console.error('Error creating book:', error);
    res.status(500).json({ success: false, message: 'Failed to create book' });
  }
});

// PUT /api/books/:id - Admin update book
router.put('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id as string;
    const currentBook = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!currentBook) {
      res.status(404).json({ success: false, message: 'Book not found' });
      return;
    }

    const {
      title,
      author,
      isbn,
      categoryId,
      description,
      publisher,
      publicationYear,
      coverImage,
      totalCopies,
      locationShelf,
      rating
    } = req.body;

    let availableAdjustment = 0;
    if (totalCopies !== undefined) {
      const diff = totalCopies - currentBook.totalCopies;
      availableAdjustment = diff;
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: {
        ...(title && { title }),
        ...(author && { author }),
        ...(isbn && { isbn }),
        ...(categoryId && { categoryId }),
        ...(description && { description }),
        ...(publisher && { publisher }),
        ...(publicationYear && { publicationYear }),
        ...(coverImage && { coverImage }),
        ...(totalCopies !== undefined && {
          totalCopies,
          availableCopies: Math.max(0, currentBook.availableCopies + availableAdjustment)
        }),
        ...(locationShelf && { locationShelf }),
        ...(rating !== undefined && { rating })
      },
      include: { category: true }
    });

    res.json({ success: true, message: 'Book updated successfully', book: updated });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ success: false, message: 'Failed to update book' });
  }
});

// DELETE /api/books/:id - Admin delete book
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bookId = req.params.id as string;
    // Check if there are active loans
    const activeLoans = await prisma.borrowingRecord.count({
      where: {
        bookId: bookId,
        status: 'BORROWED'
      }
    });

    if (activeLoans > 0) {
      res.status(400).json({
        success: false,
        message: 'Cannot delete book: Copies are currently borrowed by students.'
      });
      return;
    }

    await prisma.book.delete({
      where: { id: bookId }
    });

    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ success: false, message: 'Failed to delete book' });
  }
});

export default router;
