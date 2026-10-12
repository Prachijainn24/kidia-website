-- ==============================================================================
-- KIDIA BOUTIQUE - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project (gmwyetmtaiavvcsspxvf)
-- 3. In the left sidebar, click on "SQL Editor"
-- 4. Click "New query"
-- 5. Paste the entire contents of this file and click "Run" (Ctrl+Enter)
-- ==============================================================================

-- Enable UUID and pgcrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- 1. CUSTOMER PROFILES TABLE (Linked with auth.users)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'customer',
    status TEXT NOT NULL DEFAULT 'active',
    privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    preferences TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist in public.profiles even if the table already existed previously
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_accepted BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- ==============================================================================
-- HELPER: Admin check function (Defined AFTER profiles.role column is guaranteed)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  -- Instant admin grant for admin email in JWT
  IF (auth.jwt() ->> 'email') = 'admin@kidia.com' THEN
    RETURN TRUE;
  END IF;

  -- Verify role in profiles table
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Read own profile" ON public.profiles;
CREATE POLICY "Read own profile" 
    ON public.profiles 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can read all profiles" ON public.profiles;
CREATE POLICY "Admin can read all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Insert own profile" ON public.profiles;
CREATE POLICY "Insert own profile" 
    ON public.profiles 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile" 
    ON public.profiles 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id) 
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
CREATE POLICY "Admin can update any profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
CREATE POLICY "Admin can delete profiles"
    ON public.profiles
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Function & Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.create_customer_profile() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, email, phone, privacy_accepted)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
        COALESCE((NEW.raw_user_meta_data ->> 'privacy_accepted')::boolean, FALSE)
    )
    ON CONFLICT (id) DO UPDATE
    SET
        display_name = EXCLUDED.display_name,
        email = EXCLUDED.email,
        phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone),
        updated_at = NOW();
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.create_customer_profile() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_kidia_customer_signup ON auth.users;
CREATE TRIGGER on_kidia_customer_signup 
    AFTER INSERT ON auth.users 
    FOR EACH ROW 
    EXECUTE FUNCTION public.create_customer_profile();

-- ==============================================================================
-- 2. CATEGORIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    image TEXT DEFAULT '',
    commission NUMERIC(5, 2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist in categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS commission NUMERIC(5, 2) DEFAULT 5.00;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Enable RLS for Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" 
    ON public.categories 
    FOR SELECT 
    TO PUBLIC 
    USING (true);

-- Only admins can modify categories
DROP POLICY IF EXISTS "Admin can insert categories" ON public.categories;
CREATE POLICY "Admin can insert categories"
    ON public.categories
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update categories" ON public.categories;
CREATE POLICY "Admin can update categories"
    ON public.categories
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete categories" ON public.categories;
CREATE POLICY "Admin can delete categories"
    ON public.categories
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Grant permissions
GRANT SELECT ON public.categories TO anon;
GRANT ALL ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;

-- ==============================================================================
-- 3. PRODUCTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    gender TEXT NOT NULL DEFAULT 'unisex',
    category TEXT NOT NULL DEFAULT '',
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    occasions TEXT[] DEFAULT '{}',
    festive TEXT[] DEFAULT '{}',
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mrp NUMERIC(10, 2),
    colours JSONB DEFAULT '[]'::jsonb,
    stock JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT '{}',
    is_new BOOLEAN DEFAULT FALSE,
    bestseller BOOLEAN DEFAULT FALSE,
    sold BOOLEAN DEFAULT FALSE,
    fabric TEXT DEFAULT '',
    care TEXT[] DEFAULT '{}',
    description TEXT DEFAULT '',
    added_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist in products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'unisex';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS occasions TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS festive TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS mrp NUMERIC(10, 2);
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS colours JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bestseller BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold BOOLEAN DEFAULT FALSE;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fabric TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS care TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS added_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Enable RLS for Products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view products
DROP POLICY IF EXISTS "Anyone can view products" ON public.products;
CREATE POLICY "Anyone can view products" 
    ON public.products 
    FOR SELECT 
    TO PUBLIC 
    USING (true);

-- Admin can modify products
DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products"
    ON public.products
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products"
    ON public.products
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products"
    ON public.products
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Grant permissions
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;

-- ==============================================================================
-- 4. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    customer_name TEXT NOT NULL DEFAULT '',
    customer_email TEXT NOT NULL DEFAULT '',
    customer_phone TEXT NOT NULL DEFAULT '',
    payment_method TEXT DEFAULT 'cod',
    payment_status TEXT DEFAULT 'pending',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist in orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Enable RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Customers can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" 
    ON public.orders 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

-- Admin can view all orders
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
    ON public.orders
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admin can update orders
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders"
    ON public.orders
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Authenticated and guest users can create orders
DROP POLICY IF EXISTS "Users can insert orders" ON public.orders;
CREATE POLICY "Users can insert orders" 
    ON public.orders 
    FOR INSERT 
    TO PUBLIC 
    WITH CHECK (true);

GRANT SELECT, INSERT ON public.orders TO anon;
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- ==============================================================================
-- 5. ORDER ITEMS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    size TEXT NOT NULL,
    colour TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Order Items
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Customers can view items in their orders
DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
CREATE POLICY "Users can view own order items" 
    ON public.order_items 
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Admin can view all order items
DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;
CREATE POLICY "Admin can view all order items"
    ON public.order_items
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;
CREATE POLICY "Users can insert order items" 
    ON public.order_items 
    FOR INSERT 
    TO PUBLIC 
    WITH CHECK (true);

GRANT SELECT, INSERT ON public.order_items TO anon;
GRANT ALL ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;

-- ==============================================================================
-- 6. REVIEWS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    child_info TEXT NOT NULL,
    city TEXT DEFAULT '',
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    quote TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved reviews
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;
CREATE POLICY "Anyone can view approved reviews" 
    ON public.reviews 
    FOR SELECT 
    TO PUBLIC 
    USING (is_approved = true);

-- Admin can view all reviews
DROP POLICY IF EXISTS "Admin can view all reviews" ON public.reviews;
CREATE POLICY "Admin can view all reviews"
    ON public.reviews
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admin can update reviews (approve/reject)
DROP POLICY IF EXISTS "Admin can update reviews" ON public.reviews;
CREATE POLICY "Admin can update reviews"
    ON public.reviews
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

-- Admin can delete reviews
DROP POLICY IF EXISTS "Admin can delete reviews" ON public.reviews;
CREATE POLICY "Admin can delete reviews"
    ON public.reviews
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Authenticated users can insert reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.reviews;
CREATE POLICY "Authenticated users can create reviews" 
    ON public.reviews 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON public.reviews TO anon;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

-- ==============================================================================
-- 7. WISHLIST TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Enable RLS for Wishlists
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own wishlist
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlists;
CREATE POLICY "Users can view own wishlist" 
    ON public.wishlists 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert into own wishlist" ON public.wishlists;
CREATE POLICY "Users can insert into own wishlist" 
    ON public.wishlists 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete from own wishlist" ON public.wishlists;
CREATE POLICY "Users can delete from own wishlist" 
    ON public.wishlists 
    FOR DELETE 
    TO authenticated 
    USING (auth.uid() = user_id);

GRANT ALL ON public.wishlists TO authenticated;
GRANT ALL ON public.wishlists TO service_role;

-- ==============================================================================
-- 8. CONTACTS TABLE (Customer enquiries / Contact Us form)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT DEFAULT '',
    subject TEXT NOT NULL DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon) can submit a contact form
DROP POLICY IF EXISTS "Anyone can insert contacts" ON public.contacts;
CREATE POLICY "Anyone can insert contacts"
    ON public.contacts
    FOR INSERT
    TO PUBLIC
    WITH CHECK (true);

-- Admin can view all contacts
DROP POLICY IF EXISTS "Admin can view contacts" ON public.contacts;
CREATE POLICY "Admin can view contacts"
    ON public.contacts
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

-- Admin can delete contacts
DROP POLICY IF EXISTS "Admin can delete contacts" ON public.contacts;
CREATE POLICY "Admin can delete contacts"
    ON public.contacts
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Admin can update contacts (mark as read)
DROP POLICY IF EXISTS "Admin can update contacts" ON public.contacts;
CREATE POLICY "Admin can update contacts"
    ON public.contacts
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

GRANT INSERT ON public.contacts TO anon;
GRANT ALL ON public.contacts TO authenticated;
GRANT ALL ON public.contacts TO service_role;

-- ==============================================================================
-- 9. NOTIFICATIONS TABLE (Admin notifications)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('order', 'stock', 'review', 'user', 'info')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Admin can manage notifications
DROP POLICY IF EXISTS "Admin can view notifications" ON public.notifications;
CREATE POLICY "Admin can view notifications"
    ON public.notifications
    FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can insert notifications" ON public.notifications;
CREATE POLICY "Admin can insert notifications"
    ON public.notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update notifications" ON public.notifications;
CREATE POLICY "Admin can update notifications"
    ON public.notifications
    FOR UPDATE
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete notifications" ON public.notifications;
CREATE POLICY "Admin can delete notifications"
    ON public.notifications
    FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- Service role can insert (for triggers)
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.notifications TO authenticated;

-- ==============================================================================
-- 10. SITE SETTINGS TABLE (Store-wide config like sale, theme, etc.)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
DROP POLICY IF EXISTS "Anyone can view settings" ON public.site_settings;
CREATE POLICY "Anyone can view settings"
    ON public.site_settings
    FOR SELECT
    TO PUBLIC
    USING (true);

-- Admin can modify settings
DROP POLICY IF EXISTS "Admin can upsert settings" ON public.site_settings;
CREATE POLICY "Admin can upsert settings"
    ON public.site_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin());

GRANT SELECT ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

-- ==============================================================================
-- 11. AUTO-GENERATE NOTIFICATIONS ON NEW ORDER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (title, message, type)
    VALUES (
        'New Order Received',
        'Order from ' || COALESCE(NEW.customer_name, 'Customer') || ' — ₹' || NEW.total_amount::text,
        'order'
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_new_order_notification ON public.orders;
CREATE TRIGGER on_new_order_notification
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_order();

-- ==============================================================================
-- 12. AUTO-UPDATE updated_at TIMESTAMP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply to profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Apply to orders
DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Apply to categories
DROP TRIGGER IF EXISTS categories_updated_at ON public.categories;
CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- Apply to site_settings
DROP TRIGGER IF EXISTS settings_updated_at ON public.site_settings;
CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON public.site_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

-- ==============================================================================
-- 13. SEED DATA: CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (name, slug, image, commission, is_active) VALUES
    ('Boys'' Clothing', 'boys', '/assets/cat-boys.jpg', 5, true),
    ('Girls'' Clothing', 'girls', '/assets/cat-girls.jpg', 5, true),
    ('Ethnic Wear', 'ethnic', '/assets/cat-ethnic.jpg', 5, true),
    ('Festive Collection', 'festive', '/assets/cat-festive.jpg', 5, true),
    ('Everyday Essentials', 'essentials', '/assets/cat-essentials.jpg', 5, true),
    ('Party & Occasion', 'party', '/assets/cat-party.jpg', 5, true),
    ('Nightwear', 'nightwear', '/assets/cat-nightwear.jpg', 5, true),
    ('Co-ord Sets', 'coords', '/assets/cat-coords.jpg', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 14. SEED DATA: PRODUCTS (2 PER CATEGORY, 16 TOTAL)
-- ==============================================================================
INSERT INTO public.products (
    id, slug, name, gender, category, occasions, festive, price, mrp, colours, stock, images, is_new, bestseller, fabric, care, description, added_at
) VALUES 
(
    'b-1', 'boys-linen-blend-kurta', 'Classic Linen-Blend Boys Kurta', 'boys', 'boys',
    ARRAY['Everyday', 'Festive'], ARRAY[]::text[], 1499, 1899,
    '[{"name":"Ivory","hex":"#F6EEDC"},{"name":"Denim Blue","hex":"#456FA8"}]'::jsonb,
    '{"2-3Y":6,"3-4Y":6,"4-5Y":6,"5-6Y":6,"6-7Y":6,"7-8Y":6}'::jsonb,
    ARRAY['/assets/p-kurta.jpg','/assets/cat-boys.jpg'], FALSE, TRUE, 'Linen-Cotton Blend',
    ARRAY['Machine wash gentle', 'Warm iron', 'Dry in shade'],
    'Tailored for playtime and family gatherings alike, featuring breezy breathable linen and delicate pearl buttons.',
    NOW()
),
(
    'b-2', 'boys-chambray-casual-shirt', 'Breezy Chambray Button-Down', 'boys', 'boys',
    ARRAY['Everyday', 'Birthday'], ARRAY[]::text[], 1199, 1499,
    '[{"name":"Denim Blue","hex":"#456FA8"}]'::jsonb,
    '{"3-4Y":8,"4-5Y":8,"5-6Y":8,"6-7Y":8,"7-8Y":8}'::jsonb,
    ARRAY['/assets/cat-boys.jpg','/assets/p-tee.jpg'], TRUE, FALSE, '100% Breathable Cotton Chambray',
    ARRAY['Machine wash cold', 'Tumble dry low', 'Warm iron'],
    'Crisp yet ultra-soft chambray shirt with roll-up sleeve tabs for sunny adventures and casual outings.',
    NOW()
),
(
    'g-1', 'girls-vintage-floral-sundress', 'Vintage Meadow Floral Sundress', 'girls', 'girls',
    ARRAY['Everyday', 'Birthday'], ARRAY[]::text[], 1399, 1799,
    '[{"name":"Peach","hex":"#F6B79A"},{"name":"Pink","hex":"#F4BFCB"}]'::jsonb,
    '{"1-2Y":5,"2-3Y":5,"3-4Y":5,"4-5Y":5,"5-6Y":5}'::jsonb,
    ARRAY['/assets/p-frock.jpg','/assets/cat-girls.jpg'], FALSE, TRUE, 'Pure Cotton Voile',
    ARRAY['Gentle machine wash', 'Line dry in shade'],
    'Hand-block botanical prints on featherlight cotton with ruffled angel wings and twirl skirt.',
    NOW()
),
(
    'g-2', 'girls-tiered-cotton-midi', 'Tiered Blossom Cotton Dress', 'girls', 'girls',
    ARRAY['Everyday', 'Party'], ARRAY[]::text[], 1599, 1999,
    '[{"name":"Butter Yellow","hex":"#F5DD8B"}]'::jsonb,
    '{"3-4Y":6,"4-5Y":6,"5-6Y":6,"6-7Y":6,"7-8Y":6}'::jsonb,
    ARRAY['/assets/cat-girls.jpg','/assets/p-dress.jpg'], TRUE, FALSE, '100% Organic Muslin Cotton',
    ARRAY['Machine wash cold', 'Dry flat', 'Low iron'],
    'Three tiered layers of sunshine yellow cotton with soft inner lining and delicate gathered cuffs.',
    NOW()
),
(
    'et-1', 'gulab-silk-kurta-pyjama', 'Gulab Silk Kurta & Pyjama Set', 'boys', 'ethnic',
    ARRAY['Festive', 'Wedding'], ARRAY['diwali'], 2490, 2990,
    '[{"name":"Peach","hex":"#F6B79A"},{"name":"Ivory","hex":"#F6EEDC"}]'::jsonb,
    '{"2-3Y":6,"3-4Y":6,"4-5Y":6,"5-6Y":6,"6-7Y":6,"7-8Y":6}'::jsonb,
    ARRAY['/assets/p-kurta.jpg','/assets/cat-ethnic.jpg'], FALSE, TRUE, 'Raw Silk Kurta with Mulmul Cotton Lining',
    ARRAY['Dry clean only', 'Iron on reverse', 'Store in muslin cloth'],
    'Regal woven motifs with embroidered collar and comfortable cotton pyjamas for wedding festivities.',
    NOW()
),
(
    'et-2', 'surajmukhi-dhoti-kurta-set', 'Surajmukhi Dhoti Kurta Set', 'boys', 'ethnic',
    ARRAY['Festive', 'Wedding'], ARRAY['navratri', 'diwali'], 2290, 2690,
    '[{"name":"Maroon","hex":"#7A1F2B"},{"name":"Butter Yellow","hex":"#F5DD8B"}]'::jsonb,
    '{"4-5Y":5,"5-6Y":5,"6-7Y":5,"7-8Y":5,"8-9Y":5}'::jsonb,
    ARRAY['/assets/p-dhoti.jpg','/assets/cat-ethnic.jpg'], TRUE, FALSE, 'Chanderi Cotton with Zari borders',
    ARRAY['Dry clean recommended', 'Gentle steam iron'],
    'Traditional stitched dhoti with pre-pleated drape paired with handcrafted mirror-work kurta.',
    NOW()
),
(
    'fe-1', 'diwali-kesar-brocade-sherwani', 'Kesar Brocade Royal Sherwani', 'boys', 'festive',
    ARRAY['Festive', 'Wedding'], ARRAY['diwali'], 3490, 4290,
    '[{"name":"Ivory","hex":"#F6EEDC"},{"name":"Butter Yellow","hex":"#F5DD8B"}]'::jsonb,
    '{"3-4Y":4,"4-5Y":4,"5-6Y":4,"6-7Y":4,"7-8Y":4}'::jsonb,
    ARRAY['/assets/hero.jpg','/assets/cat-festive.jpg'], FALSE, TRUE, 'Brocade Jacquard with 100% Cotton Lining',
    ARRAY['Dry clean only', 'Do not bleach'],
    'Intricately woven gold thread jacquard sherwani designed for high-profile festive events and family portraits.',
    NOW()
),
(
    'fe-2', 'navratri-twirl-chaniya-choli', 'Twirl Garba Chaniya Choli Set', 'girls', 'festive',
    ARRAY['Festive'], ARRAY['navratri'], 2999, 3699,
    '[{"name":"Magenta","hex":"#C2185B"}]'::jsonb,
    '{"3-4Y":6,"4-5Y":6,"5-6Y":6,"6-7Y":6,"7-8Y":6,"8-9Y":6}'::jsonb,
    ARRAY['/assets/navratri.jpg','/assets/cat-festive.jpg'], TRUE, TRUE, 'Kutchi Embroidered Cotton with Pom-pom Hem',
    ARRAY['Dry clean only', 'Store folded in breathable cover'],
    'Festive 360-degree flare chaniya choli accented with mirrors, bells, and handmade tassels for dandiya nights.',
    NOW()
),
(
    'es-1', 'blooming-meadow-organic-tee', 'Blooming Meadow Organic Tee', 'unisex', 'essentials',
    ARRAY['Everyday'], ARRAY[]::text[], 890, 1090,
    '[{"name":"Mint","hex":"#9FD3B5"},{"name":"Ivory","hex":"#F6EEDC"}]'::jsonb,
    '{"1-2Y":10,"2-3Y":10,"3-4Y":10,"4-5Y":10,"5-6Y":10,"6-7Y":10}'::jsonb,
    ARRAY['/assets/p-tee.jpg','/assets/cat-essentials.jpg'], FALSE, TRUE, '100% GOTS Certified Organic Cotton',
    ARRAY['Machine wash cold', 'Tumble dry low', 'Do not iron print'],
    'Hypoallergenic, tagless organic cotton t-shirt with soft ribbed neck that keeps little ones comfortable all day.',
    NOW()
),
(
    'es-2', 'classic-striped-everyday-tee', 'Nautical Stripe Pocket Tee', 'boys', 'essentials',
    ARRAY['Everyday'], ARRAY[]::text[], 799, 999,
    '[{"name":"Denim Blue","hex":"#456FA8"},{"name":"Ivory","hex":"#F6EEDC"}]'::jsonb,
    '{"2-3Y":8,"3-4Y":8,"4-5Y":8,"5-6Y":8,"6-7Y":8}'::jsonb,
    ARRAY['/assets/cat-essentials.jpg','/assets/p-tee.jpg'], TRUE, FALSE, 'Super-combed Single Jersey Cotton',
    ARRAY['Machine wash warm', 'Wash with like colours'],
    'Timeless yarn-dyed horizontal stripes featuring a contrasting patch pocket and durable reinforced hems.',
    NOW()
),
(
    'pa-1', 'blush-tulle-twirl-party-dress', 'Blush Tulle Twirl Party Dress', 'girls', 'party',
    ARRAY['Party', 'Birthday'], ARRAY[]::text[], 1899, 2399,
    '[{"name":"Pink","hex":"#F4BFCB"}]'::jsonb,
    '{"2-3Y":6,"3-4Y":6,"4-5Y":6,"5-6Y":6,"6-7Y":6}'::jsonb,
    ARRAY['/assets/p-dress.jpg','/assets/cat-party.jpg'], FALSE, TRUE, 'Four-layer French Tulle with 100% Cotton Lining',
    ARRAY['Hand wash gentle', 'Do not wring', 'Dry flat'],
    'Dreamy blush pink party dress with satin sash and flower brooch, lined with softest pure cotton to protect sensitive skin.',
    NOW()
),
(
    'pa-2', 'golden-shimmer-birthday-frock', 'Golden Shimmer Birthday Frock', 'girls', 'party',
    ARRAY['Party', 'Birthday'], ARRAY[]::text[], 2199, 2699,
    '[{"name":"Butter Yellow","hex":"#F5DD8B"},{"name":"Peach","hex":"#F6B79A"}]'::jsonb,
    '{"3-4Y":5,"4-5Y":5,"5-6Y":5,"6-7Y":5,"7-8Y":5}'::jsonb,
    ARRAY['/assets/cat-party.jpg','/assets/p-dress.jpg'], TRUE, FALSE, 'Lurex Jacquard and Organza with Cotton Lining',
    ARRAY['Dry clean recommended', 'Low heat iron on reverse'],
    'Subtle metallic shimmer highlights this birthday dress, completed with a dramatic bow on the back.',
    NOW()
),
(
    'ni-1', 'starry-night-mulmul-pyjama', 'Starry Night Mulmul Pyjama Set', 'unisex', 'nightwear',
    ARRAY['Bedtime'], ARRAY[]::text[], 1290, 1590,
    '[{"name":"Lavender","hex":"#C8B6E8"},{"name":"Pink","hex":"#F4BFCB"}]'::jsonb,
    '{"1-2Y":7,"2-3Y":7,"3-4Y":7,"4-5Y":7,"5-6Y":7}'::jsonb,
    ARRAY['/assets/p-night.jpg','/assets/cat-nightwear.jpg'], FALSE, TRUE, 'Handspun Mulmul Cotton',
    ARRAY['Machine wash cold', 'Dry in shade', 'Warm iron'],
    'Cloud-soft breathable mulmul pyjamas printed with sleepy celestial moons and stars, finished with satin piping.',
    NOW()
),
(
    'ni-2', 'lavender-bunny-cotton-nightwear', 'Lavender Bunny Snuggle Pyjamas', 'unisex', 'nightwear',
    ARRAY['Bedtime'], ARRAY[]::text[], 990, 1290,
    '[{"name":"Lavender","hex":"#C8B6E8"}]'::jsonb,
    '{"2-3Y":8,"3-4Y":8,"4-5Y":8,"5-6Y":8,"6-7Y":8}'::jsonb,
    ARRAY['/assets/cat-nightwear.jpg','/assets/p-night.jpg'], TRUE, FALSE, '100% Breathable Combed Cotton',
    ARRAY['Machine wash cold', 'Tumble dry low'],
    'Comfortable button-down long pyjama set featuring sweet illustrated bunnies and an elasticated waistband.',
    NOW()
),
(
    'co-1', 'safari-linen-resort-co-ord', 'Safari Linen Resort Co-ord Set', 'boys', 'coords',
    ARRAY['Everyday', 'Party'], ARRAY[]::text[], 1890, 2290,
    '[{"name":"Mint","hex":"#9FD3B5"},{"name":"Ivory","hex":"#F6EEDC"}]'::jsonb,
    '{"2-3Y":6,"3-4Y":6,"4-5Y":6,"5-6Y":6,"6-7Y":6}'::jsonb,
    ARRAY['/assets/p-coord.jpg','/assets/cat-coords.jpg'], FALSE, TRUE, 'Cotton-Linen Blend',
    ARRAY['Machine wash cold gentle', 'Hang dry', 'Warm iron'],
    'Cuban collar resort shirt with matching pull-on tailored shorts, made for sunny holiday brunches and travel days.',
    NOW()
),
(
    'co-2', 'pastel-blossom-waffle-co-ord', 'Pastel Blossom Waffle Co-ord Set', 'unisex', 'coords',
    ARRAY['Everyday'], ARRAY[]::text[], 1490, 1890,
    '[{"name":"Peach","hex":"#F6B79A"},{"name":"Mint","hex":"#9FD3B5"}]'::jsonb,
    '{"1-2Y":7,"2-3Y":7,"3-4Y":7,"4-5Y":7,"5-6Y":7}'::jsonb,
    ARRAY['/assets/cat-coords.jpg','/assets/p-coord.jpg'], TRUE, FALSE, 'Organic Textured Waffle Knit Cotton',
    ARRAY['Machine wash cold', 'Dry flat'],
    'A textured waffle knit pullover sweatshirt with matching relaxed shorts for effortless weekend comfort.',
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 15. SEED ADMIN USER
-- ==============================================================================
-- Email:    admin@kidia.com
-- Password: Admin123
-- Name:     Kidia Admin
-- Role:     admin (only one admin, signup is for customers only)
-- ==============================================================================

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@kidia.com';

  IF admin_uid IS NULL THEN
    -- Generate a new UUID for the admin
    admin_uid := gen_random_uuid();

    -- Insert admin into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',  -- instance_id
      admin_uid,                                 -- id
      'authenticated',                           -- aud
      'authenticated',                           -- role
      'admin@kidia.com',                         -- email
      crypt('Admin123', gen_salt('bf')),          -- encrypted_password
      NOW(),                                     -- email_confirmed_at (pre-confirmed)
      NULL, '', NULL, '', NULL, '', '', NULL,     -- invite/confirmation/recovery tokens
      NOW(),                                     -- last_sign_in_at
      '{"provider":"email","providers":["email"]}'::jsonb,   -- raw_app_meta_data
      '{"display_name":"Kidia Admin"}'::jsonb,               -- raw_user_meta_data
      FALSE,                                     -- is_super_admin
      NOW(),                                     -- created_at
      NOW(),                                     -- updated_at
      NULL, NULL, '', '', NULL, '', 0,           -- phone fields
      NULL, '', NULL,                            -- ban/reauth fields
      FALSE,                                     -- is_sso_user
      NULL                                       -- deleted_at
    );

    -- Insert into auth.identities (required for email login to work)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      admin_uid,
      jsonb_build_object(
        'sub', admin_uid::text,
        'email', 'admin@kidia.com',
        'email_verified', true,
        'display_name', 'Kidia Admin'
      ),
      'email',
      admin_uid::text,
      NOW(),
      NOW(),
      NOW()
    );

    -- Ensure the admin profile row exists and has admin role
    INSERT INTO public.profiles (id, display_name, email, role, status)
    VALUES (admin_uid, 'Kidia Admin', 'admin@kidia.com', 'admin', 'active')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', display_name = 'Kidia Admin', email = 'admin@kidia.com', status = 'active';

    RAISE NOTICE 'Admin user created: admin@kidia.com / Admin123';
  ELSE
    -- Admin already exists, ensure profile has admin role
    INSERT INTO public.profiles (id, display_name, email, role, status)
    VALUES (admin_uid, 'Kidia Admin', 'admin@kidia.com', 'admin', 'active')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', display_name = 'Kidia Admin', email = 'admin@kidia.com', status = 'active';

    RAISE NOTICE 'Admin user already exists, role confirmed.';
  END IF;
END;
$$;

-- ==============================================================================
-- ALL DONE! Your KIDIA database is ready.
-- ==============================================================================
--
-- Tables created:
--   1.  profiles       – Customer & Admin profiles (auto-created on signup)
--   2.  categories     – Product categories (8 seeded)
--   3.  products       – Product catalog (8 seeded)
--   4.  orders         – Customer orders (empty, filled by storefront)
--   5.  order_items    – Individual items within orders
--   6.  reviews        – Product reviews (empty, filled by customers)
--   7.  wishlists      – Customer wishlists
--   8.  contacts       – Contact-Us form submissions (empty)
--   9.  notifications  – Admin notifications (auto-created on new order)
--  10.  site_settings  – Key-value store-wide config
--
-- Admin login:
--   Email:    admin@kidia.com
--   Password: Admin123
--
-- Signup is for CUSTOMERS only. There is only one admin account.
-- ==============================================================================
