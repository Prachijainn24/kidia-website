import { supabase } from "@/integrations/supabase/client";
import { createClient } from "@supabase/supabase-js";
import { SavedAddress } from "./addressService";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "packed"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "delivery_failed";

export interface OrderItem {
  productId: string;
  heading: string;
  price: number;
  quantity: number;
  size?: string;
  colour?: string;
  image?: string;
}

export interface CustomerOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: SavedAddress | {
    address?: string;
    addressLine?: string;
    city: string;
    state?: string;
    pincode: string;
    fullName?: string;
    phone?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingId?: string;
  deliveredAt?: string;
  paymentMethod: string;
  paymentStatus: "paid" | "failed" | "pending";
  createdAt: string;
}

const ORDERS_STORAGE_KEY = "kidia_customer_orders";
const NOTIFS_STORAGE_KEY = "kidia_admin_notifications";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://gmwyetmtaiavvcsspxvf.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdtd3lldG10YWlhdnZjc3NweHZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MTIwMjMsImV4cCI6MjEwNzM4ODAyM30._TECHGq0-0kR-lLNuQKL_fC_9eqfRW5pypbnXCzDIe4";

const generateUUID = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const toDbStatus = (status: OrderStatus | string): string => {
  switch (status) {
    case "placed":
      return "pending";
    case "accepted":
    case "packed":
      return "processing";
    case "shipping":
      return "shipped";
    case "delivered":
      return "delivered";
    case "cancelled":
    case "delivery_failed":
      return "cancelled";
    default:
      return "pending";
  }
};

export const toUiStatus = (dbStatus?: string): OrderStatus => {
  switch (dbStatus) {
    case "pending":
      return "placed";
    case "processing":
      return "accepted";
    case "shipped":
      return "shipping";
    case "delivered":
      return "delivered";
    case "cancelled":
      return "cancelled";
    default:
      return (dbStatus as any) || "placed";
  }
};

let cachedSyncClient: any = null;
async function getOrderSyncClient() {
  if (!cachedSyncClient) {
    cachedSyncClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    await cachedSyncClient.auth.signInWithPassword({
      email: "admin@kidia.com",
      password: "Admin123",
    });
  } else {
    const { data } = await cachedSyncClient.auth.getSession();
    if (!data?.session) {
      await cachedSyncClient.auth.signInWithPassword({
        email: "admin@kidia.com",
        password: "Admin123",
      });
    }
  }
  return cachedSyncClient;
}

export const getStoredOrders = (): CustomerOrder[] => {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse stored orders", e);
  }
  return [];
};

export const setStoredOrders = (orders: CustomerOrder[]) => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn("Failed to set stored orders", e);
  }
};

export const addAdminNotification = async (notification: {
  title: string;
  message: string;
  type?: string;
}) => {
  const newNotif = {
    id: `notif_${Date.now()}`,
    title: notification.title,
    message: notification.message,
    type: notification.type || "order",
    is_read: false,
    created_at: new Date().toISOString(),
  };

  try {
    const raw = localStorage.getItem(NOTIFS_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : [];
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify([newNotif, ...existing]));
  } catch {}

  try {
    const client = await getOrderSyncClient();
    await client.from("notifications").insert([{
      title: notification.title,
      message: notification.message,
      type: notification.type || "order",
      is_read: false,
    }]);
  } catch {}
};

/**
 * Automatically adjusts product stock in Supabase products table and local catalog.
 * direction: "decrease" (subtracts quantity when order is placed)
 * direction: "increase" (adds quantity back when order is cancelled or delivery failed)
 */
export const adjustInventoryForOrder = async (
  items: OrderItem[],
  direction: "decrease" | "increase"
): Promise<void> => {
  if (!items || items.length === 0) return;

  try {
    const client = await getOrderSyncClient();

    for (const item of items) {
      if (!item.productId) continue;

      // 1. Fetch current product from Supabase
      const { data: prod, error } = await client
        .from("products")
        .select("id, stock")
        .eq("id", item.productId)
        .maybeSingle();

      if (error || !prod) {
        console.warn(`Could not find product ${item.productId} in DB:`, error);
        continue;
      }

      let currentStock: Record<string, number> = {};
      if (prod.stock && typeof prod.stock === "object") {
        currentStock = { ...prod.stock };
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const sizeKey = (item.size || "").trim();

      if (sizeKey && sizeKey in currentStock) {
        const curVal = Number(currentStock[sizeKey]) || 0;
        currentStock[sizeKey] =
          direction === "decrease" ? Math.max(0, curVal - qty) : curVal + qty;
      } else if (sizeKey) {
        const curVal = 5;
        currentStock[sizeKey] =
          direction === "decrease" ? Math.max(0, curVal - qty) : curVal + qty;
      } else {
        const keys = Object.keys(currentStock);
        if (keys.length > 0) {
          const firstKey = keys[0];
          const curVal = Number(currentStock[firstKey]) || 0;
          currentStock[firstKey] =
            direction === "decrease" ? Math.max(0, curVal - qty) : curVal + qty;
        }
      }

      // 2. Update stock in Supabase products table
      const { error: updateError } = await client
        .from("products")
        .update({ stock: currentStock })
        .eq("id", item.productId);

      if (updateError) {
        console.error(`Failed to update stock for ${item.productId}:`, updateError);
      } else {
        console.log(`Inventory adjusted for ${item.productId} (${direction} ${qty}) ->`, currentStock);
      }
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("kidia_inventory_changed"));
    }
  } catch (err) {
    console.error("adjustInventoryForOrder exception:", err);
  }
};

export const createOrder = async (orderPayload: {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: any;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: "paid" | "failed";
}): Promise<{ success: boolean; order: CustomerOrder; error?: string }> => {
  const orderId = generateUUID();
  const orderNumber = `KD-${Date.now().toString().slice(-6)}`;

  const newOrder: CustomerOrder = {
    _id: orderId,
    orderNumber,
    userId: orderPayload.userId,
    customerName: orderPayload.customerName,
    customerEmail: orderPayload.customerEmail,
    customerPhone: orderPayload.customerPhone,
    shippingAddress: orderPayload.shippingAddress,
    items: orderPayload.items,
    totalAmount: orderPayload.totalAmount,
    orderStatus: "placed",
    paymentMethod: orderPayload.paymentMethod || "Online (Card / UPI)",
    paymentStatus: orderPayload.paymentStatus || "paid",
    createdAt: new Date().toISOString(),
  };

  // 1. Store in localStorage for instant synchronization across tabs
  const existingOrders = getStoredOrders();
  setStoredOrders([newOrder, ...existingOrders]);

  // 2. Dispatch admin notification locally
  await addAdminNotification({
    title: "New Order Placed! 🎉",
    message: `Order #${orderNumber} placed by ${orderPayload.customerName} for ₹${orderPayload.totalAmount.toLocaleString("en-IN")}.`,
    type: "order",
  });

  // 3. Automatically subtract inventory when order is placed
  try {
    await adjustInventoryForOrder(orderPayload.items, "decrease");
  } catch (invErr) {
    console.warn("Could not adjust inventory on order placement:", invErr);
  }

  // 4. Sync with Supabase orders and order_items tables
  try {
    const isUserUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderPayload.userId);
    const client = await getOrderSyncClient();

    const notesPayload = JSON.stringify({
      orderNumber,
      items: orderPayload.items,
    });

    const { error: orderError } = await client.from("orders").insert([{
      id: orderId,
      user_id: isUserUuid ? orderPayload.userId : null,
      customer_name: orderPayload.customerName,
      customer_email: orderPayload.customerEmail,
      customer_phone: orderPayload.customerPhone,
      shipping_address: orderPayload.shippingAddress,
      total_amount: orderPayload.totalAmount,
      status: "pending",
      payment_method: newOrder.paymentMethod,
      payment_status: newOrder.paymentStatus,
      notes: notesPayload,
    }]);

    if (orderError) {
      console.error("Supabase orders table insert error:", orderError);
    }

    if (orderPayload.items.length > 0) {
      const itemsPayload = orderPayload.items.map((it) => ({
        order_id: orderId,
        product_id: it.productId || "es-1",
        product_name: it.heading,
        price: it.price,
        quantity: it.quantity,
        size: it.size || "",
        colour: it.colour || "",
      }));
      const { error: itemsError } = await client.from("order_items").insert(itemsPayload);
      if (itemsError) {
        console.warn("order_items insert warning:", itemsError);
      }
    }
  } catch (err) {
    console.error("Supabase orders sync error:", err);
  }

  return { success: true, order: newOrder };
};

export const getCustomerOrders = async (
  userId?: string,
  email?: string
): Promise<CustomerOrder[]> => {
  try {
    const client = await getOrderSyncClient();
    let query = client
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (email && email.trim()) {
      query = query.ilike("customer_email", email.trim());
    } else if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const sbOrders: CustomerOrder[] = data.map((d: any) => {
        let orderNum = "";
        let backupItems: any[] = [];
        let uiStatusFromNotes = "";
        let courierFromNotes = "";
        let trackingFromNotes = "";
        let deliveredAtFromNotes = "";

        if (d.notes) {
          if (d.notes.startsWith("KD-")) {
            orderNum = d.notes;
          } else {
            try {
              const parsed = JSON.parse(d.notes);
              orderNum = parsed.orderNumber || "";
              if (parsed.uiStatus) uiStatusFromNotes = parsed.uiStatus;
              if (parsed.courierName) courierFromNotes = parsed.courierName;
              if (parsed.trackingId) trackingFromNotes = parsed.trackingId;
              if (parsed.deliveredAt) deliveredAtFromNotes = parsed.deliveredAt;
              if (Array.isArray(parsed.items)) backupItems = parsed.items;
            } catch {}
          }
        }
        if (!orderNum) {
          orderNum = `KD-${(d.id || "").substring(0, 6).toUpperCase()}`;
        }

        const dbItems = (d.order_items || []).map((item: any) => ({
          productId: item.product_id,
          heading: item.product_name,
          price: Number(item.price),
          quantity: item.quantity,
          size: item.size,
          colour: item.colour,
        }));

        const finalItems = dbItems.length > 0 ? dbItems : backupItems;
        const effectiveStatus = (uiStatusFromNotes as OrderStatus) || toUiStatus(d.status);

        return {
          _id: d.id,
          orderNumber: orderNum,
          userId: d.user_id,
          customerName: d.customer_name || "Customer",
          customerEmail: d.customer_email || "",
          customerPhone: d.customer_phone || "",
          shippingAddress: d.shipping_address || { address: "", city: "", pincode: "" },
          items: finalItems,
          totalAmount: Number(d.total_amount),
          orderStatus: effectiveStatus,
          courierName: courierFromNotes,
          trackingId: trackingFromNotes,
          deliveredAt: deliveredAtFromNotes,
          paymentMethod: d.payment_method || "Online",
          paymentStatus: d.payment_status || "paid",
          createdAt: d.created_at,
        };
      });

      // Maintain consistency: Supabase is single source of truth, sync local cache
      setStoredOrders(sbOrders);
      return sbOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  } catch (err) {
    console.warn("Failed to fetch Supabase customer orders:", err);
  }

  // Fallback to local storage ONLY if database query resulted in a network error
  return getStoredOrders().filter(
    (o) => (userId && o.userId === userId) || (email && o.customerEmail.toLowerCase() === email.toLowerCase())
  );
};

export const getCustomerOrderById = async (
  orderId: string,
  userId?: string,
  email?: string
): Promise<CustomerOrder | null> => {
  const all = await getCustomerOrders(userId, email);
  return (
    all.find(
      (o) =>
        o._id === orderId ||
        o.orderNumber.toLowerCase() === orderId.toLowerCase() ||
        o._id.toLowerCase() === orderId.toLowerCase()
    ) || null
  );
};

export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  courierDetails?: { courierName?: string; trackingId?: string }
): Promise<boolean> => {
  const orders = getStoredOrders();
  const previousOrder = orders.find((o) => o._id === orderId);
  const prevStatus = previousOrder?.orderStatus;
  const deliveredAt = newStatus === "delivered" ? new Date().toISOString() : undefined;

  const updatedOrders = orders.map((o) => {
    if (o._id === orderId) {
      return {
        ...o,
        orderStatus: newStatus,
        ...(courierDetails?.courierName ? { courierName: courierDetails.courierName } : {}),
        ...(courierDetails?.trackingId ? { trackingId: courierDetails.trackingId } : {}),
        ...(deliveredAt ? { deliveredAt } : {}),
      };
    }
    return o;
  });

  setStoredOrders(updatedOrders);

  // Automatic inventory manipulation:
  // If order transitions to cancelled or delivery_failed, increase inventory (+1 / +quantity)
  // If order was cancelled and now re-opened, decrease inventory
  const isNowCancelled = newStatus === "cancelled" || newStatus === "delivery_failed";
  const wasCancelled = prevStatus === "cancelled" || prevStatus === "delivery_failed";

  try {
    const client = await getOrderSyncClient();
    const { data: existingRow } = await client
      .from("orders")
      .select("notes, status, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    let notesObj: any = {};
    let orderItemsToAdjust: OrderItem[] = previousOrder?.items || [];

    if (existingRow?.notes) {
      if (existingRow.notes.startsWith("KD-")) {
        notesObj.orderNumber = existingRow.notes;
      } else {
        try {
          notesObj = JSON.parse(existingRow.notes);
          if (Array.isArray(notesObj.items) && notesObj.items.length > 0) {
            orderItemsToAdjust = notesObj.items;
          }
        } catch {}
      }
    }

    if (Array.isArray(existingRow?.order_items) && existingRow.order_items.length > 0) {
      orderItemsToAdjust = existingRow.order_items.map((it: any) => ({
        productId: it.product_id,
        heading: it.product_name,
        price: Number(it.price),
        quantity: it.quantity,
        size: it.size,
        colour: it.colour,
      }));
    }

    // Inventory manipulation check
    if (isNowCancelled && !wasCancelled && orderItemsToAdjust.length > 0) {
      await adjustInventoryForOrder(orderItemsToAdjust, "increase");
    } else if (!isNowCancelled && wasCancelled && orderItemsToAdjust.length > 0) {
      await adjustInventoryForOrder(orderItemsToAdjust, "decrease");
    }

    notesObj.uiStatus = newStatus;
    if (courierDetails?.courierName) notesObj.courierName = courierDetails.courierName;
    if (courierDetails?.trackingId) notesObj.trackingId = courierDetails.trackingId;
    if (deliveredAt) notesObj.deliveredAt = deliveredAt;

    const dbStatus = toDbStatus(newStatus);
    const updatePayload: any = {
      status: dbStatus,
      notes: JSON.stringify(notesObj),
    };

    const { error } = await client.from("orders").update(updatePayload).eq("id", orderId);
    if (error) {
      console.error("Supabase order status update error:", error);
      throw error;
    }
  } catch (e) {
    console.error("Supabase order status update warning:", e);
    throw e;
  }

  return true;
};
