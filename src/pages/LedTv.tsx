import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ExpandableCardGrid } from '../components/ExpandableCard';
import { api } from '../lib/api';

export default function LedTv() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set accent color to orange/gold for LED TV page
    document.documentElement.style.setProperty('--accent-color', '#eab308');
    document.documentElement.style.setProperty('--accent-color-rgb', '234, 179, 8');
    
    // Simple entry animation
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    const loadProducts = async () => {
      try {
        const data = await api.get<any[]>('/products?category=led-tv');
        setProducts(data);
      } catch (err) {
        console.error('Error loading TVs:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>LED TV</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          Immersive visual displays. Experience cinema-grade 8K Quantum OLED panels and high-refresh-rate displays engineered for elite console gaming and professional media setups.
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
