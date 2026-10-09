import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Collection } from "@/data/products";

interface CollectionCardProps {
  collection: Collection;
  index?: number;
  variant?: "default" | "wide" | "tall";
}

export const CollectionCard = ({ collection, index = 0, variant = "default" }: CollectionCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link
        to={`/products?collection=${collection.slug}`}
        className="group block relative"
      >
        <div
          className={`relative overflow-hidden bg-muted/50 ${
            variant === "wide" ? "aspect-[16/9]" :
            variant === "tall" ? "aspect-[2/3]" :
            "aspect-[3/4]"
          }`}
        >
          {/* Image with zoom on hover */}
          <img
            src={collection.image}
            alt={collection.name}
            className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110"
          />

          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
          <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-700" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-8">
            {/* Collection label */}
            <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-white/60 mb-2 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
              Collection
            </p>

            {/* Title */}
            <h3 className="font-serif text-2xl md:text-3xl text-white mb-2 transform group-hover:-translate-y-1 transition-transform duration-500">
              {collection.name}
            </h3>

            {/* Description with reveal */}
            <p className="text-sm text-white/70 leading-relaxed max-w-xs transform translate-y-1 group-hover:translate-y-0 transition-transform duration-500 delay-75">
              {collection.description}
            </p>

            {/* Arrow indicator */}
            <div className="flex items-center gap-2 mt-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 delay-150">
              <span className="text-xs font-medium tracking-[0.15em] uppercase text-white/90">
                Explore
              </span>
              <ArrowRight className="w-4 h-4 text-white/90 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>

          {/* Top border accent on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/40 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
        </div>
      </Link>
    </motion.article>
  );
};
