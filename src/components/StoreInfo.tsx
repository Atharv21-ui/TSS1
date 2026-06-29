import { Star, MapPin } from 'lucide-react';
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
  },
  {
    name: 'priyanka diodia',
    time: '6 years ago',
    rating: 5,
    text: 'Fast response and quality full best work, thank you Technical server s....✌️',
  },
  {
    name: 'NITIN KUMAR',
    time: '5 years ago',
    rating: 5,
    text: 'Very Good Service Centre and computer shop cheap and best computers.',
  },
  {
    name: 'Royal Sahab',
    time: '4 years ago',
    rating: 5,
    text: 'Best technical support And very knowledgeable staff.',
  },
  {
    name: 'Tauseef Khan',
    time: '5 years ago',
    rating: 1,
    text: 'Worst Store ever visited..!! I would prefer to buy from footpath or from roadside rather visiting there..',
  }
];

export default function StoreInfo() {
  return (
    <section className="section store-info-section">
      <h2 className="section-title font-heading">Store & Reviews</h2>
      
      <div className="store-grid">
        <div className="store-details bento-item">
          <MapPin size={40} className="bento-icon" style={{ top: '30px', left: '30px' }} />
          <h3 className="font-heading" style={{ fontSize: '28px', marginTop: '40px', marginBottom: '10px' }}>
            THE TSS COMPUTER STORE
          </h3>
          <p className="store-address" style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
            B 6 Block, Shivpuri - Jhansi Rd, Sangam Vihar, Jhansi, Uttar Pradesh 284003
          </p>
          
          <div className="store-rating-overview" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <span className="rating-score font-heading" style={{ fontSize: '48px', color: 'var(--accent-color)', lineHeight: '1' }}>3.9</span>
            <div>
              <div className="stars" style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                {[...Array(3)].map((_, i) => <Star key={i} size={18} fill="var(--accent-color)" color="var(--accent-color)" />)}
                <Star size={18} fill="url(#half-grad)" color="var(--accent-color)" />
                <Star size={18} color="var(--accent-color)" />
                <svg width="0" height="0">
                  <linearGradient id="half-grad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="90%" stopColor="var(--accent-color)" />
                    <stop offset="90%" stopColor="transparent" />
                  </linearGradient>
                </svg>
              </div>
              <span className="review-count" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>38 Google reviews</span>
            </div>
          </div>

          <div className="map-container" style={{ width: '100%', height: '250px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.827552554203!2d78.52755657597143!3d25.456167777543884!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39777104ef62de9f%3A0x6d89310c6787a476!2sTHE%20TSS%20COMPUTER%20STORE!5e0!3m2!1sen!2sin!4v1701234567890!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(80%) contrast(120%)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            ></iframe>
          </div>

          <div className="store-actions" style={{ marginTop: '30px' }}>
             <a href="https://maps.google.com/?cid=7893175865239905398" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
               <AnimatedButton text="GET DIRECTIONS" style={{ width: '100%' }} />
             </a>
          </div>
        </div>

        <div className="reviews-container">
           {reviews.slice(0, 4).map((review, i) => (
             <div key={i} className="bento-item review-item" style={{ padding: '30px', justifyContent: 'flex-start' }}>
                <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="reviewer-info">
                    <h4 className="font-heading" style={{ fontSize: '16px', marginBottom: '8px' }}>{review.name}</h4>
                    <div className="review-stars" style={{ display: 'flex', gap: '4px' }}>
                       {[...Array(review.rating)].map((_, j) => <Star key={j} size={14} fill="var(--accent-color)" color="var(--accent-color)" />)}
                       {[...Array(5 - review.rating)].map((_, j) => <Star key={j} size={14} color="var(--accent-color)" />)}
                    </div>
                  </div>
                  <span className="review-time" style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>{review.time}</span>
                </div>
                <p className="review-text" style={{ marginTop: '20px', fontSize: '15px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                  "{review.text}"
                </p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
