import * as THREE from 'three';
import { MaterialOption } from '@/types/configurator';

export interface BuiltModelResult {
  rootGroup: THREE.Group;
  partMeshMap: Record<string, THREE.Mesh[]>;
  explodedMeshes: {
    mesh: THREE.Object3D;
    originalPos: THREE.Vector3;
    explodedDelta: THREE.Vector3;
  }[];
  geometriesToDispose: THREE.BufferGeometry[];
}

/**
 * Creates a PBR Three.js Material from a MaterialOption specification
 */
export function createThreeMaterial(
  matOption: MaterialOption,
  textureLoader?: THREE.TextureLoader
): THREE.MeshPhysicalMaterial {
  const color = new THREE.Color(matOption.colorHex);

  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness: matOption.roughness,
    metalness: matOption.metalness,
    clearcoat: matOption.clearcoat || 0.0,
    clearcoatRoughness: 0.1,
    reflectivity: 0.5,
  });

  if (matOption.textureUrl && textureLoader) {
    textureLoader.load(
      matOption.textureUrl,
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);
        mat.map = tex;
        mat.needsUpdate = true;
      },
      undefined,
      (err) => {
        // graceful color fallback on load error
        console.warn(`Could not load texture: ${matOption.textureUrl}`);
      }
    );
  }

  return mat;
}

/**
 * Procedural Generator for Serpentine Modular Sectional Sofa
 */
export function buildSerpentineSofa(
  materials: Record<string, MaterialOption>,
  textureLoader?: THREE.TextureLoader
): BuiltModelResult {
  const rootGroup = new THREE.Group();
  const partMeshMap: Record<string, THREE.Mesh[]> = {
    cushions: [],
    basePlinth: [],
    accents: [],
  };
  const explodedMeshes: BuiltModelResult['explodedMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const matCushion = createThreeMaterial(materials.upholstery, textureLoader);
  const matBase = createThreeMaterial(materials.base, textureLoader);
  const matAccent = createThreeMaterial(materials.accents, textureLoader);

  // 1. Plinth Base (Curved Wooden Foundation)
  const baseGeo = new THREE.BoxGeometry(3.6, 0.22, 1.6);
  geometriesToDispose.push(baseGeo);
  const baseMesh = new THREE.Mesh(baseGeo, matBase);
  baseMesh.position.set(0, -0.65, 0);
  baseMesh.castShadow = true;
  baseMesh.receiveShadow = true;
  rootGroup.add(baseMesh);
  partMeshMap.basePlinth.push(baseMesh);

  // 2. Main Seat Modules (3 curved organic rounded blocks)
  const seatWidths = [1.2, 1.2, 1.2];
  const xOffsets = [-1.2, 0, 1.2];

  seatWidths.forEach((w, idx) => {
    const seatGeo = new THREE.BoxGeometry(w * 0.96, 0.45, 1.4);
    geometriesToDispose.push(seatGeo);
    const seatMesh = new THREE.Mesh(seatGeo, matCushion);
    seatMesh.position.set(xOffsets[idx], -0.32, 0);
    seatMesh.castShadow = true;
    seatMesh.receiveShadow = true;
    rootGroup.add(seatMesh);
    partMeshMap.cushions.push(seatMesh);

    explodedMeshes.push({
      mesh: seatMesh,
      originalPos: seatMesh.position.clone(),
      explodedDelta: new THREE.Vector3(0, 0.35 + idx * 0.05, 0),
    });

    // Backrest Cushion
    const backGeo = new THREE.BoxGeometry(w * 0.94, 0.65, 0.38);
    geometriesToDispose.push(backGeo);
    const backMesh = new THREE.Mesh(backGeo, matCushion);
    backMesh.position.set(xOffsets[idx], 0.22, -0.5);
    backMesh.castShadow = true;
    backMesh.receiveShadow = true;
    rootGroup.add(backMesh);
    partMeshMap.cushions.push(backMesh);

    explodedMeshes.push({
      mesh: backMesh,
      originalPos: backMesh.position.clone(),
      explodedDelta: new THREE.Vector3(0, 0.7, -0.4),
    });
  });

  // 3. Side Armrest
  const armGeo = new THREE.BoxGeometry(0.35, 0.55, 1.4);
  geometriesToDispose.push(armGeo);
  const leftArm = new THREE.Mesh(armGeo, matCushion);
  leftArm.position.set(-1.85, -0.15, 0);
  leftArm.castShadow = true;
  rootGroup.add(leftArm);
  partMeshMap.cushions.push(leftArm);
  explodedMeshes.push({
    mesh: leftArm,
    originalPos: leftArm.position.clone(),
    explodedDelta: new THREE.Vector3(-0.5, 0.2, 0),
  });

  // 4. Brass Accent Fasteners
  [-1.7, -0.6, 0.6, 1.7].forEach((x) => {
    const boltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16);
    geometriesToDispose.push(boltGeo);
    const bolt = new THREE.Mesh(boltGeo, matAccent);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(x, -0.65, 0.81);
    rootGroup.add(bolt);
    partMeshMap.accents.push(bolt);
  });

  return { rootGroup, partMeshMap, explodedMeshes, geometriesToDispose };
}

/**
 * Procedural Generator for Aurelia Sculptural Dining Table
 */
export function buildAureliaTable(
  materials: Record<string, MaterialOption>,
  textureLoader?: THREE.TextureLoader
): BuiltModelResult {
  const rootGroup = new THREE.Group();
  const partMeshMap: Record<string, THREE.Mesh[]> = {
    tableTop: [],
    pedestals: [],
    baseTrim: [],
  };
  const explodedMeshes: BuiltModelResult['explodedMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const matTop = createThreeMaterial(materials.tabletop, textureLoader);
  const matPedestal = createThreeMaterial(materials.pedestal, textureLoader);
  const matTrim = createThreeMaterial(materials.basePlate, textureLoader);

  // 1. Monolithic Tabletop
  const topGeo = new THREE.CylinderGeometry(1.65, 1.6, 0.12, 64);
  geometriesToDispose.push(topGeo);
  const topMesh = new THREE.Mesh(topGeo, matTop);
  topMesh.position.set(0, 0.72, 0);
  topMesh.castShadow = true;
  topMesh.receiveShadow = true;
  rootGroup.add(topMesh);
  partMeshMap.tableTop.push(topMesh);

  explodedMeshes.push({
    mesh: topMesh,
    originalPos: topMesh.position.clone(),
    explodedDelta: new THREE.Vector3(0, 0.85, 0),
  });

  // 2. Twin Fluted Pedestals
  [-0.65, 0.65].forEach((x, idx) => {
    const colGeo = new THREE.CylinderGeometry(0.32, 0.42, 1.3, 32);
    geometriesToDispose.push(colGeo);
    const colMesh = new THREE.Mesh(colGeo, matPedestal);
    colMesh.position.set(x, 0.0, 0);
    colMesh.castShadow = true;
    colMesh.receiveShadow = true;
    rootGroup.add(colMesh);
    partMeshMap.pedestals.push(colMesh);

    explodedMeshes.push({
      mesh: colMesh,
      originalPos: colMesh.position.clone(),
      explodedDelta: new THREE.Vector3(idx === 0 ? -0.3 : 0.3, 0.2, 0),
    });

    // Brass Base Trim Footing
    const trimGeo = new THREE.CylinderGeometry(0.48, 0.5, 0.06, 32);
    geometriesToDispose.push(trimGeo);
    const trimMesh = new THREE.Mesh(trimGeo, matTrim);
    trimMesh.position.set(x, -0.68, 0);
    trimMesh.receiveShadow = true;
    rootGroup.add(trimMesh);
    partMeshMap.baseTrim.push(trimMesh);

    explodedMeshes.push({
      mesh: trimMesh,
      originalPos: trimMesh.position.clone(),
      explodedDelta: new THREE.Vector3(idx === 0 ? -0.3 : 0.3, -0.3, 0),
    });
  });

  return { rootGroup, partMeshMap, explodedMeshes, geometriesToDispose };
}

/**
 * Procedural Generator for Fujiwara Cane Credenza
 */
export function buildFujiwaraCabinet(
  materials: Record<string, MaterialOption>,
  textureLoader?: THREE.TextureLoader
): BuiltModelResult {
  const rootGroup = new THREE.Group();
  const partMeshMap: Record<string, THREE.Mesh[]> = {
    carcass: [],
    doors: [],
    legsAndPulls: [],
  };
  const explodedMeshes: BuiltModelResult['explodedMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const matCarcass = createThreeMaterial(materials.carcass, textureLoader);
  const matDoor = createThreeMaterial(materials.doorPanels, textureLoader);
  const matMetal = createThreeMaterial(materials.handles, textureLoader);

  // 1. Solid Wood Carcass Box
  const bodyGeo = new THREE.BoxGeometry(2.6, 1.1, 0.75);
  geometriesToDispose.push(bodyGeo);
  const bodyMesh = new THREE.Mesh(bodyGeo, matCarcass);
  bodyMesh.position.set(0, 0.1, 0);
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  rootGroup.add(bodyMesh);
  partMeshMap.carcass.push(bodyMesh);

  // 2. 3 Door Front Panels
  [-0.85, 0, 0.85].forEach((x, idx) => {
    const doorGeo = new THREE.BoxGeometry(0.8, 1.0, 0.05);
    geometriesToDispose.push(doorGeo);
    const doorMesh = new THREE.Mesh(doorGeo, matDoor);
    doorMesh.position.set(x, 0.1, 0.39);
    doorMesh.castShadow = true;
    rootGroup.add(doorMesh);
    partMeshMap.doors.push(doorMesh);

    explodedMeshes.push({
      mesh: doorMesh,
      originalPos: doorMesh.position.clone(),
      explodedDelta: new THREE.Vector3(0, 0, 0.45 + idx * 0.05),
    });

    // Brass Vertical Handle
    const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 16);
    geometriesToDispose.push(handleGeo);
    const handle = new THREE.Mesh(handleGeo, matMetal);
    handle.position.set(x + (idx === 0 ? 0.32 : idx === 2 ? -0.32 : 0.32), 0.1, 0.43);
    rootGroup.add(handle);
    partMeshMap.legsAndPulls.push(handle);

    explodedMeshes.push({
      mesh: handle,
      originalPos: handle.position.clone(),
      explodedDelta: new THREE.Vector3(0, 0, 0.7 + idx * 0.05),
    });
  });

  // 3. Tapered Brass Legs
  [
    [-1.1, -0.65, 0.25],
    [1.1, -0.65, 0.25],
    [-1.1, -0.65, -0.25],
    [1.1, -0.65, -0.25],
  ].forEach(([x, y, z]) => {
    const legGeo = new THREE.CylinderGeometry(0.025, 0.045, 0.45, 16);
    geometriesToDispose.push(legGeo);
    const leg = new THREE.Mesh(legGeo, matMetal);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    rootGroup.add(leg);
    partMeshMap.legsAndPulls.push(leg);

    explodedMeshes.push({
      mesh: leg,
      originalPos: leg.position.clone(),
      explodedDelta: new THREE.Vector3(x * 0.3, -0.4, z * 0.3),
    });
  });

  return { rootGroup, partMeshMap, explodedMeshes, geometriesToDispose };
}

/**
 * Procedural Generator for Zenith Swivel Lounge Chair
 */
export function buildZenithLoungeChair(
  materials: Record<string, MaterialOption>,
  textureLoader?: THREE.TextureLoader
): BuiltModelResult {
  const rootGroup = new THREE.Group();
  const partMeshMap: Record<string, THREE.Mesh[]> = {
    shell: [],
    seatCushion: [],
    swivelStar: [],
  };
  const explodedMeshes: BuiltModelResult['explodedMeshes'] = [];
  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const matShell = createThreeMaterial(materials.outerShell, textureLoader);
  const matCushion = createThreeMaterial(materials.innerCushion, textureLoader);
  const matBase = createThreeMaterial(materials.swivelBase, textureLoader);

  // 1. Molded Ergonomic Shell Back
  const shellGeo = new THREE.CylinderGeometry(0.85, 0.72, 0.85, 32, 1, false, 0, Math.PI);
  geometriesToDispose.push(shellGeo);
  const shellMesh = new THREE.Mesh(shellGeo, matShell);
  shellMesh.rotation.y = Math.PI / 2;
  shellMesh.position.set(0, 0.15, -0.15);
  shellMesh.castShadow = true;
  rootGroup.add(shellMesh);
  partMeshMap.shell.push(shellMesh);

  explodedMeshes.push({
    mesh: shellMesh,
    originalPos: shellMesh.position.clone(),
    explodedDelta: new THREE.Vector3(0, 0.3, -0.4),
  });

  // 2. Plush Seat Cushion
  const seatGeo = new THREE.CylinderGeometry(0.68, 0.65, 0.25, 32);
  geometriesToDispose.push(seatGeo);
  const seatMesh = new THREE.Mesh(seatGeo, matCushion);
  seatMesh.position.set(0, -0.05, 0.05);
  seatMesh.castShadow = true;
  seatMesh.receiveShadow = true;
  rootGroup.add(seatMesh);
  partMeshMap.seatCushion.push(seatMesh);

  explodedMeshes.push({
    mesh: seatMesh,
    originalPos: seatMesh.position.clone(),
    explodedDelta: new THREE.Vector3(0, 0.55, 0.1),
  });

  // Lumbar Pillow
  const lumbarGeo = new THREE.SphereGeometry(0.38, 24, 16);
  lumbarGeo.scale(1.2, 0.7, 0.4);
  geometriesToDispose.push(lumbarGeo);
  const lumbarMesh = new THREE.Mesh(lumbarGeo, matCushion);
  lumbarMesh.position.set(0, 0.25, -0.2);
  lumbarMesh.castShadow = true;
  rootGroup.add(lumbarMesh);
  partMeshMap.seatCushion.push(lumbarMesh);

  explodedMeshes.push({
    mesh: lumbarMesh,
    originalPos: lumbarMesh.position.clone(),
    explodedDelta: new THREE.Vector3(0, 0.75, -0.1),
  });

  // 3. Central Swivel Column & 4-Star Base
  const stemGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.45, 16);
  geometriesToDispose.push(stemGeo);
  const stem = new THREE.Mesh(stemGeo, matBase);
  stem.position.set(0, -0.4, 0);
  stem.castShadow = true;
  rootGroup.add(stem);
  partMeshMap.swivelStar.push(stem);

  explodedMeshes.push({
    mesh: stem,
    originalPos: stem.position.clone(),
    explodedDelta: new THREE.Vector3(0, -0.3, 0),
  });

  [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].forEach((rotAngle) => {
    const starLegGeo = new THREE.BoxGeometry(0.65, 0.04, 0.08);
    geometriesToDispose.push(starLegGeo);
    const starLeg = new THREE.Mesh(starLegGeo, matBase);
    starLeg.position.set(Math.cos(rotAngle) * 0.32, -0.62, Math.sin(rotAngle) * 0.32);
    starLeg.rotation.y = -rotAngle;
    starLeg.receiveShadow = true;
    rootGroup.add(starLeg);
    partMeshMap.swivelStar.push(starLeg);

    explodedMeshes.push({
      mesh: starLeg,
      originalPos: starLeg.position.clone(),
      explodedDelta: new THREE.Vector3(Math.cos(rotAngle) * 0.2, -0.5, Math.sin(rotAngle) * 0.2),
    });
  });

  return { rootGroup, partMeshMap, explodedMeshes, geometriesToDispose };
}
