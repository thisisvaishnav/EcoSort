import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MapItemModelType } from '../world/items/types';
import { createItemMesh, disposeItemMesh } from '../world/items/createItemMesh';
import { RotateCw, Sparkles, Eye } from 'lucide-react';
import { useCoarsePointer } from '../../hooks/useMobileInput';

interface MapItemPreviewProps {
  modelType: MapItemModelType;
  title?: string;
  autoRotate?: boolean;
  height?: number;
  className?: string;
}

export const MapItemPreview: React.FC<MapItemPreviewProps> = ({
  modelType,
  title,
  autoRotate = true,
  height = 260,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const isCoarsePointer = useCoarsePointer();
  // Mirrored into a ref so toggling rotation doesn't tear down + rebuild the
  // whole WebGL scene (the effect below must not depend on isRotating).
  const isRotatingRef = useRef(isRotating);
  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);
  const meshGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const h = height;

    // 1. Scene & Camera
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 50);
    camera.position.set(0, 1.0, 2.2);
    camera.lookAt(0, 0.28, 0);

    // 2. Renderer — lighter on phones/tablets (no AA, cap 1.5x, cheap shadows)
    const renderer = new THREE.WebGLRenderer({ antialias: !isCoarsePointer, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isCoarsePointer ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 3. Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-3, 3, -3);
    scene.add(rimLight);

    // 4. Circular Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(0.7, 0.75, 0.06, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.2,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.03;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Soft ring on pedestal
    const ringGeo = new THREE.RingGeometry(0.62, 0.68, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.005;
    scene.add(ring);

    // 5. 3D Item Mesh
    const itemMesh = createItemMesh(modelType, {
      scale: 1.1,
      castShadow: true,
      receiveShadow: true,
    });
    scene.add(itemMesh);
    meshGroupRef.current = itemMesh;

    // Interaction dragging — pointer events cover mouse + touch in one path.
    // setPointerCapture keeps the drag alive when the pointer leaves the canvas;
    // touch-action: none stops the drag from simultaneously scrolling the modal.
    const dom = renderer.domElement;
    let isDragging = false;
    let activePointerId: number | null = null;
    let prevX = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (activePointerId !== null) return; // single-pointer drag only
      activePointerId = e.pointerId;
      isDragging = true;
      prevX = e.clientX;
      dom.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || e.pointerId !== activePointerId || !meshGroupRef.current) return;
      const deltaX = e.clientX - prevX;
      // Touch keeps its original, slightly faster sensitivity.
      const factor = e.pointerType === 'touch' ? 0.02 : 0.015;
      meshGroupRef.current.rotation.y += deltaX * factor;
      prevX = e.clientX;
    };
    const onPointerEnd = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      isDragging = false;
      activePointerId = null;
    };

    dom.style.touchAction = 'none';
    dom.addEventListener('pointerdown', onPointerDown);
    dom.addEventListener('pointermove', onPointerMove);
    dom.addEventListener('pointerup', onPointerEnd);
    dom.addEventListener('pointercancel', onPointerEnd);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (document.hidden) return;
      const delta = clock.getDelta();

      if (meshGroupRef.current && isRotatingRef.current && !isDragging) {
        meshGroupRef.current.rotation.y += delta * 1.2;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      camera.aspect = nw / h;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('pointerdown', onPointerDown);
      dom.removeEventListener('pointermove', onPointerMove);
      dom.removeEventListener('pointerup', onPointerEnd);
      dom.removeEventListener('pointercancel', onPointerEnd);
      disposeItemMesh(scene);
      renderer.dispose();
    };
  }, [modelType, height, isCoarsePointer]);

  return (
    <div className={`relative bg-slate-900/80 rounded-2xl border border-slate-700/60 overflow-hidden ${className}`}>
      {title && (
        <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">{title}</span>
        </div>
      )}

      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} style={{ height }} className="w-full cursor-grab active:cursor-grabbing" />

      {/* Controls Bar */}
      <div className="absolute bottom-2 right-3 z-10 flex items-center gap-2">
        <button
          onClick={() => setIsRotating((r) => !r)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
            isRotating
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Turntable Rotation"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
          <span className="text-[10px] font-semibold">{isRotating ? 'Spinning' : 'Paused'}</span>
        </button>
      </div>

      <div className="absolute bottom-2 left-3 z-10 text-[10px] text-slate-500 flex items-center gap-1">
        <Eye className="w-3 h-3" />
        <span>Drag to rotate 3D model</span>
      </div>
    </div>
  );
};
