import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";
import { Header } from "./Header";
import { Footer } from "./Footer";

export const Layout = ({ children, title, description }: { children: ReactNode; title?: string; description?: string }) => {
  useEffect(() => {
    if (!document.querySelector('link[data-kidia-fonts]')) {
      const fonts = document.createElement('link');
      fonts.rel = 'stylesheet';
      fonts.dataset.kidiaFonts = 'true';
      fonts.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700;6..12,800&display=swap';
      document.head.appendChild(fonts);
    }
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
