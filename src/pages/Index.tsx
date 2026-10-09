import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Feather, Sparkles, ShoppingBag, Ruler, Instagram, Heart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { NewArrivals } from "@/components/NewArrivals";
import { Newsletter } from "@/components/Newsletter";
import { Button } from "@/components/ui/button";
import { AGE_GROUPS, CATEGORIES, images, products } from "@/data/catalog";
import { CONTACT, instagramUrl } from "@/data/contact";

const fade = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const CAT_TONES = ["bg-peach", "bg-butter", "bg-mint", "bg-lavender", "bg-blush", "bg-sky", "bg-butter", "bg-peach"];
const PROMISE_TONES = ["bg-peach", "bg-butter", "bg-mint", "bg-lavender"];

const SectionHead = ({ eyebrow, title, link, linkText }: { eyebrow: string; title: string; link?: string; linkText?: string }) => (
  <motion.div {...fade} className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div><p className="eyebrow mb-2">{eyebrow}</p><h2 className="section-title">{title}</h2></div>
    {link && <Link to={link} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">{linkText}<ArrowRight className="h-4 w-4" /></Link>}
  </motion.div>
);

const Bestsellers = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  const list = products.filter((p) => p.bestseller);
  return (
    <section className="bg-blush/40 py-20">
      <div className="container-kidia">
      <div className="flex items-end justify-between">
        <SectionHead eyebrow="Loved by families" title="Bestsellers" link="/collections/bestsellers" linkText="View all" />
      </div>
      <div className="relative">
        <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 md:gap-6">
          {list.map((p) => <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[31%] lg:w-[23%]"><ProductCard p={p} /></div>)}
        </div>
        <button aria-label="Previous" onClick={() => scroll(-1)} className="absolute -left-4 top-1/3 hidden rounded-full bg-card p-3 shadow-lift md:block"><ChevronLeft className="h-5 w-5" /></button>
        <button aria-label="Next" onClick={() => scroll(1)} className="absolute -right-4 top-1/3 hidden rounded-full bg-card p-3 shadow-lift md:block"><ChevronRight className="h-5 w-5" /></button>
      </div>
    </section>
  );
};

const Index = () => {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <Layout>
      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden bg-secondary">
        <motion.img style={{ y }} src={images.hero} alt="Children wearing KIDIA festive kurta sets and a pastel lehenga" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-peach/20 md:via-background/55" />
        <div className="pointer-events-none absolute -bottom-16 right-10 h-52 w-52 rounded-full bg-blush/70 blur-3xl" />
        <div className="pointer-events-none absolute bottom-1/3 right-1/4 h-36 w-36 rounded-full bg-mint/60 blur-3xl" />
        <div className="container-kidia relative flex min-h-[78svh] items-center py-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-xl">
            <p className="mb-4 flex w-fit items-center gap-2 rounded-full bg-butter px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent"><Sparkles className="h-4 w-4" />Festive Collection 2026</p>
            <h1 className="font-serif text-5xl leading-[1.05] text-foreground md:text-7xl">Little Looks. <span className="italic rainbow-text">Big Festive Energy.</span></h1>
            <p className="mt-6 text-lg text-foreground/80">Everyday comfort, celebration-ready styles, and outfits made for their biggest little moments.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 rounded-full px-8"><Link to="/collections/new-arrivals">Shop New Arrivals</Link></Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary bg-card/60 px-8 text-primary"><Link to="/collections/ethnic-festive">Explore Festive Wear</Link></Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-kidia py-20">
        <SectionHead eyebrow="Find their style" title="Shop by category" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {CATEGORIES.map((c, i) => (
            <motion.div key={c.slug} {...fade} transition={{ duration: 0.5, delay: i * 0.05 }}>
              <Link to={c.link} className="group block">
                <div className="aspect-square overflow-hidden rounded-[2rem] bg-muted">
                  <img src={c.image} alt={c.name} loading="lazy" className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-110" />
                </div>
                <p className={`mx-auto mt-3 w-fit rounded-full px-4 py-1 text-center font-serif text-lg transition group-hover:shadow-soft ${CAT_TONES[i % CAT_TONES.length]}`}>{c.name}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      <NewArrivals />

      {/* Festive spotlight */}
      <section className="relative mt-20 overflow-hidden bg-butter/70 py-20">
        <div className="pointer-events-none absolute -left-10 top-10 h-44 w-44 rounded-full bg-marigold/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-60 w-60 rounded-full bg-blush/80 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 top-6 h-40 w-40 rounded-full bg-mint/60 blur-3xl" />
        <div className="container-kidia relative">
          <SectionHead eyebrow="The festive season" title="Celebrate in KIDIA" />
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { img: images.diwali, t: "Diwali Edit", s: "Little Lights, Big Looks", d: "Kurta sets, lehenga sets, festive dresses and waistcoat sets ready for the festival of lights.", to: "/collections/diwali", cta: "Shop Diwali Collection" },
              { img: images.navratri, t: "Navratri Edit", s: "Twirl Into Festivities", d: "Colourful chaniya cholis, kediyu and dhoti sets made for nine nights of garba.", to: "/collections/navratri", cta: "Shop Navratri Collection" },
            ].map((c, i) => (
              <motion.div key={c.t} {...fade} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <Link to={c.to} className="group relative block aspect-[4/5] overflow-hidden rounded-[2rem] md:aspect-[4/5]">
                  <img src={c.img} alt={c.t} loading="lazy" className="h-full w-full object-cover transition duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-background md:p-10">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-butter">{c.t}</p>
                    <h3 className="mt-1 font-serif text-3xl md:text-4xl">{c.s}</h3>
                    <p className="mt-2 max-w-sm text-sm opacity-90">{c.d}</p>
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-bold text-primary">{c.cta}<ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by age */}
      <section className="container-kidia py-20">
        <SectionHead eyebrow="Made for growing kids" title="Shop by age" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {AGE_GROUPS.map((a, i) => (
            <motion.div key={a.slug} {...fade} transition={{ duration: 0.5, delay: i * 0.08 }}>
              <Link to={`/shop?age=${a.slug}`} className={`flex aspect-[4/3] flex-col items-center justify-center rounded-[2rem] ${a.tone} transition hover:-translate-y-1 hover:shadow-lift`}>
                <span className="font-serif text-4xl text-foreground md:text-5xl">{a.label.split(" ")[0]}</span>
                <span className="text-sm font-bold uppercase tracking-widest text-foreground/70">Years</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <Bestsellers />

      {/* Why KIDIA */}
      <section className="bg-primary-soft py-20">
        <div className="container-kidia">
          <SectionHead eyebrow="Our promise" title="Why parents choose KIDIA" />
          <p className="-mt-4 mb-10 max-w-2xl text-muted-foreground">KIDIA was started by two mothers who wanted clothes their own children would love to wear, and that they would feel good buying. Every piece is chosen with a parent's eye for comfort, quality and joy.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { I: Feather, t: "Comfort First", d: "Soft, child-friendly fabrics chosen for all-day wear." },
              { I: Sparkles, t: "Styles for Every Moment", d: "Everyday, festive and special-occasion clothing." },
              { I: Heart, t: "Started by Mothers", d: "Founded by two moms who know what kids and parents really need." },
              { I: Ruler, t: "Made for Growing Kids", d: "Clear age labels and a detailed size guide." },
            ].map(({ I, t, d }, i) => (
              <motion.div key={t} {...fade} className={`rounded-3xl p-8 shadow-soft ${PROMISE_TONES[i]}`}>
                <div className="mb-5 inline-flex rounded-2xl bg-card p-3"><I className="h-6 w-6 text-primary" /></div>
                <h3 className="font-serif text-xl">{t}</h3>
                <p className="mt-2 text-sm text-foreground/70">{d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lookbook */}
      <section className="container-kidia py-20">
        <SectionHead eyebrow="Lookbook" title="Styled by KIDIA" link="/collections/ethnic-festive" linkText="Get Inspired" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
          <img src={images.hero} alt="Festive sibling looks" loading="lazy" className="col-span-2 row-span-2 h-full w-full rounded-[2rem] object-cover" />
          <img src={images.coord} alt="Mint co-ord set" loading="lazy" className="aspect-square w-full rounded-[2rem] object-cover object-top" />
          <img src={images.dress} alt="Blush party dress" loading="lazy" className="aspect-square w-full rounded-[2rem] object-cover object-top" />
          <img src={images.anarkali} alt="Yellow anarkali" loading="lazy" className="aspect-square w-full rounded-[2rem] object-cover object-top" />
          <img src={images.dhoti} alt="Maroon dhoti kurta" loading="lazy" className="aspect-square w-full rounded-[2rem] object-cover object-top" />
        </div>
        <div className="mt-12 text-center">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 font-serif text-2xl hover:text-primary"><Instagram className="h-5 w-5 text-primary" />@{CONTACT.instagramHandle}</a>
          <p className="mt-1 text-sm text-muted-foreground">Share your little one's KIDIA moments and follow us for new drops, festive edits and everyday style.</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container-kidia">
        <div className="bg-rainbow-soft relative overflow-hidden rounded-[2.5rem] px-6 py-16 text-center md:px-16">
          <Sparkles className="absolute left-8 top-8 h-6 w-6 text-accent/60" />
          <Sparkles className="absolute bottom-10 right-10 h-8 w-8 text-primary/40" />
          <Sparkles className="absolute right-1/4 top-10 h-5 w-5 text-success" />
          <h2 className="section-title">Little Updates, Lovely Surprises.</h2>
          <p className="mx-auto mt-3 max-w-md text-foreground/70">New collections, festive edits and members-first news — straight to your inbox.</p>
          <div className="mx-auto mt-8 max-w-lg text-left"><Newsletter /></div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
