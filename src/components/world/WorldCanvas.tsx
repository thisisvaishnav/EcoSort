import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BinType, ItemData } from '../../types/game';
import { ALL_BINS } from '../../data/bins';
import { createProceduralCity, ProceduralCityResult } from './proceduralCity';
import { createSocietyScene, SocietySceneResult } from './societyScene';
import { createLitterScatter, LitterScatterSystem } from './litterScatter';
import { createPlayerCharacter, PlayerCharacter } from './playerCharacter';
import { createLocomotionEngine, LocomotionEngine, isTypingTarget } from './locomotion';
import { createThirdPersonCamera, ThirdPersonCameraSystem, pinchZoomDelta, pinchPitchDelta } from './thirdPersonCamera';
import { useCoarsePointer, useIsPortrait } from '../../hooks/useMobileInput';
import { LEVEL_STATIONS } from './levelStations';
import { disposeObject3D } from './disposeObject3D';
import {
  Compass,
  ArrowRight,
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
  // Society mode
  societyItemPool?: ItemData[];
  onPickupSocietyItem?: (item: ItemData) => void;
  // Truck arrival (triggers when mission complete)
  truckArriving?: boolean;
}

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
  societyItemPool,
  onPickupSocietyItem,
  truckArriving = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const currentStation = LEVEL_STATIONS.find((s) => s.id === currentLevelId) || LEVEL_STATIONS[0];

  // Environment Mode: 'TOWN' or 'SOCIETY' (Level 1 Waste Detective)
  const [envMode, setEnvMode] = useState<'TOWN' | 'SOCIETY'>(
    currentLevelId === 1 ? 'SOCIETY' : 'TOWN'
  );

  // Proximity trigger state (Town)
  const [isNearStation, setIsNearStation] = useState<boolean>(true);
  const [nearestStation, setNearestStation] = useState<typeof currentStation>(currentStation);

  // Proximity to scattered town map items
  const [nearbyMapItem, setNearbyMapItem] = useState<{ id: string; name: string; modelType: string } | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  // Render-loop proximity change detectors — the loop runs at frame rate and
  // MUST NOT call setState every frame. Each setter below fires only when the
  // value actually changes (mirrors the refs-not-state discipline below).
  const lastMapItemIdRef = useRef<string | null>(null);
  const lastNearStationRef = useRef(true);
  const lastStationRef = useRef<typeof currentStation>(currentStation);

  // Throw dragging state — continuous pointer values live in refs (never
  // state): updating state on every pointermove re-renders the whole tree.
  // isAiming flips twice per gesture to mount/unmount the SVG overlay only.
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentDragRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingThrowRef = useRef(false);
  const capturedPointerIdRef = useRef<number | null>(null);
  const [isAiming, setIsAiming] = useState(false);
  const aimLineRef = useRef<SVGLineElement>(null);
  const aimCircleRef = useRef<SVGCircleElement>(null);

  // Touch input state (tap-to-move + two-finger pinch zoom/pitch)
  const isCoarsePointer = useCoarsePointer();
  const isPortrait = useIsPortrait();
  const activeTouchesRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchStateRef = useRef<{ dist: number; midY: number } | null>(null);
  const tapCandidateRef = useRef<{ x: number; y: number } | null>(null);
  // Desktop click-to-move: tracks the mousedown so pointerup can tell a tap
  // apart from a throw drag that never left the threshold.
  const mouseDownCandidateRef = useRef<{ x: number; y: number; throwArmed: boolean } | null>(null);

  // Society pickup prompt
  const [nearbyLitterItem, setNearbyLitterItem] = useState<ItemData | null>(null);
  const lastLitterIdRef = useRef<string | null>(null);
  // Stable ref for onPickupSocietyItem so the render loop can call it without stale closure
  const onPickupSocietyItemRef = useRef(onPickupSocietyItem);
  useEffect(() => { onPickupSocietyItemRef.current = onPickupSocietyItem; }, [onPickupSocietyItem]);

  // Truck animation refs — synced from prop so the render loop (created once) can read them
  const truckArrivingRef = useRef(false);
  const truckProgressRef = useRef(0);
  // Guards litter-scatter creation — must be cleared whenever the engine is rebuilt
  // (React StrictMode remounts effects in dev, otherwise the scatter is never recreated)
  const societyItemPoolRef = useRef<ItemData[]>([]);
  useEffect(() => {
    truckArrivingRef.current = truckArriving;
    if (!truckArriving) truckProgressRef.current = 0;
  }, [truckArriving]);

  // Engine references
  const engineRef = useRef<{
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    cameraSystem: ThirdPersonCameraSystem;
    locomotion: LocomotionEngine;
    player: PlayerCharacter;
    city: ProceduralCityResult;
    society: SocietySceneResult | null;
    litter: LitterScatterSystem | null;
    mapItemManager: MapItemManager;
    itemMeshGroup: THREE.Group | null;
    townBinMeshGroups: Map<BinType, THREE.Group>;
    clock: THREE.Clock;
    activeEnv: 'TOWN' | 'SOCIETY';
    cleanup: () => void;
  } | null>(null);

  // Shared litter pickup (used by E key and the touch "Pick up" button)
  const pickupNearestLitter = () => {
    const litter = engineRef.current?.litter;
    if (!litter || !engineRef.current) return;
    const playerPos = engineRef.current.locomotion.getPosition();
    const nearest = litter.getNearestPickupItem(playerPos, 1.5);
    if (nearest && !litter.getHeldItem()) {
      litter.pickUp(nearest);
    }
  };

  // Synchronize environment mode on level change
  useEffect(() => {
    if (currentLevelId === 1) {
      setEnvMode('SOCIETY');
    } else {
      setEnvMode('TOWN');
    }
  }, [currentLevelId]);

  // Keep ref updated with latest env mode
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.activeEnv = envMode;
    }
  }, [envMode]);

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
      antialias: !isCoarsePointer,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCoarsePointer ? 1.5 : 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = isCoarsePointer ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    // Block scroll/zoom gestures on the 3D surface only — the container keeps
    // touch-manipulation so child modals can still scroll on touch.
    renderer.domElement.style.touchAction = 'none';
    container.appendChild(renderer.domElement);

    // 3. Player Character: KAI (Matching model sheet)
    const player = createPlayerCharacter(0xfacc15); // Golden yellow hoodie
    scene.add(player.group);

    // 4. Create Both 3D Environments
    const city = createProceduralCity();
    // Society scene (Level 1 Waste Detective)
    const society = createSocietyScene(['wet', 'dry', 'hazardous', 'residual']);

    // Default: Level 1 → SOCIETY, else TOWN
    const isInitialSociety = currentLevelId === 1;
    if (isInitialSociety) {
      scene.add(society.societyGroup);
      scene.background = new THREE.Color(0xfff5e6);
    } else {
      scene.add(city.cityGroup);
      scene.background = new THREE.Color(0x0f172a);
    }

    // 5. Locomotion Engine
    const initialPos = isInitialSociety
      ? new THREE.Vector3(0, 0, 4)   // Compound centre
      : new THREE.Vector3(0, 0, 8);  // Outside cottage in town

    const locomotion = createLocomotionEngine(
      player,
      isInitialSociety ? society.obstacles : city.obstacles,
      initialPos
    );
    scene.add(locomotion.destinationRing);

    if (isInitialSociety) {
      locomotion.setBounds(-11, 11, -9, 7);
    } else {
      locomotion.setBounds(-75, 75, -105, 22);
    }

    // 6. Camera System
    const cameraSystem = createThirdPersonCamera(width / height, isInitialSociety ? society.obstacles : city.obstacles);
    cameraSystem.setDistance(isInitialSociety ? 10.0 : 14.0);

    // Litter scatter for society scene (uses societyItemPool prop captured at init)
    let litter: LitterScatterSystem | null = null;

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
    // Render loop — per-frame scratch vectors (never allocate inside the loop)
    // -----------------------------------------------------------------------
    const binTriggerScratch = new THREE.Vector3();
    const stationPosScratch = new THREE.Vector3();

    const renderLoop = () => {
      animationFrameId = requestAnimationFrame(renderLoop);
      // Skip work while the tab is in the background (saves battery/CPU).
      if (document.hidden) {
        clock.getDelta();
        return;
      }
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Hidden tab: keep the clock warm but skip updates and the GPU submit.
      if (document.hidden) return;

      const currentActiveEnv = engineRef.current ? engineRef.current.activeEnv : envMode;

      if (currentActiveEnv === 'SOCIETY') {
        // ── SOCIETY MODE (Level 1 Waste Detective) ──────────────────────────────────────────────
        society.animate(elapsedTime, delta);

        // Truck arrival animation (driven by truckArrivingRef synced from prop)
        if (truckArrivingRef.current && truckProgressRef.current < 1.0) {
          truckProgressRef.current = Math.min(1.0, truckProgressRef.current + delta * 0.22);
          society.animateTruckArrival(truckProgressRef.current);
        }

        const avatarPos = locomotion.getPosition();
        locomotion.update(delta, cameraSystem.getAzimuthAngle());
        cameraSystem.update(avatarPos, delta, player.currentAngle);

        // Update litter scatter
        const litSystem = engineRef.current?.litter;
        if (litSystem) {
          litSystem.update(avatarPos, elapsedTime, delta);
          const nearItem = litSystem.getNearestPickupItem(avatarPos, 1.5);
          const nextLitter = nearItem && !litSystem.getHeldItem() ? nearItem.itemData : null;
          const nextLitterId = nextLitter ? nextLitter.id : null;
          if (nextLitterId !== lastLitterIdRef.current) {
            lastLitterIdRef.current = nextLitterId;
            setNearbyLitterItem(nextLitter);
          }

          // Auto-pickup callback (fires once per pickup event)
          const heldNow = litSystem.getHeldItem();
          if (heldNow && prevItemIdRef.current !== heldNow.itemData.id) {
            prevItemIdRef.current = heldNow.itemData.id;
            onPickupSocietyItemRef.current?.(heldNow.itemData);
          }

          // Bin glow when holding item and near a bin
          const heldItem = litSystem.getHeldItem();
          if (heldItem) {
            society.binTriggers.forEach((triggerMesh, binType) => {
              triggerMesh.getWorldPosition(binTriggerScratch);
              const dist = avatarPos.distanceTo(binTriggerScratch);
              const near2 = dist < 1.4;
              const glowMesh = society.binGlowRings.get(binType);
              if (glowMesh) {
                const mat = glowMesh.material as THREE.MeshBasicMaterial;
                const targetOpacity = near2 ? (binType === heldItem.itemData.bin ? 0.85 : 0.25) : 0;
                mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 8);
              }
              if (near2) society.triggerBinAnimation(binType);
            });
          } else {
            society.binGlowRings.forEach((glowMesh) => {
              const mat = glowMesh.material as THREE.MeshBasicMaterial;
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0, delta * 5);
            });
          }
        }
      } else {
        // TOWN MODE
        city.animate(elapsedTime);
        const avatarPos = locomotion.getPosition();

        // Update scattered 3D items across town
        mapItemManager.update(elapsedTime, delta, avatarPos);
        const nearItemInstance = mapItemManager.getNearestItem(avatarPos, 2.6);
        const nextMapItemId = nearItemInstance ? nearItemInstance.config.id : null;
        if (nextMapItemId !== lastMapItemIdRef.current) {
          lastMapItemIdRef.current = nextMapItemId;
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
        }

        // Check proximity to current mission station
        stationPosScratch.set(currentStation.position.x, 0, currentStation.position.z + 3.2);
        const distToStation = avatarPos.distanceTo(stationPosScratch);
        const near = distToStation < 3.8;
        if (near !== lastNearStationRef.current) {
          lastNearStationRef.current = near;
          setIsNearStation(near);
        }
        if (currentStation !== lastStationRef.current) {
          lastStationRef.current = currentStation;
          setNearestStation(currentStation);
        }

        if (worldMode === 'EXPLORE') {
          locomotion.update(delta, cameraSystem.getAzimuthAngle());
          cameraSystem.update(avatarPos, delta, player.currentAngle);
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
      if (isTypingTarget(e.target)) return; // typing in Ask Eco / any field
      const key = e.key.toLowerCase();
      if (key === 'e') {
        if (engineRef.current?.activeEnv === 'SOCIETY') {
          // Pick up nearest litter item in society mode
          pickupNearestLitter();
        } else if (worldMode === 'EXPLORE' && isNearStation && envMode === 'TOWN') {
          onSetWorldMode('STATION_SORT');
        } else if (worldMode === 'STATION_SORT' && envMode === 'TOWN') {
          onSetWorldMode('EXPLORE');
        }
      } else if (['1', '2', '3', '4'].includes(key)) {
        // Quick sort with number keys
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
      // Drop the litter scatter with the engine it belongs to, and re-arm the
      // pool guard so the next engine build recreates it (StrictMode remount).
      const engine = engineRef.current;
      if (engine?.litter) {
        engine.litter.dispose();
        engine.litter = null;
      }
      societyItemPoolRef.current = [];
      locomotion.dispose();
      mapItemManager.dispose();
      // Free every GPU resource still in the scene graph (disposeObject3D
      // skips shared cached textures) so re-entering the world never leaks.
      disposeObject3D(scene);
      renderer.dispose();
      renderer.forceContextLoss();
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
      society,
      litter,
      mapItemManager,
      itemMeshGroup: null,
      townBinMeshGroups,
      clock,
      activeEnv: isInitialSociety ? 'SOCIETY' : 'TOWN',
      cleanup,
    };

    return () => {
      cleanup();
    };
  }, []);

  // -------------------------------------------------------------------------
  // ENVIRONMENT SWITCHING (Society <-> Town)
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current) return;
    const { scene, city, society, locomotion, cameraSystem, player } = engineRef.current;

    if (envMode === 'SOCIETY') {
      scene.remove(city.cityGroup);
      if (society) scene.add(society.societyGroup);
      scene.background = new THREE.Color(0xfff5e6);

      locomotion.setObstacles(society ? society.obstacles : []);
      locomotion.setBounds(-11, 11, -9, 7);
      const societySpawn = new THREE.Vector3(0, 0, 4);
      locomotion.setPosition(societySpawn);
      cameraSystem.setDistance(10.0);

      // Spawn facing the dustbin row so the mission bins are in front of Kai
      if (society) {
        const spawnFacing = Math.atan2(
          society.binRowCenter.x - societySpawn.x,
          society.binRowCenter.z - societySpawn.z
        );
        player.setFacingAngle(spawnFacing, 1.0);
        cameraSystem.setOrbit(spawnFacing + Math.PI);
      }
    } else {
      // TOWN
      if (society) scene.remove(society.societyGroup);
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

  // Update Energy levels in Procedural City
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.city.updateEnergy(energyLevel);
    }
  }, [energyLevel]);

  // -------------------------------------------------------------------------
  // REBUILD 3D BINS FOR TOWN MODE
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current) return;
    const { scene, townBinMeshGroups } = engineRef.current;

    // Dispose the previous station's bins before rebuilding — or whenever the
    // world leaves town (they hang directly off the scene, not cityGroup).
    townBinMeshGroups.forEach((mesh) => {
      scene.remove(mesh);
      disposeObject3D(mesh);
    });
    townBinMeshGroups.clear();

    // Society mode uses its own bins built into the scene — no town bins
    if (envMode === 'SOCIETY') return;

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
  // In SOCIETY mode, items are managed by the litter scatter system — skip.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current) return;
    const { scene } = engineRef.current;

    if (engineRef.current.itemMeshGroup) {
      scene.remove(engineRef.current.itemMeshGroup);
      disposeItemMesh(engineRef.current.itemMeshGroup);
      engineRef.current.itemMeshGroup = null;
    }

    // Society scene manages item meshes via litter scatter — no table mesh needed
    if (envMode === 'SOCIETY') return;
    if (!currentItem) return;

    const itemGroup = createItemMesh(currentItem.modelType, {
      scale: 1.15,
      castShadow: true,
      receiveShadow: true,
    });
    itemGroup.name = `Item_${currentItem.id}`;

    // Place on Town Station table
    const stationX = currentStation.position.x;
    const stationZ = currentStation.position.z + 3.2;
    itemGroup.position.set(stationX, 1.25, stationZ + 0.8);

    scene.add(itemGroup);
    engineRef.current.itemMeshGroup = itemGroup;
  }, [currentItem, currentStation, envMode]);

  // -------------------------------------------------------------------------
  // SOCIETY: create litter scatter when item pool is available
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!engineRef.current?.society || !societyItemPool?.length) return;
    if (societyItemPoolRef.current === societyItemPool) return; // no change
    societyItemPoolRef.current = societyItemPool;

    // Dispose old scatter
    if (engineRef.current.litter) {
      engineRef.current.litter.dispose();
      engineRef.current.litter = null;
    }

    const newLitter = createLitterScatter(
      societyItemPool,
      engineRef.current.society.litterSpawnPoints,
      engineRef.current.society.hiddenSpawnPoints,
      engineRef.current.society.societyGroup,
      12,
      engineRef.current.society.pinnedLitterSpots
    );
    engineRef.current.litter = newLitter;
  }, [societyItemPool]);

  // -------------------------------------------------------------------------
  // SOCIETY: when currentItem clears (correct throw), mark held item as in bin
  // -------------------------------------------------------------------------
  const prevItemIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (envMode !== 'SOCIETY') return;
    const litter = engineRef.current?.litter;
    if (!litter) return;
    const heldItem = litter.getHeldItem();
    // If held item's ID no longer matches currentItem, the throw was accepted
    if (heldItem && (!currentItem || currentItem.id !== heldItem.itemData.id)) {
      litter.markInBin(heldItem);
    }
    prevItemIdRef.current = currentItem?.id ?? null;
  }, [currentItem, envMode]);

  // -------------------------------------------------------------------------
  // THROW FLIGHT ANIMATION TO TARGET BIN
  // -------------------------------------------------------------------------
  const executeThrow = useCallback(
    (targetBin: BinType) => {
      if (isThrowing) return;
      if (!engineRef.current) return;

      const isSociety = envMode === 'SOCIETY';

      if (isSociety) {
        // In society mode, throw the litter scatter's held item mesh
        const litter = engineRef.current.litter;
        const society = engineRef.current.society;
        if (!litter || !society) return;
        const heldItem = litter.getHeldItem();
        if (!heldItem) return;

        const binMesh = society.binMeshes.get(targetBin);
        if (!binMesh) { onThrowItem(targetBin); return; }

        const binWorldPos = new THREE.Vector3();
        binMesh.getWorldPosition(binWorldPos);

        const itemMesh = heldItem.mesh;
        const startPos = itemMesh.position.clone();
        const endPos = binWorldPos.clone().add(new THREE.Vector3(0, 0.6, 0));
        const duration = slowMode ? 1.0 : 0.55;
        const startTime = performance.now();

        const throwStep = (now: number) => {
          const elapsed = (now - startTime) / 1000;
          const progress = Math.min(1.0, elapsed / duration);

          itemMesh.position.x = THREE.MathUtils.lerp(startPos.x, endPos.x, progress);
          itemMesh.position.z = THREE.MathUtils.lerp(startPos.z, endPos.z, progress);
          itemMesh.position.y = THREE.MathUtils.lerp(startPos.y, endPos.y, progress) + 1.6 * Math.sin(progress * Math.PI);
          itemMesh.rotation.y += 0.2;

          if (progress < 1.0) {
            requestAnimationFrame(throwStep);
          } else {
            society.triggerBinAnimation(targetBin);
            engineRef.current?.player.celebrate();
            onThrowItem(targetBin);
          }
        };
        requestAnimationFrame(throwStep);
        return;
      }

      // Town path requires itemMeshGroup
      if (!engineRef.current.itemMeshGroup) return;
      const itemGroup = engineRef.current.itemMeshGroup;

      // Find target bin position
      let targetX = 0;
      let targetY = 1.0;
      let targetZ = 0;

      const targetGroup = engineRef.current.townBinMeshGroups.get(targetBin);
      if (targetGroup) {
        targetX = targetGroup.position.x;
        targetY = 1.45;
        targetZ = targetGroup.position.z;
      } else {
        onThrowItem(targetBin);
        return;
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
          const targetGroup = engineRef.current?.townBinMeshGroups.get(targetBin);
          if (targetGroup) {
            const origY = targetGroup.position.y;
            targetGroup.position.y = origY - 0.12;
            setTimeout(() => { if (targetGroup) targetGroup.position.y = origY; }, 150);
          }
          engineRef.current?.player.celebrate();
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
  const updateAimVisual = (start: { x: number; y: number }, end: { x: number; y: number }) => {
    const line = aimLineRef.current;
    const circle = aimCircleRef.current;
    if (line) {
      line.setAttribute('x1', String(start.x));
      line.setAttribute('y1', String(start.y));
      line.setAttribute('x2', String(end.x));
      line.setAttribute('y2', String(end.y));
    }
    if (circle) {
      circle.setAttribute('cx', String(end.x));
      circle.setAttribute('cy', String(end.y));
    }
  };

  const beginThrowDrag = (e: React.PointerEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    isDraggingThrowRef.current = true;
    dragStartRef.current = pt;
    currentDragRef.current = pt;
    // Capture keeps the drag alive when the pointer leaves the container
    // (otherwise mouse drags ending outside never fire pointerup here).
    e.currentTarget.setPointerCapture(e.pointerId);
    capturedPointerIdRef.current = e.pointerId;
    setIsAiming(true);
  };

  const cancelThrowDrag = () => {
    const capturedId = capturedPointerIdRef.current;
    capturedPointerIdRef.current = null;
    isDraggingThrowRef.current = false;
    dragStartRef.current = null;
    currentDragRef.current = null;
    setIsAiming(false);
    const el = mountRef.current;
    if (capturedId !== null && el && el.hasPointerCapture(capturedId)) {
      el.releasePointerCapture(capturedId);
    }
  };

  // The WorldPage portrait gate freezes input at window level; drop any
  // in-flight drag here so no phantom aim state survives the rotation
  // (a mid-rotation pointerup is swallowed by the freeze listeners).
  useEffect(() => {
    if (isCoarsePointer && isPortrait) cancelThrowDrag();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoarsePointer, isPortrait]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!engineRef.current || !mountRef.current) return;
    const container = mountRef.current;

    // Right-click drag is camera orbit
    if (e.button === 2) {
      engineRef.current.cameraSystem.onPointerDown(e.nativeEvent);
      return;
    }

    // Touch bookkeeping: remember the finger for tap detection;
    // a second finger switches the gesture to pinch zoom/pitch.
    // Only track when the touch starts on the 3D scene, not on HUD buttons.
    if (e.pointerType === 'touch' && e.target instanceof HTMLCanvasElement) {
      const touches = activeTouchesRef.current;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 2) {
        const pts = [...touches.values()];
        pinchStateRef.current = {
          dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          midY: (pts[0].y + pts[1].y) / 2,
        };
        tapCandidateRef.current = null; // pinch is not a tap
        cancelThrowDrag();
        return;
      }
      tapCandidateRef.current = { x: e.clientX, y: e.clientY };
    }

    if (e.button === 0) {
      // Drop any stale mouse candidate from a previous gesture
      mouseDownCandidateRef.current = null;

      // Throw drags start on the 3D canvas only — pointerdown bubbles up from
      // HUD buttons, and capturing the pointer there would break their onClick.
      if (e.target instanceof HTMLCanvasElement) {
        if (worldMode === 'STATION_SORT' && !isThrowing && currentItem) {
          beginThrowDrag(e, container);
        }
        // Desktop click-to-move candidate (mouse only; touch has its own tap path)
        if (e.pointerType === 'mouse') {
          mouseDownCandidateRef.current = {
            x: e.clientX,
            y: e.clientY,
            throwArmed: isDraggingThrowRef.current,
          };
        }
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!engineRef.current || !mountRef.current) return;
    engineRef.current.cameraSystem.onPointerMove(e.nativeEvent);

    // Two-finger pinch: zoom + pitch
    if (e.pointerType === 'touch') {
      const touches = activeTouchesRef.current;
      if (touches.has(e.pointerId)) {
        touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }
      if (touches.size >= 2 && pinchStateRef.current) {
        const pts = [...touches.values()].slice(0, 2);
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const midY = (pts[0].y + pts[1].y) / 2;
        engineRef.current.cameraSystem.zoomBy(pinchZoomDelta(pinchStateRef.current.dist, dist));
        engineRef.current.cameraSystem.adjustPitch(pinchPitchDelta(pinchStateRef.current.midY, midY));
        pinchStateRef.current = { dist, midY };
        return;
      }
    }

    if (isDraggingThrowRef.current && dragStartRef.current) {
      const rect = mountRef.current.getBoundingClientRect();
      const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      currentDragRef.current = pt;
      updateAimVisual(dragStartRef.current, pt);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!engineRef.current || !mountRef.current) return;
    engineRef.current.cameraSystem.onPointerUp(e.nativeEvent);

    // Captured before the throw branch clears it: a tap that armed a throw
    // drag must not also fire tap-to-move (matches the mouse behavior).
    const throwWasArmed = isDraggingThrowRef.current;

    if (isDraggingThrowRef.current && dragStartRef.current) {
      const dragStart = dragStartRef.current;
      cancelThrowDrag();
      const rect = mountRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const deltaY = dragStart.y - currentY;
      const deltaX = currentX - dragStart.x;

      // Upward flick throw
      if (deltaY > 35) {
        const numBins = activeBins.length;
        const binIndex = Math.min(
          Math.max(0, Math.floor(((deltaX + 150) / 300) * numBins)),
          numBins - 1
        );
        const targetBin = activeBins[binIndex] || activeBins[0];
        executeThrow(targetBin);
      }
    }

    // Desktop click-to-move: plain left click on the ground (no throw drag)
    if (e.pointerType === 'mouse' && e.button === 0) {
      const candidate = mouseDownCandidateRef.current;
      mouseDownCandidateRef.current = null;
      if (candidate && !candidate.throwArmed) {
        const moved = Math.hypot(e.clientX - candidate.x, e.clientY - candidate.y);
        const canWalk = !(envMode === 'TOWN' && worldMode === 'STATION_SORT');
        if (moved < 12 && canWalk && e.target instanceof HTMLCanvasElement) {
          engineRef.current.locomotion.createRaycastHandler(
            e.nativeEvent,
            mountRef.current,
            engineRef.current.cameraSystem.camera
          );
        }
      }
    }

    // Touch: fire tap-to-move when one finger taps (no drag, no pinch)
    if (e.pointerType === 'touch') {
      const touches = activeTouchesRef.current;
      touches.delete(e.pointerId);
      if (touches.size < 2) pinchStateRef.current = null;

      const candidate = tapCandidateRef.current;
      if (touches.size === 0 && candidate) {
        tapCandidateRef.current = null;
        const moved = Math.hypot(e.clientX - candidate.x, e.clientY - candidate.y);
        const canWalk = !(envMode === 'TOWN' && worldMode === 'STATION_SORT');
        if (moved < 12 && canWalk && !throwWasArmed) {
          engineRef.current.locomotion.createRaycastHandler(
            e.nativeEvent,
            mountRef.current,
            engineRef.current.cameraSystem.camera
          );
        }
      }
    }
  };

  const handlePointerCancel = (e: React.PointerEvent) => {
    activeTouchesRef.current.delete(e.pointerId);
    if (activeTouchesRef.current.size < 2) pinchStateRef.current = null;
    if (activeTouchesRef.current.size === 0) tapCandidateRef.current = null;
    mouseDownCandidateRef.current = null;
    cancelThrowDrag();
  };

  // Safety net: if pointer capture ends while a throw drag is still armed
  // (e.g. the pointer left the window), drop the drag so no phantom aiming
  // state persists. On normal pointerup the drag is already cleared.
  const handleLostPointerCapture = () => {
    if (isDraggingThrowRef.current) cancelThrowDrag();
  };

  // Wheel zoom must be registered non-passive (React's onWheel is passive, so
  // the camera's preventDefault() used to throw). Only handled over the 3D
  // canvas so scrollable modals keep their own wheel scrolling.
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const onWheel = (e: WheelEvent) => {
      if (e.target instanceof HTMLCanvasElement && engineRef.current) {
        engineRef.current.cameraSystem.onWheel(e);
      }
    };
    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={
        fullScreen
          ? `relative w-full h-full select-none touch-manipulation bg-slate-950 overflow-hidden ${className || ''}`
          : `relative w-full h-[520px] md:h-[620px] rounded-3xl overflow-hidden shadow-retro-xl border-2 border-slate-900 select-none touch-manipulation bg-slate-950 ${className || ''}`
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
      onContextMenu={handleContextMenu}
      ref={mountRef}
    >
      {/* =====================================================================
          TOP HEADER BAR: ENVIRONMENT & CAMERA CONTROLS
          ===================================================================== */}
      <div className="absolute top-2 sm:top-3 left-3 right-3 z-20 flex items-center justify-between gap-1.5 flex-wrap pointer-events-none">
        {/* Left: Top Bar Extras & Location Badge */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {topBarExtrasLeft}

          {/* Location Badge */}
          <span className="hidden sm:inline-block px-3 py-1.5 bg-[#FDFBF7] border-2 border-slate-900 rounded-xl text-[11px] font-fun font-bold text-slate-900 shadow-retro-sm">
            📍 {currentStation.place} • Mission {currentStation.id}
          </span>
        </div>

        {/* Center: Top Bar Center HUD */}
        {topBarCenter && (
          <div className="pointer-events-auto flex items-center justify-center">
            {topBarCenter}
          </div>
        )}

        {/* Right: Camera Angle Controls + Extras */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap">
          {isCoarsePointer && (
            <button
              onClick={() => engineRef.current?.player.celebrate()}
              title="Cheer"
              aria-label="Cheer"
              className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center bg-[#FDFBF7] border-2 border-slate-900 rounded-xl shadow-retro-sm text-lg transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              🎉
            </button>
          )}
          {envMode === 'SOCIETY' ? (
            // Society mode: minimal top-right controls
            <div className="flex items-center gap-1.5">
              {topBarExtrasRight}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsGalleryOpen(true)}
                title="Inspect all 10 production 3D waste item components"
                className="flex items-center gap-1.5 px-3 py-2 min-h-[40px] md:min-h-[44px] rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm bg-[#FDFBF7] hover:bg-emerald-50 text-slate-950 transition-all"
              >
                <Box className="w-3.5 h-3.5 text-emerald-600" />
                <span>3D Items (10)</span>
              </button>

              <button
                onClick={() => onSetWorldMode(worldMode === 'EXPLORE' ? 'STATION_SORT' : 'EXPLORE')}
                className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] md:min-h-[44px] rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm ${
                  worldMode === 'EXPLORE' ? 'bg-amber-300 text-slate-950' : 'bg-emerald-400 text-slate-950'
                }`}
              >
                {worldMode === 'EXPLORE' ? 'Enter Station' : 'Step Out'}
              </button>
            </div>
          )}

          {envMode !== 'SOCIETY' && topBarExtrasRight}
        </div>
      </div>

      {/* =====================================================================
          AIMING DRAG INDICATOR (Flick throw visualization)
          ===================================================================== */}
      {isAiming && dragStartRef.current && currentDragRef.current && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <svg className="w-full h-full">
            <line
              ref={aimLineRef}
              x1={dragStartRef.current.x}
              y1={dragStartRef.current.y}
              x2={currentDragRef.current.x}
              y2={currentDragRef.current.y}
              stroke="#facc15"
              strokeWidth="5"
              strokeDasharray="8 8"
            />
            <circle
              ref={aimCircleRef}
              cx={currentDragRef.current.x}
              cy={currentDragRef.current.y}
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
          TRUCK ARRIVAL BANNER (Society mode)
          ===================================================================== */}
      {envMode === 'SOCIETY' && truckArriving && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-emerald-500 border-2 border-slate-900 shadow-retro px-5 py-2.5 rounded-2xl flex items-center gap-3 animate-bounce">
            <span className="text-2xl">🚛</span>
            <div>
              <div className="text-sm font-fun font-black text-white">The Waste Truck has arrived!</div>
              <div className="text-[11px] text-emerald-100">Collecting sorted waste now…</div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SOCIETY PICKUP PROMPT
          ===================================================================== */}
      {envMode === 'SOCIETY' && nearbyLitterItem && !currentItem && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 max-w-[90vw]">
          <div className="bg-[#FDFBF7]/95 border-2 border-emerald-500 shadow-retro px-3 py-1.5 rounded-2xl flex items-center gap-2">
            <span className="text-lg shrink-0">{nearbyLitterItem.icon}</span>
            <div className="min-w-0">
              <div className="text-[11px] font-fun font-black text-slate-900 truncate">{nearbyLitterItem.name}</div>
              {!isCoarsePointer && (
                <div className="text-[10px] text-slate-600">Press <kbd className="bg-slate-200 px-1 rounded">E</kbd> to pick up</div>
              )}
            </div>
            <button
              onClick={pickupNearestLitter}
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-fun font-black text-xs px-3 py-1.5 min-h-[36px] rounded-xl border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px] shrink-0"
            >
              Pick up
            </button>
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
            {!isCoarsePointer && (
              <span className="bg-slate-950 text-white text-[10px] px-2 py-0.5 rounded-lg border border-slate-900">
                Press E
              </span>
            )}
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
          SOCIETY BOTTOM CONTROLS — holding item: show 4 bin buttons
          ===================================================================== */}
      {envMode === 'SOCIETY' && currentItem && (
        <div className="absolute bottom-3 left-0 right-0 px-4 flex flex-col items-center gap-2 z-20 pointer-events-none">
          <div className="bg-[#FDFBF7]/95 border-2 border-slate-900 shadow-retro-sm rounded-xl px-3 py-1.5 text-[11px] font-fun font-black text-slate-900 pointer-events-auto flex items-center gap-2">
            <span>{currentItem.icon}</span>
            <span>Holding: {currentItem.name}</span>
            <span className="text-slate-400">|</span>
            <span>Tap a bin to sort it!</span>
          </div>
          <div className="flex justify-center gap-2 flex-wrap pointer-events-auto">
            {activeBins.map((binType) => {
              const bin = ALL_BINS[binType];
              return (
                <button
                  key={binType}
                  disabled={isThrowing}
                  onClick={() => executeThrow(binType)}
                  className={`${bin.color} hover:brightness-110 text-white font-fun font-black px-3.5 py-2 md:px-5 md:py-2.5 min-h-[44px] rounded-xl shadow-retro-sm border-2 border-slate-900 transition-all flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
                >
                  <span>{bin.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Society: walk hint when not holding anything */}
      {envMode === 'SOCIETY' && !currentItem && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-[#FDFBF7]/90 border-2 border-slate-900 shadow-retro-sm rounded-xl px-4 py-1.5 text-[11px] font-fun font-black text-slate-900 pointer-events-none flex items-center gap-2">
          <span>{isCoarsePointer ? '👆 Tap the ground to walk • Tap Pick up to take litter!' : '🎮 Walk with WASD • Approach litter and press E to pick up!'}</span>
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
                  className={`${bin.color} hover:brightness-105 text-white font-fun font-black px-3.5 py-2 md:px-5 md:py-2.5 min-h-[44px] rounded-xl shadow-retro-sm border-2 border-slate-900 transition-all flex items-center gap-1.5 text-xs md:text-sm disabled:opacity-50 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`}
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
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-30 bg-[#FDFBF7]/95 border-2 border-slate-900 shadow-retro px-3 py-1.5 rounded-2xl flex items-center gap-2 max-w-[90vw] pointer-events-auto">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="min-w-0">
            <div className="text-[11px] font-fun font-black text-slate-950 truncate">Nearby waste: {nearbyMapItem.name}</div>
            <div className="hidden sm:block text-[10px] text-slate-600 font-medium">Click Collect to pick up for sorting</div>
          </div>
          <button
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.mapItemManager.collectItem(nearbyMapItem.id);
                lastMapItemIdRef.current = null;
                setNearbyMapItem(null);
              }
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-white font-fun font-black text-xs px-3 py-1.5 min-h-[36px] rounded-xl border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px] shrink-0"
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
