import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { 
  Terminal, 
  Cpu, 
  Layers, 
  Globe, 
  Server, 
  Database, 
  ShieldCheck, 
  Activity 
} from 'lucide-react';

export default function Portfolio() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set theme accent color for Portfolio
    document.documentElement.style.setProperty('--accent-color', '#a855f7'); // Cyber Purple
    document.documentElement.style.setProperty('--accent-color-rgb', '168, 85, 247');

    const ctx = gsap.context(() => {
      // Fade in header
      gsap.from('.portfolio-header', {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'power3.out'
      });

      // Staggered fade-in for cards and specs
      gsap.from('.stagger-card', {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out',
        delay: 0.2
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const projects = [
    {
      title: "PROJECT AURORA",
      subtitle: "Enterprise AI Supercluster",
      desc: "Designed and deployed a 256-node GPU cluster utilizing custom TSS liquid-cooled racks for deep learning research, achieving a 40% reduction in thermal output.",
      tech: ["TSS Rackmounts", "Custom Liquid Loop", "NVIDIA H100s"],
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "MONOLITH VFX RIGS",
      subtitle: "Studio Workstations",
      desc: "Provisioned a fleet of custom-engineered dual-RTX 4090 workstations for a premier Hollywood VFX studio, enabling real-time 8K render previews.",
      tech: ["TSS Monolith", "Threadripper Pro", "Dual RTX 4090"],
      image: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&q=80&w=800"
    },
    {
      title: "APEX LAN ARENA",
      subtitle: "Esports Center",
      desc: "Engineered the network and hardware infrastructure for a 120-seat competitive gaming arena, featuring sub-1ms latency routing and custom esports rigs.",
      tech: ["TSS Tower X", "240Hz Displays", "Fiber Optic Routing"],
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800"
    }
  ];

  const techStack = [
    { icon: <Cpu className="w-5 h-5 text-purple-400" />, title: "Frontend Core", detail: "React 19, TypeScript, Vite" },
    { icon: <Layers className="w-5 h-5 text-purple-400" />, title: "Motion & UI", detail: "GSAP (GreenSock), Tailwind CSS" },
    { icon: <Server className="w-5 h-5 text-purple-400" />, title: "Backend API", detail: "Node.js, Express, RESTful" },
    { icon: <Database className="w-5 h-5 text-purple-400" />, title: "Database", detail: "MongoDB Atlas, Mongoose" },
    { icon: <ShieldCheck className="w-5 h-5 text-purple-400" />, title: "Security", detail: "JWT, Bcrypt, Cookie Session" },
    { icon: <Globe className="w-5 h-5 text-purple-400" />, title: "Deployments", detail: "Netlify (Web) + Railway (Server)" }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#030303] bg-gradient-to-b from-[#08050c] to-[#020203] text-zinc-100 pt-28 px-4 sm:px-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="portfolio-header text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-[10px] tracking-[0.25em] text-purple-400 font-bold uppercase font-heading">
            <Terminal className="w-3.5 h-3.5" /> SYSTEM DOSSIER & BRAND PORTFOLIO
          </div>
          <h1 className="font-heading text-5xl sm:text-7xl tracking-tight text-white uppercase">TSS ARCHITECTURE</h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-2xl mx-auto text-center">
            A comprehensive look at our custom hardware deployments and the software architecture powering the TSS Terminal.
          </p>
        </div>

        {/* Section 1: Brand Portfolio (Custom Deployments) */}
        <div className="space-y-8">
          <div className="border-b border-zinc-800/60 pb-3 flex justify-between items-end">
            <h2 className="font-heading text-xl tracking-wider text-white uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> CUSTOM DEPLOYMENTS
            </h2>
            <span className="text-[10px] text-zinc-500 font-heading">CASE STUDIES</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, idx) => (
              <div key={idx} className="stagger-card group bg-zinc-950/40 border border-zinc-900 rounded-2xl overflow-hidden backdrop-blur-md hover:border-purple-500/30 transition-all duration-300 flex flex-col justify-between">
                <div className="relative h-48 overflow-hidden bg-zinc-900">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] to-transparent opacity-60" />
                </div>
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-heading font-bold tracking-widest text-purple-400 uppercase">{project.subtitle}</span>
                    <h3 className="font-heading text-lg text-white group-hover:text-purple-400 transition-colors">{project.title}</h3>
                    <p className="text-zinc-400 text-xs leading-relaxed">{project.desc}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {project.tech.map((t, i) => (
                      <span key={i} className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-500 px-2.5 py-1 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Technical Specifications of the Website */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
          
          {/* Tech Stack List */}
          <div className="lg:col-span-2 space-y-6 stagger-card">
            <div className="border-b border-zinc-800/60 pb-3">
              <h2 className="font-heading text-xl tracking-wider text-white uppercase flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-400" /> SITE APPLICATION STACK
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {techStack.map((tech, idx) => (
                <div key={idx} className="flex items-center gap-4 bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl backdrop-blur-md hover:border-purple-500/10 transition-colors">
                  <div className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-lg">
                    {tech.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-heading font-bold text-zinc-400 uppercase tracking-wider">{tech.title}</h4>
                    <p className="text-sm text-white font-mono mt-0.5">{tech.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Telemetry (Site Stats) */}
          <div className="space-y-6 stagger-card">
            <div className="border-b border-zinc-800/60 pb-3">
              <h2 className="font-heading text-xl tracking-wider text-white uppercase flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" /> SYSTEM TELEMETRY
              </h2>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-900 p-6 rounded-2xl space-y-4 backdrop-blur-md relative">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
              
              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                <span className="text-xs text-zinc-500 font-heading uppercase">Fulfillment Modules</span>
                <span className="text-xs font-mono font-bold text-white">14 Active Pages</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                <span className="text-xs text-zinc-500 font-heading uppercase">Database Sync</span>
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> MongoDB Connected
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-zinc-900">
                <span className="text-xs text-zinc-500 font-heading uppercase">Admin Access</span>
                <span className="text-xs font-mono font-bold text-purple-400">Level 5 Clearance</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-zinc-500 font-heading uppercase">SSL Security</span>
                <span className="text-xs font-mono font-bold text-[#00ccff]">TLS 1.3 / AES-256</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
