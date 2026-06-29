import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchAllProducts();
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/products');
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products for search:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = query.trim() === '' 
    ? products.slice(0, 4) // Show 4 featured items if query empty
    : products.filter(p => 
        p.title?.toLowerCase().includes(query.toLowerCase()) ||
        p.category?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(p.specs) && p.specs.some((s: any) => 
          s.label?.toLowerCase().includes(query.toLowerCase()) || 
          s.value?.toLowerCase().includes(query.toLowerCase())
        ))
      );

  const handleProductClick = (category: string) => {
    onClose();
    const catRoute = category.toLowerCase() === 'led-tv' ? 'led-tv' : category.toLowerCase();
    navigate(`/${catRoute}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-3xl bg-[#0a0a0c] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            {/* Top Cyan Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00ccff] to-transparent" />

            {/* Input Bar */}
            <div className="relative flex items-center px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50">
              <Search className="w-5 h-5 text-[#00ccff] shrink-0 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search TSS Hardware, specs, laptops, desktops..."
                className="w-full bg-transparent text-white font-heading text-base sm:text-lg placeholder:text-zinc-600 focus:outline-none tracking-wide"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 text-zinc-500 hover:text-white transition-colors mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="px-2.5 py-1 text-xs font-heading font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:text-white transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-heading font-bold tracking-[0.2em] text-zinc-500 uppercase">
                  {query.trim() === '' ? 'RECOMMENDED HARDWARE' : `SEARCH RESULTS (${filteredProducts.length})`}
                </span>
                {loading && (
                  <span className="text-[10px] font-heading text-[#00ccff] animate-pulse">
                    QUERYING INDEX...
                  </span>
                )}
              </div>

              {filteredProducts.length === 0 && !loading ? (
                <div className="text-center py-12">
                  <p className="text-zinc-500 font-heading text-sm tracking-widest uppercase">
                    NO HARDWARE MATCHING "{query.toUpperCase()}"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product._id || product.id}
                      className="group flex items-center justify-between p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 hover:border-[#00ccff]/50 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer"
                      onClick={() => handleProductClick(product.category)}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={product.src}
                          alt={product.title}
                          className="w-12 h-12 object-cover rounded-lg border border-zinc-800 group-hover:scale-105 transition-transform duration-300"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading font-bold text-sm text-white group-hover:text-[#00ccff] transition-colors">
                              {product.title}
                            </h4>
                            <span className="text-[9px] font-heading font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-wider">
                              {product.category}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-mono font-bold text-sm text-[#00ccff]">
                          {product.price}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart({
                              id: product._id || product.id,
                              title: product.title,
                              price: product.price,
                              src: product.src,
                              category: product.category
                            });
                          }}
                          className="p-2 rounded-lg bg-zinc-800 hover:bg-[#00ccff] hover:text-black text-zinc-300 transition-colors"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#00ccff] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Quick Links */}
            <div className="px-6 py-3 border-t border-zinc-900 bg-zinc-950/80 flex items-center justify-between text-xs text-zinc-500 font-heading">
              <span>QUICK CATEGORIES</span>
              <div className="flex items-center gap-3">
                {['laptops', 'desktops', 'led-tv', 'accessories'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleProductClick(cat)}
                    className="hover:text-[#00ccff] transition-colors uppercase text-[10px] tracking-wider font-semibold"
                  >
                    {cat.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
