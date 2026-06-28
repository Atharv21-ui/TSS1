import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ExpandableCardGrid } from '../components/ExpandableCard';
import { api } from '../lib/api';

export default function Accessories() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set accent color to pink/magenta for accessories page
    document.documentElement.style.setProperty('--accent-color', '#ec4899');
    document.documentElement.style.setProperty('--accent-color-rgb', '236, 72, 153');
    
    // Simple entry animation
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    const loadProducts = async () => {
      try {
        const data = await api.get<any[]>('/products?category=accessories');
        setProducts(data);
      } catch (err) {
        console.error('Error loading accessories:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>ACCESSORIES</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          High-fidelity desktop gear. Explore our line of optical keyboards, ultra-lightweight wireless mice, and spatial audio headsets designed for competitive responsiveness.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 font-heading tracking-widest text-zinc-600 animate-pulse">
          RETRIEVING SPECIFICATIONS...
        </div>
      ) : (
        <ExpandableCardGrid products={products} />
      )}
    </div>
  );
}
