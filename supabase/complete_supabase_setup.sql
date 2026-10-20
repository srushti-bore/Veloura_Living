-- ============================================================================

-- 🏛️ VELOURA LIVING — MASTER ALL-IN-ONE SUPABASE DATABASE INITIALIZATION

-- Run this entire script in Supabase SQL Editor -> New Query -> Run

-- ============================================================================


-- PART 1: RELATIONAL SCHEMA, ENUMS & CONSTRAINTS

-- ============================================================================
-- 🏛️ Veloura Living — Production Relational Database Schema (PostgreSQL / Supabase)
-- Standard Architecture & Phase 1 Foundation
-- Reference: docs/Veloura_Living_SRS.md
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('CUSTOMER', 'ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status_enum AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status_enum AS ENUM (
        'PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 
        'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM (
        'INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 
        'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_enum AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'WALLET', 'COD', 'EMI');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE shipment_status_enum AS ENUM (
        'PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED_ATTEMPT', 'RETURNED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE return_status_enum AS ENUM (
        'RETURN_REQUESTED', 'RETURN_APPROVED', 'RETURN_REJECTED', 
        'RETURN_PICKUP', 'RETURN_RECEIVED', 'REFUND_INITIATED', 'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE inventory_movement_type_enum AS ENUM (
        'PURCHASE', 'SALE', 'RESERVATION', 'CANCELLATION', 'RETURN', 'ADJUSTMENT', 'DAMAGED', 'TRANSFER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE discount_type_enum AS ENUM ('PERCENTAGE', 'FIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. AUTHENTICATION, USERS & RBAC
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status user_status_enum DEFAULT 'ACTIVE' NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role_enum UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (user_id, role_id)
);

-- 🏛️ Single Admin Invariant & Bootstrap Audit Log
CREATE TABLE IF NOT EXISTS admin_bootstrap_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_email VARCHAR(255) NOT NULL UNIQUE,
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    bootstrapped_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_admin_bootstrap_log_email ON admin_bootstrap_log(admin_email);

CREATE OR REPLACE FUNCTION check_single_admin_invariant()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id UUID;
    existing_admin_count INT;
BEGIN
    SELECT id INTO admin_role_id FROM roles WHERE name = 'ADMIN';
    IF admin_role_id IS NOT NULL AND NEW.role_id = admin_role_id THEN
        SELECT COUNT(*) INTO existing_admin_count
        FROM user_roles
        WHERE role_id = admin_role_id
          AND user_id != NEW.user_id;

        IF existing_admin_count > 0 THEN
            RAISE EXCEPTION 'Single Admin Policy violation: Exactly one account may hold the ADMIN role.'
                USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_admin_user_roles ON user_roles;
CREATE TRIGGER trg_single_admin_user_roles
BEFORE INSERT OR UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION check_single_admin_invariant();

CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    preferred_currency VARCHAR(10) DEFAULT 'INR',
    interior_style_preference VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    landmark VARCHAR(150),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India' NOT NULL,
    is_default_shipping BOOLEAN DEFAULT FALSE,
    is_default_billing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. CATALOG: CATEGORIES, BRANDS, PRODUCTS & VARIANTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) UNIQUE NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    country_of_origin VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    tagline VARCHAR(255),
    short_description TEXT,
    full_description TEXT,
    base_price DECIMAL(12, 2) NOT NULL,
    compare_at_price DECIMAL(12, 2),
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    rating_avg DECIMAL(3, 2) DEFAULT 5.00,
    review_count INT DEFAULT 0,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    variant_name VARCHAR(150) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    compare_at_price DECIMAL(12, 2),
    material VARCHAR(100),
    finish VARCHAR(100),
    color_name VARCHAR(100),
    color_hex VARCHAR(20),
    dimensions VARCHAR(150),
    weight_kg DECIMAL(8, 2),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- ============================================================================
-- 4. INVENTORY & CONCURRENCY AUDIT
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventories (
    variant_id UUID PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
    available_quantity INT DEFAULT 0 NOT NULL,
    reserved_quantity INT DEFAULT 0 NOT NULL,
    sold_quantity INT DEFAULT 0 NOT NULL,
    low_stock_threshold INT DEFAULT 5 NOT NULL,
    warehouse_location VARCHAR(100) DEFAULT 'Main Architectural Depot',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_positive_inventory CHECK (available_quantity >= 0 AND reserved_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
    movement_type inventory_movement_type_enum NOT NULL,
    quantity INT NOT NULL,
    reference_id UUID,
    note TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 5. CARTS & WISHLISTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    session_id VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_cart_variant UNIQUE (cart_id, variant_id),
    CONSTRAINT check_cart_quantity CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_wishlist_product UNIQUE (wishlist_id, product_id, variant_id)
);

-- ============================================================================
-- 6. MARKETING: COUPONS & PROMOTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type discount_type_enum NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_value DECIMAL(12, 2) DEFAULT 0.00,
    max_discount_amount DECIMAL(12, 2),
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    starts_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 7. ORDERS, PAYMENTS & SHIPMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    billing_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    status order_status_enum DEFAULT 'PLACED' NOT NULL,
    payment_status payment_status_enum DEFAULT 'PENDING' NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    discount_total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    tax_total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    shipping_total DECIMAL(12, 2) DEFAULT 0.00 NOT NULL,
    grand_total DECIMAL(12, 2) NOT NULL,
    coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    customer_notes TEXT,
    idempotency_key VARCHAR(100) UNIQUE,
    guest_access_token VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_order_quantity CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL,
    used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT unique_order_coupon UNIQUE (order_id, coupon_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    payment_method payment_method_enum NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
    status payment_status_enum DEFAULT 'INITIATED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    transaction_ref VARCHAR(150) NOT NULL,
    gateway_name VARCHAR(50) NOT NULL,
    gateway_order_id VARCHAR(150),
    status payment_status_enum NOT NULL,
    raw_response JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    tracking_number VARCHAR(100) UNIQUE,
    carrier VARCHAR(100) DEFAULT 'Veloura White-Glove Logistics',
    status shipment_status_enum DEFAULT 'PENDING' NOT NULL,
    estimated_delivery TIMESTAMPTZ,
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS shipment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE NOT NULL,
    status shipment_status_enum NOT NULL,
    location VARCHAR(150),
    description TEXT,
    event_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 8. REVIEWS, RETURNS & REFUNDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT NOT NULL,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    status review_status_enum DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS returns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    status return_status_enum DEFAULT 'RETURN_REQUESTED' NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id UUID REFERENCES returns(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    gateway_refund_id VARCHAR(150),
    status payment_status_enum DEFAULT 'INITIATED' NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 9. CMS, AUDIT LOGGING & NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cms_banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_label VARCHAR(100),
    cta_link VARCHAR(255),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    link_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 10. OPTIMIZED INDEXES FOR HIGH-THROUGHPUT SEARCH & CONCURRENCY
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active_featured ON products(is_active, is_featured);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_guest_access_token ON orders(guest_access_token);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_inventories_stock ON inventories(available_quantity);

-- ============================================================================
-- 11. PERSISTENT MANDATORY OTP CHALLENGES (AUTH-001, AUTH-003, SEC-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_challenges (
    challenge_token VARCHAR(128) PRIMARY KEY,
    challenge_id UUID NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    user_id UUID,
    otp_hash VARCHAR(128) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('LOGIN', 'REGISTER')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    resends INT NOT NULL DEFAULT 0,
    max_resends INT NOT NULL DEFAULT 3,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    last_sent_at BIGINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_email ON otp_challenges(email);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires_at ON otp_challenges(expires_at);

-- ============================================================================
-- 12. PERSISTENT PENDING REGISTRATIONS (AUTH-001, AUTH-003, SEC-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at_tz TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);




-- PART 2: AUTH & SECURITY EXTENSIONS (OTP Challenges, Guest Security, Pending Registrations)

-- ============================================================================
-- 🏛️ Supabase Migration: 20261010000001_otp_challenges.sql
-- Veloura Living — Shared Persistent OTP Challenge Store
-- Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, AUTH-007, SEC-002)
-- ============================================================================

CREATE TABLE IF NOT EXISTS otp_challenges (
    challenge_token VARCHAR(128) PRIMARY KEY,
    challenge_id UUID NOT NULL DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    user_id UUID,
    otp_hash VARCHAR(128) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('LOGIN', 'REGISTER')),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    resends INT NOT NULL DEFAULT 0,
    max_resends INT NOT NULL DEFAULT 3,
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    last_sent_at BIGINT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_challenges_email ON otp_challenges(email);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_expires_at ON otp_challenges(expires_at);


-- ============================================================================
-- 🏛️ Supabase Migration: 20261010000002_guest_order_security.sql
-- Veloura Living — Guest Order Tracking Cryptographic Security Token
-- Reference: docs/Veloura_Living_SRS.md (SEC-004, SEC-005)
-- ============================================================================

-- Add high-entropy guest access token column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_access_token VARCHAR(128);

-- Create index for fast and safe guest order lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_access_token ON orders(guest_access_token);


-- ============================================================================
-- 🏛️ Supabase Migration: 20261010000003_pending_registrations.sql
-- Veloura Living — Shared Persistent Pending Registration Store
-- Reference: docs/Veloura_Living_SRS.md (AUTH-001, AUTH-003, SEC-002)
-- ============================================================================

-- Ensure required extension for UUID generation if not already active
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    created_at BIGINT NOT NULL,
    expires_at BIGINT NOT NULL,
    created_at_tz TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires_at ON pending_registrations(expires_at);



-- PART 3: FOUNDATIONAL LUXURY SEED DATA (Roles, Admin, Categories, Luxury Pieces, Variants)

-- ============================================================================
-- 🏛️ Veloura Living — Master Database Seed Script (PostgreSQL / Supabase)
-- Standard Architecture & Phase 1 Foundation
-- Reference: docs/Veloura_Living_SRS.md
-- ============================================================================

-- Clean existing data safely if needed
-- (Uncomment below if doing full reset)
-- TRUNCATE users, roles, categories, brands, products, product_variants, inventories, coupons CASCADE;

-- 1. ROLES
INSERT INTO roles (id, name, description)
VALUES 
    ('11111111-1111-1111-1111-111111111101', 'ADMIN', 'Full system administrator with unrestricted access'),
    ('11111111-1111-1111-1111-111111111102', 'CUSTOMER', 'Standard verified customer account'),
    ('11111111-1111-1111-1111-111111111103', 'MANAGER', 'Operations and floor manager'),
    ('11111111-1111-1111-1111-111111111104', 'PRODUCT_MANAGER', 'Catalog, inventory and brand curator'),
    ('11111111-1111-1111-1111-111111111105', 'ORDER_MANAGER', 'Fulfillment, white-glove logistics and returns officer')
ON CONFLICT (name) DO NOTHING;

-- 2. PERMISSIONS
INSERT INTO permissions (id, slug, description)
VALUES
    ('22222222-2222-2222-2222-222222222201', 'PRODUCT_CREATE', 'Create new furniture pieces and variants'),
    ('22222222-2222-2222-2222-222222222202', 'PRODUCT_UPDATE', 'Modify existing product specifications, pricing, and media'),
    ('22222222-2222-2222-2222-222222222203', 'PRODUCT_DELETE', 'Archive or delete product listings'),
    ('22222222-2222-2222-2222-222222222204', 'ORDER_VIEW', 'View customer order details and tracking status'),
    ('22222222-2222-2222-2222-222222222205', 'ORDER_UPDATE', 'Update order workflow states, shipments, and tracking'),
    ('22222222-2222-2222-2222-222222222206', 'CUSTOMER_VIEW', 'View customer CRM profiles and preferences'),
    ('22222222-2222-2222-2222-222222222207', 'REPORT_VIEW', 'Access revenue analytics, inventory velocity, and AI insights'),
    ('22222222-2222-2222-2222-222222222208', 'CMS_MANAGE', 'Manage editorial banners, journal articles, and SEO metadata'),
    ('22222222-2222-2222-2222-222222222209', 'USER_MANAGE', 'Assign RBAC roles and manage staff privileges')
ON CONFLICT (slug) DO NOTHING;

-- 3. ASSIGN ADMIN PERMISSIONS
INSERT INTO role_permissions (role_id, permission_id)
SELECT '11111111-1111-1111-1111-111111111101', id FROM permissions
ON CONFLICT DO NOTHING;

-- 4. FOUNDATIONAL STORE DATA
-- NOTE: The Master Administrator account is created EXCLUSIVELY via the secure
-- server-side bootstrap command: npm run seed:admin (configured via ADMIN_EMAIL and ADMIN_PASSWORD).
-- Insecure default administrator credentials and automatic admin seeding have been eliminated.

-- 5. CATEGORIES
INSERT INTO categories (id, name, slug, description, image_url, display_order, is_active)
VALUES
    ('55555555-5555-5555-5555-555555555501', 'Living Room', 'living-room', 'Sculptural seating, fluted walnut consoles and tactile bouclé lounges.', '/images/rooms/veloura_ultra_luxury_living_hero.jpg', 1, TRUE),
    ('55555555-5555-5555-5555-555555555502', 'Dining Pavilion', 'dining-room', 'Monolithic dining tables, travertine carver chairs and minimalist credenzas.', '/images/rooms/veloura_dining_pavilion_hero.jpg', 2, TRUE),
    ('55555555-5555-5555-5555-555555555503', 'Bedroom Sanctuary', 'bedroom', 'Low-profile platform beds, textural linens, and floating nightstands.', '/images/rooms/veloura_luxury_bedroom_hero.jpg', 3, TRUE),
    ('55555555-5555-5555-5555-555555555504', 'Architectural Study', 'home-office', 'Solid walnut desks, ergonomic leather atelier seating, and task lighting.', '/images/rooms/veloura_architectural_study_hero.jpg', 4, TRUE),
    ('55555555-5555-5555-5555-555555555505', 'Ambient Lighting', 'lighting', 'Hand-spun brass arch lamps, monolithic travertine sconces and alabaster pendants.', '/images/products/veloura_arc_floor_lamp.jpg', 5, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- 6. BRANDS
INSERT INTO brands (id, name, slug, description, country_of_origin)
VALUES
    ('66666666-6666-6666-6666-666666666601', 'Veloura Atelier', 'veloura-atelier', 'Bespoke European & Indian artisan furniture craftsmanship.', 'India'),
    ('66666666-6666-6666-6666-666666666602', 'Kyoto Craftworks', 'kyoto-craftworks', 'Handcrafted solid timber joinery rooted in Japanese minimalism.', 'Japan'),
    ('66666666-6666-6666-6666-666666666603', 'Elysian Heritage', 'elysian-heritage', 'Monolithic stone and tactile bouclé collections.', 'Italy')
ON CONFLICT (slug) DO NOTHING;

-- 7. PRODUCTS
INSERT INTO products (id, category_id, brand_id, name, slug, tagline, short_description, full_description, base_price, compare_at_price, is_featured, is_active, rating_avg, review_count, meta_title, meta_description)
VALUES
    (
        '77777777-7777-7777-7777-777777777701',
        '55555555-5555-5555-5555-555555555501',
        '66666666-6666-6666-6666-666666666601',
        'The Solis Bouclé Lounge Chair',
        'solis-boucle-lounge-chair',
        'Sculptural comfort contoured in heavy French bouclé and solid walnut.',
        'An iconic sculptural silhouette resting upon a solid American walnut plinth, wrapped in textured French bouclé.',
        'The Solis Bouclé Lounge Chair embodies modern organic poise. Sculpted with a low center of gravity and cradled in high-density memory latex, it provides an enveloping sense of stillness.',
        78000.00,
        88000.00,
        TRUE,
        TRUE,
        4.95,
        28,
        'Solis Bouclé Lounge Chair | Veloura Living',
        'Shop the Solis Bouclé Lounge Chair. Premium solid walnut and tactile French bouclé upholstery.'
    ),
    (
        '77777777-7777-7777-7777-777777777702',
        '55555555-5555-5555-5555-555555555501',
        '66666666-6666-6666-6666-666666666602',
        'The Kyoto Low Coffee Table',
        'kyoto-low-coffee-table',
        'Fluted Japanese walnut contours with continuous timber grain.',
        'Hand-carved organic oval contour in solid kiln-dried walnut with soft matte lacquer finish.',
        'Crafted in Kyoto using traditional mortise-and-tenon joinery, this monolithic low table showcases rich timber grain and subtle shadow gaps.',
        54000.00,
        62000.00,
        TRUE,
        TRUE,
        4.90,
        19,
        'Kyoto Low Coffee Table | Veloura Living',
        'Sculptural Japanese low coffee table crafted in solid American walnut.'
    ),
    (
        '77777777-7777-7777-7777-777777777703',
        '55555555-5555-5555-5555-555555555505',
        '66666666-6666-6666-6666-666666666601',
        'The Arc Ambient Floor Lamp',
        'arc-ambient-floor-lamp',
        'Hand-spun brushed antique brass dome on a monolithic travertine base.',
        'A graceful arching luminaire casting warm 2700K ambient illumination across architectural spaces.',
        'Engineered with an unlacquered brushed brass spine and weighted with Italian roman travertine, the Arc Lamp brings subtle warmth and dramatic scale.',
        38000.00,
        45000.00,
        TRUE,
        TRUE,
        4.88,
        34,
        'Arc Ambient Floor Lamp | Veloura Living',
        'Brushed brass architectural arc floor lamp with travertine stone base.'
    ),
    (
        '77777777-7777-7777-7777-777777777704',
        '55555555-5555-5555-5555-555555555503',
        '66666666-6666-6666-6666-666666666603',
        'The Elysian Platform Bed',
        'elysian-platform-bed',
        'Low-slung minimalist oak platform with integrated floating ledges.',
        'Solid European white oak platform bed with extended floating bedside rails and cushioned headboard.',
        'The Elysian Platform Bed redefines restorative quietude. Constructed from solid white oak planks with concealed interior slatted suspension.',
        128000.00,
        145000.00,
        TRUE,
        TRUE,
        4.98,
        14,
        'Elysian Platform Bed | Veloura Living',
        'Architectural low-slung platform bed in European white oak.'
    ),
    (
        '77777777-7777-7777-7777-777777777705',
        '55555555-5555-5555-5555-555555555504',
        '66666666-6666-6666-6666-666666666602',
        'The Kanso Writing Desk',
        'kanso-writing-desk',
        'Architectural fluted walnut writing desk with discreet cable channels.',
        'Solid American walnut writing desk with soft-close tambour drawers and concealed charging pass-throughs.',
        'Designed for quiet focus and productivity. Hand-finished walnut timber paired with top-grain Saddle Brown leather inlay.',
        86000.00,
        98000.00,
        TRUE,
        TRUE,
        4.92,
        22,
        'Kanso Writing Desk | Veloura Living',
        'Executive architectural writing desk crafted in solid American walnut.'
    )
ON CONFLICT (slug) DO NOTHING;

-- 8. PRODUCT VARIANTS
INSERT INTO product_variants (id, product_id, sku, variant_name, price, compare_at_price, material, finish, color_name, color_hex, dimensions, weight_kg, is_active)
VALUES
    ('88888888-8888-8888-8888-888888888801', '77777777-7777-7777-7777-777777777701', 'VEL-SOL-IVY', 'Ivory Bouclé / Walnut Plinth', 78000.00, 88000.00, 'French Bouclé & Walnut', 'Natural Matte Oil', 'Ivory Cream', '#FAF7F2', 'W 92 x D 88 x H 78 cm', 28.5, TRUE),
    ('88888888-8888-8888-8888-888888888802', '77777777-7777-7777-7777-777777777701', 'VEL-SOL-CHAR', 'Charcoal Bouclé / Ebonized Oak', 82000.00, 92000.00, 'Heavy Bouclé & Oak', 'Ebonized Matte', 'Charcoal', '#211915', 'W 92 x D 88 x H 78 cm', 28.5, TRUE),
    ('88888888-8888-8888-8888-888888888803', '77777777-7777-7777-7777-777777777702', 'VEL-KYO-WAL', 'Natural American Walnut', 54000.00, 62000.00, 'Solid American Walnut', 'Hand-Rubbed Wax', 'Deep Walnut', '#4A2C1A', 'W 140 x D 75 x H 34 cm', 34.0, TRUE),
    ('88888888-8888-8888-8888-888888888804', '77777777-7777-7777-7777-777777777703', 'VEL-ARC-BRS', 'Brushed Brass & Travertine', 38000.00, 45000.00, 'Brass & Roman Travertine', 'Brushed Antique Brass', 'Warm Gold', '#D8B486', 'W 45 x D 120 x H 210 cm', 18.2, TRUE),
    ('88888888-8888-8888-8888-888888888805', '77777777-7777-7777-7777-777777777704', 'VEL-ELY-KNG', 'King / European White Oak', 128000.00, 145000.00, 'Solid European Oak & Linen', 'Natural White Oak', 'Oat Cream', '#F4E8D7', 'W 204 x L 224 x H 85 cm', 68.0, TRUE),
    ('88888888-8888-8888-8888-888888888806', '77777777-7777-7777-7777-777777777705', 'VEL-KAN-DSK', 'American Walnut & Leather', 86000.00, 98000.00, 'Solid Walnut & Saddle Leather', 'Satin Polyurethane', 'Caramel Walnut', '#765236', 'W 160 x D 70 x H 75 cm', 42.0, TRUE)
ON CONFLICT (sku) DO NOTHING;

-- 9. PRODUCT IMAGES
INSERT INTO product_images (product_id, variant_id, image_url, alt_text, sort_order, is_primary)
VALUES
    ('77777777-7777-7777-7777-777777777701', '88888888-8888-8888-8888-888888888801', '/images/products/veloura_solis_boucle_chair.jpg', 'Solis Bouclé Lounge Chair Main Studio View', 1, TRUE),
    ('77777777-7777-7777-7777-777777777702', '88888888-8888-8888-8888-888888888803', '/images/products/veloura_kyoto_coffee_table.jpg', 'Kyoto Low Coffee Table Architectural View', 1, TRUE),
    ('77777777-7777-7777-7777-777777777703', '88888888-8888-8888-8888-888888888804', '/images/products/veloura_arc_floor_lamp.jpg', 'Arc Ambient Floor Lamp Brass and Travertine', 1, TRUE),
    ('77777777-7777-7777-7777-777777777704', '88888888-8888-8888-8888-888888888805', '/images/products/veloura_elysian_platform_bed.jpg', 'Elysian Platform Bed European Oak Sanctuary', 1, TRUE),
    ('77777777-7777-7777-7777-777777777705', '88888888-8888-8888-8888-888888888806', '/images/products/veloura_kanso_writing_desk.jpg', 'Kanso Writing Desk Solid Walnut Study', 1, TRUE)
ON CONFLICT DO NOTHING;

-- 10. INVENTORIES & INITIAL STOCKS
INSERT INTO inventories (variant_id, available_quantity, reserved_quantity, sold_quantity, low_stock_threshold, warehouse_location)
VALUES
    ('88888888-8888-8888-8888-888888888801', 12, 1, 4, 3, 'Depot A - Mumbai Flagship'),
    ('88888888-8888-8888-8888-888888888802', 6, 0, 2, 2, 'Depot A - Mumbai Flagship'),
    ('88888888-8888-8888-8888-888888888803', 18, 2, 7, 5, 'Depot B - Bengaluru Central'),
    ('88888888-8888-8888-8888-888888888804', 24, 0, 11, 5, 'Depot A - Mumbai Flagship'),
    ('88888888-8888-8888-8888-888888888805', 8, 1, 3, 2, 'Depot C - New Delhi Hub'),
    ('88888888-8888-8888-8888-888888888806', 15, 0, 5, 4, 'Depot B - Bengaluru Central')
ON CONFLICT (variant_id) DO NOTHING;

-- 11. INVENTORY MOVEMENTS AUDIT
INSERT INTO inventory_movements (variant_id, movement_type, quantity, note)
VALUES
    ('88888888-8888-8888-8888-888888888801', 'PURCHASE', 17, 'Initial batch receipt from Veloura Atelier atelier'),
    ('88888888-8888-8888-8888-888888888803', 'PURCHASE', 27, 'Air freight receipt from Kyoto woodworking shop')
ON CONFLICT DO NOTHING;

-- 12. COUPONS & PROMOTIONS
INSERT INTO coupons (id, code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, is_active)
VALUES
    ('99999999-9999-9999-9999-999999999901', 'VELOURA15', 'PERCENTAGE', 15.00, 50000.00, 25000.00, 500, TRUE),
    ('99999999-9999-9999-9999-999999999902', 'QUIZ15', 'PERCENTAGE', 15.00, 70000.00, 30000.00, 1000, TRUE),
    ('99999999-9999-9999-9999-999999999903', 'ATELIER10', 'PERCENTAGE', 10.00, 30000.00, 15000.00, 2000, TRUE),
    ('99999999-9999-9999-9999-999999999904', 'FIRSTLUXURY', 'FIXED', 5000.00, 40000.00, 5000.00, 500, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 13. CMS BANNERS
INSERT INTO cms_banners (section_name, title, subtitle, image_url, cta_label, cta_link, display_order, is_active)
VALUES
    ('hero_main', 'Sculptural Furniture for Architectural Spaces', 'Quiet luxury crafted with raw solid walnut, tactile French bouclé and monolithic stone.', '/images/rooms/veloura_ultra_luxury_living_hero.jpg', 'Explore Collections', '/collections', 1, TRUE),
    ('quiz_banner', 'Discover Your Architectural Atmosphere', 'Take our 60-second AI Interior Personality Quiz to curate your bespoke room suite.', '/images/rooms/veloura_luxury_bedroom_hero.jpg', 'Begin Quiz', '/#quiz', 2, TRUE)
ON CONFLICT DO NOTHING;


-- ============================================================================
-- PART 4: MARKETING CONSENT, UNSUBSCRIBE MANAGEMENT & CAMPAIGN SAFETY (n8n & BREVO)
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE consent_source_enum AS ENUM (
        'CHECKOUT', 'FOOTER_NEWSLETTER', 'ACCOUNT_SETTINGS', 'API', 'IMPORT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_dispatch_status_enum AS ENUM (
        'PENDING', 
        'CLAIMED', 
        'SENDING', 
        'ACCEPTED', 
        'DELIVERED', 
        'FAILED', 
        'BOUNCED', 
        'SKIPPED_UNSUBSCRIBED', 
        'TIMEOUT_AMBIGUOUS'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS customer_marketing_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    is_opted_in BOOLEAN NOT NULL DEFAULT FALSE,
    consent_source consent_source_enum,
    consented_at TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    unsubscribe_token VARCHAR(128) NOT NULL UNIQUE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure user_id foreign key constraint uses ON DELETE SET NULL to preserve unsubscribe suppression history upon user deletion
-- Deterministically inspects confdeltype ('n' = SET NULL) to avoid unnecessarily dropping or recreating an already-correct constraint
DO $$ 
DECLARE
    v_confdeltype "char";
BEGIN
    SELECT c.confdeltype INTO v_confdeltype
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'customer_marketing_consents'
      AND c.conname = 'customer_marketing_consents_user_id_fkey'
      AND c.contype = 'f';

    IF v_confdeltype IS NULL THEN
        -- Constraint does not exist yet; add it
        ALTER TABLE customer_marketing_consents 
            ADD CONSTRAINT customer_marketing_consents_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    ELSIF v_confdeltype <> 'n' THEN
        -- Constraint exists but does NOT use ON DELETE SET NULL (e.g. legacy CASCADE); upgrade it
        ALTER TABLE customer_marketing_consents 
            DROP CONSTRAINT customer_marketing_consents_user_id_fkey;

        ALTER TABLE customer_marketing_consents 
            ADD CONSTRAINT customer_marketing_consents_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    -- If v_confdeltype = 'n', the constraint already enforces ON DELETE SET NULL; do nothing.
END $$;

CREATE INDEX IF NOT EXISTS idx_marketing_consents_email ON customer_marketing_consents(email);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_opted_in ON customer_marketing_consents(is_opted_in) WHERE is_opted_in = TRUE;
CREATE INDEX IF NOT EXISTS idx_marketing_consents_unsub_token ON customer_marketing_consents(unsubscribe_token);
CREATE INDEX IF NOT EXISTS idx_marketing_consents_user_id ON customer_marketing_consents(user_id);

CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_key ON marketing_campaigns(campaign_key);

CREATE TABLE IF NOT EXISTS marketing_campaign_dispatches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    campaign_key VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    status campaign_dispatch_status_enum NOT NULL DEFAULT 'PENDING',
    claimed_at TIMESTAMPTZ,
    claimed_by VARCHAR(100),
    sent_at TIMESTAMPTZ,
    provider_message_id VARCHAR(150),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_campaign_recipient UNIQUE (campaign_key, email)
);

CREATE INDEX IF NOT EXISTS idx_campaign_dispatches_status ON marketing_campaign_dispatches(campaign_key, status);
CREATE INDEX IF NOT EXISTS idx_campaign_dispatches_email ON marketing_campaign_dispatches(email);
CREATE INDEX IF NOT EXISTS idx_campaign_dispatches_provider_id ON marketing_campaign_dispatches(provider_message_id);

CREATE OR REPLACE FUNCTION populate_campaign_dispatches(p_campaign_key VARCHAR)
RETURNS INT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_campaign_id UUID;
    v_inserted_count INT;
BEGIN
    SELECT id INTO v_campaign_id 
    FROM marketing_campaigns 
    WHERE campaign_key = p_campaign_key AND is_active = TRUE;

    IF v_campaign_id IS NULL THEN
        RAISE EXCEPTION 'Active marketing campaign not found for key: %', p_campaign_key
            USING ERRCODE = '22000';
    END IF;

    INSERT INTO marketing_campaign_dispatches (
        campaign_id,
        campaign_key,
        user_id,
        email,
        status
    )
    SELECT 
        v_campaign_id,
        p_campaign_key,
        u.id AS user_id,
        LOWER(TRIM(cmc.email)),
        'PENDING'::campaign_dispatch_status_enum
    FROM customer_marketing_consents cmc
    LEFT JOIN users u ON LOWER(u.email) = LOWER(cmc.email)
    WHERE cmc.is_opted_in = TRUE 
      AND cmc.unsubscribed_at IS NULL
      AND (u.status IS NULL OR u.status = 'ACTIVE')
      AND (u.is_email_verified IS NULL OR u.is_email_verified = TRUE)
      AND NOT EXISTS (
          SELECT 1 
          FROM user_roles ur
          JOIN roles r ON r.id = ur.role_id
          WHERE ur.user_id = u.id 
            AND r.name IN ('ADMIN', 'MANAGER', 'PRODUCT_MANAGER', 'ORDER_MANAGER')
      )
    ON CONFLICT (campaign_key, email) DO NOTHING;

    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;
    RETURN v_inserted_count;
END;
$$;

CREATE OR REPLACE FUNCTION claim_campaign_dispatches(
    p_campaign_key VARCHAR,
    p_worker_id VARCHAR,
    p_batch_size INT DEFAULT 50,
    p_target_email VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    dispatch_id UUID,
    campaign_id UUID,
    campaign_key VARCHAR,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    unsubscribe_token VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    WITH locked_rows AS (
        SELECT cd.id
        FROM marketing_campaign_dispatches cd
        INNER JOIN customer_marketing_consents cmc ON LOWER(cmc.email) = LOWER(cd.email)
        WHERE cd.campaign_key = p_campaign_key
          AND cd.status = 'PENDING'
          AND cmc.is_opted_in = TRUE
          AND cmc.unsubscribed_at IS NULL
          AND cd.attempts < cd.max_attempts
          AND (p_target_email IS NULL OR TRIM(p_target_email) = '' OR LOWER(cd.email) = LOWER(TRIM(p_target_email)))
        ORDER BY cd.created_at ASC
        LIMIT p_batch_size
        FOR UPDATE OF cd SKIP LOCKED
    ),
    updated AS (
        UPDATE marketing_campaign_dispatches cd
        SET status = 'CLAIMED'::campaign_dispatch_status_enum,
            claimed_at = CURRENT_TIMESTAMP,
            claimed_by = p_worker_id,
            attempts = cd.attempts + 1,
            updated_at = CURRENT_TIMESTAMP
        FROM locked_rows lr
        WHERE cd.id = lr.id
        RETURNING cd.id, cd.campaign_id, cd.campaign_key, cd.email, cd.user_id
    )
    SELECT 
        u.id AS dispatch_id,
        u.campaign_id,
        u.campaign_key,
        u.email,
        COALESCE(p.first_name, '') AS first_name,
        COALESCE(p.last_name, '') AS last_name,
        COALESCE(cmc.unsubscribe_token, '') AS unsubscribe_token
    FROM updated u
    LEFT JOIN profiles p ON p.user_id = u.user_id
    LEFT JOIN customer_marketing_consents cmc ON LOWER(cmc.email) = LOWER(u.email);
END;
$$;

CREATE OR REPLACE FUNCTION claim_campaign_dispatches(
    p_campaign_key VARCHAR,
    p_worker_id VARCHAR,
    p_batch_size INT DEFAULT 50
)
RETURNS TABLE (
    dispatch_id UUID,
    campaign_id UUID,
    campaign_key VARCHAR,
    email VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    unsubscribe_token VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY SELECT * FROM claim_campaign_dispatches(p_campaign_key, p_worker_id, p_batch_size, NULL::VARCHAR);
END;
$$;

CREATE OR REPLACE FUNCTION unsubscribe_customer_by_token(
    p_token VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_found BOOLEAN;
BEGIN
    UPDATE customer_marketing_consents
    SET is_opted_in = FALSE,
        unsubscribed_at = COALESCE(unsubscribed_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE unsubscribe_token = p_token;

    GET DIAGNOSTICS v_found = ROW_COUNT;
    RETURN (v_found > 0);
END;
$$;

CREATE OR REPLACE FUNCTION unsubscribe_customer_by_email(
    p_email VARCHAR,
    p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_found BOOLEAN;
BEGIN
    UPDATE customer_marketing_consents
    SET is_opted_in = FALSE,
        unsubscribed_at = COALESCE(unsubscribed_at, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE LOWER(email) = LOWER(TRIM(p_email));

    GET DIAGNOSTICS v_found = ROW_COUNT;
    RETURN (v_found > 0);
END;
$$;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS) & POSTGREST ACCESS RESTRICTIONS
-- ============================================================================

-- 1. Enable RLS on every marketing and campaign table
ALTER TABLE customer_marketing_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_campaign_dispatches ENABLE ROW LEVEL SECURITY;

-- 2. Revoke table-level permissions from PUBLIC (standard PostgreSQL)
REVOKE ALL ON customer_marketing_consents FROM PUBLIC;
REVOKE ALL ON marketing_campaigns FROM PUBLIC;
REVOKE ALL ON marketing_campaign_dispatches FROM PUBLIC;

-- 3. Explicitly revoke anon & authenticated access and grant strictly to service_role (Supabase environment)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON customer_marketing_consents FROM anon;
        REVOKE ALL ON marketing_campaigns FROM anon;
        REVOKE ALL ON marketing_campaign_dispatches FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON customer_marketing_consents FROM authenticated;
        REVOKE ALL ON marketing_campaigns FROM authenticated;
        REVOKE ALL ON marketing_campaign_dispatches FROM authenticated;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT ALL ON customer_marketing_consents TO service_role;
        GRANT ALL ON marketing_campaigns TO service_role;
        GRANT ALL ON marketing_campaign_dispatches TO service_role;
    END IF;
END $$;

-- 4. Create explicit RLS policies for service_role ensuring default-deny for all other roles
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'customer_marketing_consents' AND policyname = 'service_role_manage_marketing_consents'
        ) THEN
            CREATE POLICY service_role_manage_marketing_consents 
            ON customer_marketing_consents
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'marketing_campaigns' AND policyname = 'service_role_manage_campaigns'
        ) THEN
            CREATE POLICY service_role_manage_campaigns 
            ON marketing_campaigns
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        END IF;

        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'marketing_campaign_dispatches' AND policyname = 'service_role_manage_dispatches'
        ) THEN
            CREATE POLICY service_role_manage_dispatches 
            ON marketing_campaign_dispatches
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
        END IF;
    END IF;
END $$;

-- 5. Revoke function execution from PUBLIC, anon, and authenticated
REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM PUBLIC;
REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM PUBLIC;

DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM anon;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM anon;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM anon;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM anon;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM anon;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON FUNCTION populate_campaign_dispatches(VARCHAR) FROM authenticated;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) FROM authenticated;
        REVOKE ALL ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) FROM authenticated;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) FROM authenticated;
        REVOKE ALL ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) FROM authenticated;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
        GRANT EXECUTE ON FUNCTION populate_campaign_dispatches(VARCHAR) TO service_role;
        GRANT EXECUTE ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) TO service_role;
        GRANT EXECUTE ON FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) TO service_role;
        GRANT EXECUTE ON FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) TO service_role;
        GRANT EXECUTE ON FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) TO service_role;
    END IF;
END $$;

-- 6. Apply explicit search_path to functions to defend against CWE-426 search_path hijacking
ALTER FUNCTION populate_campaign_dispatches(VARCHAR) SET search_path = public, pg_temp;
ALTER FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT) SET search_path = public, pg_temp;
ALTER FUNCTION claim_campaign_dispatches(VARCHAR, VARCHAR, INT, VARCHAR) SET search_path = public, pg_temp;
ALTER FUNCTION unsubscribe_customer_by_token(VARCHAR, TEXT) SET search_path = public, pg_temp;
ALTER FUNCTION unsubscribe_customer_by_email(VARCHAR, TEXT) SET search_path = public, pg_temp;

