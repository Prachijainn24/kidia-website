import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type P = { className?: string };

/** KIDIA signature hand-drawn sunburst */
export const Sunburst = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-none stroke-current", className)} aria-hidden strokeWidth={3} strokeLinecap="round">
    <circle cx="50" cy="50" r="16" className="fill-current" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * Math.PI) / 6;
      return <line key={i} x1={50 + Math.cos(a) * 25} y1={50 + Math.sin(a) * 25} x2={50 + Math.cos(a) * (i % 2 ? 38 : 45)} y2={50 + Math.sin(a) * (i % 2 ? 38 : 45)} />;
    })}
  </svg>
);

/** Five-petal doodle flower */
export const Flower = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)} aria-hidden>
    {Array.from({ length: 5 }).map((_, i) => <ellipse key={i} cx="50" cy="27" rx="15" ry="23" transform={`rotate(${i * 72} 50 50)`} />)}
    <circle cx="50" cy="50" r="11" className="fill-background" />
  </svg>
);

/** Four-point sparkle */
export const Sparkle = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden>
    <path d="M12 0c.8 6.6 4.4 10.4 12 12-7.6 1.6-11.2 5.4-12 12-.8-6.6-4.4-10.4-12-12C7.6 10.4 11.2 6.6 12 0z" />
  </svg>
);

/** Gentle floating wrapper for decorations; still for reduced motion */
export const Float = ({ children, className, delay = 0, spin = false }: { children: React.ReactNode; className?: string; delay?: number; spin?: boolean }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      animate={reduced ? undefined : spin ? { rotate: 360 } : { y: [0, -10, 0], rotate: [0, 6, 0] }}
      transition={spin ? { duration: 40, repeat: Infinity, ease: "linear" } : { duration: 6, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {children}
    </motion.div>
  );
};

/** Eight-petal daisy — second flower voice, distinct from the five-petal Flower */
export const Daisy = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)} aria-hidden>
    {Array.from({ length: 8 }).map((_, i) => <ellipse key={i} cx="50" cy="24" rx="9" ry="21" transform={`rotate(${i * 45} 50 50)`} />)}
    <circle cx="50" cy="50" r="10" className="fill-background" />
  </svg>
);

/** Clothes hanger — kidswear shop sign */
export const Hanger = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-none stroke-current", className)} aria-hidden strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M50 32v-6a8 8 0 1 1 8 8" />
    <path d="M50 36 16 64a6 6 0 0 0 4 11h60a6 6 0 0 0 4-11L50 36Z" />
  </svg>
);

/** Little tee — the thing we actually sell */
export const Tee = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)} aria-hidden>
    <path d="M34 14h32l18 13-9 14-9-5v46a7 7 0 0 1-7 7H41a7 7 0 0 1-7-7V36l-9 5-9-14 18-13Z" />
    <circle cx="45" cy="25" r="2.6" className="fill-background" />
    <circle cx="55" cy="25" r="2.6" className="fill-background" />
  </svg>
);

/** Ribbon bow */
export const Bow = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)} aria-hidden>
    <path d="M50 50 22 32a11 11 0 1 0 0 36l28-18Z" />
    <path d="M50 50 78 32a11 11 0 1 1 0 36L50 50Z" />
    <circle cx="50" cy="50" r="9" className="fill-background" />
  </svg>
);

export const Heart = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden>
    <path d="M12 21S4 15.8 4 10a4.6 4.6 0 0 1 8-3 4.6 4.6 0 0 1 8 3c0 5.8-8 11-8 11z" />
  </svg>
);

export const Star = ({ className }: P) => (
  <svg viewBox="0 0 24 24" className={cn("fill-current", className)} aria-hidden>
    <path d="M12 1.8l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 16.7l-6.1 3.5 1.4-6.8L2.2 8.8l6.9-.7z" />
  </svg>
);

export const Butterfly = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-current", className)} aria-hidden>
    <ellipse cx="31" cy="37" rx="17" ry="21" transform="rotate(-18 31 37)" />
    <ellipse cx="69" cy="37" rx="17" ry="21" transform="rotate(18 69 37)" />
    <ellipse cx="36" cy="68" rx="12" ry="15" transform="rotate(14 36 68)" />
    <ellipse cx="64" cy="68" rx="12" ry="15" transform="rotate(-14 64 68)" />
    <rect x="47" y="26" width="6" height="48" rx="3" className="fill-background" />
  </svg>
);

export const Cloud = ({ className }: P) => (
  <svg viewBox="0 0 100 62" className={cn("fill-current", className)} aria-hidden>
    <path d="M26 58h50a15 15 0 0 0 3-29 21 21 0 0 0-39-7 14 14 0 0 0-14 36Z" />
  </svg>
);

/** Sticker-style campaign label */
export const Sticker = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-soft", className)}>{children}</span>
);

/** Faceted gem — little jewel accent */
export const Diamond = ({ className }: P) => (
  <svg viewBox="0 0 100 100" className={cn("fill-none stroke-current", className)} aria-hidden strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M30 20h40l22 24-42 46-42-46 22-24Z" />
    <path d="M10 44h80M30 20l12 24M70 20 58 44M42 44 50 90M58 44 50 90" />
  </svg>
);
