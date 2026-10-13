import { supabase } from "@/integrations/supabase/client";

export interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

const STORAGE_PREFIX = "kidia_saved_addresses_";

const syncToSupabase = async (addresses: SavedAddress[]) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase.auth.updateUser({
        data: { saved_addresses: addresses },
      });
    }
  } catch (err) {
    console.warn("Could not sync addresses to Supabase user metadata:", err);
  }
};

export const syncAddressesFromSupabase = async (userId: string): Promise<SavedAddress[]> => {
  if (!userId) return [];
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const metaAddresses = user?.user_metadata?.saved_addresses;
    if (Array.isArray(metaAddresses) && metaAddresses.length > 0) {
      localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(metaAddresses));
      return metaAddresses;
    }
  } catch (err) {
    console.warn("Failed to fetch addresses from Supabase metadata:", err);
  }
  return getSavedAddresses(userId);
};

export const getSavedAddresses = (userId: string): SavedAddress[] => {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read saved addresses:", err);
  }
  return [];
};

export const saveAddress = (
  userId: string,
  newAddr: Omit<SavedAddress, "id">
): { success: boolean; addresses: SavedAddress[]; error?: string } => {
  if (!userId) {
    return { success: false, addresses: [], error: "User is not authenticated" };
  }

  const existing = getSavedAddresses(userId);
  if (existing.length >= 5) {
    return {
      success: false,
      addresses: existing,
      error: "You can save a maximum of 5 delivery addresses. Please delete an older address first.",
    };
  }

  const id = `addr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const isDefault = existing.length === 0 || !!newAddr.isDefault;

  // If marked as default, clear other defaults
  const cleanedExisting = isDefault
    ? existing.map((a) => ({ ...a, isDefault: false }))
    : existing;

  const addressToSave: SavedAddress = {
    ...newAddr,
    id,
    isDefault,
  };

  const updated = [addressToSave, ...cleanedExisting];
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to save address:", err);
  }
  syncToSupabase(updated);

  return { success: true, addresses: updated };
};

export const updateAddress = (
  userId: string,
  updatedAddr: SavedAddress
): { success: boolean; addresses: SavedAddress[]; error?: string } => {
  if (!userId) {
    return { success: false, addresses: [], error: "User is not authenticated" };
  }

  const existing = getSavedAddresses(userId);
  let updatedList = existing.map((a) => (a.id === updatedAddr.id ? updatedAddr : a));

  if (updatedAddr.isDefault) {
    updatedList = updatedList.map((a) =>
      a.id === updatedAddr.id ? { ...a, isDefault: true } : { ...a, isDefault: false }
    );
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updatedList));
  } catch (err) {
    console.warn("Failed to update address:", err);
  }
  syncToSupabase(updatedList);

  return { success: true, addresses: updatedList };
};

export const deleteAddress = (
  userId: string,
  addressId: string
): { success: boolean; addresses: SavedAddress[] } => {
  if (!userId) return { success: false, addresses: [] };

  const existing = getSavedAddresses(userId);
  let updated = existing.filter((a) => a.id !== addressId);

  // If deleted address was default and other addresses remain, make the first one default
  if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
    updated[0].isDefault = true;
  }

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to delete address:", err);
  }
  syncToSupabase(updated);

  return { success: true, addresses: updated };
};

export const setDefaultAddress = (
  userId: string,
  addressId: string
): { success: boolean; addresses: SavedAddress[] } => {
  if (!userId) return { success: false, addresses: [] };

  const existing = getSavedAddresses(userId);
  const updated = existing.map((a) => ({
    ...a,
    isDefault: a.id === addressId,
  }));

  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (err) {
    console.warn("Failed to set default address:", err);
  }
  syncToSupabase(updated);

  return { success: true, addresses: updated };
};
