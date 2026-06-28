import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Get all products (with optional category filter)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const query: any = {};

    if (category) {
      query.category = String(category).toLowerCase();
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// Get single product
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
});

// Upload image standalone route removed in favor of unified pipeline

// Create product (Admin Only)
router.post('/', authenticateToken, requireAdmin, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, price, badge, description, category, stock } = req.body;
    let { src, specs } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: 'Title, price, and category are required' });
    }

    // If an image was uploaded, grab the Cloudinary URL
    if (req.file) {
      src = req.file.path;
    }

    if (!src) {
      return res.status(400).json({ message: 'Image source or file is required' });
    }

    // Parse specs if it's sent as a string from FormData
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

    const product = new Product({
      title,
      price,
      src,
      badge,
      description,
      category: category.toLowerCase(),
      stock: stock !== undefined ? Number(stock) : 10,
      specs: parsedSpecs
    });

    await product.save();
    res.status(201).json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// Update product (Admin Only)
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, price, badge, description, category, stock } = req.body;
    let { src, specs } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // If an image was uploaded, grab the Cloudinary URL
    if (req.file) {
      src = req.file.path;
    }

    // Parse specs if it's sent as a string from FormData
    let parsedSpecs = product.specs;
    if (specs) {
      if (typeof specs === 'string') {
        try {
          parsedSpecs = JSON.parse(specs);
        } catch (e) {}
      } else if (Array.isArray(specs)) {
        parsedSpecs = specs;
      }
    }

    if (title) product.title = title;
    if (price) product.price = price;
    if (src) product.src = src;
    if (badge !== undefined) product.badge = badge;
    if (description !== undefined) product.description = description;
    if (category) product.category = category.toLowerCase();
    if (stock !== undefined) product.stock = Number(stock);
    product.specs = parsedSpecs;

    await product.save();
    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// Delete product (Admin Only)
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

// Quick Stock / Inventory Update (Admin Only)
router.patch('/:id/stock', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { stock } = req.body;

    if (stock === undefined || isNaN(Number(stock))) {
      return res.status(400).json({ message: 'Valid stock value is required' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stock = Number(stock);
    await product.save();

    res.json({ id: product._id, stock: product.stock, message: 'Stock updated successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating product stock', error: error.message });
  }
});

export default router;
