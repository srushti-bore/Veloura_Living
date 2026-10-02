'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Props {
  className?: string;
}

export const FloatingFurnitureCanvas: React.FC<Props> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Group for objects
    const group = new THREE.Group();
    scene.add(group);

    // 1. Torus in brushed warm brass material
    const torusGeo = new THREE.TorusGeometry(1.4, 0.28, 24, 64);
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0x8B5A2B,
      metalness: 0.85,
      roughness: 0.25,
    });
    const torus = new THREE.Mesh(torusGeo, brassMat);
    torus.rotation.x = Math.PI / 4;
    group.add(torus);

    // 2. Alabaster Warm Cream Sphere (symbolizing organic balance)
    const sphereGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: 0xF5E6D3,
      roughness: 0.45,
      metalness: 0.1,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.set(0.3, 0.2, 0.4);
    group.add(sphere);

    // 3. Floating Walnut Disc
    const cylinderGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.15, 32);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x4A2C1A,
      roughness: 0.7,
      metalness: 0.05,
    });
    const cylinder = new THREE.Mesh(cylinderGeo, woodMat);
    cylinder.position.set(-1.2, -0.9, -0.2);
    cylinder.rotation.x = Math.PI / 6;
    cylinder.rotation.z = Math.PI / 8;
    group.add(cylinder);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffecd2, 2.2);
    dirLight.position.set(5, 6, 7);
    scene.add(dirLight);

    const rimLight = new THREE.PointLight(0xd4af37, 1.5, 10);
    rimLight.position.set(-4, -3, 2);
    scene.add(rimLight);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    let reqId: number;
    const startTime = performance.now();

    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (!prefersReducedMotion) {
        const elapsedTime = (performance.now() - startTime) * 0.001;

        // Subtle gentle floating
        torus.rotation.x = Math.PI / 4 + Math.sin(elapsedTime * 0.5) * 0.15;
        torus.rotation.y = elapsedTime * 0.25;
        sphere.position.y = 0.2 + Math.sin(elapsedTime * 0.8) * 0.12;
        cylinder.rotation.y = elapsedTime * 0.18;
        cylinder.position.y = -0.9 + Math.cos(elapsedTime * 0.6) * 0.08;

        // Smooth mouse parallax
        targetX += (mouseX * 0.6 - targetX) * 0.05;
        targetY += (mouseY * 0.4 - targetY) * 0.05;

        group.rotation.y = targetX;
        group.rotation.x = -targetY;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      torusGeo.dispose();
      sphereGeo.dispose();
      cylinderGeo.dispose();
      brassMat.dispose();
      sphereMat.dispose();
      woodMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={`w-full h-full relative cursor-grab active:cursor-grabbing ${className}`} />;
};
