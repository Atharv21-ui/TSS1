import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FloatingInput from '../components/FloatingInput';
import { 
  Package, 
  AlertTriangle, 
  Database, 
  Plus, 
  Edit2, 
  Trash2, 
  Sliders, 
  TrendingUp, 
  RefreshCw, 
  Layers, 
  FileText, 
  PlusCircle, 
  Minus,
  Check
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'inventory' | 'add'>('products');

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
      
      // Send specs as a JSON string so the backend can parse it
      formData.append('specs', JSON.stringify(filteredSpecs));

      // Either attach the file, or the fallback URL
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

  // Calculated Stats
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

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
            <h1 className="font-heading text-4xl sm:text-5xl tracking-tight text-white mt-1">TSS TERMINAL</h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">Database catalog, real-time inventory levels, and product ingestion control.</p>
          </div>

          {/* Tab Selection */}
          <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-800/80 backdrop-blur-md w-full lg:w-auto self-stretch lg:self-auto">
            <button 
              onClick={() => { resetForm(); setActiveTab('products'); }}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'products' ? 'bg-zinc-900 text-[#00ccff] shadow-[0_2px_10px_rgba(0,204,255,0.1)] border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Database className="w-3.5 h-3.5" />
              PRODUCTS
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('inventory'); }}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'inventory' ? 'bg-zinc-900 text-[#00ccff] shadow-[0_2px_10px_rgba(0,204,255,0.1)] border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              INVENTORY
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('add'); }}
              className={`flex-1 lg:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-xs font-heading font-semibold tracking-wider transition-all duration-300 ${activeTab === 'add' ? 'bg-[#00ccff]/10 text-[#00ccff] border border-[#00ccff]/20' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Plus className="w-3.5 h-3.5" />
              {editingId ? 'EDIT HARDWARE' : 'NEW HARDWARE'}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-[#00ccff]/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ccff]/5 rounded-full blur-2xl group-hover:bg-[#00ccff]/10 transition-all" />
            <div>
              <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Registered Hardware</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">{totalProducts}</h3>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-heading font-semibold mt-2">
                <TrendingUp className="w-3 h-3" />
                <span>ACTIVE DATABASE</span>
              </div>
            </div>
            <div className="p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl text-[#00ccff] group-hover:scale-110 transition-transform duration-300">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-amber-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div>
              <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Low Stock Alerts</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">{lowStockProducts}</h3>
              <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-heading font-semibold mt-2">
                <AlertTriangle className="w-3 h-3" />
                <span>REQUIRES REPLENISHMENT</span>
              </div>
            </div>
            <div className={`p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl group-hover:scale-110 transition-transform duration-300 ${lowStockProducts > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden bg-zinc-950/40 border border-zinc-850 p-6 rounded-2xl backdrop-blur-lg flex items-center justify-between group hover:border-red-500/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
            <div>
              <p className="text-[10px] font-heading font-bold text-zinc-500 tracking-[0.2em] uppercase">Depleted Units</p>
              <h3 className="text-3xl font-heading font-bold text-white mt-1">{outOfStockProducts}</h3>
              <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-heading font-semibold mt-2">
                <AlertTriangle className="w-3 h-3" />
                <span>OUT OF STOCK</span>
              </div>
            </div>
            <div className={`p-3.5 bg-zinc-900/80 border border-zinc-800/80 rounded-xl group-hover:scale-110 transition-transform duration-300 ${outOfStockProducts > 0 ? 'text-red-500' : 'text-zinc-500'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab content area with modern layering */}
        <div className="relative bg-zinc-950/30 border border-zinc-900 rounded-3xl backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* Decorative glow line */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#00ccff]/40 to-transparent" />

          {/* Tab: Products List */}
          {activeTab === 'products' && (
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
          )}

          {/* Tab: Inventory Control */}
          {activeTab === 'inventory' && (
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
          )}

          {/* Tab: Add/Edit Product Form */}
          {activeTab === 'add' && (
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
                    bgContext="#07070a" 
                  />
                  <FloatingInput 
                    label="PRICE (e.g. 1299)" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    bgContext="#07070a" 
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
                    bgContext="#0c0c10" 
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
                    bgContext="#07070a" 
                  />

                  <FloatingInput 
                    label="BADGE (e.g. GAMING, NEW)" 
                    value={badge} 
                    onChange={(e) => setBadge(e.target.value)} 
                    bgContext="#07070a" 
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
                  bgContext="#07070a" 
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
          )}

        </div>
      </div>
    </div>
  );
}
