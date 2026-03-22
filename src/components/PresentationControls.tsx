import { useEffect, useState, useCallback } from "react";
import { ChevronUp, ChevronDown, Presentation, X } from "lucide-react";

const TOTAL_SLIDES = 11;

const PresentationControls = () => {
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(0);

  const getContainer = () => document.querySelector("main.snap-y") as HTMLElement | null;

  const getSlides = useCallback(() => {
    const container = getContainer();
    if (!container) return [];
    // direct children sections + footer
    return Array.from(container.children) as HTMLElement[];
  }, []);

  const goTo = useCallback((index: number) => {
    const slides = getSlides();
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    slides[clamped]?.scrollIntoView({ behavior: "smooth" });
    setCurrent(clamped);
  }, [getSlides]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Track current slide from scroll position
  useEffect(() => {
    if (!active) return;
    const container = getContainer();
    if (!container) return;

    const onScroll = () => {
      const slides = getSlides();
      const scrollTop = container.scrollTop;
      const viewH = container.clientHeight;
      let closest = 0;
      let minDist = Infinity;
      slides.forEach((el, i) => {
        const dist = Math.abs(el.offsetTop - scrollTop);
        if (dist < minDist) { minDist = dist; closest = i; }
      });
      setCurrent(closest);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, [active, getSlides]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault(); next();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault(); prev();
      } else if (e.key === "Escape") {
        setActive(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, next, prev]);

  if (!active) {
    return (
      <button
        onClick={() => { setActive(true); goTo(0); }}
        className="flex items-center gap-2 px-4 py-1.5 rounded bg-tertiary/10 border border-tertiary/30 text-tertiary hover:bg-tertiary/20 transition-colors font-headline font-bold uppercase tracking-widest text-xs active:scale-95"
        title="Start Pitch Presentation"
      >
        <Presentation size={14} />
        Pitch
      </button>
    );
  }

  const slides = getSlides();
  const total = slides.length || TOTAL_SLIDES;

  return (
    <>
      {/* Navbar inline button */}
      <button
        onClick={() => setActive(false)}
        className="flex items-center gap-2 px-4 py-1.5 rounded bg-error/10 border border-error/30 text-error hover:bg-error/20 transition-colors font-headline font-bold uppercase tracking-widest text-xs active:scale-95"
      >
        <X size={14} />
        Exit Pitch
      </button>

      {/* Floating controls - right side */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
        <button
          onClick={prev}
          disabled={current === 0}
          className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md border border-on-surface/10 flex items-center justify-center text-on-surface hover:bg-surface transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
        >
          <ChevronUp size={20} />
        </button>

        <div className="px-3 py-2 rounded-full bg-surface/80 backdrop-blur-md border border-on-surface/10 shadow-lg">
          <span className="font-headline font-bold text-xs tabular-nums text-on-surface">
            {current + 1}<span className="text-on-surface-variant/40">/{total}</span>
          </span>
        </div>

        <button
          onClick={next}
          disabled={current === total - 1}
          className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md border border-on-surface/10 flex items-center justify-center text-on-surface hover:bg-surface transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
        >
          <ChevronDown size={20} />
        </button>

        {/* Dot indicators */}
        <div className="flex flex-col gap-1.5 mt-2">
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-primary scale-125 shadow-[0_0_6px_hsl(var(--primary))]"
                  : "bg-on-surface/20 hover:bg-on-surface/40"
              }`}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default PresentationControls;
