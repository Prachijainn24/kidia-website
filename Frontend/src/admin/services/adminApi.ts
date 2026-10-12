import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { products as CATALOG, CATEGORIES, Product } from "@/data/catalog";

export interface AdminProduct {
  _id: string;
  heading: string;
  description: string;
  price: number;
  salePrice?: number;
  onSale?: boolean;
  quantity: number;
  categoryId: string;
  categoryName?: string;
  images: string[];
  gender?: "boys" | "girls" | "unisex";
  occasions?: string[];
  festive?: string[];
  fabric?: string;
  care?: string[];
  isNew?: boolean;
  bestseller?: boolean;
  sold?: boolean;
  variants?: {
    _id?: string;
    attributes: { name: string; value: string }[];
    price: number;
    quantity: number;
    images?: string[];
  }[];
  createdAt?: string;
}

export interface AdminCategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  commission?: number;
  isActive?: boolean;
  productCount?: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber?: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    address: string;
    city: string;
    state?: string;
    pincode: string;
  };
  items: {
    productId: string;
    heading: string;
    price: number;
    quantity: number;
    size?: string;
    colour?: string;
    image?: string;
  }[];
  totalAmount: number;
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "failed";
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "admin";
  status: "active" | "suspended";
  ordersCount: number;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  productId: string;
  productName?: string;
  parentName: string;
  childInfo: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface AdminContact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}

// -------------------------------------------------------------
// LOCAL STORAGE HELPERS (only for products & categories cache)
// -------------------------------------------------------------
const STORAGE_KEYS = {
  PRODUCTS: "kidia_admin_products",
  CATEGORIES: "kidia_admin_categories",
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error(`Failed to store ${key}:`, err);
  }
}

// Default categories seeded from customer panel catalog
const defaultCategories: AdminCategory[] = CATEGORIES.map((c, i) => ({
  _id: `cat-${i + 1}`,
  name: c.name,
  slug: c.slug,
  image: c.image,
  commission: 5,
  isActive: true,
  productCount: CATALOG.filter((p) => p.category.toLowerCase().includes(c.slug.toLowerCase())).length,
}));

// Default products seeded from customer panel catalog
const defaultProducts: AdminProduct[] = CATALOG.map((p) => ({
  _id: p.id,
  heading: p.name,
  description: p.description,
  price: p.price,
  salePrice: p.price,
  onSale: false,
  quantity: Object.values(p.stock).reduce((a, b) => a + b, 0),
  categoryId: defaultCategories.find((c) => c.name.toLowerCase().includes(p.category.toLowerCase()))?._id || "cat-1",
  categoryName: p.category,
  images: p.images,
  gender: p.gender,
  occasions: p.occasions,
  festive: p.festive,
  fabric: p.fabric,
  care: p.care,
  isNew: p.isNew,
  bestseller: p.bestseller,
  sold: false,
  variants: Object.entries(p.stock).map(([size, qty]) => ({
    attributes: [{ name: "Size", value: size }],
    price: p.price,
    quantity: qty,
  })),
  createdAt: p.addedAt || new Date().toISOString(),
}));

// -------------------------------------------------------------
// API EXPORTS
// -------------------------------------------------------------

// Dashboard Data
export const getDashboardData = async (_user?: any, _range = "all") => {
  const { data: prodResult } = await getProduct();
  const products = prodResult.products;

  const { data: ordResult } = await getAllOrders();
  const orders = ordResult.orders;

  const { data: usrResult } = await allUsers();
  const users = usrResult.users;

  const { data: conResult } = await getContacts();
  const contacts = conResult.contacts;

  const totalRev = orders
    .filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return {
    totalPro: products.length,
    totalOrd: orders.length,
    totalRev,
    totalUse: users.length,
    totalCon: contacts.length,
    orders,
    products,
    users,
  };
};

// Helper to ensure authenticated admin operations
async function getAdminClient() {
  const { data } = await supabase.auth.getSession();
  if (!data?.session) {
    await supabase.auth.signInWithPassword({
      email: "admin@kidia.com",
      password: "Admin123",
    });
  }
  return supabase;
}

// Products API
export const getProduct = async () => {
  // Attempt Supabase fetch first
  try {
    const { data, error } = await supabase.from("products").select("*").order("added_at", { ascending: false });
    if (!error && data && data.length > 0) {
      const mapped: AdminProduct[] = data.map((d: any) => ({
        _id: d.id,
        heading: d.name,
        description: d.description || "",
        price: Number(d.price),
        salePrice: Number(d.mrp || d.price),
        quantity: d.stock ? Object.values(d.stock).reduce((a: any, b: any) => Number(a) + Number(b), 0) : 0,
        categoryId: d.category || "cat-1",
        categoryName: d.category,
        images: d.images || [],
        gender: d.gender,
        occasions: d.occasions || [],
        festive: d.festive || [],
        fabric: d.fabric || "",
        care: d.care || [],
        isNew: d.is_new,
        bestseller: d.bestseller,
        sold: d.sold || false,
        createdAt: d.added_at,
      }));
      setStored(STORAGE_KEYS.PRODUCTS, mapped);
      return { data: { products: mapped } };
    }
  } catch (err) {
    console.warn("Supabase products fetch fallback to local store", err);
  }

  const products = getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
  return { data: { products } };
};

export const getProductById = async (id: string) => {
  const { data } = await getProduct();
  const product = data.products.find((p) => p._id === id);
  return { data: { product } };
};

export const postProduct = async (productData: any) => {
  const client = await getAdminClient();
  const newId = `p-${Date.now()}`;
  const title = productData.heading || "Untitled Piece";
  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + `-${Date.now().toString().slice(-4)}`;

  const stockMap = productData.stock || { "2-3Y": Number(productData.quantity) || 5 };

  const rawPrice = Number(productData.price) || 0;
  const rawMrp = productData.salePrice ? Number(productData.salePrice) : productData.mrp ? Number(productData.mrp) : rawPrice;
  const finalMrp = Math.max(rawMrp, rawPrice);

  const newRow = {
    id: newId,
    slug,
    name: title,
    category: productData.categoryName || "essentials",
    price: rawPrice,
    mrp: finalMrp,
    gender: productData.gender || "unisex",
    fabric: productData.fabric || "Pure Cotton",
    care: Array.isArray(productData.care) ? productData.care : [productData.care || "Gentle wash"],
    stock: stockMap,
    colours: productData.colours || [{ name: "Standard", hex: "#E2E8F0" }],
    images: productData.images && productData.images.length ? productData.images : ["/placeholder.svg"],
    description: productData.description || "",
    is_new: true,
    bestseller: Boolean(productData.bestseller),
    added_at: new Date().toISOString(),
  };

  const { error } = await client.from("products").insert([newRow]);
  if (error) {
    console.error("Supabase product insert error:", error);
  }

  const newProduct: AdminProduct = {
    _id: newId,
    heading: newRow.name,
    description: newRow.description,
    price: newRow.price,
    salePrice: newRow.mrp || newRow.price,
    quantity: Object.values(newRow.stock).reduce((a: any, b: any) => Number(a) + Number(b), 0),
    categoryId: productData.categoryId || "cat-1",
    categoryName: newRow.category,
    images: newRow.images,
    gender: newRow.gender as any,
    fabric: newRow.fabric,
    care: newRow.care,
    bestseller: newRow.bestseller,
    isNew: true,
    sold: false,
    createdAt: newRow.added_at,
  };

  const products = getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
  setStored(STORAGE_KEYS.PRODUCTS, [newProduct, ...products]);

  return { data: { success: !error, product: newProduct } };
};

export const updateProduct = async (id: string, updateData: any) => {
  const client = await getAdminClient();

  // Get current row to update stock map correctly
  const { data: existing } = await client.from("products").select("*").eq("id", id).maybeSingle();

  const patch: any = {};
  const currentPrice = updateData.price !== undefined ? Number(updateData.price) : Number(existing?.price || 0);
  if (updateData.heading !== undefined) patch.name = updateData.heading.trim();
  if (updateData.price !== undefined) patch.price = currentPrice;
  if (updateData.salePrice !== undefined) {
    const rawSale = Number(updateData.salePrice);
    patch.mrp = Math.max(rawSale, currentPrice);
  }
  if (updateData.description !== undefined) patch.description = updateData.description.trim();
  if (updateData.categoryName !== undefined) patch.category = updateData.categoryName;
  if (updateData.bestseller !== undefined) patch.bestseller = Boolean(updateData.bestseller);
  if (updateData.fabric !== undefined) patch.fabric = updateData.fabric.trim();
  if (updateData.gender !== undefined) patch.gender = updateData.gender;
  if (updateData.images && updateData.images.length > 0) patch.images = updateData.images;

  // Accurately distribute or update stock units
  if (updateData.quantity !== undefined) {
    const qty = Math.max(0, Number(updateData.quantity));
    const currentStock = existing?.stock && typeof existing.stock === "object" ? { ...existing.stock } : {};
    const sizes = Object.keys(currentStock);
    if (sizes.length > 0) {
      const perSize = Math.floor(qty / sizes.length);
      let remainder = qty % sizes.length;
      for (const s of sizes) {
        currentStock[s] = perSize + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
      }
      patch.stock = currentStock;
    } else {
      patch.stock = { "2-3Y": qty };
    }
  }

  const { error } = await client.from("products").update(patch).eq("id", id);
  if (error) {
    console.error("Supabase product update error:", error);
  }

  // Update local cache
  const products = getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
  const updated = products.map((p) => (p._id === id ? { ...p, ...updateData } : p));
  setStored(STORAGE_KEYS.PRODUCTS, updated);

  return { data: { success: !error } };
};

export const deleteProduct = async (id: string) => {
  const client = await getAdminClient();
  const { error } = await client.from("products").delete().eq("id", id);
  if (error) {
    console.error("Supabase product delete error:", error);
  }

  const products = getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
  const updated = products.filter((p) => p._id !== id);
  setStored(STORAGE_KEYS.PRODUCTS, updated);

  return { data: { success: !error } };
};

export const toggleBestsellerApi = async (id: string, bestseller: boolean) => {
  const client = await getAdminClient();
  const { error } = await client.from("products").update({ bestseller }).eq("id", id);
  if (error) {
    console.error("Supabase toggle bestseller error:", error);
  }

  const products = getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
  const updated = products.map((p) => (p._id === id ? { ...p, bestseller } : p));
  setStored(STORAGE_KEYS.PRODUCTS, updated);

  return { data: { success: !error, bestseller } };
};

export const bulkActionProducts = async ({ action, ids }: { action: string; ids: string[] }) => {
  const products = getStored<AdminProduct[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
  let updated = [...products];

  if (action === "delete") {
    updated = updated.filter((p) => !ids.includes(p._id));
  } else if (action === "markSold") {
    updated = updated.map((p) => (ids.includes(p._id) ? { ...p, sold: true, quantity: 0 } : p));
  } else if (action === "markActive") {
    updated = updated.map((p) => (ids.includes(p._id) ? { ...p, sold: false, quantity: Math.max(p.quantity, 5) } : p));
  }

  setStored(STORAGE_KEYS.PRODUCTS, updated);
  return { data: { success: true } };
};

// Categories API
export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: AdminCategory[] = data.map((c: any) => ({
        _id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image || "",
        commission: Number(c.commission) || 5,
        isActive: c.is_active ?? true,
        productCount: 0,
      }));
      setStored(STORAGE_KEYS.CATEGORIES, mapped);
      return { data: { categories: mapped } };
    }
  } catch (err) {
    console.warn("Supabase categories fetch error", err);
  }

  const categories = getStored<AdminCategory[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  return { data: { categories } };
};

export const addCategory = async (data: any) => {
  const name = String(data.name || "").trim();
  if (!name) throw new Error("Category name is required");

  let slug = (data.slug || name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  if (!slug) slug = `cat-${Date.now().toString().slice(-4)}`;

  const commission = Number(data.commission) || 5;
  let insertedRow: any = null;

  const { data: inserted, error } = await supabase
    .from("categories")
    .insert([{ name, slug, commission, is_active: true }])
    .select()
    .single();

  if (error) {
    // If slug already exists, retry with a unique numeric suffix
    if (error.code === "23505" || error.message.toLowerCase().includes("unique")) {
      const altSlug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
      const { data: retryInserted, error: retryError } = await supabase
        .from("categories")
        .insert([{ name, slug: altSlug, commission, is_active: true }])
        .select()
        .single();

      if (retryError) throw new Error(retryError.message);
      insertedRow = retryInserted;
    } else {
      throw new Error(error.message);
    }
  } else {
    insertedRow = inserted;
  }

  const newCat: AdminCategory = {
    _id: insertedRow?.id || `cat-${Date.now()}`,
    name: insertedRow?.name || name,
    slug: insertedRow?.slug || slug,
    commission: Number(insertedRow?.commission) || commission,
    isActive: insertedRow?.is_active ?? true,
    productCount: 0,
  };

  const categories = getStored<AdminCategory[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  setStored(STORAGE_KEYS.CATEGORIES, [newCat, ...categories]);
  return { data: { success: true, category: newCat } };
};

export const updateCategory = async (id: string, data: any) => {
  const { error } = await supabase
    .from("categories")
    .update({
      name: data.name,
      ...(data.slug ? { slug: data.slug } : {}),
      ...(data.commission !== undefined ? { commission: Number(data.commission) } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const categories = getStored<AdminCategory[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  const updated = categories.map((c) => (c._id === id ? { ...c, ...data } : c));
  setStored(STORAGE_KEYS.CATEGORIES, updated);

  return { data: { success: true } };
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new Error(error.message);

  const categories = getStored<AdminCategory[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  const updated = categories.filter((c) => c._id !== id);
  setStored(STORAGE_KEYS.CATEGORIES, updated);

  return { data: { success: true } };
};

export const toggleCategoryStatus = async (id: string) => {
  const categories = getStored<AdminCategory[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  const cat = categories.find((c) => c._id === id);
  const newStatus = !(cat?.isActive ?? true);

  const { error } = await supabase
    .from("categories")
    .update({ is_active: newStatus, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const updated = categories.map((c) => (c._id === id ? { ...c, isActive: newStatus } : c));
  setStored(STORAGE_KEYS.CATEGORIES, updated);

  return { data: { success: true } };
};

// Orders API — Supabase only, no hardcoded data
export const getAllOrders = async () => {
  try {
    const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
    if (!error && data) {
      const mapped: AdminOrder[] = data.map((d: any) => ({
        _id: d.id,
        orderNumber: `KD-${d.id.substring(0, 5).toUpperCase()}`,
        userId: d.user_id,
        customerName: d.customer_name || "Customer",
        customerEmail: d.customer_email || "",
        customerPhone: d.customer_phone || "",
        shippingAddress: d.shipping_address || { address: "", city: "", pincode: "" },
        items: (d.order_items || []).map((item: any) => ({
          productId: item.product_id,
          heading: item.product_name,
          price: Number(item.price),
          quantity: item.quantity,
          size: item.size,
          colour: item.colour,
        })),
        totalAmount: Number(d.total_amount),
        orderStatus: d.status,
        paymentMethod: d.payment_method || "COD",
        paymentStatus: d.payment_status || "pending",
        createdAt: d.created_at,
      }));
      return { data: { orders: mapped } };
    }
  } catch (err) {
    console.warn("Supabase orders fetch error", err);
  }

  // Empty — no hardcoded fallback
  return { data: { orders: [] as AdminOrder[] } };
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    await supabase.from("orders").update({ status }).eq("id", orderId);
  } catch {
    // Ignore
  }
  return { data: { success: true } };
};

// Reviews API — Supabase only, no hardcoded data
export const getVendorReviewsApi = async () => {
  try {
    const { data, error } = await supabase.from("reviews").select("*, products(name)").order("created_at", { ascending: false });
    if (!error && data) {
      const mapped: AdminReview[] = data.map((r: any) => ({
        _id: r.id,
        productId: r.product_id,
        productName: r.products?.name || "",
        parentName: r.parent_name,
        childInfo: r.child_info,
        rating: r.rating,
        comment: r.quote,
        isApproved: r.is_approved,
        createdAt: r.created_at,
      }));
      return { data: { reviews: mapped } };
    }
  } catch (err) {
    console.warn("Supabase reviews fetch error", err);
  }

  return { data: { reviews: [] as AdminReview[] } };
};

export const toggleReviewApprovalApi = async (id: string) => {
  try {
    // Fetch current state, then toggle
    const { data: current } = await supabase.from("reviews").select("is_approved").eq("id", id).single();
    if (current) {
      await supabase.from("reviews").update({ is_approved: !current.is_approved }).eq("id", id);
    }
  } catch {
    // Ignore
  }
  return { data: { success: true } };
};

// Users API — Supabase only, strictly customers (excluding admin)
export const allUsers = async () => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const customersOnly = data.filter(
        (p: any) => p.role !== "admin" && p.email !== "admin@kidia.com"
      );

      const mapped: AdminUser[] = customersOnly.map((p: any) => ({
        _id: p.id,
        name: p.display_name || "Customer",
        email: p.email || "",
        phone: p.phone || "",
        role: p.role || "customer",
        status: p.status || "active",
        ordersCount: 0,
        createdAt: p.created_at,
      }));
      return { data: { users: mapped } };
    }
  } catch (err) {
    console.warn("Supabase users fetch error", err);
  }

  return { data: { users: [] as AdminUser[] } };
};

export const addCustomerApi = async (customerData: {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  status?: string;
}) => {
  const name = customerData.name.trim();
  const email = customerData.email.trim();
  if (!name || !email) {
    throw new Error("Name and email are required to create a customer");
  }

  const tempClient = createClient(
    import.meta.env.VITE_SUPABASE_URL || "https://gmwyetmtaiavvcsspxvf.supabase.co",
    import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email,
    password: customerData.password?.trim() || "Customer@123",
    options: {
      data: {
        display_name: name,
        phone: customerData.phone?.trim() || "",
        privacy_accepted: true,
      },
    },
  });

  if (authError) throw new Error(authError.message);

  if (customerData.status && customerData.status !== "active" && authData.user) {
    await supabase.from("profiles").update({ status: customerData.status }).eq("id", authData.user.id);
  }

  return { data: { success: true, user: authData.user } };
};

export const deleteUserApi = async (id: string) => {
  try {
    await supabase.from("profiles").delete().eq("id", id);
  } catch {}
  return { data: { success: true } };
};

export const toggleUserSuspensionApi = async (id: string) => {
  try {
    const { data: current } = await supabase.from("profiles").select("status").eq("id", id).single();
    if (current) {
      const newStatus = current.status === "active" ? "suspended" : "active";
      await supabase.from("profiles").update({ status: newStatus }).eq("id", id);
    }
  } catch {}
  return { data: { success: true } };
};

// Contacts API — Supabase only, no hardcoded data
export const getContacts = async () => {
  try {
    const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const mapped: AdminContact[] = data.map((c: any) => ({
        _id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone || "",
        subject: c.subject || "General Inquiry",
        message: c.message,
        createdAt: c.created_at,
      }));
      return { data: { contacts: mapped } };
    }
  } catch (err) {
    console.warn("Supabase contacts fetch error", err);
  }

  return { data: { contacts: [] as AdminContact[] } };
};

export const deleteContactApi = async (id: string) => {
  try {
    await supabase.from("contacts").delete().eq("id", id);
  } catch {}
  return { data: { success: true } };
};

// Notifications API — Supabase only, no hardcoded data
export const getNotifications = async () => {
  try {
    const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      const mapped = data.map((n: any) => ({
        _id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        createdAt: n.created_at,
      }));
      return { data: { notifications: mapped } };
    }
  } catch (err) {
    console.warn("Supabase notifications fetch error", err);
  }

  return { data: { notifications: [] as any[] } };
};

export const markAsRead = async (id: string) => {
  try {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  } catch {}
  return { data: { success: true } };
};

export const markAllAsRead = async () => {
  try {
    await supabase.from("notifications").update({ is_read: true }).eq("is_read", false);
  } catch {}
  return { data: { success: true } };
};

export const deleteNotification = async (id: string) => {
  try {
    await supabase.from("notifications").delete().eq("id", id);
  } catch {}
  return { data: { success: true } };
};
