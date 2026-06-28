import { useEffect } from 'react';
import gsap from 'gsap';
import AnimatedButton from '../components/AnimatedButton';
import FloatingInput from '../components/FloatingInput';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  useEffect(() => {
    // Set accent color to Neon Orange
    document.documentElement.style.setProperty('--accent-color', '#ff3300');
    document.documentElement.style.setProperty('--accent-color-rgb', '255, 51, 0');
    
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.contact-item', 
      { opacity: 0, x: -30 }, 
      { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );

    gsap.fromTo('.contact-form', 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.5 }
    );
  }, []);

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>CONTACT US</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          Have a question about our quantum-grade hardware? Our global support team is ready to assist you.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '60px', marginTop: '60px', alignItems: 'start' }}>
        
        {/* Contact Info (Left Column) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div className="contact-item" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '16px', background: 'rgba(255,51,0,0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
              <Mail size={24} />
            </div>
            <div>
              <h4 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Email Support</h4>
              <p className="text-muted">support@tss-hardware.com</p>
            </div>
          </div>

          <div className="contact-item" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '16px', background: 'rgba(255,51,0,0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
              <Phone size={24} />
            </div>
            <div>
              <h4 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Global Hotline</h4>
              <p className="text-muted">+1 (800) TSS-TECH</p>
            </div>
          </div>

          <div className="contact-item" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ padding: '16px', background: 'rgba(255,51,0,0.1)', borderRadius: '50%', color: 'var(--accent-color)' }}>
              <MapPin size={24} />
            </div>
            <div>
              <h4 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>Headquarters</h4>
              <p className="text-muted">101 Silicon Avenue<br />Neo San Francisco, CA 94107</p>
            </div>
          </div>
        </div>

        {/* Contact Form (Right Column) */}
        <form className="contact-form" onSubmit={(e) => { e.preventDefault(); alert("Message sent successfully (Demo Mode)"); }} style={{
          background: 'rgba(10, 10, 10, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.05)',
          padding: '40px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 className="font-heading" style={{ fontSize: '2rem', marginBottom: '10px' }}>SEND A MESSAGE</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <FloatingInput label="First Name" required type="text" bgContext="#111" />
            <FloatingInput label="Last Name" required type="text" bgContext="#111" />
          </div>
          
          <FloatingInput label="Email Address" required type="email" bgContext="#111" />
          
          <select style={{ width: '100%', padding: '16px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px', appearance: 'none' }}>
            <option>General Inquiry</option>
            <option>Technical Support</option>
            <option>Warranty Claim</option>
            <option>Sales & Enterprise</option>
          </select>
          
          <FloatingInput label="How can we help you?" required isTextArea rows={5} bgContext="#111" />
          
          <div style={{ marginTop: '10px', alignSelf: 'flex-start' }}>
            <AnimatedButton text="SEND MESSAGE" />
          </div>
        </form>

      </div>
    </div>
  );
}
