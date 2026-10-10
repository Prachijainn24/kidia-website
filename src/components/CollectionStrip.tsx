import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
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

  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="container-kidia py-16 md:py-24" aria-labelledby="category-title">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Their little wardrobe</p>
          <h2 id="category-title" className="font-display text-4xl font-extrabold text-primary md:text-5xl">Collection</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="link" className="hidden px-0 sm:inline-flex"><Link to="/shop">Shop all <ArrowUpRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" size="icon" aria-label="Previous collections" onClick={() => scroll(-1)} className="rounded-full"><ChevronLeft /></Button>
          <Button variant="outline" size="icon" aria-label="Next collections" onClick={() => scroll(1)} className="rounded-full"><ChevronRight /></Button>
        </div>
      </div>

      <div ref={ref} onScroll={update} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 md:gap-6">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.slug}
            to={c.link}
            className="group w-[44%] shrink-0 snap-start overflow-hidden rounded-2xl bg-card shadow-soft transition-transform duration-300 hover:-translate-y-1 sm:w-[28%] lg:w-[18.5%]"
          >
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img src={c.image} alt={c.name} loading="lazy" width={768} height={1024} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
            </div>
            <div className={`flex h-12 items-center justify-center px-2 text-center ${TONES[i % TONES.length]}`}>
              <h3 className="font-sans text-sm font-bold text-primary">{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-4 h-1 w-40 overflow-hidden rounded-full bg-primary/15" aria-hidden>
        <div
          className="h-full rounded-full bg-primary transition-[margin,width] duration-200"
          style={{ width: `${progress.size * 100}%`, marginLeft: `${progress.start * 100}%` }}
        />
      </div>
    </section>
  );
};
