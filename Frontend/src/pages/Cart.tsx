import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/data/catalog";
import { lineProduct, useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";

const Cart = () => {
  const { lines, setQty, remove } = useCart();
  const wish = useWishlist();
  const rows = lines.map((l) => ({ l, p: lineProduct(l) })).filter((r) => r.p);
  const subtotal = rows.reduce((n, { l, p }) => n + p.price * l.quantity, 0);
  const mrpTotal = rows.reduce((n, { l, p }) => n + (p.mrp ?? p.price) * l.quantity, 0);
  const savings = mrpTotal - subtotal;

  if (rows.length === 0)
    return (
      <Layout title="Your Bag">
        <div className="container-kidia py-24 text-center">
          <div className="mx-auto mb-6 inline-flex rounded-full bg-peach p-6"><ShoppingBag className="h-10 w-10 text-primary" /></div>
          <h1 className="font-serif text-4xl">Your bag is empty</h1>
          <p className="mt-2 text-muted-foreground">Find something lovely for your little one.</p>
          <Button asChild className="mt-8 h-12 rounded-full px-10"><Link to="/shop">Continue Shopping</Link></Button>
        </div>
      </Layout>
    );

  return (
    <Layout title="Your Bag">
      <div className="container-kidia py-12">
        <h1 className="mb-8 font-serif text-4xl">Your Bag</h1>
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <ul className="divide-y rounded-3xl border bg-card">
            {rows.map(({ l, p }) => (
              <li key={l.key} className="flex gap-4 p-4 md:p-6">
                <Link to={`/product/${p.slug}`}><img src={p.images[0]} alt={p.name} className="h-32 w-24 rounded-xl object-cover" /></Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <Link to={`/product/${p.slug}`} className="font-semibold hover:text-primary">{p.name}</Link>
                    <span className="font-bold">{formatINR(p.price * l.quantity)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Size {l.size} · {l.colour}</p>
                  <p className="text-sm text-muted-foreground">{formatINR(p.price)} each</p>
                  <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
                    <div className="flex items-center rounded-full border">
                      <button className="p-2" onClick={() => setQty(l.key, l.quantity - 1)} aria-label="Decrease quantity"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-bold">{l.quantity}</span>
                      <button className="p-2 disabled:opacity-30" disabled={l.quantity >= p.stock[l.size]} onClick={() => setQty(l.key, l.quantity + 1)} aria-label="Increase quantity"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary" onClick={() => { if (!wish.ids.includes(p.id)) wish.toggle(p.id); remove(l.key); toast("Moved to wishlist"); }}><Heart className="h-3.5 w-3.5" />Move to wishlist</button>
                    <button className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive" onClick={() => { remove(l.key); toast("Removed from bag"); }}><Trash2 className="h-3.5 w-3.5" />Remove</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit space-y-4 rounded-3xl bg-secondary p-6 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt>Total MRP</dt><dd>{formatINR(mrpTotal)}</dd></div>
              {savings > 0 && <div className="flex justify-between text-success"><dt>Discount on MRP</dt><dd>−{formatINR(savings)}</dd></div>}
              <div className="flex justify-between"><dt>Shipping</dt><dd className="text-muted-foreground">Calculated at checkout</dd></div>
              <div className="flex justify-between border-t pt-3 text-base font-bold"><dt>Estimated total</dt><dd>{formatINR(subtotal)}</dd></div>
            </dl>
            <div className="rounded-2xl bg-card p-4 text-xs text-muted-foreground">
              Coupons and secure checkout are being set up and will be available soon. Your bag is saved on this device.
            </div>
            <Button disabled className="h-12 w-full rounded-full">Checkout — coming soon</Button>
            <Button asChild variant="ghost" className="w-full rounded-full"><Link to="/shop">Continue Shopping</Link></Button>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
