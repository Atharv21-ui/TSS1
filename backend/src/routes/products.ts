import { Router, Request, Response } from 'express';
import { productsCollection, IProduct } from '../models/Product';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { FieldValue, Query } from 'firebase-admin/firestore';
import { sanitizeString, sanitizePositiveNumber, sanitizePrice } from '../utils/sanitize';

const router = Router();

// Get all products (with optional category filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let query: Query = productsCollection;

    if (category) {
      query = query.where('category', '==', String(category).toLowerCase());
    }

    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      _id: doc.id,
      id: doc.id, // Keep both for compatibility
      ...doc.data()
    }));
    
    // Sort in memory by createdAt descending to avoid requiring Firestore composite indexes
    products.sort((a: any, b: any) => {
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : (a.createdAt?._seconds ? a.createdAt._seconds * 1000 : 0);
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : (b.createdAt?._seconds ? b.createdAt._seconds * 1000 : 0);
      return bTime - aTime;
    });
    
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const docRef = await productsCollection.doc(req.params.id as string).get();
    if (!docRef.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ _id: docRef.id, id: docRef.id, ...docRef.data() });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
});

// Create product (Admin Only)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const title = sanitizeString(req.body.title, 200);
    const category = sanitizeString(req.body.category, 100);
    const badge = sanitizeString(req.body.badge, 50);
    const description = sanitizeString(req.body.description, 2000);
    
    // Enforce positive price and stock values (Business Logic validation)
    const price = sanitizePrice(req.body.price);
    const stock = sanitizePositiveNumber(req.body.stock, 0);

    let { src, specs } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, price, and category are required' });
    }

    if (req.file) {
      src = req.file.path;
    }

    if (!src) {
      return res.status(400).json({ message: 'Image source or file is required' });
    }

    let parsedSpecs = [];
    if (typeof specs === 'string') {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch (e) {
        parsedSpecs = [];
      }
    } else if (Array.isArray(specs)) {
      parsedSpecs = specs;
    }

    const newProduct: IProduct = {
      title,
      price,
      src,
      badge,
      description,
      category: category.toLowerCase(),
      stock: stock !== undefined ? Number(stock) : 10,
      specs: parsedSpecs,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    const docRef = await productsCollection.add(newProduct);
    res.status(201).json({ _id: docRef.id, id: docRef.id, ...newProduct });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const title = req.body.title !== undefined ? sanitizeString(req.body.title, 200) : undefined;
    const category = req.body.category !== undefined ? sanitizeString(req.body.category, 100) : undefined;
    const badge = req.body.badge !== undefined ? sanitizeString(req.body.badge, 50) : undefined;
    const description = req.body.description !== undefined ? sanitizeString(req.body.description, 2000) : undefined;
    
    // Validate positive value updates
    const price = req.body.price !== undefined ? sanitizePrice(req.body.price) : undefined;
    const stock = req.body.stock !== undefined ? sanitizePositiveNumber(req.body.stock, 0) : undefined;

    let { src, specs } = req.body;

    const docRef = productsCollection.doc(req.params.id as string);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productData = docSnap.data() as IProduct;

    if (req.file) {
      src = req.file.path;
    }

    let parsedSpecs = productData.specs;
    if (specs) {
      if (typeof specs === 'string') {
        try {
          parsedSpecs = JSON.parse(specs);
        } catch (e) {}
      } else if (Array.isArray(specs)) {
        parsedSpecs = specs;
      }
    }

    const updates: Partial<IProduct> = { updatedAt: FieldValue.serverTimestamp() };
    if (title !== undefined) updates.title = title;
    if (price !== undefined) updates.price = price;
    if (src !== undefined) updates.src = src;
    if (badge !== undefined) updates.badge = badge;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category.toLowerCase();
    if (stock !== undefined) updates.stock = stock;
    updates.specs = parsedSpecs;

    await docRef.update(updates as any);
    
    // Fetch updated data to return
    const updatedSnap = await docRef.get();
    res.json({ _id: updatedSnap.id, id: updatedSnap.id, ...updatedSnap.data() });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const docRef = productsCollection.doc(req.params.id as string);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await docRef.delete();
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Quick Stock / Inventory Update (Admin Only)
router.patch('/:id/stock', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const stock = sanitizePositiveNumber(req.body.stock, -1);

    if (stock === -1) {
      return res.status(400).json({ message: 'Valid non-negative stock value is required' });
    }

    const docRef = productsCollection.doc(req.params.id as string);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await docRef.update({ 
      stock: stock,
      updatedAt: FieldValue.serverTimestamp() 
    });

    res.json({ _id: docRef.id, id: docRef.id, stock: stock, message: 'Stock updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating product stock', error: error.message });
  }
});

export default router;
