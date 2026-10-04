/**
 * 🧪 Veloura Living — End-to-End Image & Asset Integrity Verification
 * Validates that all room heroes, product visuals, and video frames exist with HTTP 200,
 * and confirms that no duplicate primary images exist across distinct products.
 */

async function verifyAllImages() {
  console.log('🚀 Starting Veloura Living Full Asset & Image Integrity E2E Test...\n');

  const BASE_URL = 'http://localhost:3000';
  const BACKEND_URL = 'http://localhost:5000';

  // 1. Test Static Image URLs
  const staticImagesToVerify = [
    '/images/rooms/veloura_ultra_luxury_living_hero.jpg',
    '/images/rooms/veloura_luxury_bedroom_hero.jpg',
    '/images/rooms/veloura_luxury_dining_hero.jpg',
    '/images/rooms/veloura_luxury_office_hero.jpg',
    '/images/rooms/veloura_dining_pavilion_hero.jpg',
    '/images/rooms/veloura_architectural_study_hero.jpg',
    '/images/rooms/veloura_luxury_living_room_hero.jpg',
    '/images/rooms/veloura_cinematic_hero_living.jpg',
    '/images/video/veloura_video_frame_living.jpg',
    '/images/video/veloura_video_frame_bedroom.jpg',
    '/images/video/veloura_video_frame_dining.jpg',
    '/images/video/veloura_video_frame_office.jpg',
    '/images/veloura-auth-lifestyle.webp',
    '/images/products/veloura_serpentine_modular_sofa.jpg',
    '/images/products/veloura_kyoto_coffee_table.jpg',
    '/images/products/veloura_solis_boucle_chair.jpg',
    '/images/products/veloura_arcos_brass_arch_lamp.jpg',
    '/images/products/veloura_dune_wool_rug.jpg',
    '/images/products/veloura_atelier_fluted_credenza.jpg',
    '/images/products/veloura_solitude_platform_bed.jpg',
    '/images/products/veloura_kanso_floating_nightstand.jpg',
    '/images/products/veloura_haven_boucle_bench.jpg',
    '/images/products/veloura_pillar_fluted_wardrobe.jpg',
    '/images/products/veloura_aura_arch_mirror.jpg',
    '/images/products/veloura_heritage_walnut_dining_table.jpg',
    '/images/products/veloura_astrid_dining_chair.jpg',
    '/images/products/veloura_eclipse_glass_pendant.jpg',
    '/images/products/veloura_oslo_fluted_sideboard.jpg',
    '/images/products/veloura_meridian_executive_desk.jpg',
    '/images/products/veloura_aeron_pro_leather_chair.jpg',
    '/images/products/veloura_bauhaus_bookcase.jpg',
    '/images/products/veloura_linear_brass_task_lamp.jpg',
    '/images/materials/veloura_swatch_walnut.jpg',
    '/images/materials/veloura_swatch_boucle.jpg',
    '/images/materials/veloura_swatch_leather.jpg',
    '/images/materials/veloura_swatch_travertine.jpg',
    '/images/materials/veloura_swatch_brass.jpg',
  ];

  let passedAssets = 0;
  let failedAssets = 0;

  console.log('--- 1. Testing Local Static Image HTTP Endpoints ---');
  for (const imgPath of staticImagesToVerify) {
    try {
      const res = await fetch(`${BASE_URL}${imgPath}`, { method: 'HEAD' });
      if (res.status === 200) {
        console.log(`  ✅ [200 OK] ${imgPath} (${res.headers.get('content-type') || 'binary'})`);
        passedAssets++;
      } else {
        console.error(`  ❌ [${res.status} FAIL] ${imgPath}`);
        failedAssets++;
      }
    } catch (err: any) {
      console.error(`  ❌ [NETWORK ERROR] ${imgPath}: ${err.message}`);
      failedAssets++;
    }
  }

  // 2. Fetch Products API & Check Image Uniqueness
  console.log('\n--- 2. Verifying Product Catalog & Primary Image Uniqueness ---');
  try {
    const prodRes = await fetch(`${BASE_URL}/api/products`);
    const prodData = await prodRes.json();
    const products = prodData.products || prodData.data || prodData;

    console.log(`  Fetched ${products.length} products from Next.js API.`);

    const primaryImageMap = new Map<string, string[]>();
    for (const p of products) {
      const primaryImg = p.images?.[0] || p.image_url;
      if (!primaryImg) {
        console.error(`  ❌ Product ${p.name} (${p.id}) has no primary image!`);
        failedAssets++;
        continue;
      }

      if (!primaryImageMap.has(primaryImg)) {
        primaryImageMap.set(primaryImg, []);
      }
      primaryImageMap.get(primaryImg)!.push(p.name);
    }

    let duplicateFound = false;
    for (const [img, names] of primaryImageMap.entries()) {
      if (names.length > 1) {
        console.warn(`  ⚠️ DUPLICATE IMAGE SHARED: ${img} -> [${names.join(', ')}]`);
        duplicateFound = true;
      } else {
        console.log(`  ✅ Unique Product Image: ${names[0]} -> ${img}`);
      }
    }

    if (!duplicateFound) {
      console.log('  ✨ 100% of products have distinct, dedicated primary images!');
    }
  } catch (err: any) {
    console.error(`  ❌ Failed to fetch products: ${err.message}`);
    failedAssets++;
  }

  // 3. Test Core Web Pages Status
  console.log('\n--- 3. Testing Core Luxury Pages HTTP 200 Status ---');
  const pages = [
    '/',
    '/rooms/living-room',
    '/rooms/bedroom',
    '/rooms/dining',
    '/rooms/office',
    '/collections',
    '/collections/warm-minimalist-living',
    '/collections/japandi-rest-sanctuary',
    '/collections/heirloom-gathering-table',
    '/collections/executive-residential-focus',
    '/studio',
    '/journal',
    '/cart',
    '/checkout',
    '/docs',
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page}`);
      if (res.status === 200) {
        console.log(`  ✅ [200 OK] ${page}`);
      } else {
        console.error(`  ❌ [${res.status} FAIL] ${page}`);
        failedAssets++;
      }
    } catch (err: any) {
      console.error(`  ❌ [ERR] ${page}: ${err.message}`);
      failedAssets++;
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 Asset Verification Complete:`);
  console.log(`   Passed: ${passedAssets}`);
  console.log(`   Failed: ${failedAssets}`);
  console.log(`========================================\n`);

  if (failedAssets > 0) {
    process.exit(1);
  }
}

verifyAllImages();
