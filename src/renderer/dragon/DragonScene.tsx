import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RealisticDragonModel } from './RealisticDragonModel';
import { FlightController } from './FlightController';
import { FireSystem } from './FireSystem';
import { useAppStore } from '../store/useAppStore';

export const DragonScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<FlightController | null>(null);

  const userScale = useAppStore(s => s.settings.charm?.size ? s.settings.charm.size / 48 : 1.0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // -------------------------------------------------------------
    // 1. THREE.JS SCENE, CAMERA, & RENDERER SETUP
    // -------------------------------------------------------------
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      precision: 'highp',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    container.appendChild(renderer.domElement);

    // -------------------------------------------------------------
    // 2. CINEMATIC MULTI-LIGHT RIG (DROGON REFERENCE MATCH)
    // -------------------------------------------------------------
    // Deep twilight ambient atmosphere
    const ambientLight = new THREE.AmbientLight(0x3a334c, 1.8);
    scene.add(ambientLight);

    // Top-right key light
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.8);
    keyLight.position.set(12, 18, 14);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool fill light
    const fillLight = new THREE.DirectionalLight(0x7799ff, 1.6);
    fillLight.position.set(-14, 8, 10);
    scene.add(fillLight);

    // Fiery Rim Light highlighting under-neck crests & scale silhouettes
    const rimLight = new THREE.DirectionalLight(0xff5500, 3.8);
    rimLight.position.set(-10, -8, -12);
    scene.add(rimLight);

    // -------------------------------------------------------------
    // 3. REALISTIC DRAGON MODEL, FLIGHT CONTROLLER, & FIRE SYSTEM
    // -------------------------------------------------------------
    const dragon = new RealisticDragonModel();
    scene.add(dragon.group);

    const flight = new FlightController(dragon);
    flightRef.current = flight;

    const fireSystem = new FireSystem(dragon);
    scene.add(fireSystem.group);

    // Dynamic resolution-aware desktop companion scale (~11% of screen width)
    const updateBoundsAndScale = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      const vFOV = THREE.MathUtils.degToRad(camera.fov);
      const visibleHeight = 2 * Math.tan(vFOV / 2) * camera.position.z;
      const visibleWidth = visibleHeight * camera.aspect;

      flight.setBounds(
        -visibleWidth * 0.42,
        visibleWidth * 0.42,
        -visibleHeight * 0.42,
        visibleHeight * 0.42
      );

      const companionScale = (visibleWidth * 0.11) / 1.6 * userScale;
      dragon.group.scale.setScalar(companionScale);
    };

    updateBoundsAndScale();
    window.addEventListener('resize', updateBoundsAndScale);

    // -------------------------------------------------------------
    // 4. ANIMATION FRAME LOOP (60 FPS)
    // -------------------------------------------------------------
    const clock = new THREE.Clock();
    let animFrameId: number;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);

      flight.update(delta);
      fireSystem.update(delta, flight.state);

      renderer.render(scene, camera);
    };

    animate();

    // -------------------------------------------------------------
    // 5. CLICK INTERACTION (Clicking dragon blasts fire stream!)
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(dragon.group, true);

      if (intersects.length > 0) {
        flight.triggerFireManually();
      }
    };

    window.addEventListener('click', handleClick);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', updateBoundsAndScale);
      window.removeEventListener('click', handleClick);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [userScale]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
    />
  );
};
