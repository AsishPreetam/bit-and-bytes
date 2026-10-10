import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export default function ThreeInfrastructureCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(13, 11, 15);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // 1. Soft Blueprint Ground Grid
    const gridHelper = new THREE.GridHelper(22, 22, 0x059669, 0xe2e8f0);
    gridHelper.position.y = 0;
    cityGroup.add(gridHelper);

    // 2. Road Slab (Soft Slate Surface)
    const roadGeo = new THREE.BoxGeometry(16, 0.25, 3.8);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7,
      metalness: 0.1,
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.position.set(0, 0.12, 0);
    cityGroup.add(roadMesh);

    // Centerline Dashes
    const dashGroup = new THREE.Group();
    for (let i = -7; i <= 7; i += 2) {
      const dashGeo = new THREE.BoxGeometry(0.8, 0.04, 0.15);
      const dashMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(i, 0.26, 0);
      dashGroup.add(dash);
    }
    cityGroup.add(dashGroup);

    // 3. Subsurface Pipes (Cyan Water, Amber Power, Emerald Fiber)
    const pipeGeo = new THREE.CylinderGeometry(0.32, 0.32, 16, 24);
    pipeGeo.rotateZ(Math.PI / 2);
    const pipeMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.3,
    });
    const waterPipe = new THREE.Mesh(pipeGeo, pipeMat);
    waterPipe.position.set(0, -1.2, 1.1);
    cityGroup.add(waterPipe);

    const conduitGeo = new THREE.CylinderGeometry(0.18, 0.18, 16, 20);
    conduitGeo.rotateZ(Math.PI / 2);
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0xb45309,
      emissiveIntensity: 0.6,
    });
    const electricConduit = new THREE.Mesh(conduitGeo, conduitMat);
    electricConduit.position.set(0, -2.0, -1.0);
    cityGroup.add(electricConduit);

    const fiberGeo = new THREE.CylinderGeometry(0.1, 0.1, 16, 16);
    fiberGeo.rotateZ(Math.PI / 2);
    const fiberMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.7,
    });
    const fiberLine = new THREE.Mesh(fiberGeo, fiberMat);
    fiberLine.position.set(0, -0.65, -1.4);
    cityGroup.add(fiberLine);

    // 4. Excavation Dig Trench Node with Pulsing Warning Beacon
    const trenchGeo = new THREE.BoxGeometry(3.2, 1.3, 2.0);
    const trenchMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.9,
      wireframe: true,
    });
    const trench = new THREE.Mesh(trenchGeo, trenchMat);
    trench.position.set(2.2, -0.45, 0);
    cityGroup.add(trench);

    const radarGeo = new THREE.SphereGeometry(1.4, 20, 20);
    const radarMat = new THREE.MeshBasicMaterial({
      color: 0xe11d48,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const radarDome = new THREE.Mesh(radarGeo, radarMat);
    radarDome.position.set(2.2, 0.75, 0);
    cityGroup.add(radarDome);

    const beaconGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.4, 16);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(2.2, 0.7, 0);
    cityGroup.add(beacon);

    const bulbGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xe11d48 });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.set(2.2, 1.45, 0);
    cityGroup.add(bulb);

    // Particles (flowing stream)
    const particleCount = 35;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 14;
      particlePositions[i * 3 + 1] = -1.2;
      particlePositions[i * 3 + 2] = 1.1;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.18,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    cityGroup.add(particleSystem);

    // Moving Vehicle
    const vehicleGeo = new THREE.BoxGeometry(1.1, 0.42, 0.65);
    const vehicleMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.3 });
    const vehicle = new THREE.Mesh(vehicleGeo, vehicleMat);
    vehicle.position.set(-5, 0.42, 0.9);
    cityGroup.add(vehicle);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(12, 20, 15);
    scene.add(dirLight);

    const conflictPointLight = new THREE.PointLight(0xe11d48, 2, 6);
    conflictPointLight.position.set(2.2, 1.5, 0);
    scene.add(conflictPointLight);

    // Parallax
    let targetRotationX = 0;
    let targetRotationY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotationY = x * 0.25;
      targetRotationX = -y * 0.15;
    };

    container.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      cityGroup.rotation.y += (targetRotationY - cityGroup.rotation.y) * 0.05;
      cityGroup.rotation.x += (targetRotationX - cityGroup.rotation.x) * 0.05;

      const pulse = 1 + Math.sin(time * 3) * 0.12;
      radarDome.scale.set(pulse, pulse, pulse);
      radarDome.rotation.y += 0.01;

      bulb.material.color.setHSL(0.98, 0.85, 0.5 + Math.sin(time * 6) * 0.2);

      vehicle.position.x += 2.2 * delta;
      if (vehicle.position.x > 7) vehicle.position.x = -7;

      const positions = particleSystem.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += 3.0 * delta;
        if (positions[i * 3] > 7) positions[i * 3] = -7;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 400;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200/90 shadow-sm">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Clean HUD Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-2xs text-[11px] font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Subsurface Spatial Model</span>
        </div>
      </div>

      {/* Soft Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-sky-200 shadow-2xs text-[11px] text-sky-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Water Culvert (-1.2m)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-amber-200 shadow-2xs text-[11px] text-amber-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Power Conduit (-2.0m)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-emerald-200 shadow-2xs text-[11px] text-emerald-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Fiber Optic (-0.65m)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm border border-rose-200 shadow-2xs text-[11px] text-rose-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          <span>Dig Clashes Flagged</span>
        </div>
      </div>
    </div>
  );
}
