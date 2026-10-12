import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/context/ProductsContext";
import { useWishlist } from "@/hooks/useWishlist";

const Wishlist = () => {
  const { products } = useProducts();
  const ids = useWishlist((s) => s.ids);
  const list = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean) as typeof products;
  return (
    <Layout title="Wishlist">
      <div className="container-kidia py-12">
        <h1 className="font-serif text-4xl">Your Wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use Quick Add on any item to move it to your bag in the right size.</p>
        {list.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-6 inline-flex rounded-full bg-blush p-6"><Heart className="h-10 w-10 text-primary" /></div>
            <h2 className="font-serif text-2xl">Nothing saved yet</h2>
            <p className="mt-2 text-muted-foreground">Tap the heart on any style to save it here.</p>
            <Button asChild className="mt-8 rounded-full px-10"><Link to="/collections/new-arrivals">Discover New Arrivals</Link></Button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        )}
      </div>
    </Layout>
  );
};
export default Wishlist;
