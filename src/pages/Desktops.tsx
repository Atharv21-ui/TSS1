import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ExpandableCardGrid } from '../components/ExpandableCard';
import ProductFilterSort from '../components/ProductFilterSort';
import type { SortOption, FilterOption } from '../components/ProductFilterSort';
import { api } from '../lib/api';

export default function Desktops() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    // Set accent color to purple for desktops page
    document.documentElement.style.setProperty('--accent-color', '#a855f7');
    document.documentElement.style.setProperty('--accent-color-rgb', '168, 85, 247');
    
    // Simple entry animation
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    const loadProducts = async () => {
      try {
        const data = await api.get<any[]>('/products?category=desktops');
        setProducts(data);
      } catch (err) {
        console.error('Error loading desktops:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const processedProducts = products
    .filter(p => filterBy === 'all' || p.stock > 0)
    .sort((a, b) => {
      if (sortBy === 'price-asc') {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
        return pA - pB;
      }
      if (sortBy === 'price-desc') {
        const pA = parseFloat(a.price.replace(/[^0-9.]/g, '')) || 0;
        const pB = parseFloat(b.price.replace(/[^0-9.]/g, '')) || 0;
        return pB - pA;
      }
      if (sortBy === 'name-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>DESKTOPS</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          Uncompromised desktop power. Explore our range of custom liquid-cooled systems and mini workstations built with state-of-the-art processors and graphics accelerators.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 font-heading tracking-widest text-zinc-600 animate-pulse">
          RETRIEVING SPECIFICATIONS...
        </div>
      ) : (
        <>
          <ProductFilterSort
            sortBy={sortBy}
            onSortChange={setSortBy}
            filterBy={filterBy}
            onFilterChange={setFilterBy}
            totalResults={processedProducts.length}
          />
          <ExpandableCardGrid products={processedProducts} />
        </>
      )}
    </div>
  );
}
