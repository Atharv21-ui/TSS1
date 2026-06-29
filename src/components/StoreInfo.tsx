import { useEffect, useRef } from 'react';
import { Star, MapPin } from 'lucide-react';
import gsap from 'gsap';
import AnimatedButton from './AnimatedButton';

const reviews = [
  {
    name: 'Neha Prajapati',
    time: '8 months ago',
    rating: 5,
    text: 'The owner is very polite and calm. Always trying to help in best ways possible.',
  },
  {
    name: 'Usay Dio',
    time: '2 months ago',
    rating: 5,
    text: 'Best service ever Charge Jaroor lete hai but properly solution dete hai thank you 🙏🏻 …',
  }
];

export default function StoreInfo() {
  const containerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subtle reveal animation for the whole section
    const ctx = gsap.context(() => {
      gsap.from('.store-card-premium', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.store-info-section',
          start: 'top 80%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="section store-info-section" style={{ padding: '80px 20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div className="section-header" style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h2 className="section-title font-heading" style={{ display: 'inline-flex', justifyContent: 'center' }}>Headquarters</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '10px', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>Visit Our Flagship Store</p>
      </div>
      
      {/* Premium Store Card */}
      <div className="store-card-premium">
        <div className="store-card-content">
          <div className="store-info-col">
            <div className="store-badge">
              <MapPin size={16} /> AUTHORIZED DEALER
            </div>
            
            <h3 className="store-name font-heading">
              THE TSS COMPUTER STORE
            </h3>
            
            <p className="store-address">
              B 6 Block, Shivpuri - Jhansi Rd,<br/>
              Sangam Vihar, Jhansi, UP 284003
            </p>
            
            <div className="store-rating-box">
              <div className="rating-score-large font-heading">3.9</div>
              <div className="rating-details">
                <div className="stars-row">
                  {[...Array(3)].map((_, i) => <Star key={i} size={20} fill="var(--accent-color)" color="var(--accent-color)" />)}
                  <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                    <Star size={20} color="var(--accent-color)" style={{ position: 'absolute' }} />
                    <div style={{ position: 'absolute', overflow: 'hidden', width: '90%', height: '100%' }}>
                       <Star size={20} fill="var(--accent-color)" color="transparent" />
                    </div>
                  </div>
                  <Star size={20} color="var(--accent-color)" />
                </div>
                <div className="review-count">38 Verified Google Reviews</div>
              </div>
            </div>

            <div className="store-actions">
               <a href="https://maps.google.com/?cid=7893175865239905398" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                 <AnimatedButton text="GET DIRECTIONS" className="outline-variant" />
               </a>
            </div>
          </div>
          
          <div className="store-map-col">
            <div className="map-glass-frame">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.827552554203!2d78.52755657597143!3d25.456167777543884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39777104ef62de9f%3A0x6d89310c6787a476!2sTHE%20TSS%20COMPUTER%20STORE!5e0!3m2!1sen!2sin!4v1701234567890!5m2!1sen!2sin" 
                width="100%" 
                height="100%" 
                style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Marquee */}
      <div className="reviews-marquee-wrapper" style={{ marginTop: '80px' }}>
        <h4 className="font-heading" style={{ fontSize: '14px', letterSpacing: '4px', textAlign: 'center', marginBottom: '30px', color: 'var(--text-muted)' }}>WHAT OUR CLIENTS SAY</h4>
        
        <div className="reviews-marquee-container">
          <div className="reviews-track" ref={trackRef}>
            {/* Multiply the array for seamless looping */}
            {[...reviews, ...reviews, ...reviews, ...reviews, ...reviews, ...reviews].map((review, i) => (
              <div key={i} className="review-card-premium">
                <div className="review-card-header">
                  <div className="review-avatar font-heading">
                    {review.name.charAt(0)}
                  </div>
                  <div className="review-meta">
                    <h5>{review.name}</h5>
                    <span>{review.time}</span>
                  </div>
                  <div className="review-stars-small">
                     {[...Array(review.rating)].map((_, j) => <Star key={j} size={12} fill="var(--accent-color)" color="var(--accent-color)" />)}
                     {[...Array(5 - review.rating)].map((_, j) => <Star key={j} size={12} color="var(--text-muted)" />)}
                  </div>
                </div>
                <div className="review-body">
                  <p>"{review.text}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
