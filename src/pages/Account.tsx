import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { User as UserIcon, Shield, Package, Settings, LogOut, Key } from 'lucide-react';
import AnimatedButton from '../components/AnimatedButton';
import ArrowButton from '../components/ArrowButton';
import FloatingInput from '../components/FloatingInput';
import { api } from '../lib/api';
import { auth, googleProvider } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';

interface UserProfile {
  name?: string;
  email: string;
  role: 'user' | 'admin';
  address?: string;
  savedPaymentMethod?: {
    cardNumber: string;
    expiry: string;
  };
  createdAt?: string;
}

export default function Account() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  
  // Interactive Settings State
  const [notifications, setNotifications] = useState({ order: true, marketing: false });

  const handleEditProfile = () => alert('Profile editing mode activated. (Implementation pending)');
  const handleTrackOrder = (orderId: string) => alert(`Connecting to logistics provider...\nOrder ${orderId} Status: Out for Delivery in Neo San Francisco`);
  const handleInvoice = (orderId: string) => alert(`Downloading PDF Invoice for ${orderId}...`);
  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAddress, setRegAddress] = useState('');

  const avatarRef = useRef<HTMLImageElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set accent color to Cyber Blue to match the sleek tech aesthetic
    document.documentElement.style.setProperty('--accent-color', '#00ccff');
    document.documentElement.style.setProperty('--accent-color-rgb', '0, 204, 255');

    // Auto-login check
    const checkUser = async () => {
      try {
        const profile = await api.get<UserProfile>('/auth/me');
        setUser(profile);
        setIsLoggedIn(true);
      } catch (err) {
        // Not logged in or session expired
      }
    };
    checkUser();

    // Entry Animations
    gsap.fromTo(avatarRef.current, 
      { scale: 1.15, rotation: 10, y: 50, opacity: 0 },
      { scale: 1, rotation: 0, y: 0, opacity: 1, duration: 1, ease: 'back.out(1.2)' }
    );

    gsap.fromTo('.stagger-text', 
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, delay: 0.2, ease: 'power2.out' }
    );
  }, []);

  const handleTabChange = (tab: 'profile' | 'orders' | 'settings') => {
    if (tab === activeTab) return;
    
    gsap.to('.account-tab-content', {
      opacity: 0,
      x: -20,
      duration: 0.2,
      onComplete: () => {
        setActiveTab(tab);
        gsap.fromTo('.account-tab-content',
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
        );
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Firebase Login
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      
      // 2. Sync / Fetch User profile from backend
      const res: any = await api.get('/auth/me');
      setUser(res);
      setIsLoggedIn(true);
    } catch (err: any) {
      alert(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Firebase Registration
      await createUserWithEmailAndPassword(auth, regEmail, regPassword);
      
      // 2. Sync User profile to backend Firestore
      const res: any = await api.post('/auth/sync', {
        name: regName,
        email: regEmail,
        address: regAddress
      });
      setUser(res.user);
      setIsLoggedIn(true);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      
      // Sync Google user with backend Firestore
      const res: any = await api.post('/auth/sync', {
        name: googleUser.displayName || 'Google User',
        email: googleUser.email,
        address: ''
      });
      setUser(res.user || { name: googleUser.displayName, email: googleUser.email, role: 'user' });
      setIsLoggedIn(true);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      alert(err.message || 'Google Sign-In failed');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Backend logout not strictly needed since token isn't in httpOnly cookie anymore,
      // but if we need to clear session cookies we would call api.post('/auth/logout').
      setUser(null);
      setIsLoggedIn(false);
      resetForms();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const resetForms = () => {
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegAddress('');
  };

  // If not logged in, render authentication forms
  if (!isLoggedIn) {
    return (
      <div className="hero-wrapper" style={{ overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ height: '60px' }}></div>
        <div className="max-w-md w-full bg-[#0c0c0c] border border-zinc-900 rounded-xl p-8 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-10">
          <div className="text-center">
            <h2 className="font-heading text-3xl tracking-widest text-white">
              {authMode === 'login' ? 'TSS TERMINAL LOGIN' : 'CREATE ACCOUNT'}
            </h2>
            <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">
              {authMode === 'login' ? 'Authentication Required' : 'Register New Hardware User'}
            </p>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <FloatingInput 
                label="EMAIL ADDRESS" 
                type="email" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required 
                bgContext="#0a0a0a" 
              />
              <FloatingInput 
                label="PASSWORD" 
                type="password" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                required 
                bgContext="#0a0a0a" 
              />
              <button 
                type="submit" 
                className="w-full py-3 bg-[var(--accent-color)] text-black font-heading text-xs font-bold tracking-widest rounded-xl hover:opacity-90 transition-opacity mt-6"
              >
                AUTHORIZE TERMINAL
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-900"></div>
                <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-heading tracking-widest uppercase">OR</span>
                <div className="flex-grow border-t border-zinc-900"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 text-white font-heading text-xs font-bold tracking-widest rounded-xl hover:border-[#00ccff] hover:bg-zinc-850 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <FloatingInput 
                label="FULL NAME" 
                type="text" 
                value={regName} 
                onChange={(e) => setRegName(e.target.value)} 
                required 
                bgContext="#0a0a0a" 
              />
              <FloatingInput 
                label="EMAIL ADDRESS" 
                type="email" 
                value={regEmail} 
                onChange={(e) => setRegEmail(e.target.value)} 
                required 
                bgContext="#0a0a0a" 
              />
              <FloatingInput 
                label="PASSWORD" 
                type="password" 
                value={regPassword} 
                onChange={(e) => setRegPassword(e.target.value)} 
                required 
                bgContext="#0a0a0a" 
              />
              <FloatingInput 
                label="DELIVERY ADDRESS" 
                type="text" 
                value={regAddress} 
                onChange={(e) => setRegAddress(e.target.value)} 
                required 
                bgContext="#0a0a0a" 
              />
              <button 
                type="submit" 
                className="w-full py-3 bg-[var(--accent-color)] text-black font-heading text-xs font-bold tracking-widest rounded-xl hover:opacity-90 transition-opacity mt-6"
              >
                CREATE IDENTITY
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-zinc-900"></div>
                <span className="flex-shrink mx-4 text-[10px] text-zinc-500 font-heading tracking-widest uppercase">OR</span>
                <div className="flex-grow border-t border-zinc-900"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 bg-zinc-900 border border-zinc-800 text-white font-heading text-xs font-bold tracking-widest rounded-xl hover:border-[#00ccff] hover:bg-zinc-850 transition-all flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            </form>
          )}

          <div className="text-center pt-4 border-t border-zinc-900">
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="text-xs text-zinc-400 hover:text-[var(--accent-color)] transition-colors tracking-wider"
            >
              {authMode === 'login' ? 'NEW SYSTEM USER? REGISTER HERE' : 'ALREADY HAVE AN IDENTITY? LOGIN'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If logged in, render the profile & tabs
  return (
    <div className="hero-wrapper" style={{ overflow: 'hidden' }}>
      <div style={{ height: '32px' }}></div>

      {/* HERO SECTION */}
      <main className="hero-section">
        <div className="bg-text font-heading" style={{ fontSize: '24vw' }}>TERMINAL</div>
        
        <div className="product-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <img 
            ref={avatarRef} 
            src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" 
            alt="Cyber Avatar" 
            className="product-image"
            style={{ 
              borderRadius: '50%', 
              width: '400px', 
              height: '400px', 
              objectFit: 'cover', 
              border: '2px solid var(--accent-color)', 
              boxShadow: '0 0 40px rgba(0, 204, 255, 0.3)',
              filter: 'grayscale(50%) contrast(1.2)'
            }}
          />
        </div>
        
        <div className="fg-text font-heading" style={{ bottom: '15%' }}>
          Access
          <div className="subtitle" style={{ color: 'var(--accent-color)', letterSpacing: '0.5em' }}>A U T H E N T I C A T E D</div>
        </div>
      </main>

      {/* PANELS */}
      <footer className="footer-panels" style={{ paddingBottom: '40px', alignItems: 'flex-start' }}>
        
        {/* Left Side: Navigation / User Info */}
        <div className="color-selection" style={{ flex: '0 0 250px' }}>
          <div style={{ marginBottom: '40px' }}>
            <h3 className="choose-color uppercase" style={{ color: 'var(--accent-color)' }}>
              USER: {user?.name || 'SYSTEM USER'}
            </h3>
            <p className="text-muted" style={{ fontSize: '12px', marginTop: '5px', letterSpacing: '1px' }}>
              ROLE: {user?.role.toUpperCase()}
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              onClick={() => handleTabChange('profile')}
              style={{ background: 'none', border: 'none', color: activeTab === 'profile' ? 'var(--accent-color)' : '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 0.3s' }}
            >
              <UserIcon size={18} /> Identity Profile
            </button>
            <button 
              onClick={() => handleTabChange('orders')}
              style={{ background: 'none', border: 'none', color: activeTab === 'orders' ? 'var(--accent-color)' : '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 0.3s' }}
            >
              <Package size={18} /> Order Log
            </button>
            <button 
              onClick={() => handleTabChange('settings')}
              style={{ background: 'none', border: 'none', color: activeTab === 'settings' ? 'var(--accent-color)' : '#fff', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 0.3s' }}
            >
              <Settings size={18} /> Configuration
            </button>
          </div>

          <div style={{ marginTop: '60px' }}>
            <button 
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', color: '#ff3333', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}
            >
              <LogOut size={16} /> Disconnect
            </button>
          </div>
        </div>

        {/* Dynamic Content Panel */}
        <div className="info-panel account-tab-content" ref={infoRef} style={{ flexGrow: 1, maxWidth: '800px', background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', padding: '40px', borderRadius: '12px' }}>
          
          {activeTab === 'profile' && (
            <>
              <div className="price-title-row" style={{ marginBottom: '30px' }}>
                <div className="title-area stagger-text">
                  <span className="badge">Clearance Level {user?.role === 'admin' ? '5' : '4'}</span>
                  <h2 className="title font-heading" style={{ fontSize: '2.5rem' }}>IDENTITY PROFILE</h2>
                </div>
              </div>
              
              <div className="stagger-text" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <label className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Primary Email</label>
                  <p style={{ fontSize: '16px', marginTop: '5px' }}>{user?.email}</p>
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Role Clearance</label>
                  <p style={{ fontSize: '16px', marginTop: '5px', textTransform: 'capitalize' }}>{user?.role}</p>
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Default Shipping</label>
                  <p style={{ fontSize: '16px', marginTop: '5px', lineHeight: '1.5' }}>{user?.address || 'No address stored'}</p>
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Status</label>
                  <p style={{ fontSize: '16px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px', color: '#00ff00' }}>
                    <Shield size={16} /> 2FA Enabled
                  </p>
                </div>
              </div>
              
              <div className="stagger-text flex gap-4" style={{ marginTop: '40px' }}>
                <ArrowButton text="EDIT PROFILE" onClick={handleEditProfile} />
                
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-black font-heading text-xs font-bold tracking-wider rounded hover:opacity-90 transition-opacity"
                  >
                    <Key size={14} /> ENTER CMS DASHBOARD
                  </button>
                )}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <div className="price-title-row" style={{ marginBottom: '30px' }}>
                <div className="title-area stagger-text">
                  <h2 className="title font-heading" style={{ fontSize: '2.5rem' }}>ORDER LOG</h2>
                </div>
              </div>
              
              <div className="stagger-text" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Mock Order 1 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order #TSS-8892-X</span>
                    <h4 style={{ fontSize: '16px', margin: '5px 0' }}>TSS Blade X1 (Cyber Blue)</h4>
                    <span style={{ fontSize: '12px', color: '#00ff00' }}>● Delivered on 12.01.2025</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>₹1,24,999.00</div>
                    <AnimatedButton text="TRACK" className="outline-variant" onClick={() => handleTrackOrder('TSS-8892-X')} />
                  </div>
                </div>

                {/* Mock Order 2 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                  <div>
                    <span className="text-muted" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Order #TSS-7104-Y</span>
                    <h4 style={{ fontSize: '16px', margin: '5px 0' }}>Quantum Mechanical Keyboard</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>● Delivered on 08.15.2025</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>₹14,999.00</div>
                    <AnimatedButton text="INVOICE" className="outline-variant" onClick={() => handleInvoice('TSS-7104-Y')} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <div className="price-title-row" style={{ marginBottom: '30px' }}>
                <div className="title-area stagger-text">
                  <h2 className="title font-heading" style={{ fontSize: '2.5rem' }}>SYSTEM CONFIGURATION</h2>
                </div>
              </div>
              
              <div className="stagger-text" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                  <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', color: 'var(--accent-color)' }}>Notifications</h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                    <input type="checkbox" checked={notifications.order} onChange={(e) => setNotifications(prev => ({...prev, order: e.target.checked}))} style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }} />
                    <span>Order Updates & Shipping Alerts</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input type="checkbox" checked={notifications.marketing} onChange={(e) => setNotifications(prev => ({...prev, marketing: e.target.checked}))} style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }} />
                    <span>Marketing & Hardware Drops</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px' }}>
                  <h4 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px', color: 'var(--accent-color)' }}>Payment Channels</h4>
                  {user?.savedPaymentMethod ? (
                    <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span>•••• •••• •••• {user.savedPaymentMethod.cardNumber.slice(-4)} (Exp: {user.savedPaymentMethod.expiry})</span>
                      <button style={{ background: 'none', border: 'none', color: '#ff3333', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>Remove</button>
                    </div>
                  ) : (
                    <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span className="text-zinc-500">No saved payment methods. Add one during checkout.</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      </footer>
    </div>
  );
}
