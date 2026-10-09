import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sunburst } from "./Motifs";

export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" aria-label="KIDIA home" className={cn("inline-flex items-baseline font-display text-2xl md:text-3xl font-extrabold tracking-tight text-primary", className)}>
    KID
    <span className="relative">
      I
      <Sunburst className="absolute -top-3.5 left-1/2 h-4 w-4 -translate-x-1/2 text-marigold" />
    </span>
    A
  </Link>
);
