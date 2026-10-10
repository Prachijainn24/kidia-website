import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/catalog";

const TONES = ["bg-butter", "bg-sky", "bg-blush", "bg-secondary"];

export const CollectionStrip = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ start: 0, size: 1 });

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const size = Math.min(1, el.clientWidth / el.scrollWidth);
    const start = max > 0 ? (el.scrollLeft / max) * (1 - size) : 0;
    setProgress({ start, size });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="container-kidia py-8 md:py-12" aria-labelledby="category-title">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id="category-title" className="font-display text-2xl font-extrabold tracking-tight text-primary md:text-3xl">Collection</h2>
        <Button asChild variant="link" className="hidden px-0 text-[11px] font-bold uppercase tracking-[0.14em] text-primary/60 hover:text-primary sm:inline-flex">
          <Link to="/shop">Shop all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </Button>
      </div>

      <div ref={ref} onScroll={update} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.slug}
            to={c.link}
            className="group w-[42%] shrink-0 snap-start overflow-hidden rounded-xl bg-card shadow-soft transition-transform duration-300 hover:-translate-y-0.5 sm:w-[26%] lg:w-[11.8%]"
          >
            <div className="aspect-square overflow-hidden bg-muted">
              <img src={c.image} alt={c.name} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            </div>
            <div className={`flex h-8 items-center justify-center px-1 text-center ${TONES[i % TONES.length]}`}>
              <h3 className="whitespace-nowrap font-sans text-[10px] font-bold tracking-tight text-primary">{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-primary/12" aria-hidden>
        <div
          className="h-full rounded-full bg-primary transition-[margin,width] duration-200"
          style={{ width: `${progress.size * 100}%`, marginLeft: `${progress.start * 100}%` }}
        />
      </div>
    </section>
  );
};
