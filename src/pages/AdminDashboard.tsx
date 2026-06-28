import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import FloatingInput from '../components/FloatingInput';

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
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="text-xl font-heading tracking-widest animate-pulse">LOADING TERMINAL CMS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="font-heading text-4xl tracking-wider text-white">CMS DASHBOARD</h1>
            <p className="text-zinc-500 text-sm mt-1">Live E-commerce Catalog & Inventory Terminal</p>
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={() => { resetForm(); setActiveTab('products'); }}
              className={`px-5 py-2 text-xs font-heading tracking-wider border transition-all duration-300 ${activeTab === 'products' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-red-500/5' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
            >
              PRODUCTS
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('inventory'); }}
              className={`px-5 py-2 text-xs font-heading tracking-wider border transition-all duration-300 ${activeTab === 'inventory' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-red-500/5' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
            >
              INVENTORY
            </button>
            <button 
              onClick={() => { resetForm(); setActiveTab('add'); }}
              className={`px-5 py-2 text-xs font-heading tracking-wider border transition-all duration-300 ${activeTab === 'add' ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-red-500/5' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
            >
              {editingId ? 'EDIT PRODUCT' : 'ADD PRODUCT'}
            </button>
          </div>
        </div>

        {/* Tab: Products List */}
        {activeTab === 'products' && (
          <div className="border border-zinc-900 bg-[#0c0c0c] rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 text-xs font-heading tracking-wider">
                  <th className="p-4">IMAGE</th>
                  <th className="p-4">TITLE</th>
                  <th className="p-4">CATEGORY</th>
                  <th className="p-4">PRICE</th>
                  <th className="p-4">STOCK</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-sm">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 font-heading">
                      NO PRODUCTS FOUND IN DATABASE
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p._id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="p-4">
                        <img src={p.src} alt={p.title} className="w-12 h-12 object-cover rounded border border-zinc-800" />
                      </td>
                      <td className="p-4 font-semibold">
                        <div>{p.title}</div>
                        {p.badge && <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-heading mt-1 inline-block">{p.badge}</span>}
                      </td>
                      <td className="p-4 text-zinc-400 capitalize">{p.category}</td>
                      <td className="p-4 text-[var(--accent-color)] font-mono">{p.price}</td>
                      <td className="p-4">
                        <span className={`font-mono ${p.stock <= 5 ? 'text-red-500 font-bold' : 'text-zinc-300'}`}>
                          {p.stock} Units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => handleEditInit(p)}
                            className="px-3 py-1 text-xs border border-zinc-800 text-zinc-300 hover:border-zinc-500 rounded transition-all"
                          >
                            EDIT
                          </button>
                          <button 
                            onClick={() => handleDelete(p._id)}
                            className="px-3 py-1 text-xs border border-red-950 text-red-500 hover:bg-red-950/20 rounded transition-all"
                          >
                            DELETE
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
          <div className="border border-zinc-900 bg-[#0c0c0c] rounded-xl overflow-hidden">
            <div className="p-4 bg-zinc-950 border-b border-zinc-900">
              <h3 className="font-heading text-sm text-zinc-400">QUICK STOCK CONTROLLER</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950 text-zinc-500 text-xs font-heading tracking-wider">
                  <th className="p-4">PRODUCT</th>
                  <th className="p-4">CURRENT STOCK</th>
                  <th className="p-4">ADJUST STOCK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-sm">
                {products.map((p) => (
                  <tr key={p._id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold">{p.title}</div>
                      <span className="text-[10px] text-zinc-500 capitalize">{p.category}</span>
                    </td>
                    <td className="p-4">
                      <span className={`font-mono text-base ${p.stock <= 5 ? 'text-red-500 font-bold animate-pulse' : 'text-zinc-300'}`}>
                        {p.stock}
                      </span>
                      {p.stock <= 5 && <span className="text-[10px] text-red-500 font-heading ml-2">LOW STOCK</span>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleStockUpdate(p._id, Math.max(0, p.stock - 1))}
                          className="w-8 h-8 flex items-center justify-center border border-zinc-800 hover:border-zinc-600 rounded bg-zinc-950 text-zinc-400 hover:text-white"
                        >
                          -
                        </button>
                        <input 
                          type="number" 
                          value={p.stock}
                          onChange={(e) => handleStockUpdate(p._id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 h-8 text-center bg-[#0a0a0a] border border-zinc-800 rounded font-mono text-white focus:outline-none focus:border-red-500"
                        />
                        <button 
                          onClick={() => handleStockUpdate(p._id, p.stock + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-zinc-800 hover:border-zinc-600 rounded bg-zinc-950 text-zinc-400 hover:text-white"
                        >
                          +
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
          <form onSubmit={handleSubmit} className="border border-zinc-900 bg-[#0c0c0c] rounded-xl p-8 max-w-2xl mx-auto space-y-6">
            <h2 className="font-heading text-lg border-b border-zinc-900 pb-3 text-zinc-300">
              {editingId ? 'EDIT EXISTING HARDWARE' : 'REGISTER NEW HARDWARE'}
            </h2>

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

            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-500 font-heading">IMAGE UPLOAD (OR PASTE URL BELOW)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                  }}
                  className="bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl p-2.5 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700"
                />
              </div>
              <FloatingInput 
                label="IMAGE SOURCE URL (FALLBACK)" 
                value={src} 
                onChange={(e) => setSrc(e.target.value)} 
                bgContext="#0a0a0a" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FloatingInput 
                label="BADGE (e.g. GAMING, NEW)" 
                value={badge} 
                onChange={(e) => setBadge(e.target.value)} 
                bgContext="#0a0a0a" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-zinc-500 font-heading">CATEGORY</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-[#0a0a0a] border border-zinc-800 text-white rounded-xl p-3 focus:outline-none focus:border-[var(--accent-color)] capitalize"
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
            </div>

            <FloatingInput 
              label="DESCRIPTION" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              isTextArea 
              rows={3}
              bgContext="#0a0a0a" 
            />

            {/* Specifications List */}
            <div className="space-y-4 pt-4 border-t border-zinc-900">
              <div className="flex justify-between items-center">
                <label className="text-xs text-zinc-400 font-heading">SPECIFICATIONS (KEY FEATURES)</label>
                <button 
                  type="button" 
                  onClick={handleAddSpecRow}
                  className="text-xs text-[var(--accent-color)] hover:underline font-heading"
                >
                  + ADD SPECIFICATION ROW
                </button>
              </div>

              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex gap-4 items-center">
                    <input 
                      type="text" 
                      placeholder="Label (e.g. Graphics)" 
                      value={spec.label}
                      onChange={(e) => handleSpecChange(index, 'label', e.target.value)}
                      className="flex-1 bg-[#0a0a0a] border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                    <input 
                      type="text" 
                      placeholder="Value (e.g. RTX 4090)" 
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      className="flex-1 bg-[#0a0a0a] border border-zinc-800 text-sm text-white rounded-lg p-2.5 focus:outline-none focus:border-[var(--accent-color)]"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveSpecRow(index)}
                      className="text-red-500 hover:text-red-400 text-sm p-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-zinc-900">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-6 py-3 text-xs font-heading tracking-wider border border-zinc-800 text-zinc-400 hover:border-zinc-600 rounded-lg transition-all"
              >
                RESET
              </button>
              <button 
                type="submit"
                disabled={uploadingImage}
                className="px-8 py-3 text-xs font-heading tracking-wider bg-white text-black hover:bg-zinc-200 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadingImage ? 'UPLOADING IMAGE...' : editingId ? 'SAVE CHANGES' : 'PUBLISH HARDWARE'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
