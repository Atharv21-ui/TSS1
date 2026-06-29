import React, { useState, useEffect } from 'react';
import gsap from 'gsap';
import { useCart } from '../context/CartContext';
import { MultiStepLoader } from '../components/ui/multi-step-loader';
import AnimatedButton from '../components/AnimatedButton';
import ArrowButton from '../components/ArrowButton';
import FloatingInput from '../components/FloatingInput';
import { CheckCircle, ShieldCheck, CreditCard, Trash2, Wallet, Banknote, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const loadingStates = [
  { text: "Securing connection..." },
  { text: "Authenticating user details..." },
  { text: "Processing encrypted payment..." },
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
  const [address, setAddress] = useState('');
  const [paymentType, setPaymentType] = useState<'credit_card' | 'saved_card' | 'cod' | 'upi'>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [upiId, setUpiId] = useState('');

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
        if (profile.address) {
          setAddress(profile.address);
        }
        if (profile.savedPaymentMethod) {
          setPaymentType('saved_card');
        }
      } catch (err) {}
    };
    fetchUser();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;
    
    if (paymentType === 'credit_card' && user) {
      try {
        await api.patch('/users/me/payment', { cardNumber, expiry });
      } catch (err) {
        console.error('Failed to save payment method', err);
      }
    }

    setLoading(true);
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
          Your high-performance hardware is being provisioned. A confirmation email with encrypted tracking details has been sent to your inbox.
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
          <span className="text-muted" style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>256-bit Encrypted Session</span>
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
                    <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', margin: 0 }}>{item.price}</p>
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
                <span>${cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="text-muted">Encrypted Shipping</span>
                <span>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span className="font-heading">TOTAL</span>
                <span style={{ color: 'var(--accent-color)' }}>${cartTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Form */}
          <form className="checkout-panel" onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            <div style={{ background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '20px' }}>1. SHIPPING LOGISTICS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <FloatingInput label="First Name" required type="text" bgContext="#111" />
                <FloatingInput label="Last Name" required type="text" bgContext="#111" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <FloatingInput label="Delivery Address" required type="text" value={address} onChange={(e) => setAddress(e.target.value)} bgContext="#111" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                <FloatingInput label="City" required type="text" bgContext="#111" />
                <FloatingInput label="Postal Code" required type="text" bgContext="#111" />
              </div>
            </div>

            <div style={{ background: '#111', padding: '30px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                2. PAYMENT CHANNEL <Wallet size={18} color="var(--accent-color)" />
              </h3>

              <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
                {user?.savedPaymentMethod && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: paymentType === 'saved_card' ? 'var(--accent-color)' : '#999' }}>
                    <input type="radio" name="paymentType" checked={paymentType === 'saved_card'} onChange={() => setPaymentType('saved_card')} style={{ accentColor: 'var(--accent-color)' }} />
                    <CreditCard size={16} /> Saved Card
                  </label>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: paymentType === 'credit_card' ? 'var(--accent-color)' : '#999' }}>
                  <input type="radio" name="paymentType" checked={paymentType === 'credit_card'} onChange={() => setPaymentType('credit_card')} style={{ accentColor: 'var(--accent-color)' }} />
                  <CreditCard size={16} /> Credit Card
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: paymentType === 'upi' ? 'var(--accent-color)' : '#999' }}>
                  <input type="radio" name="paymentType" checked={paymentType === 'upi'} onChange={() => setPaymentType('upi')} style={{ accentColor: 'var(--accent-color)' }} />
                  <Smartphone size={16} /> UPI
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: paymentType === 'cod' ? 'var(--accent-color)' : '#999' }}>
                  <input type="radio" name="paymentType" checked={paymentType === 'cod'} onChange={() => setPaymentType('cod')} style={{ accentColor: 'var(--accent-color)' }} />
                  <Banknote size={16} /> Cash on Delivery
                </label>
              </div>

              {paymentType === 'saved_card' && user?.savedPaymentMethod && (
                <div style={{ padding: '20px', background: 'rgba(57, 195, 239, 0.05)', border: '1px solid rgba(57, 195, 239, 0.2)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CreditCard size={18} />
                    •••• •••• •••• {user.savedPaymentMethod.cardNumber.slice(-4)} (Exp: {user.savedPaymentMethod.expiry})
                  </p>
                  <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>This payment method is securely saved in your profile.</p>
                </div>
              )}

              {paymentType === 'credit_card' && (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <FloatingInput label="Card Number" required type="text" pattern="[0-9]{16}" title="16 digit card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} bgContext="#111" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <FloatingInput label="MM/YY" required type="text" pattern="(0[1-9]|1[0-2])\/[0-9]{2}" title="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} bgContext="#111" />
                    <FloatingInput label="CVC" required type="text" pattern="[0-9]{3,4}" title="3 or 4 digit CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} bgContext="#111" />
                  </div>
                </>
              )}

              {paymentType === 'upi' && (
                <div style={{ marginBottom: '20px' }}>
                  <FloatingInput label="UPI ID (e.g. name@bank)" required type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} bgContext="#111" />
                </div>
              )}

              {paymentType === 'cod' && (
                <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: '#999', fontSize: '13px' }}>
                  Pay with cash or digital modes upon delivery.
                </div>
              )}
            </div>

            <button type="submit" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', alignSelf: 'flex-end' }}>
              <AnimatedButton text="INITIATE PROTOCOL" />
            </button>
          </form>

        </div>
      )}

      {/* Core Loader Modal */}
      <MultiStepLoader 
        loadingStates={loadingStates} 
        loading={loading} 
        duration={2000} 
        onComplete={handleLoaderComplete}
      />
    </div>
  );
}
