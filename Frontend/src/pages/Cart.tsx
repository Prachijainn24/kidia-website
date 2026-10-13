import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  Heart,
  ShoppingBag,
  MapPin,
  Check,
  LogIn,
  AlertCircle,
  X,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatINR } from "@/data/catalog";
import { lineProduct, useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import {
  getSavedAddresses,
  saveAddress,
  updateAddress,
  deleteAddress,
  syncAddressesFromSupabase,
  SavedAddress,
} from "@/services/addressService";

const Cart = () => {
  const { lines, setQty, remove } = useCart();
  const wish = useWishlist();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const rows = lines.map((l) => ({ l, p: lineProduct(l) })).filter((r) => r.p);
  const subtotal = rows.reduce((n, { l, p }) => n + p.price * l.quantity, 0);
  const mrpTotal = rows.reduce((n, { l, p }) => n + (p.mrp ?? p.price) * l.quantity, 0);
  const savings = mrpTotal - subtotal;

  // Address State
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const selectedAddr = addresses.find((a) => a.id === selectedAddressId) || addresses.find((a) => a.isDefault) || addresses[0];
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [newFullName, setNewFullName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newState, setNewState] = useState("");
  const [newPincode, setNewPincode] = useState("");

  useEffect(() => {
    if (user) {
      const list = getSavedAddresses(user.id);
      setAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault) || list[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
      if (profile) {
        setNewFullName(profile.display_name || "");
        setNewPhone(profile.phone || "");
      }

      syncAddressesFromSupabase(user.id).then((synced) => {
        if (synced && synced.length > 0) {
          setAddresses(synced);
          const cur = synced.find((a) => a.id === selectedAddressId) || synced.find((a) => a.isDefault) || synced[0];
          if (cur) setSelectedAddressId(cur.id);
        }
      });
    }
  }, [user, profile]);

  const handleStartAddAddress = () => {
    setEditingAddressId(null);
    setNewFullName(profile?.display_name || "");
    setNewPhone(profile?.phone || "");
    setNewAddressLine("");
    setNewCity("");
    setNewState("");
    setNewPincode("");
    setShowAddAddr(true);
  };

  const handleStartEditAddress = (addr: SavedAddress, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setNewFullName(addr.fullName);
    setNewPhone(addr.phone);
    setNewAddressLine(addr.addressLine);
    setNewCity(addr.city);
    setNewState(addr.state);
    setNewPincode(addr.pincode);
    setShowAddAddr(true);
  };

  const handleDeleteAddress = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    const res = deleteAddress(user.id, id);
    setAddresses(res.addresses);
    if (selectedAddressId === id) {
      const next = res.addresses.find((a) => a.isDefault) || res.addresses[0];
      setSelectedAddressId(next ? next.id : "");
    }
    toast.success("Address deleted successfully.");
  };

  const handleSaveOrUpdateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in to save address.");
      return;
    }

    if (!newFullName.trim() || !newPhone.trim() || !newAddressLine.trim() || !newCity.trim() || !newPincode.trim()) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    if (editingAddressId) {
      const existing = addresses.find((a) => a.id === editingAddressId);
      const res = updateAddress(user.id, {
        id: editingAddressId,
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        addressLine: newAddressLine.trim(),
        city: newCity.trim(),
        state: newState.trim() || "State",
        pincode: newPincode.trim(),
        isDefault: existing?.isDefault ?? false,
      });
      setAddresses(res.addresses);
      setSelectedAddressId(editingAddressId);
      setShowAddAddr(false);
      setEditingAddressId(null);
      toast.success("Address updated successfully.");
    } else {
      const res = saveAddress(user.id, {
        fullName: newFullName.trim(),
        phone: newPhone.trim(),
        addressLine: newAddressLine.trim(),
        city: newCity.trim(),
        state: newState.trim() || "State",
        pincode: newPincode.trim(),
        isDefault: addresses.length === 0,
      });

      if (!res.success) {
        toast.error(res.error || "Could not save address.");
        return;
      }

      setAddresses(res.addresses);
      const added = res.addresses[0];
      if (added) setSelectedAddressId(added.id);
      setShowAddAddr(false);
      toast.success("New address added successfully.");
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      toast.error("Please sign in to complete your order.");
      navigate("/auth?redirect=/cart");
      return;
    }

    if (rows.length === 0) {
      toast.error("Your shopping bag is empty.");
      return;
    }

    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    if (!selectedAddr) {
      toast.error("Please select or add a delivery address before checkout.");
      return;
    }

    // Prepare checkout data and navigate to payment page
    const checkoutItems = rows.map(({ l, p }) => ({
      productId: p.id,
      heading: p.name,
      price: p.price,
      quantity: l.quantity,
      size: l.size,
      colour: l.colour,
      image: p.images[0],
    }));

    navigate("/payment", {
      state: {
        address: selectedAddr,
        items: checkoutItems,
        totalAmount: subtotal,
      },
    });
  };

  if (rows.length === 0) {
    return (
      <Layout title="Your Bag | KIDIA">
        <div className="container-kidia py-24 text-center">
          <div className="mx-auto mb-6 inline-flex rounded-full bg-peach p-6">
            <ShoppingBag className="h-10 w-10 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold">Your bag is empty</h1>
          <p className="mt-2 text-muted-foreground">Find something lovely for your little one.</p>
          <Button asChild className="mt-8 h-12 rounded-full px-10">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Your Bag | KIDIA">
      <div className="container-kidia py-12 text-left">
        <h1 className="mb-8 font-serif text-3xl sm:text-4xl font-bold text-foreground">
          Your Shopping Bag
        </h1>

        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
          <div className="space-y-6">
            {/* Zomato-Style Sleek Delivery Address Bar (At Top with Small Height) */}
            <div
              onClick={() => {
                if (!user) {
                  navigate("/auth?redirect=/cart");
                } else {
                  setAddressModalOpen(true);
                }
              }}
              className="rounded-2xl border border-primary/25 bg-card p-3 sm:px-4 sm:py-3 cursor-pointer hover:border-primary/60 hover:shadow-xs transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 text-left">
                  {!user ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground">Delivery Address</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                        Sign in to select delivery address
                      </p>
                    </>
                  ) : selectedAddr ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                          Deliver to: <span className="text-primary font-extrabold">{selectedAddr.fullName}</span>
                        </span>
                        {selectedAddr.isDefault && (
                          <span className="text-[9px] font-extrabold uppercase bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full shrink-0">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate max-w-xs sm:max-w-md md:max-w-lg">
                        {selectedAddr.addressLine}, {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode} • 📞 {selectedAddr.phone}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-foreground">Delivery Address</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground truncate">
                        Tap to select or add address
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                {!user ? (
                  <span className="text-xs font-bold text-primary group-hover:underline px-3 py-1 rounded-full border border-primary/30">
                    Sign In
                  </span>
                ) : selectedAddr ? (
                  <span className="text-xs font-bold text-primary group-hover:bg-primary group-hover:text-primary-foreground px-3 py-1 rounded-full border border-primary/30 transition-all flex items-center gap-1">
                    Change
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/30">
                    + Add
                  </span>
                )}
              </div>
            </div>

            {/* Bag Items List */}
            <ul className="divide-y rounded-3xl border bg-card shadow-soft">
              {rows.map(({ l, p }) => (
                <li key={l.key} className="flex gap-4 p-4 md:p-6">
                  <Link to={`/product/${p.slug}`}>
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="h-28 w-20 sm:h-32 sm:w-24 rounded-2xl object-cover border"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-2">
                        <Link
                          to={`/product/${p.slug}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors text-sm sm:text-base line-clamp-1"
                        >
                          {p.name}
                        </Link>
                        <span className="font-bold text-foreground text-sm sm:text-base whitespace-nowrap">
                          {formatINR(p.price * l.quantity)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        Size: <span className="font-medium text-foreground">{l.size}</span> · Colour:{" "}
                        <span className="font-medium text-foreground">{l.colour}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatINR(p.price)} each</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3">
                      <div className="flex items-center rounded-full border bg-background">
                        <button
                          className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setQty(l.key, l.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs sm:text-sm font-bold">{l.quantity}</span>
                        <button
                          className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          disabled={l.quantity >= p.stock[l.size]}
                          onClick={() => setQty(l.key, l.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <button
                        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors ml-auto sm:ml-0"
                        onClick={() => {
                          if (!wish.ids.includes(p.id)) wish.toggle(p.id);
                          remove(l.key);
                          toast.success("Moved to wishlist");
                        }}
                      >
                        <Heart className="h-3.5 w-3.5" />
                        Move to wishlist
                      </button>

                      <button
                        className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => {
                          remove(l.key);
                          toast.success("Removed from bag");
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Zomato-Style Address Selection Popup Modal */}
            {addressModalOpen && user && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 text-left max-h-[85vh] flex flex-col">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between border-b pb-3 shrink-0">
                    <div>
                      <h3 className="font-serif text-xl font-bold text-foreground">Select Delivery Address</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Tap an address below to select where your order is delivered
                      </p>
                    </div>
                    <button
                      onClick={() => { setAddressModalOpen(false); setShowAddAddr(false); }}
                      className="p-1 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                    {!showAddAddr ? (
                      <>
                        {addresses.length < 5 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleStartAddAddress}
                            className="w-full rounded-2xl border-dashed border-primary/50 text-primary hover:bg-primary/5 font-bold text-xs h-11 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>+ Add New Delivery Address ({addresses.length}/5)</span>
                          </Button>
                        )}

                        {addresses.length === 0 ? (
                          <div className="text-center py-8 border border-dashed rounded-2xl p-4">
                            <p className="text-xs text-muted-foreground">No saved addresses yet.</p>
                            <Button
                              size="sm"
                              onClick={handleStartAddAddress}
                              className="mt-3 rounded-full font-bold text-xs cursor-pointer"
                            >
                              + Add Delivery Address
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {addresses.map((addr) => {
                              const isSelected = selectedAddressId === addr.id;
                              return (
                                <div
                                  key={addr.id}
                                  onClick={() => {
                                    setSelectedAddressId(addr.id);
                                    setAddressModalOpen(false);
                                    toast.success(`Delivering to ${addr.fullName}`);
                                  }}
                                  className={`rounded-2xl border p-4 cursor-pointer transition-all flex items-start gap-3.5 group/item ${
                                    isSelected
                                      ? "border-primary bg-primary/10 ring-2 ring-primary/25 shadow-xs"
                                      : "border-border/70 hover:border-primary/50 hover:bg-muted/30"
                                  }`}
                                >
                                  <div className="pt-0.5 shrink-0">
                                    <span
                                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                        isSelected
                                          ? "border-primary bg-primary text-primary-foreground"
                                          : "border-muted-foreground/40"
                                      }`}
                                    >
                                      {isSelected && <Check size={11} strokeWidth={3} />}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold text-xs sm:text-sm text-foreground">
                                          {addr.fullName}
                                        </span>
                                        {addr.isDefault && (
                                          <span className="text-[10px] font-extrabold uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">
                                            Default
                                          </span>
                                        )}
                                      </div>

                                      {/* Edit and Delete Buttons */}
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={(e) => handleStartEditAddress(addr, e)}
                                          title="Edit address"
                                          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-foreground hover:bg-primary px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-primary/30 bg-primary/5"
                                        >
                                          <Pencil className="h-3 w-3" />
                                          <span>Edit</span>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={(e) => handleDeleteAddress(addr.id, e)}
                                          title="Delete address"
                                          className="p-1.5 rounded-lg text-destructive hover:text-white hover:bg-destructive transition-all cursor-pointer border border-destructive/30 bg-destructive/5 flex items-center justify-center"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                                      {addr.addressLine}, {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                                      📞 {addr.phone}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </>
                    ) : (
                      <form onSubmit={handleSaveOrUpdateAddress} className="space-y-3 pt-1">
                        <div className="flex items-center justify-between pb-1">
                          <span className="font-serif font-bold text-sm text-foreground">
                            {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                          </span>
                          <button
                            type="button"
                            onClick={() => { setShowAddAddr(false); setEditingAddressId(null); }}
                            className="text-xs font-semibold text-muted-foreground hover:text-foreground underline cursor-pointer"
                          >
                            Back to saved list
                          </button>
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-2">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Recipient Full Name *</Label>
                            <Input
                              required
                              placeholder="Full name"
                              value={newFullName}
                              onChange={(e) => setNewFullName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">Phone Number *</Label>
                            <Input
                              required
                              type="tel"
                              placeholder="+91 98765 43210"
                              value={newPhone}
                              onChange={(e) => setNewPhone(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-semibold">Address Line *</Label>
                          <Input
                            required
                            placeholder="House/Flat number, Street, Landmark"
                            value={newAddressLine}
                            onChange={(e) => setNewAddressLine(e.target.value)}
                          />
                        </div>

                        <div className="grid gap-2.5 sm:grid-cols-3">
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">City *</Label>
                            <Input
                              required
                              placeholder="City"
                              value={newCity}
                              onChange={(e) => setNewCity(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">State *</Label>
                            <Input
                              required
                              placeholder="State"
                              value={newState}
                              onChange={(e) => setNewState(e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[11px] font-semibold">PIN Code *</Label>
                            <Input
                              required
                              maxLength={6}
                              placeholder="6-digit PIN"
                              value={newPincode}
                              onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ""))}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t">
                          <Button type="submit" size="sm" className="rounded-full font-bold bg-primary text-primary-foreground cursor-pointer">
                            {editingAddressId ? "Save Changes" : "Save & Deliver Here"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setShowAddAddr(false); setEditingAddressId(null); }}
                            className="rounded-full cursor-pointer"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="h-fit space-y-4 rounded-3xl bg-secondary p-6 lg:sticky lg:top-28 shadow-soft">
            <h2 className="font-serif text-2xl font-bold text-foreground">Order summary</h2>
            <dl className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Total MRP</dt>
                <dd className="font-semibold">{formatINR(mrpTotal)}</dd>
              </div>
              {savings > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount on MRP</dt>
                  <dd className="font-bold">−{formatINR(savings)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="text-emerald-700 font-semibold">FREE Delivery</dd>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold text-foreground">
                <dt>Estimated total</dt>
                <dd className="text-lg">{formatINR(subtotal)}</dd>
              </div>
            </dl>

            <div className="rounded-2xl bg-card p-4 text-xs text-muted-foreground leading-relaxed">
              Standard boutique packaging with care instructions included in every delivery.
            </div>

            <Button
              onClick={handleProceedToCheckout}
              className="h-12 w-full rounded-full font-bold shadow-soft text-base"
            >
              {user ? "Proceed to Checkout" : "Sign in to Order"}
            </Button>

            <Button asChild variant="ghost" className="w-full rounded-full">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
