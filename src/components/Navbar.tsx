import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import PresentationControls from "./PresentationControls";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const scrollTo = (id: string) => {
    setOpen(false);
    if (!isHome) return;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-2xl">
      <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
        <Link to="/" className="text-2xl font-black tracking-tighter uppercase font-headline text-on-surface">
          AI-Navigate
        </Link>

        <div className="hidden md:flex items-center gap-8 font-headline font-bold uppercase tracking-tighter text-sm">
          <Link
            to="/demo"
            className="text-primary-container hover:text-primary transition-colors px-4 py-1.5 rounded bg-primary-container/10 border border-primary-container/30"
          >
            Demo
          </Link>
          {isHome && (
            <>
              <button onClick={() => scrollTo("problem")} className="text-on-surface-variant hover:text-on-surface transition-colors">Problem</button>
              <button onClick={() => scrollTo("solution")} className="text-on-surface-variant hover:text-on-surface transition-colors">Solution</button>
              <button onClick={() => scrollTo("tech")} className="text-on-surface-variant hover:text-on-surface transition-colors">Tech</button>
              <button onClick={() => scrollTo("market")} className="text-on-surface-variant hover:text-on-surface transition-colors">Market</button>
              <button onClick={() => scrollTo("roadmap")} className="text-on-surface-variant hover:text-on-surface transition-colors">Roadmap</button>
            </>
          )}
        </div>

        <div className="hidden md:block">
          <Link
            to="/demo"
            className="bg-primary-container text-primary-container-foreground px-6 py-2 rounded font-headline font-bold uppercase tracking-widest active:scale-90 transition-transform shadow-[0px_4px_20px_rgba(39,146,255,0.3)]"
          >
            Try Demo
          </Link>
        </div>

        <button className="md:hidden text-on-surface" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-outline-variant/15 px-8 py-6 space-y-4 font-headline font-bold uppercase tracking-tighter text-sm">
          <Link to="/demo" onClick={() => setOpen(false)} className="block text-primary-container">Demo</Link>
          {isHome && (
            <>
              <button onClick={() => scrollTo("problem")} className="block text-on-surface-variant">Problem</button>
              <button onClick={() => scrollTo("solution")} className="block text-on-surface-variant">Solution</button>
              <button onClick={() => scrollTo("tech")} className="block text-on-surface-variant">Tech</button>
              <button onClick={() => scrollTo("market")} className="block text-on-surface-variant">Market</button>
              <button onClick={() => scrollTo("roadmap")} className="block text-on-surface-variant">Roadmap</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
