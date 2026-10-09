import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import editorial from "@/assets/new-arrivals-editorial.jpg";
import { products } from "@/data/catalog";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";

export const NewArrivals = () => {
  const newest = products.filter((p) => p.isNew).slice(0, 8);

  return (
    <section aria-labelledby="new-arrivals-title" className="py-12">
      <div className="container-kidia mb-5 flex items-center justify-between gap-4">
        <p className="eyebrow">The latest from KIDIA</p>
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">2026 Edit</span>
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="relative isolate overflow-hidden bg-secondary">
        <img src={editorial} alt="Children modelling a peach floral frock and a mint co-ord set" loading="lazy" width={1536} height={1024} className="block aspect-[3/2] max-h-[720px] w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h2 id="new-arrivals-title" className="text-center font-serif text-5xl font-normal leading-none tracking-normal text-primary-foreground sm:text-7xl md:text-8xl lg:text-9xl">New Arrivals</h2>
        </div>
        <div className="absolute inset-x-0 bottom-3 flex justify-center sm:bottom-8">
          <Button asChild variant="link" className="h-auto rounded-none border-b border-primary px-0 py-2 text-sm font-bold uppercase tracking-widest text-primary hover:no-underline sm:text-lg">
            <Link to="/collections/new-arrivals">Shop Now<ArrowUpRight className="h-5 w-5" /></Link>
          </Button>
        </div>
      </motion.div>
      <div className="container-kidia pt-10">
        <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
          <p className="font-serif text-xl sm:text-2xl">Fresh little favourites</p>
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