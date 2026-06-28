import { useEffect } from 'react';
import gsap from 'gsap';
import { DownloadCloud, Laptop, Monitor, Printer, Keyboard } from 'lucide-react';
import ArrowButton from '../components/ArrowButton';

export default function Downloads() {
  useEffect(() => {
    // Set accent color to Cyber Teal
    document.documentElement.style.setProperty('--accent-color', '#00e5ff');
    document.documentElement.style.setProperty('--accent-color-rgb', '0, 229, 255');
    
    gsap.fromTo('.page-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
    );

    gsap.fromTo('.download-category', 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
    );
  }, []);

  const categories = [
    {
      title: 'LAPTOPS & DESKTOPS',
      icon: <Laptop size={32} />,
      items: [
        { name: 'TSS Control Center v3.2', type: 'Software', size: '145 MB' },
        { name: 'BIOS Update (Z790 / B650)', type: 'Firmware', size: '12 MB' },
        { name: 'System User Manual', type: 'PDF', size: '4.2 MB' },
      ]
    },
    {
      title: 'DISPLAYS & MONITORS',
      icon: <Monitor size={32} />,
      items: [
        { name: 'Color Calibration Profile', type: 'ICC', size: '2 MB' },
        { name: 'Monitor Firmware v1.4', type: 'Firmware', size: '8 MB' },
        { name: 'Display Setup Guide', type: 'PDF', size: '3.1 MB' },
      ]
    },
    {
      title: 'PRINTERS & 3D',
      icon: <Printer size={32} />,
      items: [
        { name: 'PrintMax Slicer Studio', type: 'Software', size: '312 MB' },
        { name: 'Universal Print Driver', type: 'Driver', size: '45 MB' },
        { name: 'Maintenance Guide', type: 'PDF', size: '15 MB' },
      ]
    },
    {
      title: 'PERIPHERALS',
      icon: <Keyboard size={32} />,
      items: [
        { name: 'TSS Synapse RGB Configurator', type: 'Software', size: '88 MB' },
        { name: 'Mouse Firmware Updater', type: 'Firmware', size: '5 MB' },
        { name: 'Keyboard Macro Guide', type: 'PDF', size: '1.8 MB' },
      ]
    },
  ];

  return (
    <div className="page-container" style={{ paddingBottom: '100px' }}>
      <div className="page-header">
        <h1 className="font-heading" style={{ fontSize: '4rem', textTransform: 'uppercase' }}>DOWNLOADS</h1>
        <p className="text-muted" style={{ maxWidth: '600px', marginTop: '20px', lineHeight: '1.6' }}>
          Maximize your hardware's potential. Download the latest drivers, software suites, firmware updates, and user manuals.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px', marginTop: '60px' }}>
        {categories.map((cat, idx) => (
          <div key={idx} className="download-category" style={{ 
            background: '#111', 
            borderRadius: '12px', 
            border: '1px solid rgba(255,255,255,0.05)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '24px', 
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ color: 'var(--accent-color)' }}>
                {cat.icon}
              </div>
              <h3 className="font-heading" style={{ fontSize: '1.5rem', margin: 0 }}>{cat.title}</h3>
            </div>
            
            <div style={{ padding: '0' }}>
              {cat.items.map((item, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '20px 24px',
                  borderBottom: i !== cat.items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  transition: 'background-color 0.2s ease',
                  cursor: 'pointer'
                }}
                className="hover:bg-[#1a1a1a]"
                >
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '10px' }}>
                      <span style={{ color: 'var(--accent-color)' }}>{item.type}</span>
                      <span>|</span>
                      <span>{item.size}</span>
                    </span>
                  </div>
                  <DownloadCloud size={20} style={{ color: 'var(--text-main)', opacity: 0.5 }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '60px', textAlign: 'center' }}>
        <p className="text-muted" style={{ marginBottom: '20px' }}>Looking for older legacy drivers?</p>
        <ArrowButton text="ARCHIVE DIRECTORY" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );
}
