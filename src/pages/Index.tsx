import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Feather, Sparkles, Ruler, Instagram, Heart, Ribbon, Mail, Star, Shirt } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { NewArrivals } from "@/components/NewArrivals";
import { Newsletter } from "@/components/Newsletter";
import { Button } from "@/components/ui/button";
import { AGE_GROUPS, CATEGORIES, images, products } from "@/data/catalog";
import { CONTACT, instagramUrl } from "@/data/contact";
import heroGolden from "@/assets/hero-golden.jpg";
import { BrandFilms } from "@/components/BrandFilms";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const Bestsellers = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="bg-blush/40 py-16 md:py-24" aria-labelledby="bestseller-title">
      <div className="container-kidia">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4"><Heart strokeWidth={1} className="hidden h-12 w-12 text-accent sm:block" /><div><p className="eyebrow mb-2">The much-loved edit</p><h2 id="bestseller-title" className="section-title">Little favourites.</h2></div></div>
          <div className="flex items-center gap-3"><Button asChild variant="link" className="px-0"><Link to="/collections/bestsellers">All bestsellers <ArrowUpRight className="h-4 w-4" /></Link></Button><Button variant="outline" size="icon" aria-label="Previous bestsellers" onClick={() => scroll(-1)} className="rounded-full"><ChevronLeft /></Button><Button variant="outline" size="icon" aria-label="Next bestsellers" onClick={() => scroll(1)} className="rounded-full"><ChevronRight /></Button></div>
        </div>
        <div ref={ref} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-6">
          {products.filter(p => p.bestseller).map(p => <div key={p.id} className="w-[72%] shrink-0 snap-start sm:w-[40%] lg:w-[23%]"><ProductCard p={p} /></div>)}
        </div>
      </div>
    </section>
  );
};

const Index = () => (
  <Layout>
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-butter via-secondary to-background" aria-labelledby="home-title">
      <Star className="absolute left-[46%] top-10 hidden h-6 w-6 md:block fill-marigold text-marigold motion-safe:animate-pulse" aria-hidden />
      <Sparkles className="absolute bottom-16 left-6 h-7 w-7 text-accent" strokeWidth={1.2} aria-hidden />
      <div className="container-kidia relative grid items-center gap-10 py-12 md:grid-cols-[0.9fr_1.1fr] md:py-20">
        <div className="relative z-10">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-5 inline-flex items-center gap-2 border-y border-primary/30 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-primary"><Star className="h-3 w-3 fill-marigold text-marigold" /> The little style edit</motion.p>
          <motion.h1 id="home-title" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="font-serif text-5xl leading-[0.95] text-primary sm:text-6xl lg:text-7xl">Little Styles.<br /><span className="italic text-accent">Big Smiles.</span></motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }} className="mt-6 max-w-md text-base leading-relaxed text-foreground sm:text-lg">Beautifully dressed for every little moment, from everyday adventures to unforgettable celebrations.</motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 rounded-md px-6 text-xs font-bold tracking-widest transition hover:-translate-y-0.5 hover:bg-accent"><Link to="/collections/new-arrivals">EXPLORE NEW ARRIVALS <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-md border-accent bg-transparent px-6 text-xs font-bold tracking-widest text-accent hover:bg-accent hover:text-accent-foreground"><Link to="/collections/ethnic-festive">SHOP FESTIVE WEAR</Link></Button>
          </motion.div>
          <p className="mt-8 font-serif text-lg italic text-primary">KIDIA · Indian kidswear · Ages 1–12</p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, delay: 0.15 }} className="relative">
          <div className="absolute -right-3 -top-3 h-full w-full rounded-t-[12rem] border border-accent/50" aria-hidden />
          <div className="relative overflow-hidden rounded-t-[12rem] shadow-lift">
            <img src={heroGolden} alt="Two children in a marigold anarkali and forest-green kurta laughing in a sunlit courtyard" width={1600} height={1104} className="aspect-[4/5] w-full object-cover object-[72%_center] transition duration-[2000ms] hover:scale-105 sm:aspect-[5/4] md:aspect-[4/5]" />
          </div>
          <span className="absolute -bottom-4 left-4 bg-primary px-4 py-2 font-serif text-sm italic text-primary-foreground sm:left-[-1.5rem]">KIDIA · Festive ’26</span>
        </motion.div>
      </div>
    </section>

    <section className="container-kidia py-16 md:py-24" aria-labelledby="category-title">
      <div className="grid items-start gap-10 lg:grid-cols-[1fr_3fr]">
        <motion.div {...fade} className="lg:sticky lg:top-28"><Ribbon className="mb-4 h-9 w-9 text-accent" strokeWidth={1} /><p className="eyebrow mb-3">Their little wardrobe</p><h2 id="category-title" className="font-serif text-3xl leading-tight md:text-4xl">A style for<br /><span className="italic">every day.</span></h2><Button asChild variant="link" className="mt-4 px-0"><Link to="/shop">Shop all clothing <ArrowUpRight className="h-4 w-4" /></Link></Button></motion.div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
          {CATEGORIES.map((c, i) => <motion.div key={c.slug} {...fade}><Link to={c.link} className="group block"><div className={`aspect-[4/5] overflow-hidden bg-muted ${i % 2 === 0 ? 'rounded-t-[6rem]' : 'rounded-lg'} ${i % 2 !== 0 ? 'md:mt-8' : ''}`}><img src={c.image} alt={c.name} loading="lazy" width={768} height={1024} className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-105" /></div><div className="mt-3 flex items-center justify-between gap-2"><h3 className="font-sans text-xs font-semibold sm:text-sm">{c.name}</h3><ArrowUpRight className="h-4 w-4 shrink-0 text-primary" /></div></Link></motion.div>)}
        </div>
      </div>
    </section>

    <NewArrivals />

    <section className="wave-top relative -mt-4 bg-blush py-20 md:py-28" aria-labelledby="festive-title"><Star className="absolute right-[8%] top-16 h-5 w-5 fill-marigold text-marigold" aria-hidden /><Sparkles className="absolute left-[6%] bottom-12 h-6 w-6 text-accent" strokeWidth={1} aria-hidden />
      <div className="container-kidia">
        <div className="mb-10 text-center"><Sparkles className="mx-auto mb-3 h-7 w-7 text-marigold" strokeWidth={1} /><p className="eyebrow mb-3 tracking-[0.2em]">Dressed for the moments that matter</p><h2 id="festive-title" className="font-serif text-4xl text-primary md:text-6xl">A Little <span className="italic text-accent">Celebration.</span></h2><p className="mx-auto mt-4 max-w-md text-muted-foreground">Tiny twirls, family festivities, and memories dressed in colour.</p></div>
        <div className="grid items-start gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
          <motion.div {...fade}><Link to="/collections/diwali" className="group block"><div className="relative aspect-[5/4] overflow-hidden rounded-sm ring-1 ring-marigold/60 ring-offset-8 ring-offset-blush"><img src={images.diwali} alt="Children celebrating Diwali in festive clothing" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><span className="absolute bottom-4 left-4 bg-marigold px-4 py-2 text-xs font-bold tracking-widest text-foreground">DIWALI EDIT</span></div><div className="mt-5 flex items-start justify-between gap-4"><div><h3 className="font-serif text-2xl text-primary md:text-3xl">Little lights, lovely outfits.</h3><span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent">Explore Diwali <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></div></Link></motion.div>
          <motion.div {...fade} className="md:pt-16"><Link to="/collections/navratri" className="group block"><div className="aspect-[4/5] overflow-hidden rounded-t-[10rem]"><img src={images.navratri} alt="Children in Navratri garba outfits" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><p className="mt-5 text-xs font-bold tracking-widest text-accent">NAVRATRI EDIT</p><h3 className="mt-2 font-serif text-2xl italic text-primary md:text-3xl">Little twirls, big festive energy.</h3><span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent">Explore Navratri <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></Link></motion.div>
        </div>
      </div>
    </section>

    <section className="bg-butter/60 py-16 md:py-24" aria-labelledby="age-title"><div className="container-kidia">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow mb-2">With them as they grow</p><h2 id="age-title" className="section-title">Small steps. New sizes.</h2></div><Button asChild variant="link" className="px-0"><Link to="/size-guide"><Ruler className="h-4 w-4" /> Size guide</Link></Button></div>
      <div className="grid grid-cols-2 md:grid-cols-4">
        {AGE_GROUPS.map((a, i) => <Link key={a.slug} to={`/shop?age=${a.slug}`} className="age-ruler group border-l border-primary/30 px-4 pb-8 pt-5 transition hover:bg-background sm:px-8"><span className="text-xs text-muted-foreground">0{i + 1}</span><p className="mt-3 font-serif text-4xl text-primary">{a.label.split(' ')[0]}<span className="ml-2 font-sans text-xs text-muted-foreground">years</span></p><span className="mt-4 flex items-center justify-between text-sm">{['First adventures', 'Playful little days', 'Growing imaginations', 'Their own style'][i]}<ArrowUpRight className="h-4 w-4 transition group-hover:-translate-y-1" /></span></Link>)}
      </div>
      </div>
    </section>

    <Bestsellers />

    <BrandFilms />

    <section className="line-pattern bg-primary-soft py-16 md:py-24" aria-labelledby="promise-title">
      <div className="container-kidia grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <motion.div {...fade}><p className="eyebrow mb-4">From one parent to another</p><h2 id="promise-title" className="font-serif text-4xl leading-tight text-primary md:text-5xl">Why parents<br />choose KIDIA</h2><p className="mt-6 max-w-md font-serif text-xl italic text-primary">Started by two mothers.<br />Chosen with a mother's heart.</p><p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">KIDIA was started by two mothers who wanted clothes their own children would love to wear, and that they would feel good buying. Every piece is chosen with a parent's eye for comfort, quality and joy.</p><Heart className="mt-6 h-8 w-8 text-accent" strokeWidth={1} /></motion.div>
        <div className="space-y-6">{[{ I: Feather, t: 'Comfort Comes First', d: 'Soft, child-friendly fabrics chosen for all-day wear.' }, { I: Sparkles, t: 'Little Styles for Every Occasion', d: 'Everyday, festive and special-occasion clothing.' }, { I: Shirt, t: 'Easy Shopping for Parents', d: 'Shop by age, size and occasion, with clear details on every piece.' }, { I: Ruler, t: 'Made for Growing Kids', d: 'Clear age labels and a detailed size guide.' }].map(({ I, t, d }) => <motion.div key={t} {...fade} className="flex gap-5 border-b border-primary/20 pb-6 last:border-0"><I className="mt-1 h-6 w-6 shrink-0 text-accent" strokeWidth={1} /><div><h3 className="font-serif text-xl">{t}</h3><p className="mt-2 text-sm text-muted-foreground">{d}</p></div></motion.div>)}</div>
      </div>
    </section>

    <section className="container-kidia py-16 md:py-24" aria-labelledby="lookbook-title">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.4fr]">
        <div className="text-center md:text-left"><Instagram className="mb-4 inline-block h-7 w-7 text-accent" strokeWidth={1} /><p className="eyebrow mb-3">The KIDIA album</p><h2 id="lookbook-title" className="section-title">Little moments,<br /><span className="italic">beautifully dressed.</span></h2><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 border-b border-primary pb-2 text-sm font-semibold text-primary">@{CONTACT.instagramHandle}<ArrowUpRight className="h-4 w-4" /></a></div>
        <div className="grid grid-cols-2 items-center gap-4 sm:gap-7"><Link to="/collections/ethnic-festive" className="block -rotate-3 bg-card p-3 shadow-soft transition hover:rotate-0"><img src={images.hero} alt="Sibling festive styles from the KIDIA lookbook" loading="lazy" width={1920} height={1088} className="aspect-[4/5] w-full object-cover object-right" /><p className="py-3 text-center font-serif text-sm italic">Together is our favourite.</p></Link><Link to="/collections/girls" className="mt-12 block rotate-3 bg-card p-3 shadow-soft transition hover:rotate-0"><img src={images.dress} alt="Blush dress for a special little occasion" loading="lazy" width={768} height={1024} className="aspect-[4/5] w-full object-cover" /><p className="py-3 text-center font-serif text-sm italic">A little dress-up day.</p></Link></div>
      </div>
    </section>

    <section className="bg-secondary py-14 md:py-20" aria-labelledby="newsletter-title">
      <div className="container-kidia grid items-center gap-8 md:grid-cols-2 md:gap-16">
        <div className="flex items-start gap-5"><Mail className="h-12 w-12 shrink-0 text-primary" strokeWidth={1} /><div><p className="eyebrow mb-3">A note from KIDIA</p><h2 id="newsletter-title" className="font-serif text-3xl">Little updates.<br /><span className="italic">Lovely surprises.</span></h2><p className="mt-4 max-w-sm text-sm text-muted-foreground">New collections, festive edits and members-first news — straight to your inbox.</p></div></div>
        <div className="postcard-edge bg-background p-6 sm:p-8"><Newsletter /></div>
      </div>
    </section>
  </Layout>
);
export default Index;
