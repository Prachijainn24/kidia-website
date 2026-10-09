// Sample catalogue (development data). Will move to Lovable Cloud in phase 2.
import kurta from "@/assets/p-kurta.jpg";
import dress from "@/assets/p-dress.jpg";
import coord from "@/assets/p-coord.jpg";
import night from "@/assets/p-night.jpg";
import anarkali from "@/assets/p-anarkali.jpg";
import tee from "@/assets/p-tee.jpg";
import dhoti from "@/assets/p-dhoti.jpg";
import frock from "@/assets/p-frock.jpg";
import diwali from "@/assets/diwali.jpg";
import navratri from "@/assets/navratri.jpg";
import hero from "@/assets/hero.jpg";

export const images = { kurta, dress, coord, night, anarkali, tee, dhoti, frock, diwali, navratri, hero };

export type Gender = "boys" | "girls" | "unisex";
export interface Colour { name: string; hex: string }
export interface Product {
  id: string;
  slug: string;
  name: string;
  gender: Gender;
  category: string;
  occasions: string[];
  festive: ("diwali" | "navratri")[];
  price: number;
  mrp?: number;
  colours: Colour[];
  stock: Record<string, number>; // size -> units
  images: string[];
  isNew?: boolean;
  bestseller?: boolean;
  fabric: string;
  care: string[];
  description: string;
  addedAt: string;
}

export const ALL_SIZES = ["1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y", "10-11Y", "11-12Y"];
export const sizeStartAge = (s: string) => parseInt(s, 10);

export const AGE_GROUPS = [
  { slug: "1-2", label: "1–2 Years", min: 1, max: 2, tone: "bg-blush" },
  { slug: "3-5", label: "3–5 Years", min: 3, max: 5, tone: "bg-butter" },
  { slug: "6-8", label: "6–8 Years", min: 6, max: 8, tone: "bg-mint" },
  { slug: "9-12", label: "9–12 Years", min: 9, max: 11, tone: "bg-lavender" },
];

export const CATEGORIES = [
  { slug: "boys", name: "Boys' Clothing", image: kurta, link: "/collections/boys" },
  { slug: "girls", name: "Girls' Clothing", image: frock, link: "/collections/girls" },
  { slug: "ethnic", name: "Ethnic Wear", image: anarkali, link: "/shop?category=ethnic" },
  { slug: "festive", name: "Festive Collection", image: diwali, link: "/collections/ethnic-festive" },
  { slug: "essentials", name: "Everyday Essentials", image: tee, link: "/shop?category=essentials" },
  { slug: "party", name: "Party & Occasion", image: dress, link: "/shop?category=party" },
  { slug: "nightwear", name: "Nightwear", image: night, link: "/shop?category=nightwear" },
  { slug: "coords", name: "Co-ord Sets", image: coord, link: "/shop?category=coords" },
];

export const OCCASIONS = ["Everyday", "Festive", "Party", "Wedding", "Birthday", "Bedtime"];

const C = {
  ivory: { name: "Ivory", hex: "#F6EEDC" },
  peach: { name: "Peach", hex: "#F6B79A" },
  pink: { name: "Pink", hex: "#F4BFCB" },
  mint: { name: "Mint", hex: "#9FD3B5" },
  lavender: { name: "Lavender", hex: "#C8B6E8" },
  yellow: { name: "Butter Yellow", hex: "#F5DD8B" },
  maroon: { name: "Maroon", hex: "#7A1F2B" },
  blue: { name: "Denim Blue", hex: "#456FA8" },
  magenta: { name: "Magenta", hex: "#C2185B" },
};

const sizes = (from: number, to: number, units = 6, out: string[] = []) =>
  Object.fromEntries(ALL_SIZES.filter((s) => sizeStartAge(s) >= from && sizeStartAge(s) <= to).map((s) => [s, out.includes(s) ? 0 : units]));

const ethnicCare = ["Dry clean recommended", "Store folded in a breathable bag", "Iron on reverse at low heat"];
const cottonCare = ["Machine wash cold, gentle cycle", "Wash with similar colours", "Dry in shade"];

export const products: Product[] = [
  { id: "p1", slug: "peach-nehru-jacket-kurta-set", name: "Peach Nehru Jacket Kurta Set", gender: "boys", category: "ethnic", occasions: ["Festive", "Wedding"], festive: ["diwali"], price: 2499, mrp: 2999, colours: [C.peach, C.ivory], stock: sizes(1, 8), images: [kurta, hero], isNew: true, bestseller: true, fabric: "Cotton-silk blend kurta and jacket, cotton pyjama lining", care: ethnicCare, description: "A three-piece set with a textured peach Nehru jacket over a soft ivory kurta and churidar pyjama — made for pujas, family dinners and wedding photos.", addedAt: "2026-10-01" },
  { id: "p2", slug: "blush-tulle-party-dress", name: "Blush Tulle Party Dress", gender: "girls", category: "party", occasions: ["Party", "Birthday"], festive: [], price: 1899, mrp: 2299, colours: [C.pink], stock: sizes(2, 9, 5, ["5-6Y"]), images: [dress, frock], isNew: true, bestseller: true, fabric: "Layered tulle skirt, satin bodice with cotton lining", care: ["Hand wash cold", "Do not wring", "Dry flat in shade"], description: "Soft layers of blush tulle, a floral appliqué waist and a fully lined bodice so it's twirl-ready without the itch.", addedAt: "2026-09-28" },
  { id: "p3", slug: "mint-resort-co-ord-set", name: "Mint Resort Co-ord Set", gender: "boys", category: "coords", occasions: ["Everyday", "Party"], festive: [], price: 1299, colours: [C.mint, C.ivory], stock: sizes(3, 11), images: [coord, tee], isNew: true, fabric: "Cotton-linen blend", care: cottonCare, description: "A camp-collar shirt with matching elasticated shorts — an easy holiday look that stays breathable on warm days.", addedAt: "2026-09-25" },
  { id: "p4", slug: "lavender-bunny-pyjama-set", name: "Lavender Bunny Pyjama Set", gender: "unisex", category: "nightwear", occasions: ["Bedtime"], festive: [], price: 899, mrp: 1099, colours: [C.lavender, C.pink], stock: sizes(1, 6), images: [night], bestseller: true, fabric: "Cotton", care: cottonCare, description: "Button-down pyjamas printed with tiny bunnies and finished with contrast piping for cosy bedtimes.", addedAt: "2026-08-12" },
  { id: "p5", slug: "butter-yellow-anarkali-set", name: "Butter Yellow Anarkali Set", gender: "girls", category: "ethnic", occasions: ["Festive", "Wedding"], festive: ["diwali"], price: 2799, mrp: 3299, colours: [C.yellow], stock: sizes(5, 11, 4, ["8-9Y"]), images: [anarkali, diwali], isNew: true, bestseller: true, fabric: "Georgette with cotton lining, net dupatta", care: ethnicCare, description: "A flowing anarkali with delicate gota-style embroidery, matching leggings and a sheer bordered dupatta.", addedAt: "2026-10-03" },
  { id: "p6", slug: "striped-tee-denim-shorts", name: "Striped Tee & Denim Shorts", gender: "boys", category: "essentials", occasions: ["Everyday"], festive: [], price: 999, colours: [C.blue, C.ivory], stock: sizes(2, 8), images: [tee, coord], bestseller: true, fabric: "Cotton jersey tee, cotton denim shorts", care: cottonCare, description: "Our everyday favourite — a pocket tee in soft stripes with comfy pull-on denim shorts.", addedAt: "2026-07-20" },
  { id: "p7", slug: "maroon-mirror-dhoti-kurta", name: "Maroon Mirror-Work Dhoti Kurta", gender: "boys", category: "ethnic", occasions: ["Festive"], festive: ["navratri", "diwali"], price: 2199, mrp: 2599, colours: [C.maroon], stock: sizes(4, 11), images: [dhoti, navratri], isNew: true, fabric: "Cotton-silk blend", care: ethnicCare, description: "A rich maroon kurta with mirror-inspired embroidery and a ready-to-wear dhoti — no draping needed.", addedAt: "2026-09-30" },
  { id: "p8", slug: "peach-blossom-frock", name: "Peach Blossom Frock", gender: "girls", category: "essentials", occasions: ["Everyday", "Birthday"], festive: [], price: 1099, colours: [C.peach], stock: sizes(1, 5), images: [frock, dress], isNew: true, fabric: "Cotton", care: cottonCare, description: "Flutter sleeves, a gathered skirt and a sweet floral print for playdates and family brunches.", addedAt: "2026-10-05" },
  { id: "p9", slug: "garba-chaniya-choli", name: "Twirl Garba Chaniya Choli", gender: "girls", category: "ethnic", occasions: ["Festive"], festive: ["navratri"], price: 2999, mrp: 3599, colours: [C.magenta], stock: sizes(3, 11), images: [navratri, anarkali], isNew: true, bestseller: true, fabric: "Cotton with mirror and thread embroidery", care: ethnicCare, description: "A full-flare chaniya choli with mirror details and pom-pom edging, made to spin through every garba night.", addedAt: "2026-09-20" },
  { id: "p10", slug: "kediyu-dhoti-set", name: "Kediyu Dhoti Set", gender: "boys", category: "ethnic", occasions: ["Festive"], festive: ["navratri"], price: 2399, colours: [C.blue, C.ivory], stock: sizes(3, 10), images: [navratri, dhoti], fabric: "Cotton with embroidered panels", care: ethnicCare, description: "A flared kediyu top with colourful embroidery and an ivory dhoti — classic Navratri style for little dancers.", addedAt: "2026-09-18" },
  { id: "p11", slug: "pink-gold-lehenga-set", name: "Pink & Gold Lehenga Set", gender: "girls", category: "ethnic", occasions: ["Festive", "Wedding"], festive: ["diwali"], price: 3499, mrp: 3999, colours: [C.magenta, C.yellow], stock: sizes(4, 11, 3), images: [diwali, anarkali], bestseller: true, fabric: "Silk blend with cotton lining, organza dupatta", care: ethnicCare, description: "A celebration lehenga in rani pink with a golden choli and glowing border — made for Diwali lights.", addedAt: "2026-09-10" },
  { id: "p12", slug: "ivory-festive-trio", name: "Ivory Brocade Kurta Set", gender: "boys", category: "ethnic", occasions: ["Festive", "Wedding"], festive: ["diwali"], price: 2299, colours: [C.ivory, C.mint], stock: sizes(1, 7), images: [hero, kurta], fabric: "Brocade-look jacquard, cotton lining", care: ethnicCare, description: "Subtle woven motifs in ivory or mint with comfortable churidar pyjamas.", addedAt: "2026-08-30" },
  { id: "p13", slug: "mint-everyday-shirt-shorts", name: "Mint Linen-Look Shirt & Shorts", gender: "unisex", category: "coords", occasions: ["Everyday"], festive: [], price: 1199, mrp: 1499, colours: [C.mint], stock: sizes(5, 11, 4), images: [coord], fabric: "Cotton-linen blend", care: cottonCare, description: "Lightweight, breathable and easy to dress up or down.", addedAt: "2026-07-01" },
  { id: "p14", slug: "pink-bedtime-pyjamas", name: "Starry Bedtime Pyjamas", gender: "girls", category: "nightwear", occasions: ["Bedtime"], festive: [], price: 849, colours: [C.pink, C.lavender], stock: sizes(1, 9, 6, ["1-2Y"]), images: [night], fabric: "Cotton", care: cottonCare, description: "Soft long-sleeve pyjamas with piping details, perfect for sleepovers.", addedAt: "2026-06-15" },
  { id: "p15", slug: "birthday-tulle-frock", name: "Birthday Bloom Dress", gender: "girls", category: "party", occasions: ["Party", "Birthday"], festive: [], price: 1699, colours: [C.pink, C.peach], stock: sizes(1, 6), images: [dress], fabric: "Tulle with cotton lining", care: ["Hand wash cold", "Dry flat in shade"], description: "Party-ready layers with a gentle sheen and a comfy lined bodice.", addedAt: "2026-08-05" },
  { id: "p16", slug: "everyday-stripe-tee", name: "Everyday Stripe Tee", gender: "unisex", category: "essentials", occasions: ["Everyday"], festive: [], price: 499, colours: [C.blue, C.mint], stock: sizes(1, 11, 10), images: [tee], fabric: "Cotton jersey", care: cottonCare, description: "A wardrobe staple in soft cotton jersey with a handy chest pocket.", addedAt: "2026-06-01" },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const discountPct = (p: Product) => (p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
export const inStock = (p: Product) => Object.values(p.stock).some((n) => n > 0);
export const formatINR = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
export const categoryName = (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;

// Collection pages
export const COLLECTIONS: Record<string, { title: string; intro: string; filter: (p: Product) => boolean; banner?: string }> = {
  "new-arrivals": { title: "New Arrivals", intro: "Fresh styles, just landed.", filter: (p) => !!p.isNew },
  bestsellers: { title: "Bestsellers", intro: "The pieces parents keep coming back for.", filter: (p) => !!p.bestseller },
  boys: { title: "Boys", intro: "Kurtas, co-ords and everyday comfort.", filter: (p) => p.gender === "boys" || p.gender === "unisex" },
  girls: { title: "Girls", intro: "Frocks, lehengas and twirl-worthy dresses.", filter: (p) => p.gender === "girls" || p.gender === "unisex" },
  "ethnic-festive": { title: "Ethnic & Festive", intro: "Celebration-ready outfits for every festival.", filter: (p) => p.category === "ethnic" || p.festive.length > 0 },
  diwali: { title: "Diwali Edit — Little Lights, Big Looks", intro: "Kurta sets, lehengas and festive layers to glow in.", filter: (p) => p.festive.includes("diwali"), banner: diwali },
  navratri: { title: "Navratri Edit — Twirl Into Festivities", intro: "Chaniya cholis, kediyu sets and garba-ready colour.", filter: (p) => p.festive.includes("navratri"), banner: navratri },
  sale: { title: "Sale", intro: "Selected styles at reduced prices.", filter: (p) => discountPct(p) > 0 },
};

// Brand size chart (configurable brand data, in cm)
export const SIZE_CHART = [
  { size: "1-2Y", height: "80–92", chest: "50–52", waist: "48–50", length: "38" },
  { size: "2-3Y", height: "92–98", chest: "52–54", waist: "50–51", length: "41" },
  { size: "3-4Y", height: "98–104", chest: "54–56", waist: "51–52", length: "44" },
  { size: "4-5Y", height: "104–110", chest: "56–58", waist: "52–53", length: "47" },
  { size: "5-6Y", height: "110–116", chest: "58–60", waist: "53–54", length: "50" },
  { size: "6-7Y", height: "116–122", chest: "60–63", waist: "54–56", length: "53" },
  { size: "7-8Y", height: "122–128", chest: "63–66", waist: "56–58", length: "56" },
  { size: "8-9Y", height: "128–134", chest: "66–69", waist: "58–60", length: "59" },
  { size: "9-10Y", height: "134–140", chest: "69–72", waist: "60–62", length: "62" },
  { size: "10-11Y", height: "140–146", chest: "72–75", waist: "62–64", length: "65" },
  { size: "11-12Y", height: "146–152", chest: "75–78", waist: "64–66", length: "68" },
];
