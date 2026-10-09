import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BinType, ItemData } from '../../types/game';
import { ALL_BINS } from '../../data/bins';
import { createProceduralCity, ProceduralCityResult } from './proceduralCity';
import { createHomeKitchenScene, HomeKitchenSceneResult } from './homeKitchenScene';
import { createPlayerCharacter, PlayerCharacter } from './playerCharacter';
import { createLocomotionEngine, LocomotionEngine } from './locomotion';
import { createThirdPersonCamera, ThirdPersonCameraSystem } from './thirdPersonCamera';
import { LEVEL_STATIONS } from './levelStations';
import {
  Compass,
  Footprints,
  Play,
  ArrowRight,
  Camera,
  Home,
  Building2,
  Sparkles,
  Box,
} from 'lucide-react';
import { createItemMesh, disposeItemMesh } from './items/createItemMesh';
import { MapItemManager } from './items/MapItemManager';
import { MapItemGalleryModal } from '../items/MapItemGalleryModal';
import { GAME_ITEMS } from '../../data/items';

export interface WorldCanvasProps {
  currentLevelId: number;
  currentItem: ItemData | null;
  activeBins: BinType[];
  energyLevel: number;
  onThrowItem: (targetBin: BinType) => void;
  isThrowing: boolean;
  slowMode: boolean;
  worldMode: 'EXPLORE' | 'STATION_SORT';
  onSetWorldMode: (mode: 'EXPLORE' | 'STATION_SORT') => void;
  fullScreen?: boolean;
  className?: string;
  topBarExtrasLeft?: React.ReactNode;
  topBarCenter?: React.ReactNode;
  topBarExtrasRight?: React.ReactNode;
  children?: React.ReactNode;
}

export type KitchenCameraMode = 'REFERENCE' | 'FOLLOW' | 'SORT';

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  currentLevelId,
  currentItem,
  activeBins,
  energyLevel,
  onThrowItem,
  isThrowing,
  slowMode,
  worldMode,
  onSetWorldMode,
  fullScreen = false,
  className,
  topBarExtrasLeft,
  topBarCenter,
  topBarExtrasRight,
  children,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const currentStation = LEVEL_STATIONS.find((s) => s.id === currentLevelId) || LEVEL_STATIONS[0];

  // Environment Mode: 'KITCHEN' (Reference Image 3D Scene) or 'TOWN' (Procedural City)
  // Level 1 defaults to 'KITCHEN' as it is the "Home Kitchen" mission!
  const [envMode, setEnvMode] = useState<'KITCHEN' | 'TOWN'>(
    currentLevelId === 1 ? 'KITCHEN' : 'TOWN'
  );

  // Kitchen Camera Preset: 'REFERENCE' (Exact screenshot view), 'FOLLOW' (Track Kai), 'SORT' (Table focus)
  const [kitchenCamMode, setKitchenCamMode] = useState<KitchenCameraMode>('REFERENCE');

  // Proximity trigger state (Town)
  const [isNearStation, setIsNearStation] = useState<boolean>(true);
  const [nearestStation, setNearestStation] = useState<typeof currentStation>(currentStation);

  // Interactive object hint in Kitchen
  const [kitchenPrompt, setKitchenPrompt] = useState<string | null>(null);

  // Proximity to scattered town map items
  const [nearbyMapItem, setNearbyMapItem] = useState<{ id: string; name: string; modelType: string } | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Throw dragging state
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDrag, setCurrentDrag] = useState<{ x: number; y: number } | null>(null);
  const isDraggingThrowRef = useRef(false);

  // Engine references
  const engineRef = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    cameraSystem: ThirdPersonCameraSystem;
    locomotion: LocomotionEngine;
    player: PlayerCharacter;
    city: ProceduralCityResult;
    kitchen: HomeKitchenSceneResult;
    mapItemManager: MapItemManager;
    itemMeshGroup: THREE.Group | null;
    townBinMeshGroups: Map<BinType, THREE.Group>;
    clock: THREE.Clock;
    activeEnv: 'KITCHEN' | 'TOWN';
    activeKitchenCam: KitchenCameraMode;
    cleanup: () => void;
  } | null>(null);

  // Synchronize environment mode on level change
  useEffect(() => {
    if (currentLevelId === 1) {
      setEnvMode('KITCHEN');
    }
  }, [currentLevelId]);

  // Keep ref updated with latest cam/env modes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.activeEnv = envMode;
      engineRef.current.activeKitchenCam = kitchenCamMode;
    }
  }, [envMode, kitchenCamMode]);

  // -------------------------------------------------------------------------
  // INITIALIZE 3D GRAPHICS PIPELINE
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfffaed); // warm morning sunlight

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Player Character: KAI (Matching model sheet)
    const player = createPlayerCharacter(0xfacc15); // Golden yellow hoodie
    scene.add(player.group);

    // 4. Create Both 3D Environments
    const kitchen = createHomeKitchenScene();
    const city = createProceduralCity();

    // Default setup: Attach Kitchen or Town based on initial level
    const isInitialKitchen = currentLevelId === 1;
    if (isInitialKitchen) {
      scene.add(kitchen.kitchenGroup);
      scene.background = new THREE.Color(0xfffaed);
    } else {
      scene.add(city.cityGroup);
      scene.background = new THREE.Color(0x0f172a);
    }

    // 5. Locomotion Engine
    const initialPos = isInitialKitchen
      ? new THREE.Vector3(0.0, 0, 2.2) // In front of dining table in kitchen
      : new THREE.Vector3(0, 0, 8); // Outside cottage in town

    const locomotion = createLocomotionEngine(
      player,
      isInitialKitchen ? kitchen.obstacles : city.obstacles,
      initialPos
    );
    scene.add(locomotion.destinationRing);

    if (isInitialKitchen) {
      locomotion.setBounds(-4.6, 4.6, -4.0, 4.0);
    } else {
      locomotion.setBounds(-75, 75, -105, 22);
    }

    // 6. Camera System
    const cameraSystem = createThirdPersonCamera(width / height, isInitialKitchen ? kitchen.obstacles : city.obstacles);
    cameraSystem.setDistance(isInitialKitchen ? 6.5 : 14.0);

    // Dynamic item & bin groups for Town stations
    const townBinMeshGroups = new Map<BinType, THREE.Group>();

    // 7. Map Item Manager for scattered items across the town map
    const mapItemManager = new MapItemManager({
      autoSpawnDefaults: true,
    });
    city.cityGroup.add(mapItemManager.itemsGroup);

    const clock = new THREE.Clock();
    let animationFrameId: number;

    // -----------------------------------------------------------------------
    // RENDER LOOP
    // -----------------------------------------------------------------------
    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      const currentActiveEnv = engineRef.current ? engineRef.current.activeEnv : envMode;
      const currentActiveCam = engineRef.current ? engineRef.current.activeKitchenCam : kitchenCamMode;

      if (currentActiveEnv === 'KITCHEN') {
        // Animate kitchen objects (bin lid flaps, bouncing items)
        kitchen.animate(elapsedTime, delta);

        const avatarPos = locomotion.getPosition();
        locomotion.update(delta, cameraSystem.getAzimuthAngle());

        // Camera handling for Kitchen
        if (currentActiveCam === 'REFERENCE') {
          // Smoothly interpolate to exact reference screenshot angle
          cameraSystem.camera.position.lerp(kitchen.referenceCameraPosition, delta * 4.5);
          const targetLook = kitchen.referenceCameraLookAt;
          cameraSystem.camera.lookAt(targetLook.x, targetLook.y, targetLook.z);
        } else if (currentActiveCam === 'SORT') {
          // Focus steadily between the dining table and 4 bins
          cameraSystem.camera.position.lerp(kitchen.sortCameraPosition, delta * 5.0);
          const targetLook = kitchen.sortCameraLookAt;
          cameraSystem.camera.lookAt(targetLook.x, targetLook.y, targetLook.z);
        } else {
          // 'FOLLOW' mode: 3rd person follow Kai
          cameraSystem.update(avatarPos, delta);
        }

        // Proximity detection for friendly Kai interactions in the kitchen
        const distFridge = avatarPos.distanceTo(new THREE.Vector3(-3.8, 0, -2.8));
        const distBins = avatarPos.distanceTo(new THREE.Vector3(-2.1, 0, -3.2));
        const distTable = avatarPos.distanceTo(new THREE.Vector3(0.5, 0, 0.5));
        const distStove = avatarPos.distanceTo(new THREE.Vector3(3.0, 0, -2.8));
        const distWindow = avatarPos.distanceTo(new THREE.Vector3(-1.2, 0, -3.2));

        if (distFridge < 1.6) {
          setKitchenPrompt('Refrigerator: Fresh milk and vegetables stay cold.');
        } else if (distBins < 1.7) {
          setKitchenPrompt('Sorting Bins: Green, Blue, Yellow, and Red bins stand ready.');
        } else if (distTable < 1.8) {
          setKitchenPrompt('Dining Table: Bananas, apples, and items wait on the table.');
        } else if (distStove < 1.6) {
          setKitchenPrompt('Cooking Stove: Clean biogas from food waste powers this burner.');
        } else if (distWindow < 1.8) {
          setKitchenPrompt('Sunny Window: Sunlight shines on town hills and the clean river.');
        } else {
          setKitchenPrompt(null);
        }
      } else {
        // TOWN MODE
        city.animate(elapsedTime);
        const avatarPos = locomotion.getPosition();

        // Update scattered 3D items across town
        mapItemManager.update(elapsedTime, delta, avatarPos);
        const nearItemInstance = mapItemManager.getNearestItem(avatarPos, 2.6);
        if (nearItemInstance) {
          const cfg = nearItemInstance.config;
          const matched = GAME_ITEMS.find((it) => it.modelType === cfg.modelType);
          setNearbyMapItem({
            id: cfg.id,
            name: matched ? matched.name : cfg.modelType,
            modelType: cfg.modelType,
          });
        } else {
          setNearbyMapItem(null);
        }

        // Check proximity to current mission station
        const targetStationPos = new THREE.Vector3(
          currentStation.position.x,
          0,
          currentStation.position.z + 3.2
        );
        const distToStation = avatarPos.distanceTo(targetStationPos);
        const near = distToStation < 3.8;
        setIsNearStation(near);
        setNearestStation(currentStation);

        if (worldMode === 'EXPLORE') {
          locomotion.update(delta, cameraSystem.getAzimuthAngle());
          cameraSystem.update(avatarPos, delta);
        } else {
          // STATION_SORT mode in town: focus camera on station table
          const tablePos = currentStation.tablePosition;
          const camPos = currentStation.cameraPosition;
          cameraSystem.camera.position.lerp(camPos, delta * 6);
          cameraSystem.camera.lookAt(tablePos.x, tablePos.y + 1.2, tablePos.z - 1.0);
        }
      }

      renderer.render(scene, cameraSystem.camera);
    };

    renderLoop();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      cameraSystem.camera.aspect = w / h;
      cameraSystem.camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Keyboard shortcut handler
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'e') {
        if (worldMode === 'EXPLORE' && isNearStation && envMode === 'TOWN') {
          onSetWorldMode('STATION_SORT');
        } else if (worldMode === 'STATION_SORT' && envMode === 'TOWN') {
          onSetWorldMode('EXPLORE');
        }
      } else if (key === 'c' && envMode === 'KITCHEN') {
        // Cycle camera mode
        setKitchenCamMode((prev) =>
          prev === 'REFERENCE' ? 'FOLLOW' : prev === 'FOLLOW' ? 'SORT' : 'REFERENCE'
        );
      } else if (['1', '2', '3', '4'].includes(key)) {
        // Quick sort with number keys in Kitchen
        const idx = parseInt(key, 10) - 1;
        const binOrder: BinType[] = ['wet', 'dry', 'ewaste', 'hazardous'];
        const chosenBin = binOrder[idx];
        if (chosenBin && !isThrowing && currentItem) {
          executeThrow(chosenBin);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const cleanup = () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      locomotion.dispose();
      mapItemManager.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };

    engineRef.current = {
      scene,
      renderer,
      cameraSystem,
      locomotion,
      player,
      city,
      kitchen,
      mapItemManager,
      itemMeshGroup: null,
      townBinMeshGroups,
      clock,
      activeEnv: isInitialKitchen ? 'KITCHEN' : 'TOWN',
      activeKitchenCam: 'REFERENCE',
      cleanup,
    };

    return () => {
      cleanup();
    };
  }, []);

  // -------------------------------------------------------------------------
  // ENVIRONMENT SWITCHING (Home Kitchen <-> Eco Town)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current) return;
    const { scene, city, kitchen, locomotion, cameraSystem, player } = engineRef.current;

    if (envMode === 'KITCHEN') {
      // Remove city and add kitchen
      scene.remove(city.cityGroup);
      scene.add(kitchen.kitchenGroup);
      scene.background = new THREE.Color(0xfffaed);

      // Reset locomotion to Kitchen
      locomotion.setObstacles(kitchen.obstacles);
      locomotion.setBounds(-4.6, 4.6, -4.0, 4.0);
      locomotion.setPosition(new THREE.Vector3(0.0, 0, 2.2));
      player.setFacingAngle(0, 1.0); // face forward towards table

      cameraSystem.setDistance(6.5);
      setKitchenCamMode('REFERENCE');
    } else {
      // Remove kitchen and add city
      scene.remove(kitchen.kitchenGroup);
      scene.add(city.cityGroup);
      scene.background = new THREE.Color(0x0f172a);

      locomotion.setObstacles(city.obstacles);
      locomotion.setBounds(-75, 75, -105, 22);

      const targetPos = new THREE.Vector3(
        currentStation.position.x,
        0,
        currentStation.position.z + 6.2
      );
      locomotion.setPosition(targetPos);
      cameraSystem.setDistance(14.0);
    }
  }, [envMode, currentStation]);

  // Update Energy levels in Procedural City & Kitchen
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.city.updateEnergy(energyLevel);
      // In kitchen, update pendant light intensity
      const pendant = engineRef.current.kitchen.pendantLight;
      if (pendant) {
        pendant.intensity = 0.8 + (energyLevel / 100) * 1.4;
      }
    }
  }, [energyLevel]);

  // -------------------------------------------------------------------------
  // REBUILD 3D BINS FOR TOWN MODE
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current || envMode === 'KITCHEN') return;
    const { scene, townBinMeshGroups } = engineRef.current;

    townBinMeshGroups.forEach((mesh) => scene.remove(mesh));
    townBinMeshGroups.clear();

    const stationX = currentStation.position.x;
    const stationZ = currentStation.position.z + 3.2;
    const numBins = activeBins.length;
    const spacing = Math.min(1.5, 4.5 / Math.max(numBins - 1, 1));
    const startX = stationX - ((numBins - 1) * spacing) / 2;

    activeBins.forEach((binType, index) => {
      const binData = ALL_BINS[binType];
      const binGroup = new THREE.Group();
      const xPos = startX + index * spacing;

      const bodyGeo = new THREE.CylinderGeometry(0.5, 0.42, 1.4, 20);
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

      const rimGeo = new THREE.TorusGeometry(0.48, 0.08, 12, 24);
      const rimMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
      const rimMesh = new THREE.Mesh(rimGeo, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      rimMesh.position.y = 1.4;
      binGroup.add(rimMesh);

      const hole = new THREE.Mesh(
        new THREE.CircleGeometry(0.42, 24),
        new THREE.MeshBasicMaterial({ color: 0x090d16 })
      );
      hole.rotation.x = -Math.PI / 2;
      hole.position.y = 1.41;
      binGroup.add(hole);

      binGroup.position.set(xPos, 0, stationZ - 0.6);
      scene.add(binGroup);
      townBinMeshGroups.set(binType, binGroup);
    });
  }, [activeBins, currentStation, envMode]);

  // -------------------------------------------------------------------------
  // CREATE & UPDATE 3D ITEM MESH (Dining Table or Station Table)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current) return;
    const { scene } = engineRef.current;

    if (engineRef.current.itemMeshGroup) {
      scene.remove(engineRef.current.itemMeshGroup);
      disposeItemMesh(engineRef.current.itemMeshGroup);
      engineRef.current.itemMeshGroup = null;
    }

    if (!currentItem) return;

    const itemGroup = createItemMesh(currentItem.modelType, {
      scale: 1.15,
      castShadow: true,
      receiveShadow: true,
    });
    itemGroup.name = `Item_${currentItem.id}`;

    if (envMode === 'KITCHEN') {
      // Place right on the Dining Table runner next to the fruit bowl
      itemGroup.position.set(0.05, 1.15, 0.5);
    } else {
      // Place on Town Station table
      const stationX = currentStation.position.x;
      const stationZ = currentStation.position.z + 3.2;
      itemGroup.position.set(stationX, 1.25, stationZ + 0.8);
    }

    scene.add(itemGroup);
    engineRef.current.itemMeshGroup = itemGroup;
  }, [currentItem, currentStation, envMode]);

  // -------------------------------------------------------------------------
  // THROW FLIGHT ANIMATION TO TARGET BIN
  // -------------------------------------------------------------------------
  const executeThrow = useCallback(
    (targetBin: BinType) => {
      if (!engineRef.current || !engineRef.current.itemMeshGroup || isThrowing) return;
      const itemGroup = engineRef.current.itemMeshGroup;
      const isKitchen = envMode === 'KITCHEN';

      // Find target bin position
      let targetX = 0;
      let targetY = 1.0;
      let targetZ = 0;

      if (isKitchen) {
        const binMesh = engineRef.current.kitchen.binMeshes.get(targetBin);
        if (binMesh) {
          targetX = binMesh.position.x;
          targetY = 1.05;
          targetZ = binMesh.position.z;
        } else {
          onThrowItem(targetBin);
          return;
        }
      } else {
        const targetGroup = engineRef.current.townBinMeshGroups.get(targetBin);
        if (targetGroup) {
          targetX = targetGroup.position.x;
          targetY = 1.45;
          targetZ = targetGroup.position.z;
        } else {
          onThrowItem(targetBin);
          return;
        }
      }

      const startPos = itemGroup.position.clone();
      const endPos = new THREE.Vector3(targetX, targetY, targetZ);
      const duration = slowMode ? 1.0 : 0.55;
      const startTime = performance.now();

      const throwStep = (now: number) => {
        const elapsed = (now - startTime) / 1000;
        const progress = Math.min(1.0, elapsed / duration);

        const currentX = THREE.MathUtils.lerp(startPos.x, endPos.x, progress);
        const currentZ = THREE.MathUtils.lerp(startPos.z, endPos.z, progress);
        const arcHeight = 1.6 * Math.sin(progress * Math.PI);
        const currentY = THREE.MathUtils.lerp(startPos.y, endPos.y, progress) + arcHeight;

        itemGroup.position.set(currentX, currentY, currentZ);
        itemGroup.rotation.x += 0.22;
        itemGroup.rotation.y += 0.16;

        if (progress < 1.0) {
          requestAnimationFrame(throwStep);
        } else {
          // Bin impact feedback
          if (isKitchen) {
            engineRef.current?.kitchen.triggerBinAnimation(targetBin);
            // Kai celebrates with a joyful victory hop!
            engineRef.current?.player.celebrate();
          } else {
            const targetGroup = engineRef.current?.townBinMeshGroups.get(targetBin);
            if (targetGroup) {
              const origY = targetGroup.position.y;
              targetGroup.position.y = origY - 0.12;
              setTimeout(() => {
                targetGroup.position.y = origY;
              }, 150);
            }
            engineRef.current?.player.celebrate();
          }

          onThrowItem(targetBin);
        }
      };

      requestAnimationFrame(throwStep);
    },
    [envMode, isThrowing, onThrowItem, slowMode]
  );

  // -------------------------------------------------------------------------
  // POINTER EVENT HANDLERS (Click-to-Move, Drag-to-Throw, Camera Orbit)
  // -------------------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!engineRef.current || !mountRef.current) return;
    const container = mountRef.current;

    // Right-click drag is camera orbit
    if (e.button === 2) {
      engineRef.current.cameraSystem.onPointerDown(e.nativeEvent);
      return;
    }

    if (e.button === 0) {
      // Left click
      if (envMode === 'KITCHEN') {
        // In Kitchen: clicking on floor moves Kai
        engineRef.current.locomotion.createRaycastHandler(
          e.nativeEvent,
          container,
          engineRef.current.cameraSystem.camera
        );

        // Initiate throw drag
        if (!isThrowing && currentItem) {
          const rect = container.getBoundingClientRect();
          isDraggingThrowRef.current = true;
          setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setCurrentDrag({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      } else {
        if (worldMode === 'EXPLORE') {
          engineRef.current.locomotion.createRaycastHandler(
            e.nativeEvent,
            container,
            engineRef.current.cameraSystem.camera
          );
        } else {
          if (isThrowing || !currentItem) return;
          const rect = container.getBoundingClientRect();
          isDraggingThrowRef.current = true;
          setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          setCurrentDrag({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!engineRef.current || !mountRef.current) return;
    engineRef.current.cameraSystem.onPointerMove(e.nativeEvent);

    if (isDraggingThrowRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      setCurrentDrag({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!engineRef.current || !mountRef.current) return;
    engineRef.current.cameraSystem.onPointerUp(e.nativeEvent);

    if (isDraggingThrowRef.current && dragStart) {
      isDraggingThrowRef.current = false;
      const rect = mountRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const deltaY = dragStart.y - currentY;
      const deltaX = currentX - dragStart.x;
      setDragStart(null);
      setCurrentDrag(null);

      // Upward flick throw
      if (deltaY > 35) {
        if (envMode === 'KITCHEN') {
          // 4 bins: wet, dry, ewaste, hazardous
          const kitchenBins: BinType[] = ['wet', 'dry', 'ewaste', 'hazardous'];
          const binIndex = Math.min(
            Math.max(0, Math.floor(((deltaX + 180) / 360) * 4)),
            3
          );
          executeThrow(kitchenBins[binIndex]);
        } else {
          const numBins = activeBins.length;
          const binIndex = Math.min(
            Math.max(0, Math.floor(((deltaX + 150) / 300) * numBins)),
            numBins - 1
          );
          const targetBin = activeBins[binIndex] || activeBins[0];
          executeThrow(targetBin);
        }
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (engineRef.current) {
      engineRef.current.cameraSystem.onWheel(e.nativeEvent);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Kitchen bins list from reference image
  const kitchenBinList: { type: BinType; label: string; color: string; desc: string }[] = [
    { type: 'wet', label: 'Wet (Compost)', color: 'bg-emerald-600', desc: 'Food waste' },
    { type: 'dry', label: 'Dry (Recycle)', color: 'bg-blue-600', desc: 'Paper & plastic' },
    { type: 'ewaste', label: 'E-Waste', color: 'bg-amber-500', desc: 'Electronics' },
    { type: 'hazardous', label: 'Hazardous', color: 'bg-rose-600', desc: 'Chemicals' },
  ];

  return (
    <div
      className={
        fullScreen
          ? `relative w-full h-full select-none touch-none bg-slate-950 overflow-hidden ${className || ''}`
          : `relative w-full h-[520px] md:h-[620px] rounded-3xl overflow-hidden shadow-retro-xl border-2 border-slate-900 select-none touch-none bg-slate-950 ${className || ''}`
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={handleContextMenu}
      ref={mountRef}
    >
      {/* =====================================================================
          TOP HEADER BAR: ENVIRONMENT & CAMERA CONTROLS
          ===================================================================== */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between gap-2 flex-wrap pointer-events-none">
        {/* Left: Environment Selector (Home Kitchen vs Eco Town) */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {topBarExtrasLeft}
          <button
            onClick={() => setEnvMode((prev) => (prev === 'KITCHEN' ? 'TOWN' : 'KITCHEN'))}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px] ${
              envMode === 'KITCHEN'
                ? 'bg-amber-300 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
            }`}
          >
            {envMode === 'KITCHEN' ? (
              <>
                <Home className="w-4 h-4 stroke-slate-950" />
                <span>🏡 Home Kitchen</span>
              </>
            ) : (
              <>
                <Building2 className="w-4 h-4 stroke-slate-950" />
                <span>🌆 Eco Town</span>
              </>
            )}
          </button>

          {/* Mode Badge */}
          {envMode === 'KITCHEN' ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFBF7] border-2 border-slate-900 rounded-xl text-[11px] font-fun font-bold text-slate-900 shadow-retro-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Ghibli Kitchen Reference • Play as Kai</span>
            </span>
          ) : (
            <span className="hidden sm:inline-block px-3 py-1.5 bg-[#FDFBF7] border-2 border-slate-900 rounded-xl text-[11px] font-fun font-bold text-slate-900 shadow-retro-sm">
              📍 {currentStation.place} • Mission {currentStation.id}
            </span>
          )}
        </div>

        {/* Center: Top Bar Center HUD */}
        {topBarCenter && (
          <div className="pointer-events-auto flex items-center justify-center">
            {topBarCenter}
          </div>
        )}

        {/* Right: Camera Angle Controls + Extras */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {envMode === 'KITCHEN' ? (
            <div className="flex items-center bg-[#FDFBF7] border-2 border-slate-900 rounded-xl p-1 shadow-retro-sm gap-1">
              <button
                onClick={() => setKitchenCamMode('REFERENCE')}
                title="Reference Camera: Exact viewpoint matching reference artwork"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-fun font-black transition-all ${
                  kitchenCamMode === 'REFERENCE'
                    ? 'bg-amber-300 text-slate-950 border border-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ref View</span>
              </button>

              <button
                onClick={() => setKitchenCamMode('FOLLOW')}
                title="Follow Kai: Third-person follow camera"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-fun font-black transition-all ${
                  kitchenCamMode === 'FOLLOW'
                    ? 'bg-amber-300 text-slate-950 border border-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>Follow Kai</span>
              </button>

              <button
                onClick={() => setKitchenCamMode('SORT')}
                title="Sort Focus: Zoomed on table and bins"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-fun font-black transition-all ${
                  kitchenCamMode === 'SORT'
                    ? 'bg-amber-300 text-slate-950 border border-slate-900'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Sort Focus</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsGalleryOpen(true)}
                title="Inspect all 10 production 3D waste item components"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm bg-[#FDFBF7] hover:bg-emerald-50 text-slate-950 transition-all"
              >
                <Box className="w-3.5 h-3.5 text-emerald-600" />
                <span>3D Items (10)</span>
              </button>

              <button
                onClick={() => onSetWorldMode(worldMode === 'EXPLORE' ? 'STATION_SORT' : 'EXPLORE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm ${
                  worldMode === 'EXPLORE' ? 'bg-amber-300 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}
              >
                {worldMode === 'EXPLORE' ? 'Enter Station' : 'Step Out'}
              </button>
            </div>
          )}

          {topBarExtrasRight}
        </div>
      </div>

      {/* =====================================================================
          AIMING DRAG INDICATOR (Flick throw visualization)
          ===================================================================== */}
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
            <circle
              cx={currentDrag.x}
              cy={currentDrag.y}
              r="14"
              fill="#facc15"
              stroke="#0f172a"
              strokeWidth="2"
              opacity="0.95"
            />
          </svg>
        </div>
      )}

      {/* =====================================================================
          KITCHEN PROXIMITY INSPECTION SPEECH BUBBLE (Kai's observations)
          ===================================================================== */}
      {envMode === 'KITCHEN' && kitchenPrompt && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="bg-[#FDFBF7] px-4 py-2 rounded-2xl border-2 border-slate-900 shadow-retro text-xs font-fun font-black text-slate-900 flex items-center gap-2">
            <span className="p-1 bg-amber-300 rounded-lg border border-slate-900 text-xs">Kai</span>
            <span>{kitchenPrompt}</span>
          </div>
        </div>
      )}

      {/* =====================================================================
          TOWN PROXIMITY ACTION PROMPTS
          ===================================================================== */}
      {envMode === 'TOWN' && worldMode === 'EXPLORE' && isNearStation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 animate-bounce">
          <button
            onClick={() => onSetWorldMode('STATION_SORT')}
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-fun font-black text-sm md:text-base rounded-2xl border-2 border-slate-900 shadow-retro transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <span>Enter Mission {nearestStation.id}: {nearestStation.name}</span>
            <ArrowRight className="w-5 h-5 stroke-slate-950" />
            <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded-lg border border-slate-900">
              Press E
            </span>
          </button>
        </div>
      )}

      {envMode === 'TOWN' && worldMode === 'EXPLORE' && !isNearStation && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 bg-[#FDFBF7] px-4 py-2 rounded-xl border-2 border-slate-900 shadow-retro-sm text-xs font-fun font-black text-slate-900 flex items-center gap-2">
          <Compass className="w-4 h-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Walk toward the glowing beacon at {currentStation.name}!</span>
        </div>
      )}

      {/* =====================================================================
          KITCHEN BOTTOM INTERACTIVE CONTROLS & DIRECT SORT BUTTONS
          ===================================================================== */}
      {envMode === 'KITCHEN' && (
        <div className="absolute bottom-3 left-0 right-0 px-4 flex flex-col items-center gap-2 z-20 pointer-events-none">
          {/* Throw Hint */}
          <div className="bg-[#FDFBF7]/95 px-3.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-retro-sm text-[11px] font-fun font-bold text-slate-900 pointer-events-auto flex items-center gap-2">
            <span>🎮 WASD / Tap floor to walk Kai • Space to jump</span>
            <span className="text-slate-400">|</span>
            <span>👆 Tap any bin or drag to throw!</span>
          </div>

          {/* 4 Bins from the Reference Screenshot */}
          <div className="flex items-center justify-center gap-2 flex-wrap pointer-events-auto">
            {kitchenBinList.map((bin, idx) => (
              <button
                key={bin.type}
                disabled={isThrowing}
                onClick={() => executeThrow(bin.type)}
                className={`${bin.color} hover:brightness-110 text-white font-fun font-black px-3 py-2 md:px-4 md:py-2.5 rounded-xl shadow-retro-sm border-2 border-slate-900 transition-all flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                  {idx + 1}
                </span>
                <span>{bin.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================================
          TOWN STATION_SORT BOTTOM CONTROLS
          ===================================================================== */}
      {envMode === 'TOWN' && worldMode === 'STATION_SORT' && (
        <div className="absolute bottom-3 left-0 right-0 px-4 flex flex-col items-center gap-2 z-20 pointer-events-none">
          <div className="bg-[#FDFBF7] px-3.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-retro-sm text-xs font-fun font-black text-slate-950 pointer-events-auto">
            👆 Drag item up to throw into a bin, or tap any bin below!
          </div>

          <div className="flex justify-center gap-2 md:gap-3 flex-wrap pointer-events-auto">
            {activeBins.map((binType) => {
              const bin = ALL_BINS[binType];
              return (
                <button
                  key={binType}
                  disabled={isThrowing}
                  onClick={() => executeThrow(binType)}
                  className={`${bin.color} hover:brightness-105 text-white font-fun font-black px-3.5 py-2 md:px-5 md:py-2.5 rounded-xl shadow-retro-sm border-2 border-slate-900 transition-all flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                >
                  <span>{bin.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Prompt for Nearby Scattered Map Items in Town */}
      {nearbyMapItem && worldMode === 'EXPLORE' && envMode === 'TOWN' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30 bg-[#FDFBF7]/95 border-2 border-slate-900 shadow-retro px-4 py-2.5 rounded-2xl flex items-center gap-3 animate-bounce pointer-events-auto">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <div>
            <div className="text-xs font-fun font-black text-slate-950">Nearby waste: {nearbyMapItem.name}</div>
            <div className="text-[10px] text-slate-600 font-medium">Click Collect to pick up for sorting</div>
          </div>
          <button
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.mapItemManager.collectItem(nearbyMapItem.id);
                setNearbyMapItem(null);
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-fun font-black text-xs px-3.5 py-1.5 rounded-xl border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            Collect
          </button>
        </div>
      )}

      {/* 3D Item Components Gallery Modal */}
      <MapItemGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        items={GAME_ITEMS}
      />

      {/* Overlaid UI children */}
      {children}
    </div>
  );
};
