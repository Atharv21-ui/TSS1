import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FloatingInput from '../components/FloatingInput';
import { 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  Sliders, 
  TrendingUp, 
  RefreshCw, 
  Minus,
  Check,
  DollarSign,
  ShoppingCart,
  Users,
  Percent,
  Calendar,
  PlusCircle
} from 'lucide-react';

interface Spec {
  label: string;
  value: string;
}

interface Product {
  _id: string;
  title: string;
  price: string;
  src: string;
  badge?: string;
  description?: string;
  category: string;
  stock: number;
  specs: Spec[];
}

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  total: number;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  item: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'inventory' | 'add'>('overview');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '12m'>('30d');

  // Form State
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [src, setSrc] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('laptops');
  const [stock, setStock] = useState('10');
  const [specs, setSpecs] = useState<Spec[]>([{ label: '', value: '' }]);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([
    { id: 'TSS-9812', customer: 'Alex Rivera', email: 'alex@rivera.io', date: '2026-06-28', total: 1899, status: 'Processing', item: 'TSS PRO 16' },
    { id: 'TSS-9745', customer: 'Elena Rostova', email: 'elena.r@cyber.ru', date: '2026-06-27', total: 2499, status: 'Shipped', item: 'TSS MONOLITH' },
    { id: 'TSS-9612', customer: 'Marcus Vance', date: '2026-06-25', email: 'vance@neon.net', total: 899, status: 'Delivered', item: 'TSS PRINTMAX 3D' },
    { id: 'TSS-9504', customer: 'Sora Takahashi', email: 'sora@tokyo.jp', date: '2026-06-24', total: 3999, status: 'Delivered', item: 'TSS QUANTUM 8K' },
    { id: 'TSS-9411', customer: 'David Chen', email: 'dchen@silicon.edu', date: '2026-06-22', total: 199, status: 'Cancelled', item: 'TSS MECH KEYBOARD' },
    { id: 'TSS-9388', customer: 'Zara Hayes', email: 'zara@hayes.org', date: '2026-06-20', total: 1299, status: 'Delivered', item: 'TSS GAMING 55"' },
    { id: 'TSS-9250', customer: 'John Doe', email: 'johndoe@gmail.com', date: '2026-06-18', total: 1799, status: 'Shipped', item: 'TSS TOWER X' }
  ]);

  useEffect(() => {
    // Check if logged in user is admin
    const checkAdmin = async () => {
      try {
        const user: any = await api.get('/auth/me');
        if (user && user.role === 'admin') {
          setIsAdmin(true);
          fetchProducts();
        } else {
          setIsAdmin(false);
          navigate('/account');
        }
      } catch (error) {
        setIsAdmin(false);
        navigate('/account');
      }
    };
    checkAdmin();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get<Product[]>('/products');
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecRow = () => {
    setSpecs([...specs, { label: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    const newSpecs = specs.filter((_, i) => i !== index);
    setSpecs(newSpecs.length ? newSpecs : [{ label: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'label' | 'value', val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setSrc('');
    setImageFile(null);
    setBadge('');
    setDescription('');
    setCategory('laptops');
    setStock('10');
    setSpecs([{ label: '', value: '' }]);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const filteredSpecs = specs.filter(s => s.label.trim() && s.value.trim());
    
    try {
      setUploadingImage(true);
      const formData = new FormData();
      
      formData.append('title', title);
      formData.append('price', price.endsWith('$') ? price : `${price}$`);
      formData.append('category', category);
      formData.append('stock', String(parseInt(stock) || 0));
      
      if (badge) formData.append('badge', badge);
      if (description) formData.append('description', description);
      formData.append('specs', JSON.stringify(filteredSpecs));

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (src) {
        formData.append('src', src);
      } else {
        alert('Please provide an image URL or upload an image file');
        setUploadingImage(false);
        return;
      }

      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product updated successfully!');
      } else {
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Product added successfully!');
      }
      
      resetForm();
      setActiveTab('products');
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEditInit = (product: Product) => {
    setEditingId(product._id);
    setTitle(product.title);
    setPrice(product.price.replace('$', ''));
    setSrc(product.src);
    setImageFile(null);
    setBadge(product.badge || '');
    setDescription(product.description || '');
    setCategory(product.category);
    setStock(String(product.stock));
    setSpecs(product.specs.length ? [...product.specs] : [{ label: '', value: '' }]);
    setActiveTab('add');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err: any) {
      alert(err.message || 'Error deleting product');
    }
  };

  const handleStockUpdate = async (id: string, newStock: number) => {
    try {
      await api.patch(`/products/${id}/stock`, { stock: newStock });
      setProducts(products.map(p => p._id === id ? { ...p, stock: newStock } : p));
    } catch (err: any) {
      alert(err.message || 'Error updating stock');
    }
  };

  const handleOrderStatusUpdate = (orderId: string, nextStatus: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
  };

  if (isAdmin === null || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#030303] text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 text-[#00ccff] animate-spin" />
          <div className="text-sm font-heading tracking-[0.25em] text-[#00ccff] uppercase">Initializing CMS Terminal...</div>
        </div>
      </div>
    );
  }

  // Calculated Stats based on Timeframe
  const timeframeConfig = {
    '24h': { sales: 8490, orders: 4, visitors: 340, aov: 2122, trend: [1200, 3100, 1900, 4800, 3900, 8490] },
    '7d': { sales: 24800, orders: 15, visitors: 1890, aov: 1653, trend: [8000, 12000, 10500, 17500, 14000, 22000, 24800] },
    '30d': { sales: 94250, orders: 58, visitors: 7800, aov: 1625, trend: [45000, 52000, 49000, 68000, 61000, 82000, 75000, 94250] },
    '12m': { sales: 840200, orders: 490, visitors: 94000, aov: 1714, trend: [40000, 55000, 48000, 69000, 65000, 72000, 89000, 81000, 95000, 102000, 98000, 120000] }
  };

  const currentStats = timeframeConfig[timeframe];

  // Custom SVG path generator for the analytics chart
  const getSvgPath = (points: number[]) => {
    const width = 600;
    const height = 180;
    const max = Math.max(...points) * 1.15;
    const min = Math.min(...points) * 0.85;
    const range = max - min;
    
    const coords = points.map((p, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 30) - 15;
      return { x, y };
    });
    
    const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x} ${c.y}`).join(' ');
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
    
    return { linePath, areaPath, coords };
  };

  const chartData = getSvgPath(currentStats.trend);

  return (
    <div className="min-h-screen bg-[#030303] bg-gradient-to-b from-[#05070a] to-[#020203] text-zinc-100 pt-28 px-4 sm:px-8 pb-16">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Dashboard Info */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-zinc-800/60">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-[#00ccff] animate-pulse shadow-[0_0_10px_#00ccff]" />
              <span className="text-[10px] tracking-[0.3em] text-[#00ccff] font-bold font-heading uppercase">SECURE ADMIN INTERFACE</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tight text-white mt-1">TSS SYSTEM CONTROL</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">Global management overview, logistics tracking, and catalog indexing.</p>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 backdrop-blur-md w-full lg:w-auto self-stretch lg:self-auto overflow-x-auto">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'overview' ? 'bg-zinc-900 text-[#00ccff] shadow-[0_2px_10px_rgba(0,204,255,0.1)] border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              OVERVIEW
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('products'); }}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'products' ? 'bg-zinc-900 text-[#00ccff] shadow-[0_2px_10px_rgba(0,204,255,0.1)] border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Database className="w-3.5 h-3.5" />
              PRODUCTS
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('inventory'); }}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'inventory' ? 'bg-zinc-900 text-[#00ccff] shadow-[0_2px_10px_rgba(0,204,255,0.1)] border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              INVENTORY
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('add'); }}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'add' ? 'bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'EDIT HARDWARE' : 'NEW HARDWARE'}
            </button>
          </div>
        </div>

        {/* TIME-FRAME SELECTOR FOR OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="flex items-center justify-between bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-heading font-semibold tracking-wider">
              <Calendar className="w-4 h-4 text-[#00ccff]" />
              TIME FRAME:
            </div>
            <div className="flex gap-2">
              {(['24h', '7d', '30d', '12m'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-heading uppercase font-bold tracking-wider transition-all duration-200 ${timeframe === t ? 'bg-[#00ccff]/15 text-[#00ccff] border border-[#00ccff]/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-10">
            
            {/* Analytical Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Total Revenue */}
              <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-[#00ccff]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ccff]/5 rounded-full blur-2xl group-hover:bg-[#00ccff]/10 transition-all" />
                <div>
                  <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Total Revenue</p>
                  <h3 className="text-2xl font-heading font-bold text-white mt-1">${currentStats.sales.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-heading font-semibold mt-2">
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+14.2%</span>
                    <span>VS PREV PERIOD</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl text-[#00ccff] group-hover:scale-115 transition-transform duration-300">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              {/* Total Orders */}
              <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-[#00ccff]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ccff]/5 rounded-full blur-2xl group-hover:bg-[#00ccff]/10 transition-all" />
                <div>
                  <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Total Orders</p>
                  <h3 className="text-2xl font-heading font-bold text-white mt-1">{currentStats.orders}</h3>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-heading font-semibold mt-2">
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+8.7%</span>
                    <span>FULFILLED</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl text-[#00ccff] group-hover:scale-115 transition-transform duration-300">
                  <ShoppingCart className="w-5 h-5" />
                </div>
              </div>

              {/* Traffic */}
              <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-[#00ccff]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ccff]/5 rounded-full blur-2xl group-hover:bg-[#00ccff]/10 transition-all" />
                <div>
                  <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Unique Visitors</p>
                  <h3 className="text-2xl font-heading font-bold text-white mt-1">{currentStats.visitors.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-heading font-semibold mt-2">
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+22.1%</span>
                    <span>SYS ACCESSES</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl text-[#00ccff] group-hover:scale-115 transition-transform duration-300">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              {/* AOV */}
              <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-[#00ccff]/30 transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ccff]/5 rounded-full blur-2xl group-hover:bg-[#00ccff]/10 transition-all" />
                <div>
                  <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Avg Order Value</p>
                  <h3 className="text-2xl font-heading font-bold text-white mt-1">${currentStats.aov.toLocaleString()}</h3>
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-heading font-semibold mt-2">
                    <span className="bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">+4.5%</span>
                    <span>PER TRANSACTION</span>
                  </div>
                </div>
                <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-xl text-[#00ccff] group-hover:scale-115 transition-transform duration-300">
                  <Percent className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Chart & Distribution Matrix Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sales Chart Panel */}
              <div className="lg:col-span-2 bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 relative backdrop-blur-xl">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/30 to-transparent" />
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-heading text-sm text-white tracking-wider uppercase">REVENUE VELOCITY TREND</h3>
                    <p className="text-[10px] text-zinc-500 font-heading">REAL-TIME TRAFFIC FLOW INDEX</p>
                  </div>
                  <span className="text-xs font-mono text-[#00ccff] font-bold">CYBERNETIC MATRIX</span>
                </div>

                {/* SVG Area Chart */}
                <div className="w-full relative h-[180px] mt-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 600 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00ccff" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#00ccff" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    <line x1="0" y1="30" x2="600" y2="30" stroke="#1f1f2e" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="#1f1f2e" strokeWidth="1" strokeDasharray="5,5" />
                    <line x1="0" y1="150" x2="600" y2="150" stroke="#1f1f2e" strokeWidth="1" strokeDasharray="5,5" />

                    {/* Area Path */}
                    <path d={chartData.areaPath} fill="url(#chartGlow)" />

                    {/* Line Path */}
                    <path d={chartData.linePath} fill="none" stroke="#00ccff" strokeWidth="3.5" strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(0,204,255,0.5)]" />

                    {/* Data nodes */}
                    {chartData.coords.map((c, idx) => (
                      <g key={idx} className="group/node cursor-pointer">
                        <circle cx={c.x} cy={c.y} r="5" fill="#030303" stroke="#00ccff" strokeWidth="3" className="transition-all duration-200 hover:r-7" />
                        <circle cx={c.x} cy={c.y} r="12" fill="#00ccff" fillOpacity="0" className="hover:fill-opacity-10 transition-all duration-200" />
                      </g>
                    ))}
                  </svg>
                </div>
                
                {/* X Axis Labels */}
                <div className="flex justify-between text-[9px] text-zinc-500 font-heading font-bold mt-4 tracking-widest uppercase">
                  {timeframe === '24h' && ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']}
                  {timeframe === '7d' && ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']}
                  {timeframe === '30d' && ['WEEK 1', 'WEEK 2', 'WEEK 3', 'WEEK 4']}
                  {timeframe === '12m' && ['JAN', 'MAR', 'MAY', 'JUL', 'SEP', 'NOV', 'DEC']}
                </div>
              </div>

              {/* Category Matrix */}
              <div className="bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 relative backdrop-blur-xl flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/30 to-transparent" />
                <div>
                  <h3 className="font-heading text-sm text-white tracking-wider uppercase mb-6">CATEGORY DISTRIBUTION</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Laptops', value: 45, color: '#00ccff' },
                      { name: 'Desktops', value: 30, color: '#ff3366' },
                      { name: 'LED TV', value: 15, color: '#9933ff' },
                      { name: 'Accessories', value: 10, color: '#00ffcc' }
                    ].map((cat) => (
                      <div key={cat.name} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-zinc-400">{cat.name}</span>
                          <span className="font-mono text-[#00ccff]">{cat.value}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${cat.value}%`, backgroundColor: cat.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-900/60 flex items-center justify-between text-xs text-zinc-500 font-heading font-semibold">
                  <span>TOTAL INDEXED ITEMS</span>
                  <span className="text-white font-mono">{products.length}</span>
                </div>
              </div>
            </div>

            {/* Recent Orders & Top Selling Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Recent Orders Ledger */}
              <div className="lg:col-span-2 bg-zinc-950/30 border border-zinc-900 rounded-3xl backdrop-blur-xl overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/30 to-transparent" />
                <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                  <div>
                    <h3 className="font-heading text-sm text-white tracking-wider uppercase">ORDER TRANSACTION LOG</h3>
                    <p className="text-[10px] text-zinc-500 font-heading">MANAGE INCOMING TRANSFERS & LOGISTICS</p>
                  </div>
                  <span className="text-[10px] bg-zinc-900 text-[#00ccff] px-3 py-1 rounded-full font-heading font-bold border border-zinc-850">
                    REAL-TIME UPDATES
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900/80 bg-zinc-950/40 text-zinc-500 text-[10px] font-heading font-bold tracking-[0.2em] uppercase">
                        <th className="p-4">ORDER ID</th>
                        <th className="p-4">CUSTOMER</th>
                        <th className="p-4">PRODUCT</th>
                        <th className="p-4">TOTAL</th>
                        <th className="p-4">STATUS</th>
                        <th className="p-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/50 text-sm">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                          <td className="p-4 font-mono font-bold text-white">{order.id}</td>
                          <td className="p-4">
                            <div className="font-semibold text-zinc-300">{order.customer}</div>
                            <div className="text-[10px] text-zinc-500">{order.email}</div>
                          </td>
                          <td className="p-4 text-zinc-400">{order.item}</td>
                          <td className="p-4 font-mono text-[#00ccff] font-bold">${order.total.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-heading font-bold border ${
                              order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              order.status === 'Shipped' ? 'bg-[#00ccff]/10 text-[#00ccff] border-[#00ccff]/20' :
                              order.status === 'Processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-right relative">
                            {/* Action to change status */}
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value as Order['status'])}
                              className="bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-[#00ccff] cursor-pointer"
                            >
                              <option value="Processing">Process</option>
                              <option value="Shipped">Ship</option>
                              <option value="Delivered">Deliver</option>
                              <option value="Cancelled">Cancel</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Selling Products */}
              <div className="bg-zinc-950/30 border border-zinc-900 rounded-3xl p-6 relative backdrop-blur-xl flex flex-col justify-between">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/30 to-transparent" />
                <div>
                  <h3 className="font-heading text-sm text-white tracking-wider uppercase mb-6">TOP PERFORMING HARDWARE</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'TSS MONOLITH', sales: 42, rev: 104958, src: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=600' },
                      { name: 'TSS PRO 16', sales: 38, rev: 72162, src: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=600' },
                      { name: 'TSS QUANTUM 8K', sales: 15, rev: 59985, src: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600' },
                      { name: 'TSS BLADE X1', sales: 28, rev: 41972, src: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=600' }
                    ].map((p, idx) => (
                      <div key={p.name} className="flex items-center gap-4 group">
                        <span className="font-mono font-bold text-zinc-600 w-4">{idx + 1}</span>
                        <img src={p.src} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-zinc-800" />
                        <div className="flex-grow">
                          <h4 className="text-xs font-semibold text-zinc-300 group-hover:text-[#00ccff] transition-colors">{p.name}</h4>
                          <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{p.sales} Units Sold</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-[#00ccff]">${p.rev.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab: Products List */}
        {activeTab === 'products' && (
          <div className="relative bg-zinc-950/30 border border-zinc-900 rounded-3xl backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/40 to-transparent" />
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900/80 bg-zinc-950/60 text-zinc-500 text-[10px] font-heading font-bold tracking-[0.2em] uppercase">
                    <th className="p-5">IMAGE</th>
                    <th className="p-5">TITLE & CATEGORY</th>
                    <th className="p-5">PRICE</th>
                    <th className="p-5">STOCK STATUS</th>
                    <th className="p-5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 text-sm">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-zinc-500 font-heading tracking-widest text-xs uppercase">
                        No products available in database.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p._id} className="hover:bg-white/[0.015] transition-colors group">
                        <td className="p-5">
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900">
                            <img src={p.src} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </div>
                        </td>
                        <td className="p-5">
                          <div className="font-semibold text-white group-hover:text-[#00ccff] transition-colors">{p.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 font-heading font-bold uppercase tracking-wider">{p.category}</span>
                            {p.badge && (
                              <span className="text-[9px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded-md font-heading uppercase font-bold tracking-wider">
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-5 text-[#00ccff] font-mono font-bold">{p.price}</td>
                        <td className="p-5">
                          <div className="flex items-center gap-2">
                            <span className={`h-1.5 w-1.5 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <span className={`font-mono text-xs font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-zinc-300'}`}>
                              {p.stock === 0 ? 'Depleted' : `${p.stock} Units`}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEditInit(p)}
                              className="p-2 border border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white rounded-lg bg-zinc-950/40 hover:bg-zinc-900 transition-all duration-200"
                              title="Edit Product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(p._id)}
                              className="p-2 border border-zinc-900 hover:border-red-500/30 text-zinc-500 hover:text-red-500 rounded-lg bg-zinc-950/40 hover:bg-red-500/5 transition-all duration-200"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Inventory Control */}
        {activeTab === 'inventory' && (
          <div className="relative bg-zinc-950/30 border border-zinc-900 rounded-3xl backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/40 to-transparent" />
            <div className="overflow-x-auto">
              <div className="p-6 bg-zinc-950/60 border-b border-zinc-900/80 flex items-center justify-between">
                <h3 className="font-heading text-xs font-bold text-zinc-400 tracking-widest uppercase">Quick Stock Adjustment</h3>
                <span className="text-[10px] text-zinc-500 font-heading">VALUES SAVE AUTOMATICALLY</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900/80 bg-zinc-950/40 text-zinc-500 text-[10px] font-heading font-bold tracking-[0.2em] uppercase">
                    <th className="p-5">PRODUCT NAME</th>
                    <th className="p-5">CURRENT LEVEL</th>
                    <th className="p-5">ADJUST QUANTITY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50 text-sm">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-white/[0.015] transition-colors group">
                      <td className="p-5">
                        <div className="font-semibold text-white group-hover:text-[#00ccff] transition-colors">{p.title}</div>
                        <span className="text-[10px] text-zinc-500 font-heading font-bold uppercase tracking-wider">{p.category}</span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2">
                          <span className={`h-1.5 w-1.5 rounded-full ${p.stock === 0 ? 'bg-red-500' : p.stock <= 5 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className={`font-mono text-base font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-white'}`}>
                            {p.stock}
                          </span>
                          {p.stock <= 5 && (
                            <span className="text-[9px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-md font-heading font-bold tracking-wider">
                              CRITICAL
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2.5">
                          <button 
                            onClick={() => handleStockUpdate(p._id, Math.max(0, p.stock - 1))}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-800 hover:border-zinc-500 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input 
                            type="number" 
                            value={p.stock}
                            onChange={(e) => handleStockUpdate(p._id, Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-16 h-8 text-center bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-white focus:outline-none focus:border-[#00ccff] transition-colors"
                          />
                          <button 
                            onClick={() => handleStockUpdate(p._id, p.stock + 1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-800 hover:border-zinc-500 rounded-lg bg-zinc-950 text-zinc-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Add/Edit Product Form */}
        {activeTab === 'add' && (
          <div className="relative bg-zinc-950/30 border border-zinc-900 rounded-3xl backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/40 to-transparent" />
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
              <div className="border-b border-zinc-900 pb-4">
                <h2 className="font-heading text-xl text-white tracking-wide">
                  {editingId ? 'MODIFY DATABASE REGISTRY' : 'REGISTER NEW HARDWARE'}
                </h2>
                <p className="text-zinc-500 text-xs mt-1">Specify technical parameters and assets for catalog publication.</p>
              </div>

              {/* Grid Section 1: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider uppercase">1. Basic Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FloatingInput 
                    label="PRODUCT TITLE" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    bgContext="#0a0a0a" 
                  />
                  <FloatingInput 
                    label="PRICE (e.g. 1299)" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    bgContext="#0a0a0a" 
                  />
                </div>
              </div>

              {/* Grid Section 2: Media */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider uppercase">2. Media & Ingestion</h3>
                <div className="bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-heading font-bold tracking-wider uppercase">Image File Upload</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                      }}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl p-3 text-sm focus:outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-zinc-850 file:text-[#00ccff] hover:file:bg-zinc-800 file:cursor-pointer cursor-pointer"
                    />
                  </div>
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-zinc-900"></div>
                    <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-heading font-bold tracking-wider">OR</span>
                    <div className="flex-grow border-t border-zinc-900"></div>
                  </div>
                  <FloatingInput 
                    label="IMAGE SOURCE URL (FALLBACK)" 
                    value={src} 
                    onChange={(e) => setSrc(e.target.value)} 
                    bgContext="#0a0a0a" 
                  />
                </div>
              </div>

              {/* Grid Section 3: Classification */}
              <div className="space-y-4">
                <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider uppercase">3. Classification & Logistics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 font-heading font-bold tracking-wider uppercase">Category</label>
                    <select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#00ccff] capitalize h-[52px] transition-colors"
                    >
                      <option value="laptops">laptops</option>
                      <option value="desktops">desktops</option>
                      <option value="printers">printers</option>
                      <option value="led-tv">led tv</option>
                      <option value="accessories">accessories</option>
                    </select>
                  </div>
                  
                  <FloatingInput 
                    label="INITIAL STOCK LEVEL" 
                    type="number"
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    required 
                    bgContext="#0a0a0a" 
                  />

                  <FloatingInput 
                    label="BADGE (e.g. GAMING, NEW)" 
                    value={badge} 
                    onChange={(e) => setBadge(e.target.value)} 
                    bgContext="#0a0a0a" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider uppercase">4. Description</h3>
                <FloatingInput 
                  label="HARDWARE SPECIFICATION DESCRIPTION" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  isTextArea 
                  rows={4}
                  bgContext="#0a0a0a" 
                />
              </div>

              {/* Specifications List */}
              <div className="space-y-4 pt-6 border-t border-zinc-900/80">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-heading font-bold text-zinc-400 tracking-wider uppercase">5. Detailed Specs (Key Features)</h3>
                  <button 
                    type="button" 
                    onClick={handleAddSpecRow}
                    className="flex items-center gap-1.5 text-xs text-[#00ccff] hover:text-[#33d6ff] font-heading font-bold tracking-wider transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    ADD SPECIFICATION
                  </button>
                </div>

                <div className="space-y-3">
                  {specs.map((spec, index) => (
                    <div key={index} className="flex gap-4 items-center bg-zinc-950/30 p-2.5 rounded-xl border border-zinc-900">
                      <input 
                        type="text" 
                        placeholder="Key (e.g. Processor)" 
                        value={spec.label}
                        onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-[#00ccff] transition-colors"
                      />
                      <input 
                        type="text" 
                        placeholder="Value (e.g. Intel Core i9)" 
                        value={spec.value}
                        onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-[#00ccff] transition-colors"
                      />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSpecRow(index)}
                        className="text-zinc-500 hover:text-red-500 transition-colors p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-zinc-900/80">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="px-6 py-3 text-xs font-heading font-bold tracking-wider border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-all duration-200"
                >
                  RESET
                </button>
                <button 
                  type="submit"
                  disabled={uploadingImage}
                  className="flex items-center gap-2 px-8 py-3 text-xs font-heading font-bold tracking-wider bg-white text-black hover:bg-zinc-200 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(255,255,255,0.15)]"
                >
                  {uploadingImage ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      UPLOADING ASSETS...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      {editingId ? 'SAVE CHANGES' : 'PUBLISH HARDWARE'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
