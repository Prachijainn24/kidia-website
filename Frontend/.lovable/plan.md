

# Homepage & Store Restructure

This plan transforms the portfolio/inquiry-only website into a fully functional e-commerce store with cart, checkout, and proper product flow.

---

## Summary of Changes

### Current State → New State
- **Wishlist page** → Removed (keep wishlist functionality in header icon only)
- **Inquiry-based flow** → Shopping cart + checkout flow
- **Product detail "Inquire" button** → "Add to Bag" + quantity selector
- **Homepage structure** → Reorganized to match reference layout

---

## 1. Homepage Restructure

Reorganize sections to follow this exact order:

| Section | Description |
|---------|-------------|
| Hero Banner | Keep existing lifestyle hero |
| Featured Collection(s) | 1-2 highlighted collections with editorial imagery |
| Latest Products | Grid of newest arrivals |
| Collections | Grid/list of all collection categories |
| About Us | Brand philosophy snippet with link |
| Follow Us | Social media / Instagram feed placeholder |

### Remove from Homepage
- Philosophy statement section (move essence to About Us section)
- Marquee text banner
- Full-width lifestyle banner mid-page
- Newsletter section (move to footer only)

---

## 2. Collection/Products Page Updates

### Add Filters
- Collection filter (already exists)
- Price range filter (Low to High, High to Low)
- Material type filter
- "New Arrivals" and "Featured" quick filters

### Add Sorting
- Dropdown with options:
  - Featured (default)
  - Newest
  - Price: Low to High
  - Price: High to Low
  - Alphabetical A-Z

### Product Grid
- Keep existing editorial-style grid
- Ensure all cards show mock data
- Only the first product links to real detail page (others link to same product for demo purposes)

---

## 3. Product Detail Page Updates

### Current → New Layout
| Element | Change |
|---------|--------|
| Images | Keep existing gallery |
| Title, Description, Price | Keep |
| "Inquire About This Piece" | → "Add to Bag" primary CTA |
| Wishlist button | Keep as secondary action |
| **New: Quantity Selector** | Add increment/decrement control |
| Related Products | Keep existing |

### New Elements to Add
- Quantity selector (1-10, with +/- buttons)
- "Add to Bag" button replaces inquiry button
- Toast notification on add to cart

---

## 4. New Cart System

### Create Cart Store (Zustand)
Similar to wishlist but with quantity:
- `items: { product, quantity }[]`
- `addItem(product, quantity)`
- `updateQuantity(productId, quantity)`
- `removeItem(productId)`
- `getTotal()`
- `getItemCount()`
- Persist to localStorage

### Cart Page (`/cart`)
| Element | Description |
|---------|-------------|
| Product List | Image, title, price, quantity selector, remove button |
| Cart Summary | Subtotal, estimated shipping, total |
| Checkout CTA | Button linking to checkout page |
| Continue Shopping | Secondary link back to products |

---

## 5. Checkout Page (`/checkout`)

### Coming Soon Banner
- Prominent banner: "Online checkout coming soon"
- Message: "Please contact us to complete your order"
- Email/phone contact info

### Order Summary
- List of cart items (read-only)
- Quantities and prices
- Subtotal and total

### Contact Form
- Name, Email, Phone
- Shipping address fields
- Order notes/special requests
- "Submit Order Request" button
- Form submits and clears cart with success message

---

## 6. Header Updates

### Navigation Changes
| Current | New |
|---------|-----|
| Wishlist icon | Keep (but no dedicated page, opens mini drawer or tooltip) |
| **New:** Cart icon | Bag icon with item count badge |

### Cart Icon Behavior
- Shows item count
- Links to `/cart` page

---

## 7. Mock Data Strategy

### Product Cards Approach
- All product cards render with unique mock data (images, names, prices)
- For demo simplicity, clicking any product goes to a single working detail page
- This prevents broken pages while showcasing the grid design

### Implementation
- Keep existing product data
- First product (Arc Pendant Light) is the "real" linkable product
- Other cards can link to this same product for the demo

---

## 8. Files to Create

| File | Purpose |
|------|---------|
| `src/hooks/useCart.ts` | Cart state management with Zustand |
| `src/pages/Cart.tsx` | Shopping cart page |
| `src/pages/Checkout.tsx` | Checkout page with form |
| `src/components/QuantitySelector.tsx` | Reusable +/- quantity control |
| `src/components/CartIcon.tsx` | Header cart icon with badge |

---

## 9. Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Index.tsx` | Restructure sections per new layout |
| `src/pages/Products.tsx` | Add filters and sorting UI |
| `src/pages/ProductDetail.tsx` | Add quantity selector, change CTA to "Add to Bag" |
| `src/components/Header.tsx` | Add cart icon, update wishlist behavior |
| `src/components/Footer.tsx` | Remove wishlist link, keep rest |
| `src/App.tsx` | Add `/cart` and `/checkout` routes, remove `/wishlist` |
| `src/components/Layout.tsx` | Fix TypeScript error with Framer Motion variants |

---

## 10. Files to Delete

| File | Reason |
|------|--------|
| `src/pages/Wishlist.tsx` | User requested removal |

---

## Technical Details

### Fix Build Error (Layout.tsx)
The Framer Motion `ease` array needs to be typed as a tuple:
```typescript
ease: [0.25, 0.46, 0.45, 0.94] as const
```

### Cart Store Structure
```typescript
interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}
```

### Quantity Selector Component
- Shows current quantity (default: 1)
- Minus button (disabled at 1)
- Plus button (max 10)
- Clean, minimal styling matching brand

### Sorting Implementation
- URL parameter based (`?sort=price-asc`)
- Combined with existing collection filter
- `useMemo` for filtered and sorted products

---

## Visual Design Notes

- Maintain warm, Scandinavian aesthetic throughout
- Cart and checkout pages use same cream/neutral tones
- No dark theming - keep light, warm palette
- Generous whitespace on cart/checkout pages
- Form inputs match existing inquiry form styling

