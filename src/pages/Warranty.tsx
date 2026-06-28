import { useEffect } from 'react';
import gsap from 'gsap';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function Warranty() {
  useEffect(() => {
    // Set accent color to Tech Blue
    document.documentElement.style.setProperty('--accent-color', '#0055ff');
    document.documentElement.style.setProperty('--accent-color-rgb', '0, 85, 255');
    
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.warranty-card', 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );
    
    gsap.fromTo('.warranty-text', 
      { opacity: 0 }, 
      { opacity: 1, duration: 0.8, delay: 0.6 }
    );
  }, []);

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>WARRANTY</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          TSS hardware is built to last. Our comprehensive warranty plans ensure that your systems run flawlessly, backed by our global network of elite technicians.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '60px' }}>
        
        {/* Tier 1 */}
        <div className="warranty-card" style={{ background: '#111', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <ShieldAlert size={48} color="var(--accent-color)" style={{ marginBottom: '20px' }} />
          <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>STANDARD CARE</h3>
          <h4 style={{ color: 'var(--accent-color)', marginBottom: '20px' }}>Included (1 Year)</h4>
          <p className="text-muted" style={{ lineHeight: '1.6', fontSize: '14px', flexGrow: 1 }}>
            Our base tier protects your hardware against manufacturing defects and hardware failure.
          </p>
          <ul style={{ color: '#ccc', fontSize: '13px', lineHeight: '2', marginTop: '20px', paddingLeft: '15px' }}>
            <li>Hardware repair / replacement</li>
            <li>90 days of 24/7 phone support</li>
            <li>Mail-in repair service</li>
          </ul>
        </div>

        {/* Tier 2 */}
        <div className="warranty-card" style={{ background: '#111', padding: '40px', borderRadius: '12px', border: '1px solid var(--accent-color)', boxShadow: '0 0 20px rgba(0,85,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', transform: 'scale(1.05)', zIndex: 10 }}>
          <ShieldCheck size={48} color="var(--accent-color)" style={{ marginBottom: '20px' }} />
          <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>PRO CARE</h3>
          <h4 style={{ color: 'var(--accent-color)', marginBottom: '20px' }}>$199 (3 Years)</h4>
          <p className="text-muted" style={{ lineHeight: '1.6', fontSize: '14px', flexGrow: 1 }}>
            Extended coverage designed for professionals who rely on their machines daily.
          </p>
          <ul style={{ color: '#ccc', fontSize: '13px', lineHeight: '2', marginTop: '20px', paddingLeft: '15px' }}>
            <li>3 years hardware protection</li>
            <li>3 years 24/7 priority support</li>
            <li>On-site technician dispatch</li>
            <li>Accidental damage protection (1 incident)</li>
          </ul>
        </div>

        {/* Tier 3 */}
        <div className="warranty-card" style={{ background: '#111', padding: '40px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Shield size={48} color="var(--accent-color)" style={{ marginBottom: '20px' }} />
          <h3 className="font-heading" style={{ fontSize: '1.5rem', marginBottom: '10px' }}>ULTIMATE CARE</h3>
          <h4 style={{ color: 'var(--accent-color)', marginBottom: '20px' }}>$399 (5 Years)</h4>
          <p className="text-muted" style={{ lineHeight: '1.6', fontSize: '14px', flexGrow: 1 }}>
            Absolute peace of mind. White-glove service for enterprise and elite consumers.
          </p>
          <ul style={{ color: '#ccc', fontSize: '13px', lineHeight: '2', marginTop: '20px', paddingLeft: '15px' }}>
            <li>5 years comprehensive protection</li>
            <li>Dedicated account manager</li>
            <li>Next-business-day on-site repair</li>
            <li>Unlimited accidental damage</li>
            <li>Data recovery services</li>
          </ul>
        </div>
      </div>

      <div className="warranty-text" style={{ marginTop: '80px', maxWidth: '800px', margin: '80px auto 0' }}>
        <h3 className="font-heading" style={{ fontSize: '2rem', marginBottom: '20px', textAlign: 'center' }}>TERMS & CONDITIONS</h3>
        <p className="text-muted" style={{ lineHeight: '1.8', fontSize: '14px', textAlign: 'justify' }}>
          The TSS Global Warranty covers defects in materials and workmanship under normal use for the specified warranty period. The warranty period commences on the date of original purchase. Valid proof of purchase is required for any warranty claim. The warranty does not cover issues resulting from unauthorized modifications, extreme environmental conditions, natural disasters, or intentional damage.
          <br /><br />
          For detailed legal information regarding your coverage, state-specific limitations, and dispute resolution, please download the full TSS Global Warranty PDF from our downloads section.
        </p>
      </div>
    </div>
  );
}
