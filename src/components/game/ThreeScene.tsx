import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { BinType, ItemData } from '../../types/game';
import { ALL_BINS } from '../../data/bins';
import { createItemMesh, disposeItemMesh } from '../world/items/createItemMesh';

interface ThreeSceneProps {
  currentItem: ItemData | null;
  activeBins: BinType[];
  energyLevel: number; // 0 to 100
  onThrowItem: (targetBin: BinType) => void;
  isThrowing: boolean;
  slowMode: boolean;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  currentItem,
  activeBins,
  energyLevel,
  onThrowItem,
  isThrowing,
  slowMode,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const itemMeshRef = useRef<THREE.Group | null>(null);
  const binMeshesRef = useRef<Map<BinType, THREE.Group>>(new Map());
  const townWindowsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Drag throw state
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!mountRef.current) return;
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark midnight sky
    scene.fog = new THREE.FogExp2(0x0f172a, 0.035);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3.8, 6.2);
    camera.lookAt(0, 1.2, -1.0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    sunLight.position.set(5, 10, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // 4. Ground / Room floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Table
    const tableGeo = new THREE.BoxGeometry(4.2, 0.3, 2.0);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    const table = new THREE.Mesh(tableGeo, tableMat);
    table.position.set(0, 0.85, 2.2);
    table.receiveShadow = true;
    scene.add(table);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const positions = [
      [-1.9, 0.42, 1.4],
      [1.9, 0.42, 1.4],
      [-1.9, 0.42, 3.0],
      [1.9, 0.42, 3.0],
    ];
    positions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      scene.add(leg);
    });

    // 5. Town in the background with lights that react to Energy
    const townGroup = new THREE.Group();
    townWindowsRef.current = [];
    const buildingColors = [0x1e293b, 0x334155, 0x0f172a, 0x1e293b];

    for (let i = -7; i <= 7; i += 2) {
      const bHeight = 2.5 + Math.abs((i * 13) % 4);
      const bGeo = new THREE.BoxGeometry(1.4, bHeight, 1.4);
      const bMat = new THREE.MeshStandardMaterial({
        color: buildingColors[Math.abs(i) % buildingColors.length],
      });
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(i * 1.5, bHeight / 2, -7.5 - Math.abs(i) * 0.3);
      townGroup.add(building);

      // Windows
      const winGeo = new THREE.PlaneGeometry(0.3, 0.4);
      for (let w = 1; w < bHeight - 0.5; w += 0.8) {
        const winMat = new THREE.MeshStandardMaterial({
          color: 0x334155,
          emissive: 0x000000,
          roughness: 0.3,
        });
        townWindowsRef.current.push(winMat);
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(i * 1.5, w, -6.7 - Math.abs(i) * 0.3);
        townGroup.add(win);
      }
    }
    scene.add(townGroup);

    // Animation Loop
    let animationId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Idle float for current item if not throwing
      if (itemMeshRef.current && !isThrowing) {
        itemMeshRef.current.rotation.y = elapsed * 1.2;
        itemMeshRef.current.position.y = 1.2 + Math.sin(elapsed * 3) * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Town lights based on energy level
  useEffect(() => {
    const emissiveIntensity = Math.min(1.0, energyLevel / 100);
    const glowColor = new THREE.Color(0xfbbf24); // warm gold glow

    townWindowsRef.current.forEach((mat) => {
      if (emissiveIntensity > 0.1) {
        mat.emissive.copy(glowColor).multiplyScalar(emissiveIntensity);
      } else {
        mat.emissive.setHex(0x000000);
      }
    });
  }, [energyLevel]);

  // Rebuild 3D Bins when activeBins change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clean up old bin meshes
    binMeshesRef.current.forEach((mesh) => scene.remove(mesh));
    binMeshesRef.current.clear();

    const numBins = activeBins.length;
    const spacing = Math.min(1.6, 5.0 / Math.max(numBins - 1, 1));
    const startX = -((numBins - 1) * spacing) / 2;

    activeBins.forEach((binType, index) => {
      const binData = ALL_BINS[binType];
      const binGroup = new THREE.Group();
      const xPos = startX + index * spacing;

      // Bin Body
      let bodyGeo: THREE.BufferGeometry;
      if (binData.shape === 'cylinder') {
        bodyGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.4, 24);
      } else if (binData.shape === 'cube') {
        bodyGeo = new THREE.BoxGeometry(1.0, 1.4, 1.0);
      } else if (binData.shape === 'hex') {
        bodyGeo = new THREE.CylinderGeometry(0.55, 0.45, 1.4, 6);
      } else {
        bodyGeo = new THREE.CylinderGeometry(0.5, 0.45, 1.4, 16);
      }

      const bodyMat = new THREE.MeshStandardMaterial({
        color: binData.hexColor,
        roughness: 0.4,
        metalness: 0.1,
      });
      const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
      bodyMesh.castShadow = true;
      bodyMesh.receiveShadow = true;
      bodyMesh.position.y = 0.7;
      binGroup.add(bodyMesh);

      // Bin Lid / Rim
      const rimGeo = new THREE.TorusGeometry(0.52, 0.08, 12, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 1.4;
      binGroup.add(rimMesh);

      // Bin opening hole
      const holeGeo = new THREE.CircleGeometry(0.46, 24);
      const holeMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
      const hole = new THREE.Mesh(holeGeo, holeMat);
      hole.rotation.x = -Math.PI / 2;
      hole.position.y = 1.41;
      binGroup.add(hole);

      binGroup.position.set(xPos, 0, -0.6);
      scene.add(binGroup);
      binMeshesRef.current.set(binType, binGroup);
    });
  }, [activeBins]);

  // Create & Update 3D Item
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (itemMeshRef.current) {
      scene.remove(itemMeshRef.current);
      disposeItemMesh(itemMeshRef.current);
      itemMeshRef.current = null;
    }

    if (!currentItem) return;

    const itemGroup = createItemMesh(currentItem.modelType, {
      scale: 1.15,
      castShadow: true,
      receiveShadow: true,
    });

    itemGroup.position.set(0, 1.2, 2.0);
    scene.add(itemGroup);
    itemMeshRef.current = itemGroup;
  }, [currentItem]);

  // Throw animation
  const animateThrowToBin = (targetBin: BinType) => {
    const targetGroup = binMeshesRef.current.get(targetBin);
    if (!targetGroup || !itemMeshRef.current) return;

    const startPos = itemMeshRef.current.position.clone();
    const endPos = new THREE.Vector3(targetGroup.position.x, 1.5, targetGroup.position.z);
    const duration = slowMode ? 1.2 : 0.65;
    let startTime: number | null = null;

    const throwStep = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1.0);

      // Arc curve formula
      const currentX = THREE.MathUtils.lerp(startPos.x, endPos.x, progress);
      const currentZ = THREE.MathUtils.lerp(startPos.z, endPos.z, progress);
      const currentY =
        THREE.MathUtils.lerp(startPos.y, endPos.y, progress) + Math.sin(progress * Math.PI) * 1.5;

      if (itemMeshRef.current) {
        itemMeshRef.current.position.set(currentX, currentY, currentZ);
        itemMeshRef.current.rotation.x += 0.15;
        itemMeshRef.current.rotation.y += 0.15;
      }

      if (progress < 1.0) {
        requestAnimationFrame(throwStep);
      } else {
        // Bin bounce animation on impact
        const binOrigY = targetGroup.position.y;
        targetGroup.position.y = binOrigY - 0.12;
        setTimeout(() => {
          targetGroup.position.y = binOrigY;
        }, 150);

        onThrowItem(targetBin);
      }
    };

    requestAnimationFrame(throwStep);
  };

  // Pointer drag gestures for child throw
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isThrowing || !currentItem || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    isDraggingRef.current = true;
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setCurrentDrag({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !mountRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    setCurrentDrag({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !dragStart || !currentItem || !mountRef.current) return;
    isDraggingRef.current = false;
    const rect = mountRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaY = dragStart.y - currentY;
    const deltaX = currentX - dragStart.x;
    setDragStart(null);
    setCurrentDrag(null);

    // If dragged upward (throwing action)
    if (deltaY > 30) {
      // Find closest bin based on horizontal flick
      const numBins = activeBins.length;
      const binIndex = Math.min(
        Math.max(0, Math.floor(((deltaX + 150) / 300) * numBins)),
        numBins - 1
      );
      const targetBin = activeBins[binIndex] || activeBins[0];
      animateThrowToBin(targetBin);
    }
  };

  return (
    <div
      className="relative w-full h-[460px] md:h-[540px] rounded-3xl overflow-hidden shadow-retro-xl border-2 border-slate-900 select-none touch-none bg-slate-950"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      ref={mountRef}
    >
      {/* Aiming Drag Indicator */}
      {dragStart && currentDrag && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full">
            <line
              x1={dragStart.x}
              y1={dragStart.y}
              x2={currentDrag.x}
              y2={currentDrag.y}
              stroke="#facc15"
              strokeWidth="5"
              strokeDasharray="8 8"
            />
            <circle cx={currentDrag.x} cy={currentDrag.y} r="14" fill="#facc15" stroke="#0f172a" strokeWidth="2" opacity="0.9" />
          </svg>
        </div>
      )}

      {/* Throw Hint Overlay */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-10 text-center bg-[#FDFBF7] px-4 py-2 rounded-xl border-2 border-slate-900 shadow-retro-sm text-xs font-fun font-black text-slate-950">
        👆 Drag item up to throw, or tap any bin!
      </div>

      {/* Accessible Direct-Tap Bin Buttons for younger kids & touch devices */}
      <div className="absolute bottom-3 left-0 right-0 px-4 flex justify-center gap-2 md:gap-3 z-20 flex-wrap">
        {activeBins.map((binType) => {
          const bin = ALL_BINS[binType];
          return (
            <button
              key={binType}
              disabled={isThrowing}
              onClick={() => animateThrowToBin(binType)}
              className={`${bin.color} hover:brightness-105 text-white font-fun font-black px-3.5 py-2 md:px-5 md:py-2.5 rounded-xl shadow-retro-sm border-2 border-slate-900 transition-all flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
            >
              <span>{bin.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
