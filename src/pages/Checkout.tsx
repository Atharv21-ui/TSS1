import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { MultiStepLoader } from '../components/ui/multi-step-loader';
import AnimatedButton from '../components/AnimatedButton';
import ArrowButton from '../components/ArrowButton';
import FloatingInput from '../components/FloatingInput';
import { CheckCircle, ShieldCheck, Trash2, Shield, CreditCard, Smartphone, Building } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const loadingStates = [
  { text: "Securing Razorpay tunnel..." },
  { text: "Verifying encrypted payment signature..." },
  { text: "Allocating global inventory..." },
  { text: "Configuring system specs..." },
  { text: "Preparing shipping manifest..." },
  { text: "Order Confirmed" },
];

export default function Checkout() {
  const { cartItems, cartTotal, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    // Set accent color for Checkout
    document.documentElement.style.setProperty('--accent-color', '#39C3EF');
    document.documentElement.style.setProperty('--accent-color-rgb', '57, 195, 239');
    
    gsap.fromTo('.checkout-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.checkout-panel', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out', delay: 0.3 }
    );
    const fetchUser = async () => {
      try {
        const profile: any = await api.get('/auth/me');
        setUser(profile);
        if (profile.name) {
          const parts = profile.name.split(' ');
          setFirstName(parts[0] || '');
          setLastName(parts.slice(1).join(' ') || '');
        }
        if (profile.address) {
          setAddress(profile.address);
        }
      } catch (err) {}
    };
    fetchUser();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      // 1. Create order on backend via Razorpay
      const orderRes: any = await api.post('/payments/create-order', {
        amount: cartTotal
      });

      if (!orderRes.success) {
        alert('Failed to initialize Razorpay payment session.');
        return;
      }

      const { order_id, amount, currency, key_id } = orderRes;

      // 2. Setup Razorpay Checkout Modal
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'TSS COMPUTERS',
        description: 'High Performance Hardware Order',
        image: '/favicon.svg',
        order_id: order_id,
        prefill: {
          name: `${firstName} ${lastName}`.trim() || user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#39C3EF',
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            const verifyRes: any = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              // MultiStepLoader handles transition to complete state
            } else {
              setLoading(false);
              alert('Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification error:', err);
            setLoading(false);
            alert('Payment verification error.');
          }
        },
        modal: {
          ondismiss: function () {
            console.log('Payment modal closed');
          },
        },
      };

      if ((window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        alert('Razorpay SDK failed to load. Please refresh and check your internet connection.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.message || 'Error initializing payment.');
    }
  };

  const handleLoaderComplete = () => {
    setLoading(false);
    setOrderComplete(true);
    clearCart();
  };

  if (orderComplete) {
    return (
      <div className="page-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
        <CheckCircle size={80} color="var(--accent-color)" style={{ marginBottom: '30px' }} />
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase', marginBottom: '20px' }}>ORDER SECURED</h1>
        <p className="text-muted" style={{ maxWidth: '600px', lineHeight: '1.6', marginBottom: '40px' }}>
          Your high-performance hardware has been provisioned and paid via Razorpay. A confirmation email with tracking details has been sent to your inbox.
        </p>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <ArrowButton text="RETURN TO SECURE TERMINAL" />
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <div className="checkout-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>CHECKOUT</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <ShieldCheck size={20} color="var(--accent-color)" />
          <span className="text-muted" style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Razorpay 256-bit Encrypted Session</span>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="checkout-panel" style={{ marginTop: '80px', textAlign: 'center', padding: '100px 0' }}>
          <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '30px' }}>YOUR TERMINAL CART IS EMPTY</p>
          <Link to="/laptops" style={{ textDecoration: 'none' }}>
            <ArrowButton text="BROWSE HARDWARE" style={{ margin: '0 auto' }} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '60px', marginTop: '60px', alignItems: 'start' }}>
          
          {/* Left Column: Cart Summary */}
          <div className="checkout-panel" style={{ background: '#0a0a0a', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '30px', borderBottom: '1px solid #333', paddingBottom: '15px' }}>ORDER SUMMARY</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              {cartItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <img src={item.src} alt={item.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flexGrow: 1 }}>
                    <h4 className="font-heading" style={{ fontSize: '1.1rem', margin: 0 }}>{item.title}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>QTY: {item.quantity}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', margin: 0 }}>
                      {item.price.includes('₹') ? item.price : `₹${item.price}`}
                    </p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginTop: '5px' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #333', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted">Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted">Express Shipping</span>
                <span>₹0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span className="font-heading">TOTAL</span>
                <span style={{ color: 'var(--accent-color)' }}>₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form */}
          <form className="checkout-panel" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>1. SHIPPING LOGISTICS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <FloatingInput label="First Name" required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} bgContext="#111" />
                <FloatingInput label="Last Name" required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} bgContext="#111" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <FloatingInput label="Delivery Address" required type="text" value={address} onChange={(e) => setAddress(e.target.value)} bgContext="#111" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <FloatingInput label="City" required type="text" value={city} onChange={(e) => setCity(e.target.value)} bgContext="#111" />
                <FloatingInput label="Postal Code" required type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} bgContext="#111" />
              </div>
            </div>

            <div style={{ background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                2. PAY VIA RAZORPAY <Shield size={18} color="var(--accent-color)" />
              </h3>

              <div style={{ padding: '20px', background: 'rgba(57, 195, 239, 0.05)', border: '1px solid rgba(57, 195, 239, 0.2)', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                  Secure payment gateway supported modes:
                </p>
                <div style={{ display: 'flex', gap: '20px', color: 'var(--accent-color)', fontSize: '13px', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Smartphone size={16} /> UPI (GPay, PhonePe, Paytm)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={16} /> Credit / Debit Cards</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building size={16} /> Net Banking & Wallets</span>
                </div>
              </div>
            </div>

            <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', alignSelf: 'flex-end' }}>
              <AnimatedButton text="PAY WITH RAZORPAY" />
            </button>
          </form>

        </div>
      )}

      {/* Core Loader Modal */}
      <MultiStepLoader 
        loadingStates={loadingStates} 
        loading={loading} 
        duration={1500} 
        onComplete={handleLoaderComplete}
      />
    </div>
  );
}
