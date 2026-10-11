import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MEADOWS_PHASE5_ITEMS, MEADOWS_WRONG_BIN_HINTS, MEADOWS_CONTAMINATION_SPEECHES } from '../src/components/game/meadows/meadowsPhase5Data';
import { createMeadowsItemManager } from '../src/components/world/meadowsItemManager';
import { MeadowsBinModal } from '../src/components/game/meadows/MeadowsBinModal';
import { ContaminationMeter } from '../src/components/game/meadows/ContaminationMeter';
import * as THREE from 'three';

describe('Meadows Phase 5: The Sorting Challenge', () => {
  describe('Phase 5 Items Specification & Indian SWM Rules', () => {
    it('contains exactly 10 items matching the challenge specification', () => {
      expect(MEADOWS_PHASE5_ITEMS).toHaveLength(10);
      const ids = MEADOWS_PHASE5_ITEMS.map((item) => item.id);
      expect(ids).toContain('banana_peel');
      expect(ids).toContain('veggie_scrap');
      expect(ids).toContain('food_plate');
      expect(ids).toContain('plastic_bottle_water');
      expect(ids).toContain('newspaper');
      expect(ids).toContain('metal_can');
      expect(ids).toContain('glass_bottle');
      expect(ids).toContain('battery_aa');
      expect(ids).toContain('light_bulb');
      expect(ids).toContain('used_diaper');
    });

    it('classifies items into the 4 correct color-coded bins', () => {
      const wet = MEADOWS_PHASE5_ITEMS.filter((i) => i.bin === 'wet');
      const dry = MEADOWS_PHASE5_ITEMS.filter((i) => i.bin === 'dry');
      const hazardous = MEADOWS_PHASE5_ITEMS.filter((i) => i.bin === 'hazardous');
      const residual = MEADOWS_PHASE5_ITEMS.filter((i) => i.bin === 'residual');

      expect(wet).toHaveLength(3);
      expect(dry).toHaveLength(4);
      expect(hazardous).toHaveLength(2);
      expect(residual).toHaveLength(1);
    });

    it('defines hints for all 10 items and narrator speech for all 3 contamination levels', () => {
      MEADOWS_PHASE5_ITEMS.forEach((item) => {
        expect(MEADOWS_WRONG_BIN_HINTS[item.id]).toBeDefined();
        expect(typeof MEADOWS_WRONG_BIN_HINTS[item.id]).toBe('string');
      });

      expect(MEADOWS_CONTAMINATION_SPEECHES[1]).toContain('Careful! Wet food waste');
      expect(MEADOWS_CONTAMINATION_SPEECHES[2]).toContain('When hazardous waste mixes');
      expect(MEADOWS_CONTAMINATION_SPEECHES[3]).toContain('Mixed waste ends up in a landfill');
    });
  });

  describe('3D Meadows Item Manager', () => {
    it('spawns 10 ground items around the waste pile', () => {
      const manager = createMeadowsItemManager();
      expect(manager.items).toHaveLength(10);
      expect(manager.group.children.length).toBeGreaterThanOrEqual(10);

      // Check proximity detection
      const playerPos = new THREE.Vector3(-6.0, 0, 4.0);
      const nearest = manager.getNearestItem(playerPos, 3.0);
      expect(nearest).not.toBeNull();
      expect(nearest?.isSorted).toBe(false);

      // Pick up item
      const picked = manager.pickUpItem(nearest!.id);
      expect(picked).not.toBeNull();
      expect(picked?.isPickedUp).toBe(true);

      // Drop item back
      manager.dropItem(nearest!.id);
      expect(manager.items.find((i) => i.id === nearest!.id)?.isPickedUp).toBe(false);

      // Sort item
      manager.sortItem(nearest!.id);
      expect(manager.items.find((i) => i.id === nearest!.id)?.isSorted).toBe(true);

      manager.dispose();
    });
  });

  describe('MeadowsBinModal Component', () => {
    it('renders the 4 large bin buttons and triggers callback on select', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      const onSelectBin = vi.fn();
      const onCancel = vi.fn();
      const testItem = MEADOWS_PHASE5_ITEMS[0]; // banana peel

      await act(async () => {
        root.render(
          React.createElement(MeadowsBinModal, {
            item: testItem,
            onSelectBin,
            onCancel,
          })
        );
      });

      const modal = container.querySelector('[data-testid="meadows-bin-modal"]');
      expect(modal).not.toBeNull();

      // Check 4 bin buttons
      const wetBtn = container.querySelector('[data-testid="bin-select-wet"]');
      const dryBtn = container.querySelector('[data-testid="bin-select-dry"]');
      const hazBtn = container.querySelector('[data-testid="bin-select-hazardous"]');
      const resBtn = container.querySelector('[data-testid="bin-select-residual"]');

      expect(wetBtn).not.toBeNull();
      expect(dryBtn).not.toBeNull();
      expect(hazBtn).not.toBeNull();
      expect(resBtn).not.toBeNull();

      // Tap Wet button
      await act(async () => {
        (wetBtn as HTMLButtonElement).click();
      });
      expect(onSelectBin).toHaveBeenCalledWith('wet');

      // Tap close button
      const closeBtn = container.querySelector('[data-testid="bin-modal-close"]');
      await act(async () => {
        (closeBtn as HTMLButtonElement).click();
      });
      expect(onCancel).toHaveBeenCalled();

      root.unmount();
      container.remove();
    });
  });

  describe('ContaminationMeter Component', () => {
    it('renders contamination fill percentage corresponding to mistake levels', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(ContaminationMeter, {
            contaminationLevel: 2,
            maxLevel: 3,
          })
        );
      });

      const meter = container.querySelector('[data-testid="contamination-meter"]');
      expect(meter).not.toBeNull();
      expect(meter?.textContent).toContain('High (2/3)');

      const fill = container.querySelector('[data-testid="contamination-fill"]');
      expect((fill as HTMLElement).style.width).toContain('66.66');

      root.unmount();
      container.remove();
    });
  });
});
