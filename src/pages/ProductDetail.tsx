import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, Truck, RotateCcw, Ruler, ZoomIn } from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { ProductCard, WishButton } from "@/components/ProductCard";
import { OptionPickers } from "@/components/QuickAdd";
import { SizeChart } from "@/components/SizeChart";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { categoryName, discountPct, formatINR, getProduct, products } from "@/data/catalog";
import { useCart } from "@/hooks/useCart";
import { useRecent } from "@/hooks/useWishlist";
import NotFound from "./NotFound";

const PinCheck = () => {
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState("");
  const check = () => {
    if (!/^[1-9][0-9]{5}$/.test(pin)) return setMsg("Please enter a valid 6-digit Indian PIN code.");
    setMsg("Delivery estimates by PIN code will be available once shipping partners are connected. Typical delivery within India is 4–8 working days.");
  };
  return (
    <div className="rounded-2xl bg-muted p-4">
      <label htmlFor="pin" className="mb-2 flex items-center gap-2 text-sm font-bold"><Truck className="h-4 w-4" />Check delivery</label>
      <div className="flex gap-2">
        <input id="pin" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="Enter PIN code" className="h-10 flex-1 rounded-full border bg-card px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <Button variant="outline" className="rounded-full" onClick={check}>Check</Button>
      </div>
      {msg && <p className="mt-2 text-xs text-muted-foreground" role="status">{msg}</p>}
    </div>
  );
};

const ProductDetail = () => {
  const { slug = "" } = useParams();
  const p = getProduct(slug);
  const nav = useNavigate();
  const add = useCart((s) => s.add);
  const { ids: recentIds, push } = useRecent();
  const [img, setImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [qty, setQty] = useState(1);
  const [tried, setTried] = useState(false);
  const [chart, setChart] = useState(false);

  useEffect(() => {
    if (!p) return;
    push(p.id); setImg(0); setSize(""); setQty(1); setTried(false);
    setColour(p.colours.length === 1 ? p.colours[0].name : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.id]);

  if (!p) return <NotFound />;
  const off = discountPct(p);
  const max = size ? p.stock[size] : 10;
  const ready = !!size && !!colour;
  const sizes = Object.keys(p.stock);
  const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.festive.some((f) => p.festive.includes(f)))).slice(0, 4);
  const recent = recentIds.filter((id) => id !== p.id).map((id) => products.find((x) => x.id === id)!).filter(Boolean).slice(0, 4);

  const doAdd = (buyNow = false) => {
    setTried(true);
    if (!ready) return toast.error(!colour ? "Please choose a colour" : "Please choose a size");
    add(p, size, colour, qty);
    if (buyNow) return nav("/cart");
    toast.success("Added to bag", { description: `${p.name} · ${size} · ${colour}`, action: { label: "View bag", onClick: () => nav("/cart") } });
  };

  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, brand: "KIDIA", offers: { "@type": "Offer", priceCurrency: "INR", price: p.price, availability: "https://schema.org/InStock" } };

  return (
    <Layout title={p.name} description={p.description}>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      <div className="container-kidia py-8">
        <nav className="mb-6 text-xs text-muted-foreground"><Link to="/" className="hover:text-primary">Home</Link> / <Link to={`/shop?category=${p.category}`} className="hover:text-primary">{categoryName(p.category)}</Link> / {p.name}</nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col-reverse gap-4 md:flex-row">
            <div className="flex gap-3 md:flex-col">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setImg(i)} aria-label={`View image ${i + 1}`} className={`h-24 w-20 overflow-hidden rounded-xl border-2 ${img === i ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
            <button onClick={() => setZoom(true)} className="relative flex-1 overflow-hidden rounded-3xl bg-muted" aria-label="Enlarge image">
              <AnimatePresence mode="wait">
                <motion.img key={img} src={p.images[img]} alt={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="aspect-[3/4] w-full object-cover" />
              </AnimatePresence>
              <span className="absolute bottom-4 right-4 rounded-full bg-card/90 p-2"><ZoomIn className="h-4 w-4" /></span>
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2 flex gap-2">
                {p.isNew && <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold">New Arrival</span>}
                {p.bestseller && <span className="rounded-full bg-butter px-3 py-1 text-xs font-bold">Bestseller</span>}
              </div>
              <h1 className="font-serif text-3xl md:text-4xl">{p.name}</h1>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold">{formatINR(p.price)}</span>
                {off > 0 && <><span className="text-muted-foreground line-through">MRP {formatINR(p.mrp!)}</span><span className="font-bold text-accent">{off}% off</span></>}
              </div>
              <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
            </div>
            <p className="text-foreground/80">{p.description}</p>
            <p className="text-sm"><span className="font-bold">Recommended age:</span> {sizes[0].replace("Y", "")} to {sizes[sizes.length - 1]} years</p>

            <OptionPickers p={p} size={size} setSize={setSize} colour={colour} setColour={setColour} />
            {tried && !ready && <p className="text-sm font-semibold text-destructive" role="alert">Please select {!colour ? "a colour" : "a size"} to continue.</p>}
            <button onClick={() => setChart(true)} className="flex items-center gap-2 text-sm font-bold text-primary underline"><Ruler className="h-4 w-4" />Size chart</button>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-full border" aria-label="Quantity">
                <button className="p-3 disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty(qty - 1)} aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-bold" aria-live="polite">{qty}</span>
                <button className="p-3 disabled:opacity-30" disabled={qty >= Math.min(max, 10)} onClick={() => setQty(qty + 1)} aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
              </div>
              <Button className="h-12 flex-1 rounded-full" onClick={() => doAdd()}>Add to Bag</Button>
              <WishButton p={p} className="h-12 w-12 flex items-center justify-center border" />
            </div>
            <Button variant="outline" className="h-12 w-full rounded-full border-primary text-primary" onClick={() => doAdd(true)}>Buy Now</Button>

            <PinCheck />

            <Accordion type="multiple" defaultValue={["fabric"]}>
              <AccordionItem value="fabric"><AccordionTrigger>Fabric & care</AccordionTrigger>
                <AccordionContent><p className="mb-2">{p.fabric}</p><ul className="list-disc pl-5">{p.care.map((c) => <li key={c}>{c}</li>)}</ul></AccordionContent></AccordionItem>
              <AccordionItem value="sizes"><AccordionTrigger>Available sizes</AccordionTrigger>
                <AccordionContent>{sizes.map((s) => `${s}${p.stock[s] === 0 ? " (sold out)" : ""}`).join(" · ")}. Please check garment measurements in the size chart before ordering.</AccordionContent></AccordionItem>
              <AccordionItem value="returns"><AccordionTrigger><span className="flex items-center gap-2"><RotateCcw className="h-4 w-4" />Returns & exchanges</span></AccordionTrigger>
                <AccordionContent>Our returns and exchange policy will be published before launch. Unworn items with original tags will be eligible for exchange.</AccordionContent></AccordionItem>
              <AccordionItem value="reviews"><AccordionTrigger>Reviews</AccordionTrigger>
                <AccordionContent>No reviews yet. Reviews from verified buyers will appear here.</AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-24"><h2 className="section-title mb-8">You may also like</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{related.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>
        )}
        {recent.length > 0 && (
          <section className="mt-20"><h2 className="section-title mb-8">Recently viewed</h2>
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-4">{recent.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>
        )}
      </div>

      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-3xl p-2"><DialogTitle className="sr-only">{p.name}</DialogTitle><img src={p.images[img]} alt={p.name} className="max-h-[85vh] w-full rounded-xl object-contain" /></DialogContent>
      </Dialog>
      <Dialog open={chart} onOpenChange={setChart}>
        <DialogContent className="max-w-2xl"><DialogTitle className="font-serif text-2xl">Size chart</DialogTitle><SizeChart /><p className="text-xs text-muted-foreground">Measurements are KIDIA brand guidelines in cm and can vary slightly by style. Please check garment measurements before ordering.</p></DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductDetail;
