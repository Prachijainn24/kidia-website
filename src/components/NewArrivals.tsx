import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import editorial from "@/assets/new-arrivals-editorial.jpg";
import editorial2 from "@/assets/new-arrivals-editorial-2.jpg";
import editorial3 from "@/assets/new-arrivals-editorial-3.jpg";
import { Button } from "@/components/ui/button";

const SLIDES = [
  { src: editorial, alt: "Children modelling a peach floral frock and a mint co-ord set" },
  { src: editorial2, alt: "Children in a lavender lehenga and a cream kurta with marigold waistcoat" },
  { src: editorial3, alt: "Two children in a mint co-ord set and peach dress playing with a kite" },
];
const INTERVAL = 7000;

export const NewArrivals = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section aria-labelledby="new-arrivals-title" className="bg-background">
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative isolate overflow-hidden bg-foreground"
      >
        <div className="relative h-[100svh] min-h-[520px] w-full overflow-hidden">
          {SLIDES.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              loading="eager"
              decoding="async"
              aria-hidden={i !== index}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 via-45% to-transparent" />
        <div className="pointer-events-none container-kidia absolute inset-x-0 bottom-24">
          <p className="mb-3 text-sm text-primary-foreground">A new chapter of little styles</p>
          <h1 id="new-arrivals-title" className="font-serif text-5xl font-normal leading-none text-primary-foreground sm:text-7xl md:text-8xl">New <span className="italic">Arrivals</span></h1>
        </div>
        <div className="container-kidia absolute inset-x-0 bottom-8">
          <Button asChild variant="link" className="h-auto rounded-none border-b border-primary-foreground px-0 py-2 text-sm font-bold text-primary-foreground hover:no-underline">
            <Link to="/collections/new-arrivals">Shop Now<ArrowUpRight className="h-5 w-5" /></Link>
          </Button>
        </div>
        <div className="absolute right-4 top-4 flex gap-1 sm:right-6 sm:top-6">
          {SLIDES.map((_, i) => (
            <Button
              key={i}
              type="button"
              aria-label={`Show slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"
            ><span className={`h-2 rounded-full transition-all duration-500 ${i === index ? "w-5 bg-primary-foreground" : "w-2 bg-primary-foreground/50"}`} /></Button>
          ))}
        </div>
      </div>
    </section>
  );
};
