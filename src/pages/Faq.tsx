import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useEffect(() => {
    // Set accent color to Magenta
    document.documentElement.style.setProperty('--accent-color', '#ff00ff');
    document.documentElement.style.setProperty('--accent-color-rgb', '255, 0, 255');
    
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.faq-item', 
      { opacity: 0, y: 20 }, 
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );
  }, []);

  const faqs = [
    {
      question: "How long does shipping take?",
      answer: "Standard shipping for pre-configured systems takes 3-5 business days globally. Custom-built desktops and laptops undergo rigorous 48-hour burn-in testing and typically ship within 7-10 business days."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes. TSS Hardware ships to over 50 countries worldwide. International orders may be subject to import taxes, customs duties, and fees levied by the destination country."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day money-back guarantee for all standard configurations. If you aren't completely satisfied with your machine's performance, return it in original condition for a full refund (minus shipping costs)."
    },
    {
      question: "Can I upgrade my laptop components later?",
      answer: "Unlike many modern ultrabooks, TSS laptops prioritize repairability and upgrades. Both RAM (SO-DIMM) and Storage (M.2 NVMe) slots are fully accessible and upgradeable without voiding your Standard Warranty."
    },
    {
      question: "How do I activate my ProCare Warranty?",
      answer: "If purchased alongside a system, ProCare is automatically linked to your device's serial number. If purchased separately, log into your TSS Account and register the activation code sent to your email."
    },
    {
      question: "Do you offer financing options?",
      answer: "Yes, we partner with major tech financing institutions to offer 12, 24, and 36-month zero-interest payment plans for qualifying customers at checkout."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>F.A.Q.</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          Frequently asked questions regarding our systems, shipping, returns, and warranties.
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '60px auto 0' }}>
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="faq-item"
            style={{ 
              marginBottom: '20px', 
              background: '#111', 
              borderRadius: '8px', 
              border: '1px solid rgba(255,255,255,0.05)',
              overflow: 'hidden'
            }}
          >
            <button 
              onClick={() => toggleFaq(index)}
              style={{
                width: '100%',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                textAlign: 'left',
                outline: 'none'
              }}
            >
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, paddingRight: '20px' }}>
                {faq.question}
              </h3>
              <motion.div
                animate={{ rotate: openIndex === index ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ color: openIndex === index ? 'var(--accent-color)' : 'white' }}
              >
                <ChevronDown />
              </motion.div>
            </button>
            
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div style={{ 
                    padding: '0 24px 24px 24px', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.6' 
                  }}>
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
