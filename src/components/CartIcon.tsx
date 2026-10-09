import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";

export const CartIcon = () => {
  const itemCount = useCart((state) => state.getItemCount());

  return (
    <Link
      to="/cart"
      className="relative p-2 hover:bg-accent transition-colors duration-300 group"
    >
      <ShoppingBag className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full flex items-center justify-center"
          >
            {itemCount > 9 ? "9+" : itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
};
