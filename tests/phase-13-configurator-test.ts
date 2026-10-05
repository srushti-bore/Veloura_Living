/**
 * 🏛️ Veloura Living — Phase 13 Automated Test Suite
 * 3D AR Spatial Configurator, PBR Material Shaders & WebXR Engine
 */

import {
  MATERIAL_LIBRARY,
  CONFIGURABLE_PIECES,
  calculateConfiguredPrice,
} from '../lib/data/configuratorMaterials';
import { ARBridgeService } from '../lib/services/arBridgeService';
import {
  buildSerpentineSofa,
  buildAureliaTable,
  buildFujiwaraCabinet,
  buildZenithLoungeChair,
} from '../components/three/configurator/furnitureModels';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function runPhase13Tests() {
  console.log('\n🏛️ =========================================================================');
  console.log('🏛️ VELOURA LIVING — PHASE 13 3D AR SPATIAL CONFIGURATOR TEST SUITE');
  console.log('🏛️ =========================================================================\n');

  // --- 1. Material Library & PBR Shader Attributes ---
  console.log('📦 1. Testing Curated Material Library & PBR Parameters...');
  assert(MATERIAL_LIBRARY.length >= 12, `Material library contains ${MATERIAL_LIBRARY.length} curated luxury materials (>= 12)`);

  const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
  const allHexValid = MATERIAL_LIBRARY.every((m) => hexColorRegex.test(m.colorHex));
  assert(allHexValid, 'All materials have mathematically valid CSS hex color codes');

  const allRoughnessValid = MATERIAL_LIBRARY.every((m) => m.roughness >= 0 && m.roughness <= 1);
  assert(allRoughnessValid, 'All PBR roughness values are normalized within [0.0, 1.0]');

  const allMetalnessValid = MATERIAL_LIBRARY.every((m) => m.metalness >= 0 && m.metalness <= 1);
  assert(allMetalnessValid, 'All PBR metalness values are normalized within [0.0, 1.0]');

  const allUpchargesNonNegative = MATERIAL_LIBRARY.every((m) => m.upchargeINR >= 0);
  assert(allUpchargesNonNegative, 'All material valuation upcharges are >= 0 INR');

  // --- 2. Configurable Pieces Topology & Dimension Standards ---
  console.log('\n📦 2. Testing Configurable Furniture Topology & Dimensions...');
  assert(CONFIGURABLE_PIECES.length === 4, '4 signature luxury pieces configured (Sofa, Table, Cabinet, Lounge Chair)');

  const sofa = CONFIGURABLE_PIECES.find((p) => p.id === 'piece-serpentine-sofa');
  assert(!!sofa, 'Serpentine Sectional Sofa piece exists');
  assert(sofa?.dimensions.widthCm === 280, 'Sofa width is 280 cm');
  assert(sofa?.dimensions.depthCm === 115, 'Sofa depth is 115 cm');
  assert(sofa?.dimensions.heightCm === 76, 'Sofa height is 76 cm');

  const table = CONFIGURABLE_PIECES.find((p) => p.id === 'piece-aurelia-table');
  assert(!!table, 'Aurelia Dining Table piece exists');
  assert(table?.basePriceINR === 145000, 'Aurelia Table base price is ₹1,45,000');

  const cabinet = CONFIGURABLE_PIECES.find((p) => p.id === 'piece-fujiwara-cabinet');
  assert(!!cabinet, 'Fujiwara Cane Credenza piece exists');

  const chair = CONFIGURABLE_PIECES.find((p) => p.id === 'piece-zenith-lounge');
  assert(!!chair, 'Zenith Swivel Lounge Chair piece exists');

  // Verify all parts have valid default materials
  let allDefaultsValid = true;
  for (const piece of CONFIGURABLE_PIECES) {
    for (const part of piece.parts) {
      const defMat = MATERIAL_LIBRARY.find((m) => m.id === part.defaultMaterialId);
      if (!defMat || !part.allowedCategories.includes(defMat.category)) {
        allDefaultsValid = false;
      }
    }
  }
  assert(allDefaultsValid, 'All furniture parts bind to valid default materials matching allowed categories');

  // --- 3. Dynamic Pricing & Upcharge Calculation Engine ---
  console.log('\n📦 3. Testing Dynamic Pricing & Custom Upcharge Calculation...');
  if (sofa) {
    // Default config price
    const defaultPricing = calculateConfiguredPrice(sofa, sofa.defaultConfiguration);
    assert(defaultPricing.basePriceINR === 185000, 'Sofa base price is ₹1,85,000');
    assert(defaultPricing.totalUpchargeINR === 0, 'Sofa default configuration has ₹0 upcharge');
    assert(defaultPricing.finalPriceINR === 185000, 'Sofa default final price is ₹1,85,000');

    // Upgrade with Tuscan Saddle Leather (+₹25,000) and White Oak (+₹8,000)
    const customConfig = {
      upholstery: 'mat-saddle-leather',
      base: 'mat-white-oak',
      accents: 'mat-spun-brass',
    };
    const upgradedPricing = calculateConfiguredPrice(sofa, customConfig);
    assert(upgradedPricing.totalUpchargeINR === 33000, 'Custom upgrades total exactly ₹33,000 (25k + 8k + 0k)');
    assert(upgradedPricing.finalPriceINR === 218000, 'Final configured price is ₹2,18,000');
    assert(upgradedPricing.itemizedUpcharges.length === 3, 'Itemized receipt generated 3 part entries');
  }

  if (table) {
    // Table with Calacatta Gold Marble (+₹48,000) and Patinated Bronze (+₹9,500)
    const tableCustom = {
      tabletop: 'mat-calacatta-gold',
      pedestal: 'mat-smoked-ash',
      basePlate: 'mat-dark-bronze',
    };
    const tablePricing = calculateConfiguredPrice(table, tableCustom);
    assert(tablePricing.totalUpchargeINR === 69500, 'Table custom upgrades total ₹69,500 (48k + 12k + 9.5k)');
    assert(tablePricing.finalPriceINR === 214500, 'Table final configured price is ₹2,14,500');
  }

  // --- 4. AR Bridge, Query Serialization & WebXR Payload ---
  console.log('\n📦 4. Testing AR Bridge, QR Generation & WebXR Intents...');
  const testConfig = {
    upholstery: 'mat-saddle-leather',
    base: 'mat-walnut',
    accents: 'mat-spun-brass',
  };

  const serializedQuery = ARBridgeService.serializeConfigToQuery(testConfig);
  assert(serializedQuery.includes('cfg_upholstery=mat-saddle-leather'), 'Query serialization contains upholstery parameter');
  assert(serializedQuery.includes('cfg_base=mat-walnut'), 'Query serialization contains base parameter');

  const deserialized = ARBridgeService.deserializeConfigFromQuery(new URLSearchParams(serializedQuery));
  assert(deserialized.upholstery === 'mat-saddle-leather', 'Deserialized upholstery matches original');
  assert(deserialized.base === 'mat-walnut', 'Deserialized base matches original');

  if (sofa) {
    const arPayload = ARBridgeService.generateARPayload(sofa, serializedQuery, 'https://veloura-living.vercel.app');
    assert(arPayload.fallbackQrUrl.includes('api.qrserver.com'), 'QR code generator link populated');
    assert(arPayload.title.includes('Serpentine Modular Sectional Sofa'), 'AR payload title contains piece name');
  }

  // --- 5. Procedural 3D Geometry Models Generation ---
  console.log('\n📦 5. Testing Procedural Three.js Model Geometry Generators...');
  const defaultMats = {
    upholstery: MATERIAL_LIBRARY[0],
    base: MATERIAL_LIBRARY[1],
    accents: MATERIAL_LIBRARY[12],
    tabletop: MATERIAL_LIBRARY[9],
    pedestal: MATERIAL_LIBRARY[0],
    basePlate: MATERIAL_LIBRARY[12],
    carcass: MATERIAL_LIBRARY[0],
    doorPanels: MATERIAL_LIBRARY[3],
    handles: MATERIAL_LIBRARY[12],
    outerShell: MATERIAL_LIBRARY[0],
    innerCushion: MATERIAL_LIBRARY[6],
    swivelBase: MATERIAL_LIBRARY[14],
  };

  // Build Sofa
  const sofaModel = buildSerpentineSofa(defaultMats);
  assert(sofaModel.rootGroup.children.length > 0, 'Sofa 3D root group constructed with child meshes');
  assert(sofaModel.partMeshMap.cushions.length > 0, 'Sofa cushion meshes mapped to target');
  assert(sofaModel.partMeshMap.basePlinth.length > 0, 'Sofa plinth meshes mapped to target');
  assert(sofaModel.explodedMeshes.length > 0, 'Sofa exploded joinery metadata populated');

  // Build Table
  const tableModel = buildAureliaTable(defaultMats);
  assert(tableModel.rootGroup.children.length > 0, 'Table 3D root group constructed with child meshes');
  assert(tableModel.partMeshMap.tableTop.length > 0, 'Tabletop mesh mapped to target');
  assert(tableModel.partMeshMap.pedestals.length > 0, 'Pedestal column meshes mapped to target');

  // Build Cabinet
  const cabinetModel = buildFujiwaraCabinet(defaultMats);
  assert(cabinetModel.rootGroup.children.length > 0, 'Cabinet 3D root group constructed with child meshes');
  assert(cabinetModel.partMeshMap.carcass.length > 0, 'Cabinet carcass mesh mapped to target');
  assert(cabinetModel.partMeshMap.doors.length === 3, 'Cabinet has 3 door front panels');

  // Build Lounge Chair
  const chairModel = buildZenithLoungeChair(defaultMats);
  assert(chairModel.rootGroup.children.length > 0, 'Lounge Chair 3D root group constructed with child meshes');
  assert(chairModel.partMeshMap.shell.length > 0, 'Chair ergonomic shell mesh mapped to target');
  assert(chairModel.partMeshMap.swivelStar.length > 0, 'Chair swivel base meshes mapped to target');

  // --- Summary ---
  console.log('\n🏛️ =========================================================================');
  console.log('📊 PHASE 13 3D SPATIAL CONFIGURATOR TEST SUMMARY:');
  console.log(`   ✓ Passed: ${passed}`);
  console.log(`   ✗ Failed: ${failed}`);
  console.log(`   🎯 Total:  ${passed + failed}`);
  console.log('🏛️ =========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 ALL PHASE 13 3D AR SPATIAL CONFIGURATOR TESTS PASSED 100%!\n');
  }
}

runPhase13Tests().catch((err) => {
  console.error('Test execution fatal error:', err);
  process.exit(1);
});
