import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import look1 from "@/assets/new-arrivals-editorial-3.jpg";
import look2 from "@/assets/new-arrivals-editorial-2.jpg";
import look3 from "@/assets/boutique-garden.jpg";
import { Flower, Sparkle, Sticker, Float } from "./Motifs";

const LOOKS = [
  { src: look1, alt: "Two children in a mint co-ord set and peach dress flying a kite", tag: "Everyday adventures", note: "Made for little adventures", to: "/shop?category=coords", cls: "md:col-span-7 aspect-[4/3]", tone: "bg-butter text-foreground" },
  { src: look2, alt: "Children in a lavender lehenga and a cream kurta with marigold waistcoat", tag: "Festive moments", note: "Dressed for the celebration", to: "/collections/ethnic-festive", cls: "md:col-span-5 md:mt-16 aspect-[4/5]", tone: "bg-accent text-accent-foreground" },
  { src: look3, alt: "Children in sage linen overalls and an ivory lace-collar dress in a garden", tag: "Playful outfits", note: "For garden days and giggles", to: "/collections/new-arrivals", cls: "md:col-span-8 md:col-start-3 aspect-[16/9]", tone: "bg-plum text-primary-foreground" },
];

/** "Little Stories in Motion" — editorial image lookbook with reveal motion */
export function BrandFilms() {
  return (
    <section className="relative overflow-hidden bg-sky py-16 md:py-24" aria-labelledby="films-title">
      <Float className="right-[6%] top-10 h-16 w-16 text-marigold"><Flower /></Float>
      <Float className="left-[4%] bottom-20 h-8 w-8 text-accent" delay={2}><Sparkle /></Float>
      <div className="container-kidia relative">
        <div className="mb-10 max-w-xl">
          <Sticker className="mb-4 bg-background text-primary">The KIDIA lookbook</Sticker>
          <h2 id="films-title" className="font-display text-4xl leading-none text-primary md:text-6xl">Little stories in motion.</h2>
          <p className="mt-4 text-foreground/80">Everyday adventures, playful outfits and festive moments — styled the KIDIA way.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-12 md:gap-8">
          {LOOKS.map((l, i) => (
            <motion.div key={l.tag} className={l.cls.split(" ").filter(c => c.startsWith("md:")).join(" ")} initial={{ opacity: 0, y: 40, clipPath: "inset(12% 0 0 0)" }} whileInView={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, delay: i * 0.1 }}>
              <Link to={l.to} className="group block">
                <div className={`relative overflow-hidden rounded-[2rem] border-4 border-background shadow-lift ${l.cls.split(" ").filter(c => !c.startsWith("md:")).join(" ")}`}>
                  <img src={l.src} alt={l.alt} loading="lazy" className="h-full w-full object-cover transition duration-[1200ms] group-hover:scale-110" />
                  <Sticker className={`absolute left-4 top-4 ${l.tone}`}>{l.tag}</Sticker>
                </div>
                <div className="mt-3 flex items-center justify-between px-2">
                  <p className="font-hand text-2xl text-primary">{l.note}</p>
                  <ArrowUpRight className="h-5 w-5 text-primary transition group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
