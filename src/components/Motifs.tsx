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

/** Sticker-style campaign label */
export const Sticker = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest shadow-soft", className)}>{children}</span>
);
