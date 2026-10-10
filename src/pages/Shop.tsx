import { useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, SearchX } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AGE_GROUPS, ALL_SIZES, CATEGORIES, COLLECTIONS, OCCASIONS, Product, categoryName, discountPct, inStock, products, sizeStartAge } from "@/data/catalog";
import NotFound from "./NotFound";

const PAGE = 6;
const PRICES = [{ v: "0-999", l: "Under ₹1,000" }, { v: "1000-1999", l: "₹1,000 – ₹1,999" }, { v: "2000-2999", l: "₹2,000 – ₹2,999" }, { v: "3000-99999", l: "₹3,000 & above" }];
const COLOURS = Array.from(new Map(products.flatMap((p) => p.colours).map((c) => [c.name, c])).values());
const GENDERS = [{ v: "boys", l: "Boys" }, { v: "girls", l: "Girls" }];
const GENDER_LABEL: Record<string, string> = { boys: "Boys", girls: "Girls", unisex: "Unisex" };

type Key = "category" | "gender" | "age" | "size" | "colour" | "occasion" | "price" | "flags";

const Shop = () => {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  const [mobileFilters, setMobileFilters] = useState(false);
  const collection = slug ? COLLECTIONS[slug] : undefined;

  const get = (k: Key) => params.get(k)?.split(",").filter(Boolean) ?? [];
  const q = params.get("q") ?? "";
  const sort = params.get("sort") ?? "recommended";
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  const goPage = (n: number) => {
    const p = new URLSearchParams(params);
    if (n <= 1) p.delete("page"); else p.set("page", String(n));
    setParams(p, { replace: true });
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggle = (k: Key, v: string) => {
    const cur = get(k);
    const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    const p = new URLSearchParams(params);
    next.length ? p.set(k, next.join(",")) : p.delete(k);
    p.delete("page");
    setParams(p, { replace: true });
  };
  const setOne = (k: string, v: string) => { const p = new URLSearchParams(params); v ? p.set(k, v) : p.delete(k); p.delete("page"); setParams(p, { replace: true }); };
  const clearAll = () => setParams(q ? { q } : {}, { replace: true });

  const results = useMemo(() => {
    let list: Product[] = collection ? products.filter(collection.filter) : products;
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((p) => `${p.name} ${categoryName(p.category)} ${p.occasions.join(" ")} ${p.gender} ${p.festive.join(" ")} ${p.description}`.toLowerCase().includes(term));
    const f = { category: get("category"), gender: get("gender"), age: get("age"), size: get("size"), colour: get("colour"), occasion: get("occasion"), price: get("price"), flags: get("flags") };
    list = list.filter((p) => {
      const sizes = Object.keys(p.stock);
      if (f.category.length && !f.category.includes(p.category)) return false;
      if (f.gender.length && !f.gender.includes(p.gender)) return false;
      if (f.age.length && !f.age.some((a) => { const g = AGE_GROUPS.find((x) => x.slug === a)!; return sizes.some((s) => p.stock[s] > 0 && sizeStartAge(s) >= g.min && sizeStartAge(s) <= g.max); })) return false;
      if (f.size.length && !f.size.some((s) => (p.stock[s] ?? 0) > 0)) return false;
      if (f.colour.length && !p.colours.some((c) => f.colour.includes(c.name))) return false;
      if (f.occasion.length && !p.occasions.some((o) => f.occasion.includes(o))) return false;
      if (f.price.length && !f.price.some((r) => { const [a, b] = r.split("-").map(Number); return p.price >= a && p.price <= b; })) return false;
      if (f.flags.includes("instock") && !inStock(p)) return false;
      if (f.flags.includes("discount") && discountPct(p) === 0) return false;
      if (f.flags.includes("new") && !p.isNew) return false;
      if (f.flags.includes("bestseller") && !p.bestseller) return false;
      return true;
    });
    const s = [...list];
    if (sort === "newest") s.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    if (sort === "price-asc") s.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") s.sort((a, b) => b.price - a.price);
    if (sort === "recommended") s.sort((a, b) => Number(!!b.bestseller) + Number(!!b.isNew) - (Number(!!a.bestseller) + Number(!!a.isNew)));
    return s;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, collection]);

  if (slug && !collection) return <NotFound />;

  const pages = Math.max(1, Math.ceil(results.length / PAGE));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * PAGE;
  const shown = results.slice(start, start + PAGE);
  const pageItems: (number | "…")[] = [];
  Array.from({ length: pages }, (_, i) => i + 1)
    .filter((n) => pages <= 7 || n === 1 || n === pages || Math.abs(n - cur) <= 1)
    .forEach((n, i, arr) => { if (i && n - arr[i - 1] > 1) pageItems.push("…"); pageItems.push(n); });

  const chipLabel = (k: Key, v: string) =>
    k === "category" ? categoryName(v) : k === "gender" ? GENDER_LABEL[v] : k === "age" ? AGE_GROUPS.find((a) => a.slug === v)?.label : k === "price" ? PRICES.find((p) => p.v === v)?.l : k === "flags" ? { instock: "In stock", discount: "On discount", new: "New", bestseller: "Bestseller" }[v] : v;
  const chips = (["category", "gender", "age", "size", "colour", "occasion", "price", "flags"] as Key[]).flatMap((k) => get(k).map((v) => ({ k, v })));

  const Group = ({ title, k, opts, children }: { title: string; k?: Key; opts?: { v: string; l: string; swatch?: string }[]; children?: React.ReactNode }) => (
    <AccordionItem value={title} className="border-b border-primary/10">
      <AccordionTrigger className="py-4 text-sm font-bold hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="pb-5">
        {children ?? (
          <div className="space-y-2">
            {opts!.map((o) => (
              <label key={o.v} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={get(k!).includes(o.v)} onCheckedChange={() => toggle(k!, o.v)} />
                {o.swatch && <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: o.swatch }} />}
                {o.l}
              </label>
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );

  const filters = (
    <Accordion type="multiple" defaultValue={["Size", "Price", "Category", "Colour", "Occasion"]} className="-mt-2">
      <Group title="Size">
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((s) => (
            <button key={s} onClick={() => toggle("size", s)} aria-pressed={get("size").includes(s)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${get("size").includes(s) ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>{s}</button>
          ))}
        </div>
      </Group>
      <Group title="Price" k="price" opts={PRICES.map((p) => ({ v: p.v, l: p.l }))} />
      <Group title="Category" k="category" opts={CATEGORIES.filter((c) => !["boys", "girls", "festive"].includes(c.slug)).map((c) => ({ v: c.slug, l: c.name }))} />
      <Group title="Colour" k="colour" opts={COLOURS.map((c) => ({ v: c.name, l: c.name, swatch: c.hex }))} />
      <Group title="Occasion" k="occasion" opts={OCCASIONS.map((o) => ({ v: o, l: o }))} />
    </Accordion>
  );

  const title = q ? `Results for "${q}"` : collection?.title ?? "Shop All";

  // Breadcrumb path, e.g. Home / Boys' Clothing / Boys / Ethnic Wear
  const crumbs: { label: string; to?: string }[] = [{ label: "Home", to: "/" }];
  if (collection) {
    crumbs.push(
      slug === "boys" || slug === "girls"
        ? { label: slug === "boys" ? "Boys' Clothing" : "Girls' Clothing", to: `/shop?gender=${slug}` }
        : slug === "diwali" || slug === "navratri"
          ? { label: "Ethnic & Festive", to: "/collections/ethnic-festive" }
          : { label: "Collections", to: "/shop" }
    );
    crumbs.push({ label: collection.title });
    if (get("category").length === 1) crumbs.push({ label: categoryName(get("category")[0]) });
  } else {
    crumbs.push({ label: "Shop All", to: "/shop" });
    if (get("category").length === 1) crumbs.push({ label: categoryName(get("category")[0]) });
    else if (get("gender").length === 1) crumbs.push({ label: GENDER_LABEL[get("gender")[0]] ?? "Shop All" });
    else if (q) crumbs.push({ label: `Search: ${q}` });
  }

  const Crumbs = ({ tone = "cream" }: { tone?: "cream" | "overlay" }) => (
    <nav aria-label="Breadcrumb" className={tone === "overlay" ? "text-background/80" : "text-muted-foreground"}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={c.label + i} className="flex items-center gap-1.5">
              {i > 0 && <span aria-hidden>/</span>}
              {last || !c.to ? (
                <span aria-current={last ? "page" : undefined} className={last ? "font-semibold text-primary" : undefined}>{c.label}</span>
              ) : (
                <Link to={c.to} className="transition-colors hover:text-primary hover:underline">{c.label}</Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <Layout title={collection?.title ?? (q ? "Search" : "Shop All")} description={collection?.intro}>
      {collection?.banner ? (
        <section className="relative h-64 overflow-hidden md:h-80">
          <img src={collection.banner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-foreground/50" />
          <div className="container-kidia relative flex h-full flex-col justify-end pb-10 text-background">
            <Crumbs tone="overlay" />
            <h1 className="mt-2 font-serif text-3xl md:text-5xl">{collection.title}</h1>
            <p className="mt-2 opacity-90">{collection.intro}</p>
          </div>
        </section>
      ) : (
        <section className="bg-secondary py-12">
          <div className="container-kidia">
            <Crumbs />
            <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
            {collection && <p className="mt-2 text-muted-foreground">{collection.intro}</p>}
          </div>
        </section>
      )}

      <div className="container-kidia py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">{results.length} {results.length === 1 ? "product" : "products"}</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="rounded-full lg:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal className="mr-2 h-4 w-4" />Filters{chips.length ? ` (${chips.length})` : ""}</Button>
            <Select value={sort} onValueChange={(v) => setOne("sort", v === "recommended" ? "" : v)}>
              <SelectTrigger className="w-48 rounded-full" aria-label="Sort products"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {(chips.length > 0 || q) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {q && <button onClick={() => setOne("q", "")} className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">Search: {q}<X className="h-3 w-3" /></button>}
            {chips.map(({ k, v }) => (
              <button key={k + v} onClick={() => toggle(k, v)} className="flex items-center gap-1 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary">{chipLabel(k, v)}<X className="h-3 w-3" /></button>
            ))}
            {chips.length > 0 && <button onClick={clearAll} className="text-xs font-bold underline">Clear all</button>}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">{filters}</aside>
          <div>
            {results.length === 0 ? (
              <div className="rounded-3xl bg-muted py-20 text-center">
                <SearchX className="mx-auto h-10 w-10 text-muted-foreground" />
                <h2 className="mt-4 font-serif text-2xl">No styles match yet</h2>
                <p className="mt-2 text-sm text-muted-foreground">Try removing a filter or searching for "kurta", "dress" or "pyjama".</p>
                <Button className="mt-6 rounded-full" onClick={() => setParams({}, { replace: true })}>Clear search & filters</Button>
              </div>
            ) : (
              <>
                <div ref={gridRef} className="grid scroll-mt-28 grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                  {shown.map((p) => <ProductCard key={p.id} p={p} />)}
                </div>
                {pages > 1 && (
                  <>
                    <nav className="mt-12 flex flex-wrap items-center justify-center gap-2" aria-label="Product pages">
                      <button onClick={() => goPage(cur - 1)} disabled={cur === 1} aria-label="Previous page" className="grid h-10 w-10 place-items-center rounded-full border text-primary transition hover:border-primary disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
                      {pageItems.map((n, i) => n === "…" ? (
                        <span key={`gap${i}`} className="px-1 text-sm text-muted-foreground">…</span>
                      ) : (
                        <button key={n} onClick={() => goPage(n)} aria-current={n === cur ? "page" : undefined} className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition ${n === cur ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"}`}>{n}</button>
                      ))}
                      <button onClick={() => goPage(cur + 1)} disabled={cur === pages} aria-label="Next page" className="grid h-10 w-10 place-items-center rounded-full border text-primary transition hover:border-primary disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
                    </nav>
                    <p className="mt-4 text-center text-xs text-muted-foreground">Showing {start + 1}–{start + shown.length} of {results.length}</p>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Sheet open={mobileFilters} onOpenChange={setMobileFilters}>
        <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
          <SheetTitle className="font-serif">Filters</SheetTitle>
          {filters}
          <div className="sticky bottom-0 flex gap-2 bg-background py-4">
            <Button variant="outline" className="flex-1 rounded-full" onClick={clearAll}>Clear</Button>
            <Button className="flex-1 rounded-full" onClick={() => setMobileFilters(false)}>Show {results.length}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </Layout>
  );
};

export default Shop;
