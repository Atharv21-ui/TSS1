import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import { User } from './models/User';
import { Product } from './models/Product';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tss';

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('netlify.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Basic health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'TSS Backend is running' });
});

// Database seeding function
const seedDatabase = async () => {
  try {
    // 1. Seed Admin User if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'TSS Admin',
        email: 'admin@tss.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('Seeded default admin account: admin@tss.com / admin123');
    }

    // 2. Seed default products if none exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const defaultProducts = [
        // Laptops
        {
          title: 'TSS BLADE X1',
          price: '1,299$',
          src: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=600',
          badge: 'GAMING',
          description: 'The ultimate portable gaming powerhouse.',
          category: 'laptops',
          stock: 15,
          specs: [
            { label: 'Processor', value: 'Intel Core i9-13900H' },
            { label: 'Graphics', value: 'NVIDIA RTX 4080 (150W)' },
            { label: 'Display', value: '16" QHD+ 240Hz OLED' },
            { label: 'Memory', value: '32GB DDR5 5600MHz' },
            { label: 'Storage', value: '2TB PCIe Gen4 NVMe' }
          ]
        },
        {
          title: 'TSS STUDIO',
          price: '1,599$',
          src: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=600',
          badge: 'CREATORS',
          description: 'Color accuracy and unmatched rendering speeds.',
          category: 'laptops',
          stock: 12,
          specs: [
            { label: 'Processor', value: 'Intel Core i7-13700H' },
            { label: 'Graphics', value: 'NVIDIA RTX 4070 Studio' },
            { label: 'Display', value: '16" 4K Mini-LED (100% DCI-P3)' },
            { label: 'Memory', value: '64GB DDR5 5200MHz' },
            { label: 'Storage', value: '4TB (2x 2TB RAID 0)' }
          ]
        },
        {
          title: 'TSS PRO 16',
          price: '1,899$',
          src: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600',
          badge: 'WORKSTATION',
          description: 'Desktop-level performance in a magnesium chassis.',
          category: 'laptops',
          stock: 8,
          specs: [
            { label: 'Processor', value: 'AMD Ryzen 9 7945HX3D' },
            { label: 'Graphics', value: 'NVIDIA RTX 4090 (175W)' },
            { label: 'Display', value: '17" QHD+ 240Hz IPS' },
            { label: 'Memory', value: '64GB DDR5 5600MHz' },
            { label: 'Storage', value: '2TB PCIe Gen4 NVMe' }
          ]
        },
        // Desktops
        {
          title: 'TSS MONOLITH',
          price: '2,499$',
          src: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=600',
          badge: 'EXTREME',
          description: 'The pinnacle of desktop computing.',
          category: 'desktops',
          stock: 5,
          specs: [
            { label: 'Processor', value: 'Intel Core i9-14900K' },
            { label: 'Graphics', value: 'NVIDIA RTX 4090 24GB' },
            { label: 'Motherboard', value: 'Z790 E-ATX' },
            { label: 'Memory', value: '128GB DDR5 6000MHz' },
            { label: 'Cooling', value: 'Custom Hardline Liquid Loop' }
          ]
        },
        {
          title: 'TSS TOWER X',
          price: '1,799$',
          src: 'https://images.unsplash.com/photo-1593640495253-23196b27a87f?auto=format&fit=crop&q=80&w=600',
          badge: 'GAMING',
          description: 'High performance gaming machine.',
          category: 'desktops',
          stock: 10,
          specs: [
            { label: 'Processor', value: 'AMD Ryzen 7 7800X3D' },
            { label: 'Graphics', value: 'NVIDIA RTX 4080 Super' },
            { label: 'Motherboard', value: 'B650 ATX' },
            { label: 'Memory', value: '32GB DDR5 6000MHz' },
            { label: 'Cooling', value: '360mm AIO Liquid Cooler' }
          ]
        },
        {
          title: 'TSS COMPACT',
          price: '999$',
          src: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&q=80&w=600',
          badge: 'MINI ITX',
          description: 'Massive power in a tiny footprint.',
          category: 'desktops',
          stock: 14,
          specs: [
            { label: 'Processor', value: 'Intel Core i5-13600K' },
            { label: 'Graphics', value: 'NVIDIA RTX 4060 Ti 16GB' },
            { label: 'Motherboard', value: 'B760i Mini-ITX' },
            { label: 'Memory', value: '32GB DDR5 5600MHz' },
            { label: 'Cooling', value: 'Low-Profile Air Cooler' }
          ]
        },
        // Printers
        {
          title: 'TSS PRINTMAX 3D',
          price: '899$',
          src: 'https://images.unsplash.com/photo-1590457494480-1a73fb5789f2?auto=format&fit=crop&q=80&w=600',
          badge: 'PRO 3D',
          description: 'Precision layer printing for creators.',
          category: 'printers',
          stock: 7,
          specs: [
            { label: 'Technology', value: 'FDM (Fused Deposition Modeling)' },
            { label: 'Build Volume', value: '300 x 300 x 400 mm' },
            { label: 'Layer Resolution', value: '50-400 microns' },
            { label: 'Speed', value: 'Up to 600mm/s' },
            { label: 'Connectivity', value: 'Wi-Fi, USB, Ethernet' }
          ]
        },
        {
          title: 'TSS OFFICE LASER',
          price: '349$',
          src: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=600',
          badge: 'BUSINESS',
          description: 'High speed, ultra-efficient document printing.',
          category: 'printers',
          stock: 22,
          specs: [
            { label: 'Technology', value: 'Monochrome Laser' },
            { label: 'Print Speed', value: '45 pages per minute' },
            { label: 'Resolution', value: '1200 x 1200 dpi' },
            { label: 'Paper Capacity', value: '500 sheets' },
            { label: 'Functions', value: 'Print, Copy, Scan, Fax' }
          ]
        },
        {
          title: 'TSS INKJET LITE',
          price: '129$',
          src: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=600',
          badge: 'HOME',
          description: 'Vibrant colors for family and home office.',
          category: 'printers',
          stock: 35,
          specs: [
            { label: 'Technology', value: 'Thermal Inkjet' },
            { label: 'Color Speed', value: '10 pages per minute' },
            { label: 'Resolution', value: '4800 x 1200 optimized dpi' },
            { label: 'Paper Capacity', value: '100 sheets' },
            { label: 'Functions', value: 'Print, Copy, Scan' }
          ]
        },
        // LED TV
        {
          title: 'TSS QUANTUM 8K',
          price: '3,999$',
          src: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600',
          badge: '8K OLED',
          description: 'The future of home cinema is here.',
          category: 'led-tv',
          stock: 4,
          specs: [
            { label: 'Resolution', value: '8K UHD (7680 x 4320)' },
            { label: 'Panel Tech', value: 'Quantum OLED' },
            { label: 'Refresh Rate', value: '120Hz Native' },
            { label: 'HDR', value: 'Dolby Vision IQ / HDR10+' },
            { label: 'Audio', value: '6.2.2 Channel Dolby Atmos' }
          ]
        },
        {
          title: 'TSS CINEMA 75"',
          price: '2,199$',
          src: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&q=80&w=600',
          badge: '4K HDR',
          description: 'Massive screen, incredible color accuracy.',
          category: 'led-tv',
          stock: 6,
          specs: [
            { label: 'Resolution', value: '4K UHD (3840 x 2160)' },
            { label: 'Panel Tech', value: 'Mini-LED (Local Dimming)' },
            { label: 'Refresh Rate', value: '144Hz VRR' },
            { label: 'HDR', value: 'HDR10 Pro' },
            { label: 'Smart OS', value: 'TSS WebOS v8' }
          ]
        },
        {
          title: 'TSS GAMING 55"',
          price: '1,299$',
          src: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=600',
          badge: '144HZ',
          description: 'Built specifically for next-gen consoles.',
          category: 'led-tv',
          stock: 11,
          specs: [
            { label: 'Resolution', value: '4K UHD (3840 x 2160)' },
            { label: 'Panel Tech', value: 'OLED Evo' },
            { label: 'Refresh Rate', value: '144Hz / 240Hz (1080p)' },
            { label: 'Gaming Tech', value: 'G-Sync / FreeSync Premium' },
            { label: 'Input Lag', value: '< 1ms' }
          ]
        },
        // Accessories
        {
          title: 'TSS MECH KEYBOARD',
          price: '199$',
          src: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=600',
          badge: 'TACTILE',
          description: 'Precision mechanical switches with per-key RGB.',
          category: 'accessories',
          stock: 25,
          specs: [
            { label: 'Switches', value: 'TSS Optical Linear' },
            { label: 'Keycaps', value: 'Double-shot PBT' },
            { label: 'Polling Rate', value: '8000Hz' },
            { label: 'Connectivity', value: 'Wired USB-C' }
          ]
        },
        {
          title: 'TSS PRO MOUSE',
          price: '129$',
          src: 'https://images.unsplash.com/photo-1527814050087-179f376dd0e7?auto=format&fit=crop&q=80&w=600',
          badge: 'WIRELESS',
          description: 'Ultra-lightweight competitive gaming mouse.',
          category: 'accessories',
          stock: 30,
          specs: [
            { label: 'Sensor', value: 'TSS Focus Pro 30K' },
            { label: 'Weight', value: '58g' },
            { label: 'Battery Life', value: '90 Hours' },
            { label: 'Connectivity', value: '2.4GHz Wireless' }
          ]
        },
        {
          title: 'TSS STUDIO HEADSET',
          price: '249$',
          src: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=600',
          badge: 'ANC',
          description: 'Immersive spatial audio and active noise cancellation.',
          category: 'accessories',
          stock: 18,
          specs: [
            { label: 'Drivers', value: '50mm Titanium' },
            { label: 'Audio', value: 'THX Spatial Audio' },
            { label: 'Microphone', value: 'Detachable Supercardioid' },
            { label: 'Battery', value: 'Up to 40 Hours' }
          ]
        }
      ];

      await Product.insertMany(defaultProducts);
      console.log('Seeded default products into MongoDB!');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas successfully.');
    await seedDatabase();
    
    // Start Server only after DB connection
    app.listen(PORT, () => {
      console.log(`TSS Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
