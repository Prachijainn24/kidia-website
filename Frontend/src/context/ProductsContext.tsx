import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Product, products as fallbackProducts } from "@/data/catalog";

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  refreshProducts: () => Promise<void>;
  getProduct: (slugOrId: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType>({
  products: fallbackProducts,
  loading: false,
  refreshProducts: async () => {},
  getProduct: () => undefined,
});

// Module-level in-memory cache for synchronous non-hook lookups (e.g., cart operations)
let cachedProducts: Product[] = [...fallbackProducts];

export const getLiveProducts = (): Product[] => cachedProducts;
export const getLiveProduct = (idOrSlug: string): Product | undefined => {
  return cachedProducts.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
};

export function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    slug: row.slug || row.id,
    name: row.name || "Untitled Piece",
    gender: (row.gender as "boys" | "girls" | "unisex") || "unisex",
    category: row.category || "essentials",
    occasions: Array.isArray(row.occasions) ? row.occasions : [],
    festive: Array.isArray(row.festive) ? row.festive : [],
    price: Number(row.price) || 0,
    mrp: row.mrp ? Number(row.mrp) : undefined,
    colours: Array.isArray(row.colours) ? row.colours : [{ name: "Standard", hex: "#E2E8F0" }],
    stock: row.stock && typeof row.stock === "object" ? row.stock : { "2-3Y": 5, "3-4Y": 5 },
    images: Array.isArray(row.images) && row.images.length > 0 ? row.images : ["/placeholder.svg"],
    isNew: Boolean(row.is_new),
    bestseller: Boolean(row.bestseller),
    fabric: row.fabric || "Pure Cotton",
    care: Array.isArray(row.care) ? row.care : ["Gentle hand wash recommended"],
    description: row.description || "",
    addedAt: row.added_at ? new Date(row.added_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  };
}

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("added_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapDbProduct);
        setProducts(mapped);
        cachedProducts = mapped;
      }
    } catch (err) {
      console.warn("Failed to fetch products from Supabase, using local catalog", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();

    // Subscribe to realtime changes in products table
    const channel = supabase
      .channel("realtime-customer-products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchProducts]);

  const getProduct = useCallback(
    (slugOrId: string) => {
      const target = (slugOrId || "").trim().toLowerCase();
      return products.find(
        (p) =>
          p.slug === slugOrId ||
          p.id === slugOrId ||
          p.slug?.toLowerCase() === target ||
          p.id?.toLowerCase() === target
      );
    },
    [products]
  );

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        refreshProducts: fetchProducts,
        getProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => useContext(ProductsContext);
