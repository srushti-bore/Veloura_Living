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

-- 4. DEFAULT USERS
-- Password hash for 'VelouraAdmin2026!'
INSERT INTO users (id, email, password_hash, status, is_email_verified)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'admin@velouraliving.com', '$2a$12$e9g0/Y7Y2fL/T8g0mXW7teR4lV5.7bB.6o7U8Yw5b3A0vYf4bQ1K2', 'ACTIVE', TRUE),
    ('33333333-3333-3333-3333-333333333302', 'concierge@velouraliving.com', '$2a$12$e9g0/Y7Y2fL/T8g0mXW7teR4lV5.7bB.6o7U8Yw5b3A0vYf4bQ1K2', 'ACTIVE', TRUE),
    ('33333333-3333-3333-3333-333333333303', 'client@example.com', '$2a$12$e9g0/Y7Y2fL/T8g0mXW7teR4lV5.7bB.6o7U8Yw5b3A0vYf4bQ1K2', 'ACTIVE', TRUE)
ON CONFLICT (email) DO NOTHING;

-- ASSIGN USER ROLES
INSERT INTO user_roles (user_id, role_id)
VALUES
    ('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101'), -- Admin
    ('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111103'), -- Manager
    ('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111102')  -- Customer
ON CONFLICT DO NOTHING;

-- PROFILES
INSERT INTO profiles (user_id, first_name, last_name, phone, preferred_currency, interior_style_preference)
VALUES
    ('33333333-3333-3333-3333-333333333301', 'Eleanor', 'Vance', '+91 98200 12345', 'INR', 'Warm Minimalist'),
    ('33333333-3333-3333-3333-333333333302', 'Julian', 'Mercer', '+91 98200 67890', 'INR', 'Japandi Quietude'),
    ('33333333-3333-3333-3333-333333333303', 'Aarav', 'Mehta', '+91 98111 22334', 'INR', 'Modern Organic')
ON CONFLICT (user_id) DO NOTHING;

-- ADDRESSES
INSERT INTO addresses (id, user_id, full_name, phone, address_line1, address_line2, landmark, city, state, postal_code, country, is_default_shipping, is_default_billing)
VALUES
    ('44444444-4444-4444-4444-444444444401', '33333333-3333-3333-3333-333333333303', 'Aarav Mehta', '+91 98111 22334', 'Penthouse 42B, The Imperial Towers', 'Tardeo Main Road', 'Near Altamount Road', 'Mumbai', 'Maharashtra', '400034', 'India', TRUE, TRUE)
ON CONFLICT DO NOTHING;

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
