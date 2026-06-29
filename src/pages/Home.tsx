import { useState, useRef } from 'react';
import gsap from 'gsap';
import { Cpu, Monitor, Zap, Shield, Wifi, Battery } from 'lucide-react';
import { Link } from 'react-router-dom';
import AnimatedButton from '../components/AnimatedButton';
import { TracingBeam } from '../components/ui/tracing-beam';
import StoreInfo from '../components/StoreInfo';

type Colorway = {
  id: string;
  name: string;
  hex: string;
  price: string;
  image: string;
};

const colors: Colorway[] = [
  {
    id: 'red',
    name: 'Crimson Red',
    hex: '#ff0000',
    price: '1,299$',
    image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'green',
    name: 'Neon Green',
    hex: '#00ff00',
    price: '1,349$',
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'blue',
    name: 'Cyber Blue',
    hex: '#00ccff',
    price: '1,499$',
    image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800'
  }
];

export default function Home() {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const activeColor = colors[activeColorIndex];
  
  const productRef = useRef<HTMLImageElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  
  const handleColorChange = (index: number) => {
    if (index === activeColorIndex) return;
    
    const newColor = colors[index];
    
    gsap.to(productRef.current, {
      scale: 0.85,
      rotation: 55,
      x: -200,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => {
        setActiveColorIndex(index);
        
        document.documentElement.style.setProperty('--accent-color', newColor.hex);
        
        const r = parseInt(newColor.hex.slice(1, 3), 16);
        const g = parseInt(newColor.hex.slice(3, 5), 16);
        const b = parseInt(newColor.hex.slice(5, 7), 16);
        document.documentElement.style.setProperty('--accent-color-rgb', `${r}, ${g}, ${b}`);
        
        gsap.fromTo(productRef.current, 
          { scale: 1.15, rotation: 30, x: 200, opacity: 0 },
          { scale: 1, rotation: 45, x: 0, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }
        );
      }
    });

    gsap.to('.stagger-text', {
      y: 10,
      opacity: 0,
      duration: 0.2,
      stagger: 0.05,
      onComplete: () => {
        gsap.to('.stagger-text', {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.1
        });
      }
    });
  };

  return (
    <>
      {/* 1. HERO SECTION (100vh) */}
      <div className="hero-wrapper">
        {/* Placeholder to balance the flex space-between exactly like the old header did */}
        <div style={{ height: '32px' }}></div>

        <main className="hero-section">
          <div className="bg-text font-heading">QUANTUM</div>
          
          <div className="product-container">
            <img 
              ref={productRef} 
              src={activeColor.image} 
              alt="TSS Blade Laptop" 
              className="product-image"
              style={{ transform: 'rotate(45deg)' }}
            />
          </div>
          
          <div className="fg-text font-heading">
            Blade
            <div className="subtitle">P e r f o r m a n c e  L a p t o p s</div>
          </div>
        </main>

        <footer className="footer-panels">
          <div className="color-selection">
            <h3 className="choose-color">CHOOSE COLOR :</h3>
            <div className="thumbnails">
              {colors.map((color, index) => (
                <div 
                  key={color.id} 
                  className={`thumbnail ${index === activeColorIndex ? 'active' : ''}`}
                  onClick={() => handleColorChange(index)}
                >
                  <div className="thumb-laptop" style={{ borderColor: color.hex, boxShadow: index === activeColorIndex ? `0 0 10px ${color.hex}` : 'none' }}></div>
                </div>
              ))}
            </div>
          </div>

          <div className="ctas" style={{ display: 'flex', gap: '20px' }}>
            <AnimatedButton text="ADD TO CART" />
            <AnimatedButton text="BUY NOW" className="outline-variant" />
          </div>

          <div className="info-panel" ref={infoRef}>
            <div className="price-title-row">
              <div className="price stagger-text text-accent">{activeColor.price}</div>
              <div className="title-area stagger-text">
                <span className="badge">exclusive</span>
                <h2 className="title font-heading">TSS BLADE X1</h2>
                <div className="edition">GAMING EDITION</div>
              </div>
            </div>
            
            <div className="inspiration stagger-text">
              <h4>INSPIRATION</h4>
              <p>Engineered for elite performance. The TSS Blade X1 features a magnesium-alloy chassis, advanced vapor chamber cooling, and a 240Hz display to elevate your workflow and gaming.</p>
            </div>
          </div>
        </footer>

        <div className="pagination">
          {colors.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${index === activeColorIndex ? 'active' : ''}`}
              onClick={() => handleColorChange(index)}
            ></div>
          ))}
          <div className="dot"></div>
        </div>
      </div>

      {/* 2. SCROLLING MARQUEE */}
      <div className="marquee-container">
        <div className="marquee-content font-heading">
          <span>QUANTUM PERFORMANCE</span>
          <span>•</span>
          <span>ELITE GAMING</span>
          <span>•</span>
          <span>UNMATCHED PRECISION</span>
          <span>•</span>
          <span>QUANTUM PERFORMANCE</span>
          <span>•</span>
          <span>ELITE GAMING</span>
          <span>•</span>
          <span>UNMATCHED PRECISION</span>
        </div>
      </div>

      {/* 3. SCROLL TRACKED CONTENT */}
      <TracingBeam>
        {/* CATEGORIES GRID */}
        <section className="section" style={{ paddingTop: '80px' }}>
          <h2 className="section-title font-heading">Categories</h2>
          <div className="categories-grid">
            {[
              { title: 'LAPTOPS', link: '/laptops', img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=600' },
              { title: 'DESKTOPS', link: '/desktops', img: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=600' },
              { title: 'LED TV', link: '/led-tv', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=600' },
              { title: 'ACCESSORIES', link: '/accessories', img: 'https://images.unsplash.com/photo-1527814050087-179f376dd0e7?auto=format&fit=crop&q=80&w=600' }
            ].map((cat, i) => (
              <Link to={cat.link} key={i} className="category-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
                <img src={cat.img} alt={cat.title} className="category-img" />
                <div className="category-info">
                  <h3 className="font-heading">{cat.title}</h3>
                  <p>EXPLORE RANGE</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BENTO BOX TECH SPECS */}
        <section className="section">
          <h2 className="section-title font-heading">Engineering</h2>
          <div className="bento-grid">
            <div className="bento-item large">
              <Cpu size={48} className="bento-icon" />
              <h3 className="font-heading">Next-Gen Architecture</h3>
              <p>Powered by the latest multi-core processors. Experience unparalleled speed in rendering, compiling, and elite gaming. Built to push the boundaries of what a portable machine can do.</p>
            </div>
            <div className="bento-item">
              <Monitor size={32} className="bento-icon" />
              <h3 className="font-heading">240Hz Display</h3>
              <p>Silky smooth visuals with absolute color accuracy for creators.</p>
            </div>
            <div className="bento-item">
              <Zap size={32} className="bento-icon" />
              <h3 className="font-heading">Vapor Cooling</h3>
              <p>Advanced thermal management keeps the chassis cool under load.</p>
            </div>
            <div className="bento-item">
              <Shield size={32} className="bento-icon" />
              <h3 className="font-heading">Titanium Build</h3>
              <p>Aircraft-grade materials ensure maximum durability.</p>
            </div>
            <div className="bento-item">
              <Wifi size={32} className="bento-icon" />
              <h3 className="font-heading">Wi-Fi 7 Ready</h3>
              <p>Ultra-low latency connectivity for competitive gaming.</p>
            </div>
            <div className="bento-item">
              <Battery size={32} className="bento-icon" />
              <h3 className="font-heading">99Wh Battery</h3>
              <p>All-day performance with fast charging support.</p>
            </div>
          </div>
        </section>

        {/* STORE INFO & REVIEWS */}
        <StoreInfo />
      </TracingBeam>
    </>
  );
}
