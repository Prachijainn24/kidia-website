import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import logoWide from "@/assets/logo-blossom-wide.png";

export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" aria-label="KIDIA home" className={cn("inline-flex items-center", className)}>
    <img src={logoWide} alt="KIDIA" width={1038} height={295} loading="eager" decoding="async" className="h-8 w-auto md:h-9" />
  </Link>
);
