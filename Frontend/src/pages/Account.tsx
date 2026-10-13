import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  UserRound,
  LogOut,
  Heart,
  ShoppingBag,
  Package,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  Edit2,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  getSavedAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  SavedAddress,
} from "@/services/addressService";

export default function Account() {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [preferences, setPreferences] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // Address Management State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrName, setAddrName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrLine, setAddrLine] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrPincode, setAddrPincode] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);

  // Prefill initial user details
  useEffect(() => {
    if (profile) {
      if (profile.display_name) setName(profile.display_name);
      if (profile.phone) setPhone(profile.phone);
    } else if (user) {
      setName(user.user_metadata?.display_name || user.email?.split("@")[0] || "");
    }
  }, [profile, user]);

  // Load from Supabase profiles & saved addresses
  useEffect(() => {
    if (!user) return;
    let active = true;

    // Load saved addresses
    const userAddresses = getSavedAddresses(user.id);
    setAddresses(userAddresses);

    // Fetch profile from Supabase
    void supabase
      .from("profiles")
      .select("display_name, phone, preferences")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        if (data) {
          if (data.display_name) setName(data.display_name);
          if (data.phone) setPhone(data.phone);
          if (data.preferences) setPreferences(data.preferences);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  if (!loading && !user) return <Navigate to="/auth" replace />;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError("");

    const updatedProfile = {
      id: user.id,
      email: user.email || "",
      display_name: name.trim(),
      phone: phone.trim(),
      preferences: preferences.trim(),
      role: profile?.role || "customer",
      status: profile?.status || "active",
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Attempt updating Supabase profiles table
      try {
        await supabase.from("profiles").upsert(updatedProfile);
      } catch (sbErr) {
        console.warn("Supabase profile upsert caught warning:", sbErr);
      }

      // 2. Persist locally to active session overrides
      try {
        localStorage.setItem("kidia_bypass_profile", JSON.stringify(updatedProfile));
        const savedSession = localStorage.getItem("kidia_bypass_session");
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          parsed.user_metadata = { ...(parsed.user_metadata || {}), display_name: name.trim() };
          localStorage.setItem("kidia_bypass_session", JSON.stringify(parsed));
        }
      } catch {}

      await refreshProfile();
      setSaved(true);
      toast.success("Your profile details have been saved.");
    } catch (err: any) {
      setError(err?.message || "Could not save profile.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await signOut();
      toast.success("You have been signed out.");
      navigate("/");
    } catch {
      setError("Could not sign out. Please try again.");
      setBusy(false);
    }
  };

  // Address Handlers
  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrName("");
    setAddrPhone("");
    setAddrLine("");
    setAddrCity("");
    setAddrState("");
    setAddrPincode("");
    setAddrIsDefault(false);
    setShowAddressForm(false);
  };

  const handleStartEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id);
    setAddrName(addr.fullName);
    setAddrPhone(addr.phone);
    setAddrLine(addr.addressLine);
    setAddrCity(addr.city);
    setAddrState(addr.state);
    setAddrPincode(addr.pincode);
    setAddrIsDefault(!!addr.isDefault);
    setShowAddressForm(true);
  };

  const handleSaveAddress = (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!addrName.trim() || !addrPhone.trim() || !addrLine.trim() || !addrCity.trim() || !addrPincode.trim()) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (editingAddressId) {
      const res = updateAddress(user.id, {
        id: editingAddressId,
        fullName: addrName.trim(),
        phone: addrPhone.trim(),
        addressLine: addrLine.trim(),
        city: addrCity.trim(),
        state: addrState.trim() || "State",
        pincode: addrPincode.trim(),
        isDefault: addrIsDefault,
      });
      setAddresses(res.addresses);
      toast.success("Address updated successfully.");
    } else {
      const res = saveAddress(user.id, {
        fullName: addrName.trim(),
        phone: addrPhone.trim(),
        addressLine: addrLine.trim(),
        city: addrCity.trim(),
        state: addrState.trim() || "State",
        pincode: addrPincode.trim(),
        isDefault: addrIsDefault,
      });
      if (!res.success) {
        toast.error(res.error || "Could not save address.");
        return;
      }
      setAddresses(res.addresses);
      toast.success("New address added successfully.");
    }

    resetAddressForm();
  };

  const handleDeleteAddress = (id: string) => {
    if (!user) return;
    const res = deleteAddress(user.id, id);
    setAddresses(res.addresses);
    toast.success("Address removed.");
  };

  const handleSetDefaultAddress = (id: string) => {
    if (!user) return;
    const res = setDefaultAddress(user.id, id);
    setAddresses(res.addresses);
    toast.success("Default address updated.");
  };

  return (
    <Layout title="My Profile | KIDIA">
      <section className="container-kidia py-12 md:py-16 text-left">
        <div className="mx-auto max-w-3xl space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b pb-6">
            <div>
              <p className="eyebrow mb-1">Your KIDIA Account</p>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
                My Profile
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" size="sm" className="rounded-full gap-2 border-primary text-primary font-bold">
                <Link to="/orders">
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
              </Button>
            </div>
          </div>

          {/* Profile Form */}
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-foreground">Personal Information</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Manage your contact details and boutique preferences.</p>
              </div>
              <UserRound className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </div>

            <form onSubmit={save} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-name" className="text-xs font-semibold">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="profile-name"
                    autoComplete="name"
                    maxLength={80}
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setSaved(false);
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-phone" className="text-xs font-semibold">
                    Phone Number
                  </Label>
                  <Input
                    id="profile-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={20}
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setSaved(false);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-preferences" className="text-xs font-semibold">
                  Favourite Styles & Sizing Notes (Optional)
                </Label>
                <Textarea
                  id="profile-preferences"
                  maxLength={500}
                  placeholder="E.g., Pastel colours, size 3-4Y for elder child, soft cottons for infant..."
                  value={preferences}
                  onChange={(e) => {
                    setPreferences(e.target.value);
                    setSaved(false);
                  }}
                  rows={3}
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium">
                  {error}
                </div>
              )}

              {saved && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Your profile details have been saved.</span>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={busy} className="rounded-full px-6">
                  {busy ? "Saving..." : "Save Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={logout}
                  className="rounded-full text-destructive hover:bg-destructive/10 border-destructive/30"
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  Sign Out
                </Button>
              </div>
            </form>
          </div>

          {/* Delivery Addresses Section */}
          <div className="rounded-3xl border bg-card p-6 sm:p-8 shadow-soft space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif text-2xl font-bold text-foreground">Saved Delivery Addresses</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {addresses.length} / 5
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Save up to 5 delivery addresses to speed up checkout.
                </p>
              </div>

              {!showAddressForm && addresses.length < 5 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    resetAddressForm();
                    setAddrName(name);
                    setAddrPhone(phone);
                    setShowAddressForm(true);
                  }}
                  className="rounded-full gap-1.5 bg-primary font-bold shadow-soft"
                >
                  <Plus className="h-4 w-4" />
                  Add Address
                </Button>
              )}
            </div>

            {/* Address Form (Add / Edit) */}
            {showAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                className="rounded-2xl border border-primary/20 bg-background/80 p-5 space-y-4 animate-in fade-in-50"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {editingAddressId ? "Edit Address" : "Add New Delivery Address"}
                  </h3>
                  <button
                    type="button"
                    onClick={resetAddressForm}
                    className="p-1 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Recipient Full Name *</Label>
                    <Input
                      required
                      placeholder="e.g. John Doe"
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">Phone Number *</Label>
                    <Input
                      required
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">House No., Building, Street *</Label>
                  <Input
                    required
                    placeholder="e.g. Flat 402, Lotus Bloom Apartments, MG Road"
                    value={addrLine}
                    onChange={(e) => setAddrLine(e.target.value)}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">City *</Label>
                    <Input
                      required
                      placeholder="e.g. Jaipur"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">State *</Label>
                    <Input
                      required
                      placeholder="e.g. Rajasthan"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold">PIN Code *</Label>
                    <Input
                      required
                      maxLength={6}
                      placeholder="e.g. 302001"
                      value={addrPincode}
                      onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-foreground">
                    <input
                      type="checkbox"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <span>Set as default delivery address</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" className="rounded-full font-bold">
                    {editingAddressId ? "Save Changes" : "Save Address"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={resetAddressForm}
                    className="rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {/* Address Cards Grid */}
            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-8 rounded-2xl border border-dashed border-border p-6">
                <MapPin className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
                <p className="text-sm font-semibold text-foreground">No saved addresses yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add your home or office address to make ordering swift and easy.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    resetAddressForm();
                    setAddrName(name);
                    setAddrPhone(phone);
                    setShowAddressForm(true);
                  }}
                  className="mt-4 rounded-full border-primary text-primary font-bold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Address
                </Button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative rounded-2xl border p-4 bg-background/60 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          {addr.fullName}
                        </span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-extrabold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <Check size={10} /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">
                        📞 {addr.phone}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 pt-3 border-t text-xs">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-primary hover:underline font-semibold text-[11px] mr-auto"
                        >
                          Make Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleStartEditAddress(addr)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
                        aria-label="Edit address"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap items-center gap-6 border-t pt-6 text-sm">
            <Button asChild variant="link" className="px-0 gap-1.5">
              <Link to="/orders">
                <Package className="h-4 w-4" />
                My Orders
              </Link>
            </Button>
            <Button asChild variant="link" className="px-0 gap-1.5">
              <Link to="/wishlist">
                <Heart className="h-4 w-4" />
                My Wishlist
              </Link>
            </Button>
            <Button asChild variant="link" className="px-0 gap-1.5">
              <Link to="/cart">
                <ShoppingBag className="h-4 w-4" />
                My Bag
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}