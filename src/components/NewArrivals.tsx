import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import editorial from "@/assets/new-arrivals-editorial.jpg";
import editorial2 from "@/assets/new-arrivals-editorial-2.jpg";
import editorial3 from "@/assets/new-arrivals-editorial-3.jpg";
import { products } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";

const SLIDES = [
  { src: editorial, alt: "Children modelling a peach floral frock and a mint co-ord set" },
  { src: editorial2, alt: "Children in a lavender lehenga and a cream kurta with marigold waistcoat" },
  { src: editorial3, alt: "Two children in a mint co-ord set and peach dress playing with a kite" },
];
const INTERVAL = 7000;

export const NewArrivals = () => {
  const newest = [...products.filter((p) => p.isNew), ...products.filter((p) => !p.isNew)].slice(0, 8);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), INTERVAL);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section aria-labelledby="new-arrivals-title" className="bg-background pb-16 md:pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="relative isolate overflow-hidden bg-secondary"
      >
        <div className="relative h-[100svh] min-h-[520px] w-full overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.img
              key={index}
              src={SLIDES[index].src}
              alt={SLIDES[index].alt}
              loading="eager"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
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
      </motion.div>
      <div className="container-kidia pt-10">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <p className="font-serif text-3xl italic text-primary md:text-4xl">Just landed, <span className="text-accent">just lovely.</span></p>
          <Button asChild variant="link" className="h-auto shrink-0 px-0 text-xs font-bold sm:text-sm">
            <Link to="/collections/new-arrivals">View All<ArrowUpRight /></Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">
          {newest.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
};
