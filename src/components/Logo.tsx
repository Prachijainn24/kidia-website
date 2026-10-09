import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" aria-label="KIDIA home" className={cn("inline-flex items-baseline font-serif text-2xl md:text-3xl font-semibold tracking-tight text-primary", className)}>
    KID
    <span className="relative">
      I
      <svg viewBox="0 0 24 24" className="absolute -top-2.5 left-1/2 h-3 w-3 -translate-x-1/2 fill-marigold" aria-hidden>
        <path d="M12 0l2.6 8.4L24 12l-9.4 3.6L12 24l-2.6-8.4L0 12l9.4-3.6z" />
      </svg>
    </span>
    A
  </Link>
);
