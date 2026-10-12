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
import catBoys from "@/assets/cat-boys.jpg";
import catGirls from "@/assets/cat-girls.jpg";
import catEthnic from "@/assets/cat-ethnic.jpg";
import catFestive from "@/assets/cat-festive.jpg";
import catEssentials from "@/assets/cat-essentials.jpg";
import catParty from "@/assets/cat-party.jpg";
import catNightwear from "@/assets/cat-nightwear.jpg";
import catCoords from "@/assets/cat-coords.jpg";


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
  { slug: "boys", name: "Boys' Clothing", image: catBoys, link: "/collections/boys" },
  { slug: "girls", name: "Girls' Clothing", image: catGirls, link: "/collections/girls" },
  { slug: "ethnic", name: "Ethnic Wear", image: catEthnic, link: "/shop?category=ethnic" },
  { slug: "festive", name: "Festive Collection", image: catFestive, link: "/collections/ethnic-festive" },
  { slug: "essentials", name: "Everyday Essentials", image: catEssentials, link: "/shop?category=essentials" },
  { slug: "party", name: "Party & Occasion", image: catParty, link: "/shop?category=party" },
  { slug: "nightwear", name: "Nightwear", image: catNightwear, link: "/shop?category=nightwear" },
  { slug: "coords", name: "Co-ord Sets", image: catCoords, link: "/shop?category=coords" },
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
  // 1. Boys' Clothing (boys)
  {
    id: "b-1",
    slug: "boys-linen-blend-kurta",
    name: "Classic Linen-Blend Boys Kurta",
    gender: "boys",
    category: "boys",
    occasions: ["Everyday", "Festive"],
    festive: [],
    price: 1499,
    mrp: 1899,
    colours: [C.ivory, C.blue],
    stock: sizes(2, 8),
    images: [kurta, catBoys],
    isNew: false,
    bestseller: true,
    fabric: "Linen-Cotton Blend",
    care: ["Machine wash gentle", "Warm iron", "Dry in shade"],
    description: "Tailored for playtime and family gatherings alike, featuring breezy breathable linen and delicate pearl buttons.",
    addedAt: "2026-10-01",
  },
  {
    id: "b-2",
    slug: "boys-chambray-casual-shirt",
    name: "Breezy Chambray Button-Down",
    gender: "boys",
    category: "boys",
    occasions: ["Everyday", "Birthday"],
    festive: [],
    price: 1199,
    mrp: 1499,
    colours: [C.blue],
    stock: sizes(3, 8, 8),
    images: [catBoys, tee],
    isNew: true,
    bestseller: false,
    fabric: "100% Breathable Cotton Chambray",
    care: ["Machine wash cold", "Tumble dry low", "Warm iron"],
    description: "Crisp yet ultra-soft chambray shirt with roll-up sleeve tabs for sunny adventures and casual outings.",
    addedAt: "2026-10-05",
  },

  // 2. Girls' Clothing (girls)
  {
    id: "g-1",
    slug: "girls-vintage-floral-sundress",
    name: "Vintage Meadow Floral Sundress",
    gender: "girls",
    category: "girls",
    occasions: ["Everyday", "Birthday"],
    festive: [],
    price: 1399,
    mrp: 1799,
    colours: [C.peach, C.pink],
    stock: sizes(1, 6, 5),
    images: [frock, catGirls],
    isNew: false,
    bestseller: true,
    fabric: "Pure Cotton Voile",
    care: ["Gentle machine wash", "Line dry in shade"],
    description: "Hand-block botanical prints on featherlight cotton with ruffled angel wings and twirl skirt.",
    addedAt: "2026-09-28",
  },
  {
    id: "g-2",
    slug: "girls-tiered-cotton-midi",
    name: "Tiered Blossom Cotton Dress",
    gender: "girls",
    category: "girls",
    occasions: ["Everyday", "Party"],
    festive: [],
    price: 1599,
    mrp: 1999,
    colours: [C.yellow],
    stock: sizes(3, 8),
    images: [catGirls, dress],
    isNew: true,
    bestseller: false,
    fabric: "100% Organic Muslin Cotton",
    care: ["Machine wash cold", "Dry flat", "Low iron"],
    description: "Three tiered layers of sunshine yellow cotton with soft inner lining and delicate gathered cuffs.",
    addedAt: "2026-10-06",
  },

  // 3. Ethnic Wear (ethnic)
  {
    id: "et-1",
    slug: "gulab-silk-kurta-pyjama",
    name: "Gulab Silk Kurta & Pyjama Set",
    gender: "boys",
    category: "ethnic",
    occasions: ["Festive", "Wedding"],
    festive: ["diwali"],
    price: 2490,
    mrp: 2990,
    colours: [C.peach, C.ivory],
    stock: sizes(2, 8),
    images: [kurta, catEthnic],
    isNew: false,
    bestseller: true,
    fabric: "Raw Silk Kurta with Mulmul Cotton Lining",
    care: ["Dry clean only", "Iron on reverse", "Store in muslin cloth"],
    description: "Regal woven motifs with embroidered collar and comfortable cotton pyjamas for wedding festivities.",
    addedAt: "2026-09-20",
  },
  {
    id: "et-2",
    slug: "surajmukhi-dhoti-kurta-set",
    name: "Surajmukhi Dhoti Kurta Set",
    gender: "boys",
    category: "ethnic",
    occasions: ["Festive", "Wedding"],
    festive: ["navratri", "diwali"],
    price: 2290,
    mrp: 2690,
    colours: [C.maroon, C.yellow],
    stock: sizes(4, 9, 5),
    images: [dhoti, catEthnic],
    isNew: true,
    bestseller: false,
    fabric: "Chanderi Cotton with Zari borders",
    care: ["Dry clean recommended", "Gentle steam iron"],
    description: "Traditional stitched dhoti with pre-pleated drape paired with handcrafted mirror-work kurta.",
    addedAt: "2026-10-02",
  },

  // 4. Festive Collection (festive)
  {
    id: "fe-1",
    slug: "diwali-kesar-brocade-sherwani",
    name: "Kesar Brocade Royal Sherwani",
    gender: "boys",
    category: "festive",
    occasions: ["Festive", "Wedding"],
    festive: ["diwali"],
    price: 3490,
    mrp: 4290,
    colours: [C.ivory, C.yellow],
    stock: sizes(3, 8, 4),
    images: [hero, catFestive],
    isNew: false,
    bestseller: true,
    fabric: "Brocade Jacquard with 100% Cotton Lining",
    care: ["Dry clean only", "Do not bleach"],
    description: "Intricately woven gold thread jacquard sherwani designed for high-profile festive events and family portraits.",
    addedAt: "2026-09-15",
  },
  {
    id: "fe-2",
    slug: "navratri-twirl-chaniya-choli",
    name: "Twirl Garba Chaniya Choli Set",
    gender: "girls",
    category: "festive",
    occasions: ["Festive"],
    festive: ["navratri"],
    price: 2999,
    mrp: 3699,
    colours: [C.magenta],
    stock: sizes(3, 9),
    images: [navratri, catFestive],
    isNew: true,
    bestseller: true,
    fabric: "Kutchi Embroidered Cotton with Pom-pom Hem",
    care: ["Dry clean only", "Store folded in breathable cover"],
    description: "Festive 360-degree flare chaniya choli accented with mirrors, bells, and handmade tassels for dandiya nights.",
    addedAt: "2026-09-22",
  },

  // 5. Everyday Essentials (essentials)
  {
    id: "es-1",
    slug: "blooming-meadow-organic-tee",
    name: "Blooming Meadow Organic Tee",
    gender: "unisex",
    category: "essentials",
    occasions: ["Everyday"],
    festive: [],
    price: 890,
    mrp: 1090,
    colours: [C.mint, C.ivory],
    stock: sizes(1, 7, 10),
    images: [tee, catEssentials],
    isNew: false,
    bestseller: true,
    fabric: "100% GOTS Certified Organic Cotton",
    care: ["Machine wash cold", "Tumble dry low", "Do not iron print"],
    description: "Hypoallergenic, tagless organic cotton t-shirt with soft ribbed neck that keeps little ones comfortable all day.",
    addedAt: "2026-08-10",
  },
  {
    id: "es-2",
    slug: "classic-striped-everyday-tee",
    name: "Nautical Stripe Pocket Tee",
    gender: "boys",
    category: "essentials",
    occasions: ["Everyday"],
    festive: [],
    price: 799,
    mrp: 999,
    colours: [C.blue, C.ivory],
    stock: sizes(2, 8, 8),
    images: [catEssentials, tee],
    isNew: true,
    bestseller: false,
    fabric: "Super-combed Single Jersey Cotton",
    care: ["Machine wash warm", "Wash with like colours"],
    description: "Timeless yarn-dyed horizontal stripes featuring a contrasting patch pocket and durable reinforced hems.",
    addedAt: "2026-09-25",
  },

  // 6. Party & Occasion (party)
  {
    id: "pa-1",
    slug: "blush-tulle-twirl-party-dress",
    name: "Blush Tulle Twirl Party Dress",
    gender: "girls",
    category: "party",
    occasions: ["Party", "Birthday"],
    festive: [],
    price: 1899,
    mrp: 2399,
    colours: [C.pink],
    stock: sizes(2, 7, 6),
    images: [dress, catParty],
    isNew: false,
    bestseller: true,
    fabric: "Four-layer French Tulle with 100% Cotton Lining",
    care: ["Hand wash gentle", "Do not wring", "Dry flat"],
    description: "Dreamy blush pink party dress with satin sash and flower brooch, lined with softest pure cotton to protect sensitive skin.",
    addedAt: "2026-09-18",
  },
  {
    id: "pa-2",
    slug: "golden-shimmer-birthday-frock",
    name: "Golden Shimmer Birthday Frock",
    gender: "girls",
    category: "party",
    occasions: ["Party", "Birthday"],
    festive: [],
    price: 2199,
    mrp: 2699,
    colours: [C.yellow, C.peach],
    stock: sizes(3, 8, 5),
    images: [catParty, dress],
    isNew: true,
    bestseller: false,
    fabric: "Lurex Jacquard and Organza with Cotton Lining",
    care: ["Dry clean recommended", "Low heat iron on reverse"],
    description: "Subtle metallic shimmer highlights this birthday dress, completed with a dramatic bow on the back.",
    addedAt: "2026-10-04",
  },

  // 7. Nightwear (nightwear)
  {
    id: "ni-1",
    slug: "starry-night-mulmul-pyjama",
    name: "Starry Night Mulmul Pyjama Set",
    gender: "unisex",
    category: "nightwear",
    occasions: ["Bedtime"],
    festive: [],
    price: 1290,
    mrp: 1590,
    colours: [C.lavender, C.pink],
    stock: sizes(1, 7, 7),
    images: [night, catNightwear],
    isNew: false,
    bestseller: true,
    fabric: "Handspun Mulmul Cotton",
    care: ["Machine wash cold", "Dry in shade", "Warm iron"],
    description: "Cloud-soft breathable mulmul pyjamas printed with sleepy celestial moons and stars, finished with satin piping.",
    addedAt: "2026-08-15",
  },
  {
    id: "ni-2",
    slug: "lavender-bunny-cotton-nightwear",
    name: "Lavender Bunny Snuggle Pyjamas",
    gender: "unisex",
    category: "nightwear",
    occasions: ["Bedtime"],
    festive: [],
    price: 990,
    mrp: 1290,
    colours: [C.lavender],
    stock: sizes(2, 8, 8),
    images: [catNightwear, night],
    isNew: true,
    bestseller: false,
    fabric: "100% Breathable Combed Cotton",
    care: ["Machine wash cold", "Tumble dry low"],
    description: "Comfortable button-down long pyjama set featuring sweet illustrated bunnies and an elasticated waistband.",
    addedAt: "2026-09-29",
  },

  // 8. Co-ord Sets (coords)
  {
    id: "co-1",
    slug: "safari-linen-resort-co-ord",
    name: "Safari Linen Resort Co-ord Set",
    gender: "boys",
    category: "coords",
    occasions: ["Everyday", "Party"],
    festive: [],
    price: 1890,
    mrp: 2290,
    colours: [C.mint, C.ivory],
    stock: sizes(2, 7, 6),
    images: [coord, catCoords],
    isNew: false,
    bestseller: true,
    fabric: "Cotton-Linen Blend",
    care: ["Machine wash cold gentle", "Hang dry", "Warm iron"],
    description: "Cuban collar resort shirt with matching pull-on tailored shorts, made for sunny holiday brunches and travel days.",
    addedAt: "2026-09-01",
  },
  {
    id: "co-2",
    slug: "pastel-blossom-waffle-co-ord",
    name: "Pastel Blossom Waffle Co-ord Set",
    gender: "unisex",
    category: "coords",
    occasions: ["Everyday"],
    festive: [],
    price: 1490,
    mrp: 1890,
    colours: [C.peach, C.mint],
    stock: sizes(1, 7, 7),
    images: [catCoords, coord],
    isNew: true,
    bestseller: false,
    fabric: "Organic Textured Waffle Knit Cotton",
    care: ["Machine wash cold", "Dry flat"],
    description: "A textured waffle knit pullover sweatshirt with matching relaxed shorts for effortless weekend comfort.",
    addedAt: "2026-10-07",
  },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const discountPct = (p: Product) => (p.mrp && p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0);
export const inStock = (p: Product) => (p && p.stock && typeof p.stock === "object" ? Object.values(p.stock).some((n) => Number(n) > 0) : true);
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
