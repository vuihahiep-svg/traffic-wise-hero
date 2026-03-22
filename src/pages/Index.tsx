import heroCity from "@/assets/hero-city.jpg";
import qrCode from "@/assets/qr-code.png";
import trafficSimRoute from "@/assets/traffic-simulation-route.jpg";
import agentsNetwork from "@/assets/ai-agents-network.png";
import cityEyesEars from "@/assets/city-eyes-ears.jpg";
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
            Traditional navigation tells you where a road is; we tell you if it's actually usable. Real-time predictive intelligence for urban mobility.
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
            Urban mobility is broken by factors that standard GPS cannot see. Cities lose billions annually to these phantom obstacles.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "⚠", color: "error", title: "The Human Factor", desc: "Phantom jams—unpredictable congestion at intersections, traffic accidents, red-light queuing, and chain-reaction braking that no standard algorithm anticipates." },
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
    <Section id="solution" className="py-32 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-8">
            <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95]">
              Turning Chaos into a<br /><span className="text-gradient">Single, Safe Route.</span>
            </h2>
            <p className="text-on-surface-variant font-body text-lg max-w-lg">
              While every road turns red, our AI finds the one clear path — simulating thousands of traffic flows in real-time to navigate through congestion, floods, and accidents.
            </p>
            <div className="flex gap-3 flex-wrap">
              <span className="px-4 py-1.5 bg-error/10 text-error text-xs font-bold uppercase tracking-widest rounded">Congested</span>
              <span className="px-4 py-1.5 bg-[hsl(45,90%,50%)]/10 text-[hsl(45,90%,40%)] text-xs font-bold uppercase tracking-widest rounded">Moderate</span>
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded">AI Optimal Route</span>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-6 bg-primary/15 blur-3xl rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-700" />
            <img src={trafficSimRoute} alt="Traffic simulation showing optimal route through congested city network" className="relative rounded-md border border-on-surface/10 glow-blue w-full" />
            <div className="absolute bottom-4 left-4 right-4 bg-surface/80 backdrop-blur-md rounded px-4 py-3 border border-on-surface/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-primary font-headline font-bold uppercase tracking-widest">↗ Clear Route Found</span>
                <span className="text-on-surface-variant font-label">ETA saved: <span className="text-tertiary font-bold">23 min</span></span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: "👁", label: "The Environment Observer", desc: "Ingests CCTV, News, and Weather data to build a real-time semantic understanding of every street corner.", accent: "primary" },
            { icon: "🧭", label: "The Smart Navigator", desc: "A Multi-Agent System where specialized agents debate to find the \"True Best Path\" — resolving conflicting data from different sources to avoid hazards like floods or accidents.", accent: "tertiary" },
            { icon: "👥", label: "The Multi-Agent Simulator", desc: "Simulates thousands of possible traffic flows simultaneously to find the most efficient macro-solution for the whole city.", accent: "secondary" },
          ].map((s) => (
            <div key={s.label} className="p-6 bg-surface-container-low rounded-md border border-on-surface/5 flex gap-5 items-start hover:translate-y-[-4px] transition-transform duration-300">
              <div className={`shrink-0 w-14 h-14 rounded-full bg-${s.accent}/10 flex items-center justify-center text-2xl`}>
                {s.icon}
              </div>
              <div>
                <h4 className="font-headline text-lg font-bold tracking-tight mb-2">{s.label}</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* AI AGENTS */}
    <Section className="py-32 bg-surface-container">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <span className="text-tertiary font-label text-sm font-bold uppercase tracking-widest block mb-4">Multi-Agent Architecture</span>
          <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6">
            System Architecture,<br /><span className="text-gradient">One Unified Intelligence.</span>
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body">
            Each agent is a domain expert. Together, they form a collaborative intelligence network that sees what no single system can.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-6">
            {[
              {
                icon: "🗄️", num: "01", title: "Insight Agent", subtitle: "Private Database Mining",
                desc: "Performs Text-to-SQL (via LlamaIndex & SQLAlchemy) on internal historical traffic records to understand how the city reacts to specific weather patterns, enabling predictive environmental modeling.",
                accent: "primary",
              },
              {
                icon: "📡", num: "02", title: "Media Agent", subtitle: "Multimodal Content Analysis",
                desc: "\"Listens\" to live FM traffic radio using OpenAI Whisper and analyzes city CCTV feeds using GPT-4o-vision to detect rising flood levels and traffic incidents in real-time.",
                accent: "tertiary",
              },
              {
                icon: "🔍", num: "03", title: "Query Agent", subtitle: "Precise Information Search",
                desc: "Performs deep, targeted crawls on social media (Zalo/X) and local news using Firecrawl & Tavily API to find \"Ghost Variables\" — sudden accidents or localized flash floods that standard maps miss.",
                accent: "secondary",
              },
              {
                icon: "📋", num: "04", title: "Report Agent", subtitle: "Intelligent Report Generation",
                desc: "Collects consolidated consensus from the ForumEngine and uses a template engine (Jinja2) to render complex simulations into professional, actionable PDF/HTML \"Panoramic\" strategies for drivers and city planners.",
                accent: "primary",
              },
            ].map((agent) => (
              <div key={agent.num} className="group relative p-6 bg-surface-container-low rounded-md border border-on-surface/5 hover:border-primary/30 transition-all duration-300 hover:translate-x-2">
                <div className="flex gap-5">
                  <div className="shrink-0 w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <span className="text-primary font-headline font-black text-xs tracking-widest">{agent.num}</span>
                      <h4 className="font-headline font-bold text-lg tracking-tight text-on-surface">{agent.title}</h4>
                    </div>
                    <p className="text-tertiary/70 text-xs font-label uppercase tracking-widest mb-3">{agent.subtitle}</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{agent.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative sticky top-32">
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-3xl rounded-full -z-0" />
            <img src={agentsNetwork} alt="Multi-Agent City Brain System Architecture" className="rounded-md border border-on-surface/10 glow-blue max-w-full relative z-10" />
          </div>
        </div>
      </div>
    </Section>

    {/* TECH */}
    <Section id="tech" className="py-32 bg-surface-container relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-tertiary font-label text-sm font-bold uppercase tracking-widest block mb-4">Core Technology</span>
          <h2 className="font-headline text-5xl md:text-6xl font-black tracking-tighter mb-6 uppercase">The Eyes and Ears<br />of the City.</h2>
          <p className="text-on-surface-variant font-body text-lg max-w-2xl mx-auto">Three layers of perception working in concert — converting the city's chaos into structured, actionable intelligence.</p>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-on-surface/10 mb-16 bg-surface-container-high p-6 md:p-10">
          {/* Animated data flow visualization */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* CCTV Panel */}
            <div className="rounded-lg border border-on-surface/10 bg-surface/80 p-4 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-error rounded-full animate-pulse" />
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">CCTV Feed</span>
              </div>
              <div className="aspect-video bg-surface-container rounded flex items-center justify-center relative">
                <div className="absolute inset-2 border border-primary/30 rounded" />
                <div className="absolute top-3 left-3 w-6 h-4 border-2 border-primary/60 rounded-sm" />
                <div className="absolute bottom-4 right-4 w-8 h-5 border-2 border-tertiary/60 rounded-sm" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-error/60 rounded-sm" />
                <span className="text-primary/40 text-xs font-label">GPT-4o Vision</span>
              </div>
              <div className="mt-2 flex gap-1">
                {[...Array(8)].map((_, i) => <div key={i} className="flex-1 h-1 rounded-full bg-primary/20" style={{ opacity: 0.3 + Math.random() * 0.7 }} />)}
              </div>
            </div>

            {/* Central Brain */}
            <div className="rounded-lg border border-primary/20 bg-surface/80 p-4 relative overflow-hidden flex flex-col items-center justify-center shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]">
              <div className="relative w-24 h-24 md:w-32 md:h-32">
                <div className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full animate-[spin_20s_linear_infinite]" />
                <div className="absolute inset-3 border border-tertiary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
                    <span className="text-primary text-lg md:text-2xl">🧠</span>
                  </div>
                </div>
                {/* Connection dots */}
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <div key={deg} className="absolute w-2 h-2 bg-primary/60 rounded-full" style={{ top: `${50 - 45 * Math.cos(deg * Math.PI / 180)}%`, left: `${50 + 45 * Math.sin(deg * Math.PI / 180)}%`, transform: 'translate(-50%,-50%)' }} />
                ))}
              </div>
              <span className="text-xs font-label font-bold uppercase tracking-widest text-primary/80 mt-3">Data Fusion Engine</span>
              <span className="text-[10px] text-on-surface-variant/40 font-label mt-1">Multi-Agent Consensus</span>
            </div>

            {/* Audio Panel */}
            <div className="rounded-lg border border-on-surface/10 bg-surface/80 p-4 relative overflow-hidden">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 bg-tertiary rounded-full animate-pulse" />
                <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">FM Radio</span>
              </div>
              <div className="aspect-video bg-surface-container rounded flex items-center justify-center relative overflow-hidden">
                {/* Audio waveform bars */}
                <div className="flex items-center gap-[2px] h-full py-3">
                  {[...Array(24)].map((_, i) => (
                    <div key={i} className="w-1 bg-tertiary/50 rounded-full" style={{ height: `${20 + Math.sin(i * 0.8) * 30 + Math.random() * 25}%`, animationDelay: `${i * 80}ms` }} />
                  ))}
                </div>
                <span className="absolute bottom-2 text-[9px] text-tertiary/50 font-label">Whisper STT</span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="h-1 rounded-full bg-tertiary/15 w-full" />
                <div className="h-1 rounded-full bg-tertiary/10 w-3/4" />
              </div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface/60 rounded-lg border border-on-surface/5">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-tertiary rounded-full animate-pulse shadow-[0_0_8px_hsl(var(--tertiary))]" />
              <span className="text-xs font-label font-bold uppercase tracking-widest text-on-surface/80">Multi-Source Fusion Active</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-label text-on-surface-variant/50 uppercase tracking-wider">CCTV · Radio · News · Social · Weather · Sensors</span>
              <span className="text-[10px] font-label text-tertiary uppercase tracking-wider font-bold">● LIVE</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "📊",
              title: "Unstructured Data Fusion",
              desc: "Converting live radio news, social alerts, and CCTV footage into actionable vector data.",
              stat: "6+",
              statLabel: "Data Sources",
              accent: "primary"
            },
            {
              icon: "🔗",
              title: "Dynamic Graph Maps",
              desc: "The city mapped as a node-edge network where every connection's weight changes in real-time.",
              stat: "~200",
              statLabel: "Live Edges",
              accent: "tertiary"
            },
            {
              icon: "🤖",
              title: "AI Agent Routing",
              desc: "LLM-powered agents analyze images and audio to update road conditions and find optimal paths.",
              stat: "<2s",
              statLabel: "Response Time",
              accent: "secondary"
            }
          ].map((item, i) => (
            <div key={i} className="group/card relative p-6 rounded-lg bg-surface/60 border border-on-surface/5 hover:border-on-surface/15 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">{item.icon}</span>
                <div className="text-right">
                  <div className={`text-2xl font-headline font-black text-${item.accent}`}>{item.stat}</div>
                  <div className="text-[10px] font-label uppercase tracking-wider text-on-surface-variant/50">{item.statLabel}</div>
                </div>
              </div>
              <h5 className="font-bold text-on-surface mb-2 text-lg">{item.title}</h5>
              <p className="text-sm text-on-surface-variant leading-relaxed">{item.desc}</p>
              <div className={`absolute bottom-0 left-6 right-6 h-[2px] bg-${item.accent}/0 group-hover/card:bg-${item.accent}/60 transition-all duration-500`} />
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* DASHBOARD */}
    <Section className="py-32 bg-surface-container-lowest overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <h2 className="font-headline text-5xl font-black tracking-tighter uppercase leading-tight">
              From Prediction to Strategy:<br /><span className="text-gradient">The Panoramic Dashboard.</span>
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

    {/* CITY INTELLIGENCE REPORT */}
    <Section className="py-32 bg-surface-container">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <span className="text-tertiary font-label text-sm font-bold uppercase tracking-widest block mb-4">Live Data Layer</span>
          <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase mb-6">
            City Intelligence<br /><span className="text-gradient">Report.</span>
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body">
            Every road, intersection, and environmental zone is continuously scored. Here's what the system sees right now.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Road Conditions Table */}
          <div className="bg-surface rounded-md border border-on-surface/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-on-surface/5 flex items-center justify-between">
              <h4 className="font-headline font-bold uppercase tracking-tight text-sm">Road Segments (Edges)</h4>
              <span className="text-[10px] font-label uppercase tracking-widest text-tertiary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse" /> Real-time
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-on-surface/5 text-left">
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label">Road</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label">District</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label text-right">Score</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { road: "Nguyễn Huệ Blvd", dist: "D1", score: 12, status: "Clear" },
                    { road: "Lê Lợi Avenue", dist: "D1", score: 28, status: "Moderate" },
                    { road: "Nguyễn Trãi Corridor", dist: "D5", score: 74, status: "Congested" },
                    { road: "Xa Lộ Hà Nội", dist: "Thủ Đức", score: 91, status: "Severe" },
                    { road: "Điện Biên Phủ", dist: "BT", score: 45, status: "Moderate" },
                    { road: "CMT8 Boulevard", dist: "D10", score: 63, status: "Congested" },
                  ].map((r) => (
                    <tr key={r.road} className="border-b border-on-surface/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-3 font-bold text-on-surface">{r.road}</td>
                      <td className="px-4 py-3 text-on-surface-variant/70">{r.dist}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-headline font-bold tabular-nums ${r.score < 30 ? "text-tertiary" : r.score < 60 ? "text-[hsl(45,90%,50%)]" : "text-error"}`}>
                          {r.score}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                          r.score < 30 ? "bg-tertiary/10 text-tertiary" : r.score < 60 ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,90%,40%)]" : "bg-error/10 text-error"
                        }`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Intersection Nodes Table */}
          <div className="bg-surface rounded-md border border-on-surface/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-on-surface/5 flex items-center justify-between">
              <h4 className="font-headline font-bold uppercase tracking-tight text-sm">Intersections (Nodes)</h4>
              <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50">18 Active Nodes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-on-surface/5 text-left">
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label">Intersection</th>
                    <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label text-right">Flood Risk</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label">Condition</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { node: "Bến Thành Market", risk: 8, cond: "Normal" },
                    { node: "Ngã Tư Hàng Xanh", risk: 72, cond: "Flood Warning" },
                    { node: "Ngã 6 Phù Đổng", risk: 15, cond: "Normal" },
                    { node: "Vòng Xoay Dân Chủ", risk: 55, cond: "Watch Zone" },
                    { node: "Cầu Sài Gòn", risk: 88, cond: "Flooded" },
                    { node: "Ngã 4 Bảy Hiền", risk: 34, cond: "Watch Zone" },
                  ].map((n) => (
                    <tr key={n.node} className="border-b border-on-surface/5 last:border-0 hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-3 font-bold text-on-surface">{n.node}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${n.risk < 30 ? "bg-tertiary" : n.risk < 60 ? "bg-[hsl(45,90%,50%)]" : "bg-error"}`} style={{ width: `${n.risk}%` }} />
                          </div>
                          <span className={`font-headline font-bold tabular-nums text-xs ${n.risk < 30 ? "text-tertiary" : n.risk < 60 ? "text-[hsl(45,90%,50%)]" : "text-error"}`}>
                            {n.risk}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                          n.risk < 30 ? "bg-tertiary/10 text-tertiary" : n.risk < 60 ? "bg-[hsl(45,90%,50%)]/10 text-[hsl(45,90%,40%)]" : "bg-error/10 text-error"
                        }`}>
                          {n.cond}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Environmental Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: "🌧", label: "Rainfall Forecast", value: "78mm", sub: "Next 6 hours — Heavy", severity: "high" },
            { icon: "🌊", label: "Flood Probability", value: "64%", sub: "District 7, Bình Thạnh", severity: "high" },
            { icon: "🌡", label: "Humidity Index", value: "92%", sub: "Saturation threshold near", severity: "medium" },
            { icon: "📡", label: "Active Sensors", value: "1,247", sub: "Coverage: 87% of network", severity: "low" },
          ].map((c) => (
            <div key={c.label} className="p-6 bg-surface rounded-md border border-on-surface/5 relative overflow-hidden group hover:translate-y-[-4px] transition-transform duration-300">
              <div className={`absolute top-0 left-0 w-full h-0.5 ${c.severity === "high" ? "bg-error" : c.severity === "medium" ? "bg-[hsl(45,90%,50%)]" : "bg-tertiary"}`} />
              <div className="text-3xl mb-4">{c.icon}</div>
              <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 font-label mb-1">{c.label}</div>
              <div className={`font-headline font-black text-3xl tabular-nums mb-2 ${c.severity === "high" ? "text-error" : c.severity === "medium" ? "text-[hsl(45,90%,50%)]" : "text-tertiary"}`}>
                {c.value}
              </div>
              <div className="text-xs text-on-surface-variant/60">{c.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>

    {/* MARKET – TAM / SAM / SOM */}
    <Section id="market" className="py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-20">
          <h2 className="font-headline text-4xl md:text-5xl font-black tracking-tighter uppercase mb-4">
            Market Opportunity:<br /><span className="text-primary">TAM / SAM / SOM.</span>
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto font-body">
            Our market strategy starts where the problem is most urgent. By proving our Panoramic solution in HCMC first, we create a clear path to scale across the $15B+ Southeast Asian market.
          </p>
        </div>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-16">
          {/* Bullseye concentric circles */}
          <div className="relative w-[340px] h-[340px] flex items-center justify-center flex-shrink-0">
            {/* TAM – outermost */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/25 flex items-start justify-center pt-6">
              <span className="bg-surface px-3 py-1 rounded text-xs font-headline font-bold uppercase tracking-widest text-primary/70">TAM $15B+</span>
            </div>
            {/* SAM – middle */}
            <div className="absolute inset-[52px] rounded-full border-2 border-primary/40 flex items-start justify-center pt-5">
              <span className="bg-surface px-3 py-1 rounded text-xs font-headline font-bold uppercase tracking-widest text-primary/90">SAM $1B+</span>
            </div>
            {/* SOM – center */}
            <div className="absolute inset-[108px] rounded-full bg-primary/15 border-2 border-primary flex items-center justify-center flex-col">
              <span className="font-headline font-black text-2xl text-primary">SOM</span>
              <span className="font-headline font-bold text-sm text-on-surface">$200M+</span>
            </div>
          </div>

          {/* Market descriptions */}
          <div className="max-w-md space-y-6">
            <div className="p-5 bg-surface-container rounded-md border-l-4 border-primary/30">
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-1">TAM — $15B+</h4>
              <p className="text-sm text-on-surface-variant">Southeast Asian Digital Mobility Market. Every major city faces flooding and traffic chaos.</p>
            </div>
            <div className="p-5 bg-surface-container rounded-md border-l-4 border-primary/50">
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-1">SAM — $1B+</h4>
              <p className="text-sm text-on-surface-variant">Vietnam's Logistics & Smart Infrastructure sector, rapidly modernizing with government backing.</p>
            </div>
            <div className="p-5 bg-surface-container rounded-md border-l-4 border-primary">
              <h4 className="font-headline font-bold text-sm uppercase tracking-widest text-primary mb-1">SOM — $200M+</h4>
              <p className="text-sm text-on-surface-variant">Urban hubs—HCMC & Hanoi—where the problem is most urgent and our initial beachhead.</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
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
        <h2 className="font-headline text-4xl font-black tracking-tighter uppercase mb-6 text-center">Technical Roadmap.</h2>
        <p className="text-on-surface-variant text-center max-w-2xl mx-auto mb-20 font-body">
          A phased approach that balances cost-efficiency with accuracy improvement at every stage.
        </p>

        {/* Timeline visual */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 w-full h-0.5 bg-outline-variant/30 hidden lg:block" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {[
              {
                n: "1",
                title: "Phase: Precision",
                timeline: "Months 0–6",
                cost: "$50K–$80K",
                accuracy: "70% → 82%",
                color: "primary",
                items: [
                  "High-resolution Node-Edge mapping of HCMC center",
                  "Core Environment Observer MVP (CCTV + weather feeds)",
                  "Baseline Dijkstra routing with manual weight tuning",
                ],
                improvement: "Manual data labeling + structured traffic feeds establish ground-truth baselines for model training.",
              },
              {
                n: "2",
                title: "Phase: Intelligence",
                timeline: "Months 6–14",
                cost: "$120K–$200K",
                accuracy: "82% → 93%",
                color: "tertiary",
                items: [
                  "Multi-Agent Simulation beta with LLM-powered analysis",
                  "Panoramic Dashboard for B2B rollout",
                  "Regional expansion: Hanoi pilot",
                ],
                improvement: "LLM vision + audio agents replace manual inputs; feedback loops retrain models weekly on real outcomes.",
              },
              {
                n: "3",
                title: "Phase: Ecosystem",
                timeline: "Months 14–24",
                cost: "$300K–$500K",
                accuracy: "93% → 97%+",
                color: "secondary",
                items: [
                  "API for Autonomous Vehicles & fleet partners",
                  "SEA market launch (Bangkok, Jakarta)",
                  "City Brain integration & government data sharing",
                ],
                improvement: "Federated learning across cities; millions of daily data points create self-improving prediction loops.",
              },
            ].map((p) => (
              <div key={p.n} className="relative bg-surface border border-on-surface/5 rounded-md pt-16 pb-8 px-8 flex flex-col">
                {/* Phase circle */}
                <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-${p.color} rounded-full flex items-center justify-center font-black text-xl text-surface border-4 border-surface font-headline z-10`}>
                  {p.n}
                </div>

                <h5 className={`font-headline font-bold uppercase mb-1 text-${p.color}`}>{p.title}</h5>
                <div className="text-xs text-on-surface-variant/50 font-label uppercase tracking-widest mb-4">{p.timeline}</div>

                {/* Cost & Accuracy badges */}
                <div className="flex gap-3 mb-6">
                  <div className="px-3 py-1.5 bg-surface-container-high rounded text-xs font-bold font-headline">
                    <span className="text-on-surface-variant/50 mr-1">Cost:</span>
                    <span className="text-on-surface">{p.cost}</span>
                  </div>
                  <div className="px-3 py-1.5 bg-surface-container-high rounded text-xs font-bold font-headline">
                    <span className="text-on-surface-variant/50 mr-1">Accuracy:</span>
                    <span className={`text-${p.color}`}>{p.accuracy}</span>
                  </div>
                </div>

                {/* Deliverables */}
                <ul className="text-xs space-y-2 text-on-surface-variant/70 font-label mb-6 flex-1">
                  {p.items.map((i) => <li key={i} className="flex gap-2"><span className={`text-${p.color} mt-0.5`}>▸</span>{i}</li>)}
                </ul>

                {/* Accuracy improvement note */}
                <div className={`border-t border-${p.color}/20 pt-4`}>
                  <div className="text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-label mb-1">How Accuracy Improves</div>
                  <p className="text-xs text-on-surface-variant/60">{p.improvement}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar visual */}
          <div className="mt-16 bg-surface-container rounded-md p-6 border border-on-surface/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-headline font-bold uppercase tracking-widest text-on-surface-variant/50">Accuracy Trajectory</span>
              <span className="text-xs font-headline font-bold text-primary">Target: 97%+</span>
            </div>
            <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 w-[30%] bg-primary rounded-full" />
              <div className="absolute inset-y-0 left-[30%] w-[32%] bg-tertiary rounded-full" />
              <div className="absolute inset-y-0 left-[62%] w-[35%] bg-secondary rounded-full" />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-label text-on-surface-variant/40 uppercase tracking-widest">
              <span>70% Baseline</span>
              <span>82%</span>
              <span>93%</span>
              <span>97%+</span>
            </div>
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
