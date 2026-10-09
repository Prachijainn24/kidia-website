import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children, title, description }: { children: ReactNode; title?: string; description?: string }) => {
  useEffect(() => {
    document.title = title ? `${title} | KIDIA` : "KIDIA — Little Styles. Big Smiles. | Kidswear for ages 1–12";
    if (description) document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-2">Skip to content</a>
      <Header />
      <motion.main id="main" className="flex-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};
