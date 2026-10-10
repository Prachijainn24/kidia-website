import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Feather, Sparkles, Ruler, Instagram, Heart, Ribbon, Star, Shirt } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { NewArrivals } from "@/components/NewArrivals";
import { CollectionStrip } from "@/components/CollectionStrip";
import { Button } from "@/components/ui/button";
import { AGE_GROUPS, images, products } from "@/data/catalog";
import { CONTACT, instagramUrl } from "@/data/contact";
import { BrandFilms } from "@/components/BrandFilms";
import { Float, Flower, Sticker, Sunburst } from "@/components/Motifs";

const fade = { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const Bestsellers = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="bg-blush/40 py-16 md:py-24" aria-labelledby="bestseller-title">
      <div className="container-kidia">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div className="flex items-center gap-4"><Heart strokeWidth={1} className="hidden h-12 w-12 text-accent sm:block" /><div><h2 id="bestseller-title" className="section-title">Little favourites.</h2></div></div>
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
    <NewArrivals />

    <CollectionStrip />

    <Bestsellers />


    <section className="wave-top relative -mt-4 bg-coral py-20 md:py-28" aria-labelledby="festive-title"><Star className="absolute right-[8%] top-16 h-5 w-5 fill-butter text-butter" aria-hidden />
      <div className="container-kidia">
        <div className="mb-10 text-center"><Sunburst className="mx-auto mb-3 h-12 w-12 text-butter" /><p className="mb-3 text-xs font-extrabold uppercase tracking-[0.2em] text-butter">Dressed for the moments that matter</p><h2 id="festive-title" className="font-display text-4xl font-extrabold text-background md:text-6xl">A Little <span className="text-butter">Celebration.</span></h2><p className="mx-auto mt-4 max-w-md font-semibold text-background/90">Tiny twirls, family festivities, and memories dressed in colour.</p></div>
        <div className="grid items-start gap-8 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
          <motion.div {...fade}><Link to="/collections/diwali" className="group block"><div className="relative aspect-[5/4] overflow-hidden rounded-sm rounded-[2rem] border-[6px] border-butter"><img src={images.diwali} alt="Children celebrating Diwali in festive clothing" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /><Sticker className="absolute bottom-4 left-4 -rotate-3 bg-marigold text-foreground">✦ Diwali edit</Sticker></div><div className="mt-5 rounded-2xl bg-butter p-5"><div><h3 className="font-display text-2xl font-extrabold text-primary md:text-3xl">Little Lights, Lovely Looks</h3><span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-plum">Explore Diwali <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></div></Link></motion.div>
          <motion.div {...fade} className="md:pt-16"><Link to="/collections/navratri" className="group block"><div className="aspect-[4/5] overflow-hidden rounded-t-[10rem] border-[6px] border-blush"><img src={images.navratri} alt="Children in Navratri garba outfits" loading="lazy" width={1024} height={1024} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div><div className="mt-5 rounded-2xl bg-plum p-5"><p className="text-xs font-extrabold tracking-widest text-blush">NAVRATRI EDIT</p><h3 className="mt-2 font-display text-2xl font-extrabold text-primary-foreground md:text-3xl">Little Twirls, Big Festive Energy</h3><span className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-butter">Explore Navratri <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span></div></Link></motion.div>
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


    <BrandFilms />

    <section className="container-kidia py-16 md:py-24" aria-labelledby="lookbook-title">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.4fr]">
        <div className="text-center md:text-left"><Instagram className="mb-4 inline-block h-7 w-7 text-accent" strokeWidth={1} /><p className="eyebrow mb-3">The KIDIA album</p><h2 id="lookbook-title" className="section-title">Little moments,<br /><span className="italic">beautifully dressed.</span></h2><a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 border-b border-primary pb-2 text-sm font-semibold text-primary">@{CONTACT.instagramHandle}<ArrowUpRight className="h-4 w-4" /></a></div>
        <div className="grid grid-cols-2 items-center gap-4 sm:gap-7"><Link to="/collections/ethnic-festive" className="block -rotate-3 bg-card p-3 shadow-soft transition hover:rotate-0"><img src={images.hero} alt="Sibling festive styles from the KIDIA lookbook" loading="lazy" width={1920} height={1088} className="aspect-[4/5] w-full object-cover object-right" /><p className="py-3 text-center font-serif text-sm italic">Together is our favourite.</p></Link><Link to="/collections/girls" className="mt-12 block rotate-3 bg-card p-3 shadow-soft transition hover:rotate-0"><img src={images.dress} alt="Blush dress for a special little occasion" loading="lazy" width={768} height={1024} className="aspect-[4/5] w-full object-cover" /><p className="py-3 text-center font-serif text-sm italic">A little dress-up day.</p></Link></div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24" aria-labelledby="promise-title"><Float className="right-[4%] top-8 h-20 w-20 text-marigold/80" spin><Sunburst /></Float><Float className="bottom-8 left-[45%] h-12 w-12 text-blush/70" delay={1}><Flower /></Float>
      <div className="container-kidia grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <motion.div {...fade}><Sticker className="mb-5 bg-butter text-primary">From one parent to another</Sticker><h2 id="promise-title" className="font-display text-4xl font-extrabold leading-tight text-butter md:text-5xl">Why parents<br />choose KIDIA</h2><p className="mt-6 max-w-md font-hand text-3xl text-blush">Started by two mothers.<br />Chosen with a mother's heart.</p><p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/85">KIDIA was started by two mothers who wanted clothes their own children would love to wear, and that they would feel good buying. Every piece is chosen with a parent's eye for comfort, quality and joy.</p><Heart className="mt-6 h-8 w-8 fill-coral text-coral" strokeWidth={1} /></motion.div>
        <div className="space-y-4">{[{ I: Feather, t: 'Comfort Comes First', d: 'Soft, child-friendly fabrics chosen for all-day wear.' }, { I: Sparkles, t: 'Little Styles for Every Occasion', d: 'Everyday, festive and special-occasion clothing.' }, { I: Shirt, t: 'Easy Shopping for Parents', d: 'Shop by age, size and occasion, with clear details on every piece.' }, { I: Ruler, t: 'Made for Growing Kids', d: 'Clear age labels and a detailed size guide.' }].map(({ I, t, d }) => <motion.div key={t} {...fade} className="flex gap-5 rounded-2xl border-2 border-dashed border-butter/50 p-5"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-butter"><I className="h-5 w-5 text-primary" strokeWidth={1.6} /></span><div><h3 className="font-display text-xl font-bold text-primary-foreground">{t}</h3><p className="mt-1 text-sm text-primary-foreground/80">{d}</p></div></motion.div>)}</div>
      </div>
    </section>

  </Layout>
);
export default Index;
