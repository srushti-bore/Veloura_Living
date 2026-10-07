'use client';

import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import {
  ConfigurableFurniturePiece,
  LightingEnvironment,
  MaterialOption,
} from '@/types/configurator';
import { MATERIAL_LIBRARY } from '@/lib/data/configuratorMaterials';
import {
  buildSerpentineSofa,
  buildAureliaTable,
  buildFujiwaraCabinet,
  buildZenithLoungeChair,
  BuiltModelResult,
} from './furnitureModels';

export interface ThreeStudioViewportHandle {
  captureSnapshot: () => string | null;
  resetCamera: () => void;
  focusSection: (section: 'overview' | 'materials' | 'lighting' | 'joinery') => void;
}

interface Props {
  piece: ConfigurableFurniturePiece;
  partMaterials: Record<string, string>;
  lighting: LightingEnvironment;
  showCalipers: boolean;
  explodedProgress: number;
  autoRotate: boolean;
  className?: string;
}

interface PieceCameraConfig {
  radius: number;
  theta: number;
  phi: number;
  targetY: number;
}

const PIECE_CAMERA_PRESETS: Record<string, PieceCameraConfig> = {
  'piece-serpentine-sofa': {
    radius: 7.2,
    theta: Math.PI / 4.2,
    phi: Math.PI / 2.65,
    targetY: -0.12,
  },
  'piece-aurelia-table': {
    radius: 6.2,
    theta: Math.PI / 4.0,
    phi: Math.PI / 2.75,
    targetY: 0.15,
  },
  'piece-fujiwara-cabinet': {
    radius: 5.8,
    theta: Math.PI / 4.2,
    phi: Math.PI / 2.65,
    targetY: 0.05,
  },
  'piece-zenith-lounge-chair': {
    radius: 4.8,
    theta: Math.PI / 4.5,
    phi: Math.PI / 2.7,
    targetY: 0.1,
  },
};

export const ThreeStudioViewport = forwardRef<ThreeStudioViewportHandle, Props>(
  (
    {
      piece,
      partMaterials,
      lighting,
      showCalipers,
      explodedProgress,
      autoRotate,
      className = '',
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const modelGroupRef = useRef<THREE.Group | null>(null);
    const currentModelDataRef = useRef<BuiltModelResult | null>(null);
    const lightsGroupRef = useRef<THREE.Group | null>(null);
    const calipersGroupRef = useRef<THREE.Group | null>(null);
    const textureLoaderRef = useRef<THREE.TextureLoader | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    // Camera Orbit & Visual Center Target State
    const isDraggingRef = useRef(false);
    const previousMousePosRef = useRef({ x: 0, y: 0 });

    const initialPreset = PIECE_CAMERA_PRESETS[piece.id] || {
      radius: 6.5,
      theta: Math.PI / 4.2,
      phi: Math.PI / 2.7,
      targetY: 0,
    };

    const sphericalRef = useRef({
      radius: initialPreset.radius,
      theta: initialPreset.theta,
      phi: initialPreset.phi,
    });
    const targetSphericalRef = useRef({
      radius: initialPreset.radius,
      theta: initialPreset.theta,
      phi: initialPreset.phi,
    });

    const currentTargetYRef = useRef(initialPreset.targetY);
    const destTargetYRef = useRef(initialPreset.targetY);

    // Expose Snapshot, Camera Reset, and Scroll-Focus handles
    useImperativeHandle(ref, () => ({
      captureSnapshot: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      },
      resetCamera: () => {
        const preset = PIECE_CAMERA_PRESETS[piece.id] || {
          radius: 6.5,
          theta: Math.PI / 4.2,
          phi: Math.PI / 2.7,
          targetY: 0,
        };
        targetSphericalRef.current = {
          radius: preset.radius,
          theta: preset.theta,
          phi: preset.phi,
        };
        destTargetYRef.current = preset.targetY;
      },
      focusSection: (section: 'overview' | 'materials' | 'lighting' | 'joinery') => {
        const preset = PIECE_CAMERA_PRESETS[piece.id] || {
          radius: 6.5,
          theta: Math.PI / 4.2,
          phi: Math.PI / 2.7,
          targetY: 0,
        };
        if (section === 'materials') {
          targetSphericalRef.current = {
            radius: preset.radius * 0.88,
            theta: preset.theta + 0.18,
            phi: Math.PI / 2.58,
          };
          destTargetYRef.current = preset.targetY + 0.12;
        } else if (section === 'lighting') {
          targetSphericalRef.current = {
            radius: preset.radius * 1.05,
            theta: preset.theta - 0.28,
            phi: Math.PI / 2.8,
          };
          destTargetYRef.current = preset.targetY;
        } else if (section === 'joinery') {
          targetSphericalRef.current = {
            radius: preset.radius * 0.94,
            theta: preset.theta + 0.42,
            phi: Math.PI / 2.4,
          };
          destTargetYRef.current = preset.targetY + 0.22;
        } else {
          targetSphericalRef.current = {
            radius: preset.radius,
            theta: preset.theta,
            phi: preset.phi,
          };
          destTargetYRef.current = preset.targetY;
        }
      },
    }));

    // Setup Lighting Environment with Rich Volumetric Fill
    const updateLighting = useCallback((env: LightingEnvironment) => {
      const lightsGroup = lightsGroupRef.current;
      if (!lightsGroup) return;

      while (lightsGroup.children.length > 0) {
        const obj = lightsGroup.children[0];
        lightsGroup.remove(obj);
      }

      // 1. Universal Studio Ambient & Ground Bounce Fill
      const hemiLight = new THREE.HemisphereLight(0xfff6ec, 0x2e241c, 1.4);
      lightsGroup.add(hemiLight);

      switch (env) {
        case 'morning-sun': {
          const sun = new THREE.DirectionalLight(0xffeedb, 2.6);
          sun.position.set(6, 9, 6);
          sun.castShadow = true;
          sun.shadow.mapSize.width = 2048;
          sun.shadow.mapSize.height = 2048;
          sun.shadow.bias = -0.0001;

          const fill = new THREE.DirectionalLight(0xdceeff, 1.1);
          fill.position.set(-6, 4, -4);

          const rim = new THREE.DirectionalLight(0xfff0dd, 1.0);
          rim.position.set(0, 6, -7);

          lightsGroup.add(sun, fill, rim);
          break;
        }
        case 'golden-dusk': {
          const sunset = new THREE.DirectionalLight(0xff9944, 3.2);
          sunset.position.set(8, 5, 4);
          sunset.castShadow = true;

          const rim = new THREE.PointLight(0xff7722, 2.4, 18);
          rim.position.set(-6, 3, -5);

          const softFill = new THREE.DirectionalLight(0x664433, 1.0);
          softFill.position.set(-5, 4, 5);

          lightsGroup.add(sunset, rim, softFill);
          break;
        }
        case 'gallery-spotlight': {
          const spot = new THREE.SpotLight(0xffffff, 4.8, 22, Math.PI / 4.5, 0.4);
          spot.position.set(0, 11, 4);
          spot.castShadow = true;

          const key = new THREE.DirectionalLight(0xfff5ee, 2.0);
          key.position.set(5, 6, 5);

          const rim = new THREE.DirectionalLight(0xe8e4dc, 1.2);
          rim.position.set(-5, 5, -5);

          lightsGroup.add(spot, key, rim);
          break;
        }
        case 'midnight-atelier': {
          const brassKey = new THREE.PointLight(0xd4af37, 3.8, 12);
          brassKey.position.set(3, 5, 4);

          const blueRim = new THREE.DirectionalLight(0x4466aa, 1.8);
          blueRim.position.set(-6, 7, -6);

          const warmGlow = new THREE.PointLight(0x8b5a2b, 2.0, 10);
          warmGlow.position.set(0, 1, 3);

          lightsGroup.add(brassKey, blueRim, warmGlow);
          break;
        }
      }
    }, []);

    // Build Dimension Calipers
    const updateCalipers = useCallback(
      (dims: ConfigurableFurniturePiece['dimensions'], visible: boolean) => {
        const group = calipersGroupRef.current;
        if (!group) return;

        while (group.children.length > 0) {
          const obj = group.children[0];
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
          group.remove(obj);
        }

        if (!visible) return;

        const w = (dims.widthCm / 100) * 1.2;
        const d = (dims.depthCm / 100) * 1.2;
        const h = (dims.heightCm / 100) * 1.2;

        const lineMat = new THREE.LineBasicMaterial({
          color: 0xd8b486,
          linewidth: 2,
          transparent: true,
          opacity: 0.85,
        });

        // 1. Width Dimension Line (Front Bottom)
        const wGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-w / 2, -0.82, d / 2 + 0.2),
          new THREE.Vector3(w / 2, -0.82, d / 2 + 0.2),
        ]);
        const wLine = new THREE.Line(wGeo, lineMat);
        group.add(wLine);

        // 2. Height Dimension Line (Right Side)
        const hGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(w / 2 + 0.2, -0.82, d / 2),
          new THREE.Vector3(w / 2 + 0.2, -0.82 + h, d / 2),
        ]);
        const hLine = new THREE.Line(hGeo, lineMat);
        group.add(hLine);

        // 3. Depth Dimension Line (Side Floor)
        const dGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(w / 2 + 0.2, -0.82, -d / 2),
          new THREE.Vector3(w / 2 + 0.2, -0.82, d / 2),
        ]);
        const dLine = new THREE.Line(dGeo, lineMat);
        group.add(dLine);
      },
      []
    );

    // Initial Scene & WebGL Setup
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;

      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      textureLoaderRef.current = new THREE.TextureLoader();

      // Studio Gallery Floor Podium
      const podiumGeo = new THREE.CylinderGeometry(5.2, 5.3, 0.05, 64);
      const podiumMat = new THREE.MeshStandardMaterial({
        color: 0x16120f,
        roughness: 0.9,
        metalness: 0.1,
      });
      const podium = new THREE.Mesh(podiumGeo, podiumMat);
      podium.position.y = -0.875;
      podium.receiveShadow = true;
      scene.add(podium);

      // Bronze Subtle Rim Trim
      const rimGeo = new THREE.TorusGeometry(5.22, 0.018, 16, 64);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x8b5a2b,
        roughness: 0.35,
        metalness: 0.8,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = -0.85;
      scene.add(rim);

      // Soft Shadow Contact Disc
      const shadowPlaneGeo = new THREE.PlaneGeometry(12, 12);
      const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: 0.28 });
      const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
      shadowPlane.rotation.x = -Math.PI / 2;
      shadowPlane.position.y = -0.845;
      shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      // Groups
      const lightsGroup = new THREE.Group();
      lightsGroupRef.current = lightsGroup;
      scene.add(lightsGroup);

      const modelGroup = new THREE.Group();
      modelGroupRef.current = modelGroup;
      scene.add(modelGroup);

      const calipersGroup = new THREE.Group();
      calipersGroupRef.current = calipersGroup;
      scene.add(calipersGroup);

      updateLighting(lighting);

      // Event Listeners for Smooth Orbit
      const onMouseDown = (e: MouseEvent) => {
        isDraggingRef.current = true;
        previousMousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaX = e.clientX - previousMousePosRef.current.x;
        const deltaY = e.clientY - previousMousePosRef.current.y;

        targetSphericalRef.current.theta -= deltaX * 0.007;
        targetSphericalRef.current.phi = Math.max(
          0.15,
          Math.min(Math.PI / 2 - 0.08, targetSphericalRef.current.phi - deltaY * 0.007)
        );

        previousMousePosRef.current = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDraggingRef.current = false;
      };

      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        targetSphericalRef.current.radius = Math.max(
          3.2,
          Math.min(11.5, targetSphericalRef.current.radius + e.deltaY * 0.005)
        );
      };

      // Touch Events for Mobile
      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length === 1) {
          isDraggingRef.current = true;
          previousMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - previousMousePosRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePosRef.current.y;

        targetSphericalRef.current.theta -= deltaX * 0.007;
        targetSphericalRef.current.phi = Math.max(
          0.15,
          Math.min(Math.PI / 2 - 0.08, targetSphericalRef.current.phi - deltaY * 0.007)
        );

        previousMousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      const onTouchEnd = () => {
        isDraggingRef.current = false;
      };

      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      container.addEventListener('wheel', onWheel, { passive: false });

      container.addEventListener('touchstart', onTouchStart);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onTouchEnd);

      // ResizeObserver for rock-solid responsive canvas framing
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const w = entry.contentRect.width;
          const h = entry.contentRect.height;
          if (w > 0 && h > 0 && cameraRef.current && rendererRef.current) {
            cameraRef.current.aspect = w / h;
            cameraRef.current.updateProjectionMatrix();
            rendererRef.current.setSize(w, h, false);
          }
        }
      });
      resizeObserver.observe(container);

      // Animation Loop with Smooth Damping Interpolation
      let reqId: number;
      const animate = () => {
        reqId = requestAnimationFrame(animate);

        // Auto-rotation when idle
        if (autoRotate && !isDraggingRef.current) {
          targetSphericalRef.current.theta += 0.0025;
        }

        // Smooth damping interpolation for camera orbit
        sphericalRef.current.theta +=
          (targetSphericalRef.current.theta - sphericalRef.current.theta) * 0.08;
        sphericalRef.current.phi +=
          (targetSphericalRef.current.phi - sphericalRef.current.phi) * 0.08;
        sphericalRef.current.radius +=
          (targetSphericalRef.current.radius - sphericalRef.current.radius) * 0.08;

        // Smooth visual target center transition
        currentTargetYRef.current +=
          (destTargetYRef.current - currentTargetYRef.current) * 0.08;

        const { radius, theta, phi } = sphericalRef.current;
        const targetY = currentTargetYRef.current;

        camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        camera.position.y = targetY + radius * Math.cos(phi);
        camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        camera.lookAt(0, targetY, 0);

        renderer.render(scene, camera);
      };

      animate();
      setIsLoading(false);

      return () => {
        cancelAnimationFrame(reqId);
        resizeObserver.disconnect();
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        container.removeEventListener('wheel', onWheel);
        container.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);

        renderer.dispose();
        podiumGeo.dispose();
        podiumMat.dispose();
        rimGeo.dispose();
        rimMat.dispose();
        shadowPlaneGeo.dispose();
        shadowPlaneMat.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    }, [autoRotate, updateLighting]);

    // Update Lighting on prop change
    useEffect(() => {
      updateLighting(lighting);
    }, [lighting, updateLighting]);

    // Update Calipers on prop change
    useEffect(() => {
      updateCalipers(piece.dimensions, showCalipers);
    }, [piece.dimensions, showCalipers, updateCalipers]);

    // Update Camera Target Preset when Piece Changes
    useEffect(() => {
      const preset = PIECE_CAMERA_PRESETS[piece.id] || {
        radius: 6.5,
        theta: Math.PI / 4.2,
        phi: Math.PI / 2.7,
        targetY: 0,
      };
      targetSphericalRef.current = {
        radius: preset.radius,
        theta: preset.theta,
        phi: preset.phi,
      };
      destTargetYRef.current = preset.targetY;
    }, [piece.id]);

    // Rebuild 3D Model when piece or materials change
    useEffect(() => {
      const modelGroup = modelGroupRef.current;
      if (!modelGroup) return;

      // Clean previous model geometries
      if (currentModelDataRef.current) {
        currentModelDataRef.current.geometriesToDispose.forEach((geo) => geo.dispose());
      }
      while (modelGroup.children.length > 0) {
        modelGroup.remove(modelGroup.children[0]);
      }

      // Resolve MaterialOption objects for parts
      const activeMaterials: Record<string, MaterialOption> = {};
      piece.parts.forEach((part) => {
        const matId = partMaterials[part.id] || part.defaultMaterialId;
        const matOption =
          MATERIAL_LIBRARY.find((m) => m.id === matId) ||
          MATERIAL_LIBRARY.find((m) => m.id === part.defaultMaterialId) ||
          MATERIAL_LIBRARY[0];
        activeMaterials[part.id] = matOption;
      });

      let result: BuiltModelResult;
      if (piece.id === 'piece-serpentine-sofa') {
        result = buildSerpentineSofa(activeMaterials, textureLoaderRef.current || undefined);
      } else if (piece.id === 'piece-aurelia-table') {
        result = buildAureliaTable(activeMaterials, textureLoaderRef.current || undefined);
      } else if (piece.id === 'piece-fujiwara-cabinet') {
        result = buildFujiwaraCabinet(activeMaterials, textureLoaderRef.current || undefined);
      } else {
        result = buildZenithLoungeChair(activeMaterials, textureLoaderRef.current || undefined);
      }

      currentModelDataRef.current = result;
      modelGroup.add(result.rootGroup);
    }, [piece, partMaterials]);

    // Exploded View Interpolation
    useEffect(() => {
      const modelData = currentModelDataRef.current;
      if (!modelData) return;

      modelData.explodedMeshes.forEach(({ mesh, originalPos, explodedDelta }) => {
        mesh.position.x = originalPos.x + explodedDelta.x * explodedProgress;
        mesh.position.y = originalPos.y + explodedDelta.y * explodedProgress;
        mesh.position.z = originalPos.z + explodedDelta.z * explodedProgress;
      });
    }, [explodedProgress]);

    return (
      <div className={`relative w-full h-full select-none overflow-hidden ${className}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1c1815]/90 backdrop-blur-md z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-[#8B5A2B] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs uppercase tracking-widest text-[#D8B486]">Loading 3D Studio...</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
        />

        {/* 3D Calipers Dimension Badges (Overlay) */}
        {showCalipers && (
          <div className="absolute bottom-6 left-6 pointer-events-none flex flex-col gap-1.5 bg-[#12100E]/85 backdrop-blur-md px-4 py-3 rounded-2xl border border-[#8B5A2B]/30 shadow-2xl">
            <span className="text-[10px] uppercase tracking-widest text-[#D8B486] font-semibold">
              Live Architectural Dimensions
            </span>
            <div className="flex items-center gap-4 text-xs text-[#FAF7F2]">
              <div>
                <span className="text-stone-400">Width:</span> {piece.dimensions.widthCm} cm
              </div>
              <div>
                <span className="text-stone-400">Depth:</span> {piece.dimensions.depthCm} cm
              </div>
              <div>
                <span className="text-stone-400">Height:</span> {piece.dimensions.heightCm} cm
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ThreeStudioViewport.displayName = 'ThreeStudioViewport';
