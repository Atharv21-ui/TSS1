import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import StaggeredMenu from './StaggeredMenu';
import { GooeyInput } from './ui/gooey-input';
import FloatingInput from './FloatingInput';
import SearchModal from './SearchModal';

export default function Layout() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Global deep-space vector canvas */}
      <div className="vector-lines"></div>

      {/* Global Search Bar */}
      <div 
        onClick={() => setIsSearchOpen(true)}
        style={{ position: 'fixed', top: '25px', left: '40px', zIndex: 100, cursor: 'pointer' }}
      >
        <GooeyInput placeholder="Search TSS Hardware..." />
      </div>
      
      {/* Global Navigation - Staggered Menu */}
      <StaggeredMenu
        position="right"
        isFixed={true}
        onLogoClick={() => setIsSearchOpen(true)}
        items={[
          { label: 'Home', ariaLabel: 'Go to home', link: '/' },
          { label: 'Laptops', ariaLabel: 'Shop laptops', link: '/laptops' },
          { label: 'Desktops', ariaLabel: 'Shop desktops', link: '/desktops' },
          { label: 'Printers', ariaLabel: 'Shop printers', link: '/printers' },
          { label: 'LED TV', ariaLabel: 'Shop TVs', link: '/led-tv' },
          { label: 'Accessories', ariaLabel: 'Shop accessories', link: '/accessories' },
          { label: 'Cart', ariaLabel: 'View cart', link: '/checkout' },
          { label: 'Account', ariaLabel: 'Manage account', link: '/account' },
        ]}
        socialItems={[
          
          { label: 'Twitter', link: 'https://twitter.com' },
          { label: 'Instagram', link: 'https://instagram.com' },
          { label: 'YouTube', link: 'https://youtube.com' }
        ]}
        colors={['#111', '#222']}
        accentColor="var(--accent-color)"
        menuButtonColor="#fff"
        openMenuButtonColor="var(--accent-color)"
      />

      {/* Dynamic Page Content */}
      <main style={{ flexGrow: 1 }}>
        <Outlet />
      </main>

      {/* Global Footer */}
      <footer className="footer">
        <div className="footer-col">
          <h2 className="footer-logo font-heading">TSS</h2>
          <p className="text-muted" style={{ fontSize: '12px', lineHeight: '1.6' }}>
            Elevating the standard of high-performance electronics. Built for the modern creator, engineer, and gamer.
          </p>
        </div>
        <div className="footer-col" style={{ display: 'flex', gap: '60px' }}>
          <div>
            <h4>PRODUCTS</h4>
            <ul>
              <li><NavLink to="/laptops">Laptops</NavLink></li>
              <li><NavLink to="/desktops">Desktops</NavLink></li>
              <li><NavLink to="/printers">Printers</NavLink></li>
              <li><NavLink to="/led-tv">LED TVs</NavLink></li>
            </ul>
          </div>
          <div>
            <h4>SUPPORT</h4>
            <ul>
              <li><NavLink to="/contact">Contact Us</NavLink></li>
              <li><NavLink to="/warranty">Warranty</NavLink></li>
              <li><NavLink to="/downloads">Downloads</NavLink></li>
              <li><NavLink to="/faq">FAQ</NavLink></li>
            </ul>
          </div>
        </div>
        <div className="footer-col newsletter">
          <h4>STAY UPDATED</h4>
          <div style={{ marginBottom: '15px' }}>
            <FloatingInput label="ENTER EMAIL" required type="email" bgContext="#111" />
          </div>
          <button className="btn-solid" style={{ width: '100%' }}>SUBSCRIBE</button>
        </div>
      </footer>
    </div>
  );
}
