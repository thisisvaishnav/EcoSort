import * as THREE from 'three';
import { ItemMeshOptions, MapItemModelType } from './types';
import { createBananaPeel3D } from './models/BananaPeel3D';
import { createFoodPlate3D } from './models/FoodPlate3D';
import { createMilkCarton3D } from './models/MilkCarton3D';
import { createPlasticBottle3D } from './models/PlasticBottle3D';
import { createNewspaper3D } from './models/Newspaper3D';
import { createBattery3D } from './models/Battery3D';
import { createLightBulb3D } from './models/LightBulb3D';
import { createMedicineBottle3D } from './models/MedicineBottle3D';
import { createMagazine3D } from './models/Magazine3D';
import { createToyCar3D } from './models/ToyCar3D';
import { createBreadSlice3D } from './models/BreadSlice3D';
import { createVeggieScrap3D } from './models/VeggieScrap3D';
import { createEggShell3D } from './models/EggShell3D';
import { createCardboardBox3D } from './models/CardboardBox3D';
import { createMetalCan3D } from './models/MetalCan3D';
import { createWrapper3D } from './models/Wrapper3D';
import { createTissue3D } from './models/Tissue3D';
import { createBrokenPen3D } from './models/BrokenPen3D';

/**
 * Unified factory function that instantiates any of the 10 production 3D models
 * (or legacy model types), ensuring consistent scale, shadows, metadata, and disposal.
 */
export function createItemMesh(
  modelType: MapItemModelType | string,
  options: ItemMeshOptions = {}
): THREE.Group {
  let meshGroup: THREE.Group;

  switch (modelType) {
    // 1. Banana Peel
    case 'banana':
    case 'banana_peel':
      meshGroup = createBananaPeel3D(options);
      break;

    // 2. Food Leftovers Plate
    case 'food_plate':
    case 'plate':
      meshGroup = createFoodPlate3D(options);
      break;

    // 3. Milk Carton
    case 'milk_carton':
      meshGroup = createMilkCarton3D(options);
      break;

    // 4. Plastic Water Bottle
    case 'plastic_bottle':
    case 'plastic_bottle_water':
      meshGroup = createPlasticBottle3D(options);
      break;

    // 5. Folded Newspaper
    case 'newspaper':
    case 'paper_sheet':
      meshGroup = createNewspaper3D(options);
      break;

    // 6. Used Battery
    case 'battery':
    case 'battery_aa':
      meshGroup = createBattery3D(options);
      break;

    // 7. Light Bulb
    case 'light_bulb':
      meshGroup = createLightBulb3D(options);
      break;

    // 8. Medicine Bottle & Pills
    case 'medicine':
    case 'medicine_bottle':
    case 'expired_medicine':
      meshGroup = createMedicineBottle3D(options);
      break;

    // 9. Glossy Magazine
    case 'magazine':
      meshGroup = createMagazine3D(options);
      break;

    // 10. Broken Toy Car
    case 'toy_car':
    case 'broken_toy_car':
      meshGroup = createToyCar3D(options);
      break;

    // ── New Level 1 items ────────────────────────────────────────────────────

    // 11. Leftover Bread Slice (Wet)
    case 'bread_slice':
    case 'bread':
      meshGroup = createBreadSlice3D(options);
      break;

    // 12. Vegetable Scraps (Wet)
    case 'veggie_scrap':
    case 'veggie_scraps':
      meshGroup = createVeggieScrap3D(options);
      break;

    // 13. Egg Shell (Wet)
    case 'egg_shell':
    case 'eggshell':
      meshGroup = createEggShell3D(options);
      break;

    // 14. Cardboard Box (Dry)
    case 'cardboard':
    case 'cardboard_box':
      meshGroup = createCardboardBox3D(options);
      break;

    // 15. Metal / Tin Can (Dry)
    case 'metal_can':
    case 'soda_can':
    case 'tin_can':
      meshGroup = createMetalCan3D(options);
      break;

    // ── Level 1 residual items ────────────────────────────────────────────────

    // 16. Candy Wrapper (Residual)
    case 'wrapper':
      meshGroup = createWrapper3D(options);
      break;

    // 17. Used Tissue (Residual)
    case 'tissue':
      meshGroup = createTissue3D(options);
      break;

    // 18. Broken Pen (Residual)
    case 'broken_pen':
      meshGroup = createBrokenPen3D(options);
      break;

    // Legacy Fallbacks
    case 'apple': {
      meshGroup = new THREE.Group();
      const apple = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 20, 20),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
      );
      apple.position.y = 0.28;
      apple.castShadow = true;
      meshGroup.add(apple);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x78350f })
      );
      stem.position.y = 0.58;
      meshGroup.add(stem);
      break;
    }

    case 'phone': {
      meshGroup = new THREE.Group();
      const phone = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.45, 0.04),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 })
      );
      phone.position.y = 0.225;
      phone.castShadow = true;
      meshGroup.add(phone);
      break;
    }

    default: {
      meshGroup = new THREE.Group();
      const defMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.24),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 })
      );
      defMesh.position.y = 0.24;
      defMesh.castShadow = true;
      meshGroup.add(defMesh);
    }
  }

  // Tag group for easy identification and resource disposal
  meshGroup.userData = {
    modelType,
    isEcoSortItem: true,
    dispose: () => disposeItemMesh(meshGroup),
  };

  return meshGroup;
}

/**
 * Recursively disposes all geometries, materials, and textures attached to a mesh group
 * to prevent GPU memory leaks.
 */
export function disposeItemMesh(group: THREE.Object3D): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      if (child.geometry) {
        child.geometry.dispose();
      }
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        } else {
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      }
    }
  });
}
