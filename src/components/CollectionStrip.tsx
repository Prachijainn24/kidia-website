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
    <section className="container-kidia py-10 md:py-14" aria-labelledby="category-title">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="category-title" className="font-display text-3xl font-bold tracking-tight text-primary md:text-4xl">Collection</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="link" className="hidden px-0 sm:inline-flex"><Link to="/shop">Shop all <ArrowUpRight className="h-4 w-4" /></Link></Button>
          <Button variant="outline" size="icon" aria-label="Previous collections" onClick={() => scroll(-1)} className="h-8 w-8 rounded-full border-foreground/15 text-primary hover:bg-primary hover:text-primary-foreground"><ChevronLeft className="h-4 w-4" /></Button>
          <Button variant="outline" size="icon" aria-label="Next collections" onClick={() => scroll(1)} className="h-8 w-8 rounded-full border-foreground/15 text-primary hover:bg-primary hover:text-primary-foreground"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <div ref={ref} onScroll={update} className="no-scrollbar -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1 md:gap-5">
        {CATEGORIES.map((c, i) => (
          <Link
            key={c.slug}
            to={c.link}
            className="group w-[40%] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-foreground/10 bg-card transition-transform duration-300 hover:-translate-y-1 sm:w-[24%] lg:w-[16.5%]"
          >
            <div className="aspect-[3/4] overflow-hidden bg-muted">
              <img src={c.image} alt={c.name} loading="lazy" width={768} height={1024} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" />
            </div>
            <div className={`flex h-9 items-center justify-center px-2 text-center ${TONES[i % TONES.length]}`}>
              <h3 className="font-sans text-[11px] font-extrabold uppercase tracking-[0.1em] text-primary">{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-5 h-[3px] w-28 overflow-hidden rounded-full bg-primary/12" aria-hidden>
        <div
          className="h-full rounded-full bg-primary transition-[margin,width] duration-200"
          style={{ width: `${progress.size * 100}%`, marginLeft: `${progress.start * 100}%` }}
        />
      </div>
    </section>
  );
};
