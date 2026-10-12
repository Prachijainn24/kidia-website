import { motion } from "framer-motion";
import { Check, Instagram, MessageCircle, Quote } from "lucide-react";
import { REVIEWS } from "@/data/reviews";
import { CONTACT, instagramUrl, whatsappUrl } from "@/data/contact";
import { cn } from "@/lib/utils";
import { Float, Flower, Sparkle, Sticker } from "./Motifs";

const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const CHECKS = [
  { t: "The wriggle test", d: "Soft seams, no scratchy labels, and enough give to survive a whole day of play.", tone: "bg-butter" },
  { t: "Easy on, easy off", d: "Wide necklines and stretchy waists — for impatient little humans and impatient mornings.", tone: "bg-sky" },
  { t: "The grown-up check", d: "Fabric, finish and fit looked at with a parent's eye before a piece is packed.", tone: "bg-blush" },
];

export const BabyApproved = () => (
  <section className="relative overflow-hidden bg-butter/35 pb-5 pt-16 md:pb-7 md:pt-24" aria-labelledby="approval-title">
    <Float className="left-[3%] top-10 h-14 w-14 text-marigold/70" delay={0.4}><Flower /></Float>
    <Sparkle className="absolute bottom-10 right-[6%] h-6 w-6 text-coral" />

    <div className="container-kidia">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Sticker className="bg-coral text-background">The final sign-off</Sticker>
          <h2 id="approval-title" className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-primary md:text-6xl">
            Baby approved,<br /><span className="text-coral">parents confirmed.</span>
          </h2>
          <p className="mt-4 font-hand text-3xl text-plum">Two thumbs up from the little ones.</p>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
            Before a piece earns its place in a child's wardrobe, it passes the same three checks we'd run on our own children's clothes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {CHECKS.map((c) => (
            <motion.div key={c.t} {...fade} className="rounded-3xl bg-card p-5 shadow-soft">
              <span className={cn("grid h-14 w-14 place-items-center rounded-full border-2 border-dashed border-primary/25", c.tone)}>
                <Check className="h-6 w-6 text-primary" strokeWidth={2.4} />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary">{c.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.d}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {REVIEWS.length > 0 ? (
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.figure key={r.parent} {...fade} className={cn("postcard-edge rounded-2xl bg-card p-6 shadow-soft", i % 2 ? "md:rotate-1" : "md:-rotate-1")}>
              <Quote className="h-5 w-5 text-coral" />
              <blockquote className="mt-3 font-serif text-lg italic leading-snug">“{r.quote}”</blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-bold text-primary">{r.parent}</span>
                <span className="text-muted-foreground"> · {r.child}{r.city ? ` · ${r.city}` : ""}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      ) : (
        <motion.div {...fade} className="mt-14 rounded-3xl border-2 border-dashed border-primary/25 bg-card/70 p-6 text-center md:p-8">
          <p className="font-hand text-3xl text-plum">No reviews yet — and we'd rather show you real ones.</p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            If your little one has worn something from KIDIA, we'd love to hear how it went — a line or two, in your own words.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl("Hi KIDIA! I'd love to share a review of my order.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-coral"
            >
              <MessageCircle className="h-4 w-4" />Share a review on WhatsApp
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-background"
            >
              <Instagram className="h-4 w-4" />Tag us @{CONTACT.instagramHandle}
            </a>
          </div>
        </motion.div>
      )}
    </div>
  </section>
);
