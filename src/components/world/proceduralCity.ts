import * as THREE from 'three';
import { WorldObstacle } from './types';
import { LEVEL_STATIONS } from './levelStations';

export interface ProceduralCityResult {
  cityGroup: THREE.Group;
  obstacles: WorldObstacle[];
  windowMaterials: THREE.MeshStandardMaterial[];
  streetLampLights: THREE.PointLight[];
  windTurbineRotors: THREE.Group[];
  waterMesh: THREE.Mesh;
  stationBeacons: Map<number, THREE.Group>;
  updateEnergy: (energyLevel: number) => void;
  animate: (time: number) => void;
}

export function createProceduralCity(): ProceduralCityResult {
  const cityGroup = new THREE.Group();
  const obstacles: WorldObstacle[] = [];
  const windowMaterials: THREE.MeshStandardMaterial[] = [];
  const streetLampLights: THREE.PointLight[] = [];
  const windTurbineRotors: THREE.Group[] = [];
  const stationBeacons = new Map<number, THREE.Group>();

  // Helper for adding box obstacle
  const addObstacle = (id: string, minX: number, maxX: number, minZ: number, maxZ: number, type: WorldObstacle['type'] = 'building') => {
    obstacles.push({ id, minX, maxX, minZ, maxZ, type });
  };

  // =========================================================================
  // 1. TERRAIN & GROUND
  // =========================================================================
  // Main Grass Ground
  const grassGeo = new THREE.PlaneGeometry(160, 220);
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32, // rich lawn green
    roughness: 0.9,
    metalness: 0.05,
  });
  const grass = new THREE.Mesh(grassGeo, grassMat);
  grass.rotation.x = -Math.PI / 2;
  grass.receiveShadow = true;
  cityGroup.add(grass);

  // Outer Town Perimeter Fence Obstacles
  addObstacle('boundary_north', -80, 80, -112, -110, 'fence');
  addObstacle('boundary_south', -80, 80, 25, 27, 'fence');
  addObstacle('boundary_west', -82, -80, -112, 27, 'fence');
  addObstacle('boundary_east', 80, 82, -112, 27, 'fence');

  // =========================================================================
  // 2. STREETS & SIDEWALKS NETWORK
  // =========================================================================
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
  const curbMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.6 });
  const yellowLineMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

  // Main Central Avenue (North-South, from Z = 20 to Z = -100)
  const mainRoadGeo = new THREE.PlaneGeometry(8, 140);
  const mainRoad = new THREE.Mesh(mainRoadGeo, roadMat);
  mainRoad.rotation.x = -Math.PI / 2;
  mainRoad.position.set(0, 0.02, -40);
  mainRoad.receiveShadow = true;
  cityGroup.add(mainRoad);

  // Main Road Center Line
  const lineGeo = new THREE.PlaneGeometry(0.3, 138);
  const line = new THREE.Mesh(lineGeo, yellowLineMat);
  line.rotation.x = -Math.PI / 2;
  line.position.set(0, 0.03, -40);
  cityGroup.add(line);

  // Cross Streets
  const crossStreetsZ = [-12, -45, -75];
  crossStreetsZ.forEach((z) => {
    const crossGeo = new THREE.PlaneGeometry(100, 7);
    const crossRoad = new THREE.Mesh(crossGeo, roadMat);
    crossRoad.rotation.x = -Math.PI / 2;
    crossRoad.position.set(0, 0.02, z);
    crossRoad.receiveShadow = true;
    cityGroup.add(crossRoad);
  });

  // Sidewalks along main road
  const leftSidewalk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 140), curbMat);
  leftSidewalk.position.set(-5.25, 0.075, -40);
  leftSidewalk.receiveShadow = true;
  cityGroup.add(leftSidewalk);

  const rightSidewalk = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 140), curbMat);
  rightSidewalk.position.set(5.25, 0.075, -40);
  rightSidewalk.receiveShadow = true;
  cityGroup.add(rightSidewalk);

  // =========================================================================
  // 3. PROCEDURAL RIVER CANAL & FOOTBRIDGE
  // =========================================================================
  // River runs along X = -17 from Z = -20 to Z = -65
  const riverBedGeo = new THREE.BoxGeometry(8, 0.8, 48);
  const riverBedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  const riverBed = new THREE.Mesh(riverBedGeo, riverBedMat);
  riverBed.position.set(-18, -0.4, -42.5);
  cityGroup.add(riverBed);

  const waterGeo = new THREE.PlaneGeometry(7.6, 47.6, 16, 32);
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7, // vibrant clear water
    roughness: 0.1,
    metalness: 0.3,
    transparent: true,
    opacity: 0.85,
  });
  const waterMesh = new THREE.Mesh(waterGeo, waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(-18, -0.05, -42.5);
  cityGroup.add(waterMesh);

  // River water collision (prevent walking into deep river except on bridge)
  addObstacle('river_north', -22, -14, -65, -48, 'water');
  addObstacle('river_south', -22, -14, -42, -20, 'water');

  // Arched Stone Bridge across river at Z = -45
  const bridgeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(9, 0.35, 6), bridgeMat);
  bridge.position.set(-18, 0.22, -45);
  bridge.receiveShadow = true;
  cityGroup.add(bridge);

  // Bridge railings
  const railingL = new THREE.Mesh(new THREE.BoxGeometry(9, 0.7, 0.2), curbMat);
  railingL.position.set(-18, 0.7, -47.9);
  cityGroup.add(railingL);
  const railingR = new THREE.Mesh(new THREE.BoxGeometry(9, 0.7, 0.2), curbMat);
  railingR.position.set(-18, 0.7, -42.1);
  cityGroup.add(railingR);

  // =========================================================================
  // 4. DISTINCT LANDMARKS FOR EACH LEVEL
  // =========================================================================

  // Helper for creating window materials
  const createWindowMaterial = () => {
    const mat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.2,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
    });
    windowMaterials.push(mat);
    return mat;
  };

  // Helper for creating sorting station table and visual bins
  const createStationTableMesh = (stationX: number, stationZ: number, tableZOffset = 3.2) => {
    const tableGroup = new THREE.Group();
    tableGroup.position.set(stationX, 0, stationZ + tableZOffset);

    // Tabletop
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 0.25, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 })
    );
    top.position.y = 0.85;
    top.castShadow = true;
    top.receiveShadow = true;
    tableGroup.add(top);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.85);
    [[-1.8, 0.42, -0.8], [1.8, 0.42, -0.8], [-1.8, 0.42, 0.8], [1.8, 0.42, 0.8]].forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      tableGroup.add(leg);
    });

    cityGroup.add(tableGroup);
  };

  // -------------------------------------------------------------------------
  // LANDMARK 1: HOME BASE COTTAGE (Level 1: Home Kitchen)
  // -------------------------------------------------------------------------
  const homeGroup = new THREE.Group();
  homeGroup.position.set(0, 0, -4);

  // Cottage body
  const cottageBody = new THREE.Mesh(
    new THREE.BoxGeometry(8, 4.5, 7),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.7 }) // cozy yellow
  );
  cottageBody.position.y = 2.25;
  cottageBody.castShadow = true;
  cottageBody.receiveShadow = true;
  homeGroup.add(cottageBody);

  // Gable roof
  const roofGeo = new THREE.ConeGeometry(6.2, 2.6, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }));
  roof.position.y = 5.5;
  roof.scale.set(1.1, 1, 0.9);
  roof.castShadow = true;
  homeGroup.add(roof);

  // Front Porch & Wooden Door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 2.2, 0.1),
    new THREE.MeshStandardMaterial({ color: 0x78350f })
  );
  door.position.set(0, 1.1, 3.55);
  homeGroup.add(door);

  // Windows
  const homeWinMat = createWindowMaterial();
  const winGeo = new THREE.PlaneGeometry(1.0, 1.2);
  [-2.2, 2.2].forEach((x) => {
    const win = new THREE.Mesh(winGeo, homeWinMat);
    win.position.set(x, 2.2, 3.56);
    homeGroup.add(win);
  });

  // Chimney
  const chimney = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 2.5, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x991b1b })
  );
  chimney.position.set(2.4, 5.2, -1.5);
  homeGroup.add(chimney);

  cityGroup.add(homeGroup);
  addObstacle('home_cottage', -4.5, 4.5, -8, -0.2);
  createStationTableMesh(0, 0, 3.2);

  // -------------------------------------------------------------------------
  // LANDMARK 2: NEIGHBORHOOD ROWHOUSES (Level 2: Living Room)
  // -------------------------------------------------------------------------
  const rowhousesGroup = new THREE.Group();
  rowhousesGroup.position.set(0, 0, -32);

  [-9, 9].forEach((xOffset, idx) => {
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(9, 6.5, 8),
      new THREE.MeshStandardMaterial({ color: idx === 0 ? 0x991b1b : 0xd97706, roughness: 0.8 })
    );
    house.position.set(xOffset, 3.25, 0);
    house.castShadow = true;
    house.receiveShadow = true;
    rowhousesGroup.add(house);

    // Windows grid
    const rowWinMat = createWindowMaterial();
    [-2.2, 0, 2.2].forEach((wx) => {
      [2.0, 4.5].forEach((wy) => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.3), rowWinMat);
        win.position.set(xOffset + wx, wy, 4.05);
        rowhousesGroup.add(win);
      });
    });

    addObstacle(`rowhouse_${idx}`, xOffset - 4.8, xOffset + 4.8, -36.5, -27.5);
  });

  cityGroup.add(rowhousesGroup);
  createStationTableMesh(0, -26, 3.2);

  // -------------------------------------------------------------------------
  // LANDMARK 3: SUNNY SCHOOL (Level 3: Classroom & Yard)
  // -------------------------------------------------------------------------
  const schoolGroup = new THREE.Group();
  schoolGroup.position.set(34, 0, -38);

  // Main School Building
  const schoolMain = new THREE.Mesh(
    new THREE.BoxGeometry(16, 7.5, 10),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.8 }) // school brick red
  );
  schoolMain.position.y = 3.75;
  schoolMain.castShadow = true;
  schoolMain.receiveShadow = true;
  schoolGroup.add(schoolMain);

  // Clock Tower
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 12, 3.5),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.7 })
  );
  tower.position.set(0, 6, 2.5);
  tower.castShadow = true;
  schoolGroup.add(tower);

  // Clock face
  const clock = new THREE.Mesh(
    new THREE.CircleGeometry(0.9, 24),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  clock.position.set(0, 10.5, 4.3);
  schoolGroup.add(clock);

  // School Windows
  const schoolWinMat = createWindowMaterial();
  [-5.5, -2.5, 2.5, 5.5].forEach((wx) => {
    [2.2, 5.0].forEach((wy) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), schoolWinMat);
      win.position.set(wx, wy, 5.05);
      schoolGroup.add(win);
    });
  });

  cityGroup.add(schoolGroup);
  addObstacle('sunny_school', 25, 43, -44, -32);
  createStationTableMesh(34, -32, 3.2);

  // -------------------------------------------------------------------------
  // LANDMARK 4: COMMUNITY PARK & RIVER (Level 4: Park & River)
  // -------------------------------------------------------------------------
  const parkGroup = new THREE.Group();
  parkGroup.position.set(-34, 0, -42);

  // Gazebo in the park
  const gazeboPillars = new THREE.Group();
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.5 });
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.8), pillarMat);
    p.position.set(Math.cos(a) * 2.2, 1.4, Math.sin(a) * 2.2);
    gazeboPillars.add(p);
  }
  const gazeboRoof = new THREE.Mesh(
    new THREE.ConeGeometry(3.0, 1.6, 6),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
  );
  gazeboRoof.position.y = 3.6;
  gazeboPillars.add(gazeboRoof);
  parkGroup.add(gazeboPillars);

  cityGroup.add(parkGroup);
  addObstacle('park_gazebo', -37, -31, -45, -39, 'prop');
  createStationTableMesh(-34, -36, 3.2);

  // -------------------------------------------------------------------------
  // LANDMARK 5: RECYCLING PLANT (Level 5: Eco Innovation Hub)
  // -------------------------------------------------------------------------
  const plantGroup = new THREE.Group();
  plantGroup.position.set(-28, 0, -78);

  // Industrial warehouse
  const plantBuilding = new THREE.Mesh(
    new THREE.BoxGeometry(18, 6.5, 12),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.3 })
  );
  plantBuilding.position.y = 3.25;
  plantBuilding.castShadow = true;
  plantBuilding.receiveShadow = true;
  plantGroup.add(plantBuilding);

  // Rooftop Solar Panel Arrays
  const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.8 });
  [-5, 0, 5].forEach((sx) => {
    const solar = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.1, 8), solarMat);
    solar.position.set(sx, 6.7, 0);
    solar.rotation.x = 0.2;
    plantGroup.add(solar);
  });

  // Eco Steam Smokestacks
  const stackGeo = new THREE.CylinderGeometry(0.6, 0.8, 7.5, 16);
  const stackMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 });
  [-6, -3].forEach((sx) => {
    const stack = new THREE.Mesh(stackGeo, stackMat);
    stack.position.set(sx, 7.0, -3.5);
    stack.castShadow = true;
    plantGroup.add(stack);
  });

  cityGroup.add(plantGroup);
  addObstacle('recycling_plant', -38, -18, -85, -71);
  createStationTableMesh(-28, -72, 3.2);

  // -------------------------------------------------------------------------
  // LANDMARK 6: CENTRAL TOWN PLAZA (Level 6: Town Conveyor Hub)
  // -------------------------------------------------------------------------
  const plazaGroup = new THREE.Group();
  plazaGroup.position.set(0, 0, -96);

  // Town Hall Neoclassical Facade
  const hall = new THREE.Mesh(
    new THREE.BoxGeometry(22, 9, 10),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.6 }) // crisp ivory stone
  );
  hall.position.y = 4.5;
  hall.castShadow = true;
  hall.receiveShadow = true;
  plazaGroup.add(hall);

  // Columns portico
  const colGeo = new THREE.CylinderGeometry(0.35, 0.35, 8.5, 16);
  const colMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  [-7, -3.5, 0, 3.5, 7].forEach((cx) => {
    const col = new THREE.Mesh(colGeo, colMat);
    col.position.set(cx, 4.25, 5.4);
    col.castShadow = true;
    plazaGroup.add(col);
  });

  // Pediment Triangle
  const pediment = new THREE.Mesh(
    new THREE.ConeGeometry(12, 3, 4),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
  );
  pediment.rotation.y = Math.PI / 4;
  pediment.scale.set(1.2, 0.7, 0.3);
  pediment.position.set(0, 10.0, 5.2);
  plazaGroup.add(pediment);

  // Town Hall Windows
  const hallWinMat = createWindowMaterial();
  [-6, -3, 3, 6].forEach((wx) => {
    [2.8, 6.2].forEach((wy) => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), hallWinMat);
      win.position.set(wx, wy, 5.05);
      plazaGroup.add(win);
    });
  });

  cityGroup.add(plazaGroup);
  addObstacle('town_hall', -12, 12, -102, -90);
  createStationTableMesh(0, -88, 3.2);

  // =========================================================================
  // 5. LIVING CITY ENVIRONMENT (Trees, Benches, Streetlamps, Wind Turbines)
  // =========================================================================

  // Procedural Tree Generator
  const createTree = (x: number, z: number, scale = 1.0) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(x, 0, z);

    // Trunk
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 1.8 * scale, 8),
      new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 })
    );
    trunk.position.y = 0.9 * scale;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Foliage Spheres
    const foliageMat = new THREE.MeshStandardMaterial({
      color: scale > 1.1 ? 0x15803d : 0x16a34a,
      roughness: 0.8,
    });
    const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 * scale), foliageMat);
    f1.position.y = 2.2 * scale;
    f1.castShadow = true;
    treeGroup.add(f1);

    const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9 * scale), foliageMat);
    f2.position.set(0.3 * scale, 2.9 * scale, 0.2 * scale);
    f2.castShadow = true;
    treeGroup.add(f2);

    cityGroup.add(treeGroup);
    addObstacle(`tree_${x}_${z}`, x - 0.6, x + 0.6, z - 0.6, z + 0.6, 'prop');
  };

  // Plant trees along sidewalks and in park
  const treePositions: [number, number, number][] = [
    [-8, 12, 1.1], [8, 12, 1.0], [-8, -2, 1.2], [8, -2, 0.9],
    [-8, -18, 1.0], [8, -18, 1.1], [-8, -36, 1.3], [8, -36, 1.0],
    [-8, -55, 0.9], [8, -55, 1.2], [-8, -72, 1.1], [8, -72, 1.0],
    // Park clusters
    [-28, -28, 1.3], [-42, -28, 1.2], [-44, -42, 1.4], [-28, -50, 1.2],
    [-40, -52, 1.5], [-35, -24, 1.1],
    // Schoolyard trees
    [22, -28, 1.0], [22, -45, 1.1], [46, -28, 1.0], [46, -45, 1.2],
  ];
  treePositions.forEach(([tx, tz, tScale]) => createTree(tx, tz, tScale));

  // Solar Streetlamps along sidewalks
  const lampPositions: [number, number][] = [
    [-6.5, 6], [6.5, 6], [-6.5, -8], [6.5, -8],
    [-6.5, -22], [6.5, -22], [-6.5, -38], [6.5, -38],
    [-6.5, -54], [6.5, -54], [-6.5, -70], [6.5, -70],
    [-6.5, -86], [6.5, -86],
  ];

  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.2 });

  lampPositions.forEach(([lx, lz], idx) => {
    const lampGroup = new THREE.Group();
    lampGroup.position.set(lx, 0, lz);

    // Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2), poleMat);
    pole.position.y = 2.1;
    pole.castShadow = true;
    lampGroup.add(pole);

    // Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), poleMat);
    arm.position.set(lx > 0 ? -0.35 : 0.35, 4.15, 0);
    lampGroup.add(arm);

    // Bulb
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), bulbMat);
    bulb.position.set(lx > 0 ? -0.7 : 0.7, 4.0, 0);
    lampGroup.add(bulb);

    // Dynamic point light
    const pLight = new THREE.PointLight(0xfef08a, 0.2, 12);
    pLight.position.set(lx > 0 ? -0.7 : 0.7, 3.8, 0);
    lampGroup.add(pLight);
    streetLampLights.push(pLight);

    cityGroup.add(lampGroup);
    addObstacle(`lamp_${idx}`, lx - 0.3, lx + 0.3, lz - 0.3, lz + 0.3, 'prop');
  });

  // Wind Turbines on distant ridges
  const turbinePositions: [number, number][] = [
    [-55, -85], [-65, -60], [-60, -35], [55, -85], [65, -60], [60, -35],
  ];

  turbinePositions.forEach(([tx, tz]) => {
    const turbineGroup = new THREE.Group();
    turbineGroup.position.set(tx, 0, tz);

    // Tower
    const towerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.7, 18, 16),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
    );
    towerMesh.position.y = 9;
    towerMesh.castShadow = true;
    turbineGroup.add(towerMesh);

    // Nacelle
    const nacelle = new THREE.Mesh(
      new THREE.BoxGeometry(1.0, 1.0, 2.2),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 })
    );
    nacelle.position.set(0, 18, 0);
    turbineGroup.add(nacelle);

    // Rotor with 3 blades
    const rotor = new THREE.Group();
    rotor.position.set(0, 18, 1.2);

    const hub = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a })
    );
    rotor.add(hub);

    const bladeGeo = new THREE.ConeGeometry(0.25, 7.5, 4);
    bladeGeo.translate(0, 3.75, 0);
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(bladeGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
      blade.rotation.z = (b * Math.PI * 2) / 3;
      rotor.add(blade);
    }

    turbineGroup.add(rotor);
    windTurbineRotors.push(rotor);

    cityGroup.add(turbineGroup);
    addObstacle(`turbine_${tx}_${tz}`, tx - 1.5, tx + 1.5, tz - 1.5, tz + 1.5, 'prop');
  });

  // =========================================================================
  // 6. FLOATING 3D MISSION BEACONS & WAYPOINTS
  // =========================================================================
  LEVEL_STATIONS.forEach((station) => {
    const beaconGroup = new THREE.Group();
    beaconGroup.position.set(station.position.x, 0, station.position.z + 3.2);

    // Base Pulsing Ground Ring
    const ringGeo = new THREE.RingGeometry(1.6, 2.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(station.markerColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.05;
    beaconGroup.add(ring);

    // Floating Holographic Diamond Beacon
    const diamondGeo = new THREE.OctahedronGeometry(0.65);
    const diamondMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(station.markerColor),
      emissive: new THREE.Color(station.markerColor),
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const diamond = new THREE.Mesh(diamondGeo, diamondMat);
    diamond.position.y = 2.8;
    beaconGroup.add(diamond);

    cityGroup.add(beaconGroup);
    stationBeacons.set(station.id, beaconGroup);
  });

  // =========================================================================
  // 7. ENERGY LINK & ANIMATION DISPATCHERS
  // =========================================================================
  const updateEnergy = (energyLevel: number) => {
    const intensity = Math.min(1.0, Math.max(0, energyLevel / 100));
    const glowColor = new THREE.Color(0xfbbf24); // warm golden light

    // Update window illumination
    windowMaterials.forEach((mat) => {
      if (intensity > 0.1) {
        mat.emissive.copy(glowColor).multiplyScalar(intensity * 1.2);
        mat.emissiveIntensity = intensity * 1.2;
      } else {
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }
    });

    // Update streetlamps
    streetLampLights.forEach((light) => {
      light.intensity = 0.2 + intensity * 1.8;
    });
  };

  const animate = (time: number) => {
    // 1. Spin wind turbines
    windTurbineRotors.forEach((rotor) => {
      rotor.rotation.z += 0.025;
    });

    // 2. Animate river water waves
    if (waterMesh && waterMesh.geometry) {
      const posAttr = waterMesh.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const u = posAttr.getX(i);
        const v = posAttr.getY(i);
        const z = Math.sin(u * 0.8 + time * 2) * 0.08 + Math.cos(v * 0.5 + time * 1.5) * 0.06;
        posAttr.setZ(i, z);
      }
      posAttr.needsUpdate = true;
    }

    // 3. Float & pulse station beacons
    stationBeacons.forEach((beacon) => {
      const diamond = beacon.children[1];
      if (diamond) {
        diamond.position.y = 2.8 + Math.sin(time * 3) * 0.25;
        diamond.rotation.y += 0.02;
      }
      const ring = beacon.children[0];
      if (ring) {
        const scale = 1.0 + Math.sin(time * 4) * 0.08;
        ring.scale.set(scale, scale, scale);
      }
    });
  };

  return {
    cityGroup,
    obstacles,
    windowMaterials,
    streetLampLights,
    windTurbineRotors,
    waterMesh,
    stationBeacons,
    updateEnergy,
    animate,
  };
}
