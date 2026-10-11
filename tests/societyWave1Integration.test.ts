import { describe, it, expect } from 'vitest';
import { createSocietyMap } from '../src/worlds/society/map';
import { createSocietyProps } from '../src/worlds/society/props';
import { SOCIETY_STRINGS, SOCIETY_VOICE_MANIFEST, SOCIETY_AUDIO_KEYS } from '../src/worlds/society';
import { SOCIETY_MANIFEST } from '../src/worlds/society/manifest';
import { registerAndroidBridge } from '../src/worlds/society/android/androidBridge';
import budgets from '../perf/budgets.json';

describe('Wave 1: Agent B Map & Scene Validation', () => {
  it('creates the complete 3D society map with buildings and obstacles', () => {
    const map = createSocietyMap();
    expect(map.group).toBeDefined();
    expect(map.groundMesh).toBeDefined();
    expect(map.obstacles.length).toBeGreaterThanOrEqual(4);
    expect(map.plantMeshes.length).toBe(6);
    expect(map.pestParticles).toBeDefined();
    expect(map.butterflyParticles).toBeDefined();
  });

  it('switches between visual states 0 (dirty), 1 (clean), and 2 (revived) cleanly', () => {
    const map = createSocietyMap();

    // State 0: Dirty
    map.setVisualState(0);
    expect(map.pestParticles.visible).toBe(true);

    // State 1: Clean
    map.setVisualState(1);
    expect(map.pestParticles.visible).toBe(false);

    // State 2: Revived
    map.setVisualState(2);
    expect(map.pestParticles.visible).toBe(false);
  });
});

describe('Wave 1: Agent C Props & Assets Validation', () => {
  it('instantiates all 4 Eco Lens 3D hotspot representations', () => {
    const props = createSocietyProps();
    expect(props.hotspotMeshes.size).toBe(4);
    expect(props.hotspotMeshes.has('hotspot_food_waste')).toBe(true);
    expect(props.hotspotMeshes.has('hotspot_standing_water')).toBe(true);
    expect(props.hotspotMeshes.has('hotspot_damaged_plants')).toBe(true);
    expect(props.hotspotMeshes.has('hotspot_littered_drain')).toBe(true);
  });

  it('instantiates 4 temporary sorting sacks placed at manifest positions', () => {
    const props = createSocietyProps();
    expect(props.sackMeshes.size).toBe(4);
    expect(props.sackMeshes.has('wet')).toBe(true);
    expect(props.sackMeshes.has('dry')).toBe(true);
    expect(props.sackMeshes.has('hazardous')).toBe(true);
    expect(props.sackMeshes.has('residual')).toBe(true);
  });
});

describe('Wave 1: Agent G Content, Dialogue & Audio (ASD-STE100 Compliance)', () => {
  it('ensures all resident dialogue lines and hints contain 10 words or fewer', () => {
    expect(SOCIETY_STRINGS.residents.length).toBe(8);

    for (const resident of SOCIETY_STRINGS.residents) {
      const statementWords = resident.statement.trim().split(/\s+/).length;
      const guidanceWords = resident.guidance.trim().split(/\s+/).length;
      const hintWords = resident.hint.trim().split(/\s+/).length;

      expect(statementWords).toBeLessThanOrEqual(10);
      expect(guidanceWords).toBeLessThanOrEqual(10);
      expect(hintWords).toBeLessThanOrEqual(10);

      // Verify each resident has valid quiz options and a correct bin
      expect(resident.options.length).toBeGreaterThanOrEqual(3);
      expect(resident.options.some((o) => o.binType === resident.correctBin)).toBe(true);
    }
  });

  it('ensures narrative strings and hotspot descriptions contain 10 words or fewer', () => {
    for (const line of Object.values(SOCIETY_STRINGS.narrative)) {
      const wordCount = line.trim().split(/\s+/).length;
      expect(wordCount).toBeLessThanOrEqual(10);
    }

    for (const hotspot of Object.values(SOCIETY_STRINGS.hotspots)) {
      const descWords = hotspot.shortDesc.trim().split(/\s+/).length;
      const impactWords = hotspot.impactText.trim().split(/\s+/).length;
      const solutionWords = hotspot.solutionText.trim().split(/\s+/).length;

      expect(descWords).toBeLessThanOrEqual(10);
      expect(impactWords).toBeLessThanOrEqual(10);
      expect(solutionWords).toBeLessThanOrEqual(10);
    }
  });

  it('maps voice manifest entries with Polly voices and valid paths', () => {
    expect(SOCIETY_VOICE_MANIFEST.length).toBeGreaterThan(10);
    for (const voiceItem of SOCIETY_VOICE_MANIFEST) {
      expect(voiceItem.id.startsWith('society_voice_')).toBe(true);
      expect(voiceItem.file.startsWith('/audio/en/society/')).toBe(true);
      expect(['Aditi', 'Raveena', 'Kajal']).toContain(voiceItem.voice);
    }
  });
});

describe('Wave 1: Agent H Android Bridge & Performance Budgets', () => {
  it('registers android lifecycle hooks safely without throwing', () => {
    let backCalled = false;
    const cleanup = registerAndroidBridge({
      onHardwareBack: () => {
        backCalled = true;
      },
    });
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('declares compliant performance budgets in perf/budgets.json', () => {
    expect(budgets.performanceBudgets.targetFPS.min).toBe(30);
    expect(budgets.performanceBudgets.display.devicePixelRatioCap).toBeLessThanOrEqual(1.5);
    expect(budgets.performanceBudgets.rendering.maxDrawCallsPerFrame).toBeLessThanOrEqual(100);
  });
});
