import heroCity from "@/assets/hero-city.jpg";
import floodScene from "@/assets/flood-scene.jpg";
import dashboardImg from "@/assets/dashboard-interface.jpg";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

/* Scroll reveal helper */
const useReveal = () => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.filter = "blur(4px)";
    el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1)";
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; el.style.filter = "blur(0)"; obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
};

const Section = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => {
  const ref = useReveal();
  return <section ref={ref} id={id} className={className}>{children}</section>;
};

const Index = () => (
  <main>
    {/* HERO */}
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface z-10" />
        <img src={heroCity} alt="Aerial view of city traffic at night" className="w-full h-full object-cover grayscale" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8 animate-fade-up">
          <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
            AI-NAVIGATE:<br /><span className="text-gradient">PREDICTING THE UNPREDICTABLE.</span>
          </h1>
          <p className="font-body text-xl text-on-surface-variant max-w-xl">
            Traditional navigation tells you where a road is; we tell you if it's actually usable. Real-time predictive intelligence for Ho Chi Minh City.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/demo" className="bg-primary-container text-primary-container-foreground px-8 py-4 rounded font-headline font-bold uppercase tracking-widest hover:brightness-110 transition-all active:scale-95">
              Try Live Demo
            </Link>
            <button onClick={() => document.getElementById("solution")?.scrollIntoView({ behavior: "smooth" })} className="border border-outline-variant/30 text-on-surface px-8 py-4 rounded font-headline font-bold uppercase tracking-widest hover:bg-on-surface/5 transition-all active:scale-95">
              Learn More
            </button>
          </div>
        </div>
        <div className="relative group" style={{ animationDelay: "200ms" }}>
          <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative glass border border-on-surface/10 rounded-md overflow-hidden shadow-2xl aspect-[4/5] flex flex-col">
            <div className="flex-1 relative">
              <img src={floodScene} alt="Flooded street in Ho Chi Minh City" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute top-4 left-4 bg-error-container/80 text-error px-3 py-1 text-xs font-bold uppercase tracking-widest rounded">
                Actual Condition: Flooded
              </div>
            </div>
            <div className="h-1 bg-primary/50" />
            <div className="flex-1 relative bg-surface-container">
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="w-full border-l-4 border-primary bg-primary/10 rounded-r-lg p-4 mb-4">
                  <div className="text-primary font-headline font-bold text-lg mb-2 flex items-center gap-2">
                    ↗ Clear Route Found
                  </div>
                  <div className="h-2 bg-primary/20 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4" />
                  </div>
                  <div className="mt-4 text-xs font-label text-on-surface-variant">
                    AI-Navigate detected rising water levels 15 mins ago. Re-routing through Upper District.
                  </div>
                </div>
              </div>
              <div className="absolute top-4 right-4 bg-tertiary/20 text-tertiary px-3 py-1 text-xs font-bold uppercase tracking-widest rounded">
                AI-NAV Prediction: Optimal
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* PROBLEM */}
    <Section id="problem" className="py-32 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-20">
          <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter mb-6 uppercase">
            The Three Invisible Walls:<br /><span className="text-primary">Why Current Systems Fail.</span>
          </h2>
          <p className="font-body text-lg text-on-surface-variant max-w-2xl">
            Urban mobility is broken by factors that standard GPS cannot see. Ho Chi Minh City loses billions annually to these phantom obstacles.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "⚠", color: "error", title: "Phantom Jams", desc: "Congestion that appears without cause, triggered by minute human braking patterns and amplified by outdated algorithms." },
            { icon: "🌊", color: "primary", title: "Environmental Randomness", desc: "Flash floods, fallen trees, and local event closures that happen in minutes—faster than typical data feeds can update." },
            { icon: "🔀", color: "tertiary", title: "Braess's Paradox", desc: "The counter-intuitive reality where adding a road actually increases traffic time by creating inefficient selfish routing." },
          ].map((item) => (
            <div key={item.title} className={`p-8 bg-surface-container-low border-b-4 border-${item.color} rounded-md hover:translate-y-[-8px] transition-transform duration-300`}>
              <div className={`w-16 h-16 bg-${item.color}/10 text-${item.color} rounded-full flex items-center justify-center mb-8 text-3xl`}>
                {item.icon}
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4 uppercase tracking-tight">{item.title}</h3>
              <p className="text-on-surface-variant font-body leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* SOLUTION */}
    <Section id="solution" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-24">
          <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tighter mb-6 uppercase">
            Turning Chaos into a<br /><span className="text-gradient">Single, Safe Route.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {[
            { icon: "👁", label: "The Environment Observer", desc: "Ingests CCTV, News, and Weather data to build a real-time semantic understanding of every street corner.", accent: "primary" },
            { icon: "🧭", label: "The Smart Navigator", desc: "Hyper-precise pathfinding that accounts for predicted water levels and traffic density hours before it peaks.", accent: "tertiary" },
            { icon: "👥", label: "The Multi-Agent Simulator", desc: "Simulates thousands of possible traffic flows simultaneously to find the most efficient macro-solution for the whole city.", accent: "secondary" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center space-y-6">
              <div className={`w-32 h-32 rounded-full border border-${s.accent}/30 flex items-center justify-center relative`}>
                <div className={`absolute inset-0 bg-${s.accent}/5 animate-pulse-glow rounded-full`} />
                <span className="text-5xl">{s.icon}</span>
              </div>
              <h4 className="font-headline text-xl font-bold tracking-tight">{s.label}</h4>
              <p className="text-on-surface-variant text-sm px-4">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* TECH */}
    <Section id="tech" className="py-32 bg-surface-container">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-tertiary font-label text-sm font-bold uppercase tracking-widest block mb-4">Core Technology</span>
            <h2 className="font-headline text-5xl font-black tracking-tighter mb-8 uppercase">The Eyes and Ears<br />of the City.</h2>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 rounded bg-surface/40">
                <span className="text-primary text-2xl">📊</span>
                <div>
                  <h5 className="font-bold text-on-surface mb-1">Unstructured Data Fusion</h5>
                  <p className="text-sm text-on-surface-variant">Converting live radio news, social alerts, and CCTV footage into actionable vector data.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded bg-surface/40">
                <span className="text-primary text-2xl">🔗</span>
                <div>
                  <h5 className="font-bold text-on-surface mb-1">Dynamic Graph Maps</h5>
                  <p className="text-sm text-on-surface-variant">The city is mapped as a node-edge network where every connection's "weight" changes in real-time based on conditions.</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded bg-surface/40">
                <span className="text-primary text-2xl">🤖</span>
                <div>
                  <h5 className="font-bold text-on-surface mb-1">AI Agent Routing</h5>
                  <p className="text-sm text-on-surface-variant">LLM-powered agents analyze images and audio to update road conditions and find optimal paths in real-time.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative glass rounded-md p-8 border border-on-surface/5 glow-blue overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="w-full h-full bg-[radial-gradient(circle_at_center,_hsl(var(--primary))_0%,_transparent_70%)]" />
            </div>
            <div className="relative flex flex-col gap-6">
              <div className="flex justify-between items-center px-4 py-2 bg-surface-container-high rounded border border-on-surface/5">
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Incoming Stream: District 1</span>
                <span className="text-tertiary flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse" /> LIVE
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-video bg-surface rounded flex items-center justify-center text-xs text-on-surface-variant/50 border border-on-surface/5">NEWS FEED [TEXT]</div>
                <div className="aspect-video bg-surface rounded flex items-center justify-center text-xs text-on-surface-variant/50 border border-on-surface/5">WEATHER RADAR</div>
              </div>
              <div className="h-40 bg-surface/80 rounded flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 p-4">
                  <div className="w-full h-full border border-primary/20 rounded relative">
                    <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-error rounded-full shadow-[0_0_10px_hsl(var(--error))]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1/2 h-1/2 border-2 border-dashed border-primary/10 rounded-full animate-[spin_10s_linear_infinite]" />
                    </div>
                  </div>
                </div>
                <div className="z-10 text-center">
                  <div className="text-primary font-headline font-bold text-2xl uppercase tracking-tighter">Processing...</div>
                  <div className="text-[10px] uppercase font-label text-on-surface-variant/50">LLM-Vision Analysis in Progress</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>

    {/* DASHBOARD */}
    <Section className="py-32 bg-surface-container-lowest overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="font-headline text-5xl font-black tracking-tighter uppercase leading-tight">
              From Prediction to Strategy:<br /><span className="text-gradient">The "Toàn Cảnh" Dashboard.</span>
            </h2>
            <p className="font-body text-lg text-on-surface-variant">
              A bird's eye view for city planners. Transform raw traffic data into high-level urban strategy reports automatically.
            </p>
            <ul className="space-y-4 font-label">
              {["Real-time hazard heatmap", "Predictive congestion modeling", "Automated infrastructure ROI analysis"].map((t) => (
                <li key={t} className="flex items-center gap-3 text-tertiary">✓ {t}</li>
              ))}
            </ul>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-3xl rounded-full -z-0" />
            <img src={dashboardImg} alt="AI-Navigate Dashboard Interface" className="rounded-md border border-on-surface/10 glow-blue max-w-full relative z-10" />
          </div>
        </div>
      </div>
    </Section>

    {/* MARKET */}
    <Section id="market" className="py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-24">
          <h2 className="font-headline text-5xl font-black tracking-tighter uppercase mb-4">
            A $15 Billion Opportunity:<br /><span className="text-primary">Starting Local, Scaling Regional.</span>
          </h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="relative w-80 h-80 flex items-center justify-center">
            <div className="absolute inset-0 border border-primary/20 rounded-full animate-[pulse_4s_infinite]" />
            <div className="absolute inset-8 border border-primary/40 rounded-full" />
            <div className="absolute inset-16 border border-primary/60 rounded-full" />
            <div className="absolute inset-24 bg-primary/10 border border-primary rounded-full flex items-center justify-center flex-col">
              <div className="text-2xl font-black font-headline">SOM</div>
              <div className="text-sm font-bold">$200M</div>
            </div>
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-center">
              <div className="text-on-surface-variant/50 font-headline text-sm uppercase tracking-widest">TAM (SEA Market)</div>
              <div className="text-2xl font-black">$15B+</div>
            </div>
          </div>
          <div className="max-w-md space-y-6">
            <p className="text-on-surface-variant font-body">
              Focusing initially on Ho Chi Minh City and Hanoi, before scaling to the wider Southeast Asian corridor where infrastructure development struggles to keep pace with population growth.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-on-surface/5 bg-surface-container rounded">
                <div className="text-tertiary font-headline font-bold text-xl">12%</div>
                <div className="text-[10px] uppercase text-on-surface-variant/50">Avg. Annual Traffic Growth</div>
              </div>
              <div className="p-4 border border-on-surface/5 bg-surface-container rounded">
                <div className="text-tertiary font-headline font-bold text-xl">250M</div>
                <div className="text-[10px] uppercase text-on-surface-variant/50">Commuters in SEA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>

    {/* PRICING */}
    <Section className="py-32">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-headline text-4xl font-black tracking-tighter uppercase mb-16 text-center">Scaling Strategy.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "👤", title: "B2C Subscription", desc: "Premium predictive routing for daily commuters. Monthly/Annual plans.", price: "$4.99/mo", accent: "primary" },
            { icon: "🏢", title: "B2B SaaS", desc: "Fleet optimization for logistics companies and ride-hailing services.", price: "Enterprise Tier", accent: "tertiary" },
            { icon: "🏛", title: "B2G Licensing", desc: "Data-as-a-Service for city governments to assist in urban planning.", price: "Custom Tenders", accent: "secondary" },
          ].map((p) => (
            <div key={p.title} className="p-8 bg-surface-container-high rounded-md border border-on-surface/5 flex flex-col items-center text-center">
              <span className="text-5xl mb-6">{p.icon}</span>
              <h4 className="font-headline font-bold text-2xl uppercase mb-4">{p.title}</h4>
              <p className="text-sm text-on-surface-variant mb-6">{p.desc}</p>
              <div className={`mt-auto text-${p.accent} font-bold font-headline`}>{p.price}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* ROADMAP */}
    <Section id="roadmap" className="py-32">
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="font-headline text-4xl font-black tracking-tighter uppercase mb-20 text-center">Technical Roadmap.</h2>
        <div className="relative py-12">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-on-surface/5 -translate-y-1/2 hidden md:block" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { n: "1", title: "Phase: Precision", color: "primary", items: ["High-res Node-Edge mapping", "Core Environment Observer MVP", "Launch in HCMC Center"] },
              { n: "2", title: "Phase: Intelligence", color: "tertiary", items: ["Multi-Agent Simulation beta", "Dashboard for B2B rollout", "Regional Expansion: Hanoi"] },
              { n: "3", title: "Phase: Ecosystem", color: "secondary", items: ["API for Autonomous Vehicles", "SEA Market Launch (Bangkok, Jakarta)", "City Brain Integration"] },
            ].map((p) => (
              <div key={p.n} className="relative bg-surface border border-on-surface/5 p-8 rounded-md pt-16">
                <div className={`absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-${p.color} rounded-full flex items-center justify-center font-bold text-surface border-4 border-surface`}>
                  {p.n}
                </div>
                <h5 className={`font-headline font-bold uppercase mb-4 text-${p.color}`}>{p.title}</h5>
                <ul className="text-xs space-y-2 text-on-surface-variant/60 font-label">
                  {p.items.map((i) => <li key={i}>• {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>

    {/* CTA */}
    <section className="py-32 bg-primary-container text-primary-container-foreground text-center">
      <div className="max-w-4xl mx-auto px-8">
        <h2 className="font-headline text-5xl md:text-7xl font-black tracking-tighter uppercase mb-8">Join the Future of Urban Mobility.</h2>
        <Link to="/demo" className="inline-block bg-surface text-on-surface px-12 py-6 rounded font-headline font-bold uppercase tracking-widest text-xl hover:scale-105 active:scale-95 transition-transform shadow-2xl">
          Try Live Demo
        </Link>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="bg-surface w-full py-12 px-8 border-t border-on-surface/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-8">
        <div className="space-y-4">
          <div className="text-lg font-bold text-on-surface font-headline uppercase tracking-tight">AI-Navigate</div>
          <p className="text-sm text-on-surface-variant max-w-xs">Pioneering the next generation of urban predictive navigation systems for Ho Chi Minh City.</p>
        </div>
        <div className="space-y-4">
          <div className="text-on-surface-variant/50 font-bold uppercase text-xs tracking-widest mb-2">Legal</div>
          <div className="text-sm text-on-surface-variant">© 2025 AI-Navigate. The Urban Synapse.</div>
        </div>
      </div>
    </footer>
  </main>
);

export default Index;
