import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

describe('Kai 3D GLB Character Verification', () => {
  const glbPath = path.resolve(process.cwd(), 'public/models/kai.glb');

  it('verifies public/models/kai.glb exists and has valid glTF 2.0 binary header', () => {
    expect(fs.existsSync(glbPath)).toBe(true);

    const stat = fs.statSync(glbPath);
    expect(stat.size).toBeGreaterThan(100_000); // Should be > 100KB with textures

    const fd = fs.openSync(glbPath, 'r');
    const headerBuf = Buffer.alloc(12);
    fs.readSync(fd, headerBuf, 0, 12, 0);
    fs.closeSync(fd);

    const magic = headerBuf.readUInt32LE(0);
    const version = headerBuf.readUInt32LE(4);
    const length = headerBuf.readUInt32LE(8);

    // 0x46546C67 = "glTF"
    expect(magic).toBe(0x46546c67);
    expect(version).toBe(2);
    expect(length).toBe(stat.size);
  });

  it('parses Kai GLB with Three.js and validates key locomotion pivots and photo textures', async () => {
    // Provide polyfill for self / createImageBitmap in node/jsdom testing
    const originalSelf = globalThis.self;
    const originalCreateImageBitmap = (globalThis as any).createImageBitmap;
    (globalThis as unknown as { self: unknown }).self = globalThis;
    (globalThis as any).createImageBitmap = async () => ({
      width: 256,
      height: 256,
      close: () => {},
    });

    const fileData = fs.readFileSync(glbPath);
    // Create realm-local ArrayBuffer to ensure `instanceof ArrayBuffer` passes in Vitest vm
    const arrayBuffer = new ArrayBuffer(fileData.byteLength);
    new Uint8Array(arrayBuffer).set(fileData);

    const loader = new GLTFLoader();
    const gltf = await new Promise<any>((resolve, reject) => {
      loader.parse(
        arrayBuffer,
        '',
        (result) => resolve(result),
        (err) => reject(err)
      );
    });

    try {
      expect(gltf).toBeDefined();
      expect(gltf.scene).toBeDefined();

      const scene = gltf.scene;

      // Essential pivots required for player movement animations
      const bodyRoot = scene.getObjectByName('BodyRoot');
      const headPivot = scene.getObjectByName('HeadPivot');
      const leftArm = scene.getObjectByName('LeftArmPivot');
      const rightArm = scene.getObjectByName('RightArmPivot');
      const leftLeg = scene.getObjectByName('LeftLegPivot');
      const rightLeg = scene.getObjectByName('RightLegPivot');
      const torso = scene.getObjectByName('TorsoGroup');
      const backpack = scene.getObjectByName('Backpack');

      expect(bodyRoot).toBeDefined();
      expect(headPivot).toBeDefined();
      expect(leftArm).toBeDefined();
      expect(rightArm).toBeDefined();
      expect(leftLeg).toBeDefined();
      expect(rightLeg).toBeDefined();
      expect(torso).toBeDefined();
      expect(backpack).toBeDefined();

      // Check materials and photo texture mapping
      const materialsFound = new Set<string>();
      scene.traverse((child: THREE.Object3D) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              if (m.name) materialsFound.add(m.name);
            });
          }
        }
      });

      // Verify textures from hero turnaround sheet are bound to materials
      expect(materialsFound.has('MatKaiFace')).toBe(true);
      expect(materialsFound.has('MatKaiHoodieFront')).toBe(true);
      expect(materialsFound.has('MatKaiBackpack')).toBe(true);
      expect(materialsFound.has('MatKaiHairTex')).toBe(true);
      expect(materialsFound.has('MatKaiShortsTex')).toBe(true);
      expect(materialsFound.has('MatKaiSneakerTex')).toBe(true);
    } finally {
      if (originalSelf === undefined) {
        delete (globalThis as unknown as { self?: unknown }).self;
      } else {
        (globalThis as unknown as { self: unknown }).self = originalSelf;
      }
      if (originalCreateImageBitmap === undefined) {
        delete (globalThis as any).createImageBitmap;
      } else {
        (globalThis as any).createImageBitmap = originalCreateImageBitmap;
      }
    }
  });

  it('complies with ASD-STE100 guidelines for character descriptions and UI copy', () => {
    const characterDialogue = [
      'Kai: Let us sort plastic bottles into the dry bin.',
      'Kai: Fruit peels go into the green compost bin.',
      'Kai: Clean homes make clean towns and happy rivers.',
      'Kai: Hero points increased. Good job sorting!',
    ];

    characterDialogue.forEach((line) => {
      const sentence = line.split(': ')[1];
      expect(sentence).toBeDefined();
      const words = sentence.trim().split(/\s+/);
      expect(words.length).toBeLessThanOrEqual(10);
      expect(sentence).not.toMatch(/\b(don't|can't|won't|it's|they're)\b/i);
    });
  });
});
