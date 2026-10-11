import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MissionPanel, MissionTask } from '../src/components/game/meadows/MissionPanel';
import { EcoLensAbilityButton } from '../src/components/game/meadows/EcoLensAbilityButton';
import { NarrativeBanner, NarrativeToken } from '../src/components/game/meadows/NarrativeBanner';
import { INITIAL_ECO_LENS_STATE, EcoLensState } from '../src/systems/ecoLens';
import { joystickToMoveDir, JOYSTICK_DEAD_ZONE } from '../src/components/world/locomotion';

// Configure act environment flag for React 18 in jsdom
// @ts-expect-error global IS_REACT_ACT_ENVIRONMENT
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Meadow HUD Components & Mechanics', () => {
  describe('MissionPanel Collapse and Expand', () => {
    const sampleTasks: MissionTask[] = [
      { id: 'clean', label: 'Clean the waste area', done: false },
      { id: 'sort', label: 'Sort the waste correctly', done: true },
      { id: 'garden', label: 'Restore the garden', done: false },
    ];

    it('renders task list and handles collapse/expand toggle', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(MissionPanel, {
            timeLeft: 60,
            isWarning: false,
            isUrgent: false,
            isExpired: false,
            tasks: sampleTasks,
          })
        );
      });

      // Panel is initially open
      const panel = container.querySelector('[data-testid="mission-panel"]');
      expect(panel).not.toBeNull();
      expect(container.textContent).toContain('Clean the waste area');
      expect(container.textContent).toContain('1 / 3 done');

      // Click collapse toggle button
      const collapseBtn = container.querySelector('[data-testid="mission-collapse"]') as HTMLButtonElement;
      expect(collapseBtn).not.toBeNull();

      await act(async () => {
        collapseBtn.click();
      });

      // Panel collapsed: mission-reopen button visible, checklist hidden
      expect(container.querySelector('[data-testid="mission-panel"]')).toBeNull();
      const reopenBtn = container.querySelector('[data-testid="mission-reopen"]') as HTMLButtonElement;
      expect(reopenBtn).not.toBeNull();

      // Click reopen button
      await act(async () => {
        reopenBtn.click();
      });

      expect(container.querySelector('[data-testid="mission-panel"]')).not.toBeNull();
      expect(container.textContent).toContain('Clean the waste area');

      root.unmount();
      container.remove();
    });
  });

  describe('Virtual Joystick & Locomotion Math', () => {
    it('returns null within the dead zone', () => {
      expect(joystickToMoveDir(0, 0, 0)).toBeNull();
      expect(joystickToMoveDir(0.05, 0.05, 0)).toBeNull();
      expect(joystickToMoveDir(JOYSTICK_DEAD_ZONE - 0.01, 0, 0)).toBeNull();
    });

    it('returns normalized camera-relative direction past dead zone', () => {
      // Forward push (y = -1 in screen space) with camera facing forward (0)
      const moveForward = joystickToMoveDir(0, -1, 0);
      expect(moveForward).not.toBeNull();
      if (moveForward) {
        expect(moveForward.backward).toBe(false);
        // Magnitude should be 1
        expect(Math.hypot(moveForward.x, moveForward.z)).toBeCloseTo(1, 5);
      }

      // Backward push (y = +1 in screen space)
      const moveBackward = joystickToMoveDir(0, 1, 0);
      expect(moveBackward).not.toBeNull();
      if (moveBackward) {
        expect(moveBackward.backward).toBe(true);
      }

      // Right push (x = +1, y = 0)
      const moveRight = joystickToMoveDir(1, 0, 0);
      expect(moveRight).not.toBeNull();
      if (moveRight) {
        expect(moveRight.x).toBeCloseTo(1, 5);
        expect(moveRight.backward).toBe(false);
      }
    });
  });

  describe('EcoLensAbilityButton', () => {
    it('renders 5 segments for initial full energy and triggers callback', async () => {
      const onActivate = vi.fn();
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(EcoLensAbilityButton, {
            lensState: INITIAL_ECO_LENS_STATE,
            onActivate,
            disabled: false,
          })
        );
      });

      const energyBar = container.querySelector('[data-testid="lens-energy-bar"]');
      expect(energyBar).not.toBeNull();
      expect(energyBar?.children.length).toBe(5);

      const button = container.querySelector('button') as HTMLButtonElement;
      expect(button).not.toBeNull();
      expect(button.disabled).toBe(false);

      await act(async () => {
        button.click();
      });
      expect(onActivate).toHaveBeenCalledTimes(1);

      root.unmount();
      container.remove();
    });

    it('disables button when disabled prop is true or on cooldown', async () => {
      const onActivate = vi.fn();
      const cooldownState: EcoLensState = {
        ...INITIAL_ECO_LENS_STATE,
        cooldown: 5,
      };

      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(EcoLensAbilityButton, {
            lensState: INITIAL_ECO_LENS_STATE,
            onActivate,
            disabled: true,
          })
        );
      });

      let button = container.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);

      await act(async () => {
        root.render(
          React.createElement(EcoLensAbilityButton, {
            lensState: cooldownState,
            onActivate,
            disabled: false,
          })
        );
      });

      button = container.querySelector('button') as HTMLButtonElement;
      expect(button.disabled).toBe(true);

      root.unmount();
      container.remove();
    });
  });

  describe('ASD-STE100 Linguistic Compliance for Meadows Copy', () => {
    const contractionRegex = /\b(can't|won't|don't|it's|doesn't|didn't|isn't|aren't|haven't|hasn't)\b/i;
    const forbiddenTrashWords = /\b(trash|garbage|rubbish)\b/i;

    const meadowsTokens: NarrativeToken[] = [
      { text: 'Clean the path. Sort ' },
      { text: 'waste', highlight: 'waste' },
      { text: '. Bring ' },
      { text: 'life', highlight: 'life' },
      { text: ' back.' },
    ];

    const meadowsTasks: MissionTask[] = [
      { id: 'clean', label: 'Clean the waste area', done: false },
      { id: 'sort', label: 'Sort the waste correctly', done: false },
      { id: 'garden', label: 'Restore the garden', done: false },
    ];

    it('ensures narrative banner copy conforms to ASD-STE100 rules', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(React.createElement(NarrativeBanner, { tokens: meadowsTokens }));
      });

      const banner = container.querySelector('[data-testid="narrative-banner"]');
      const text = banner?.textContent || '';

      expect(text).not.toMatch(contractionRegex);
      expect(text).not.toMatch(forbiddenTrashWords);

      // Sentences must be concise (<= 8 words for mascot/narratives)
      const sentences = text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
      sentences.forEach((sentence) => {
        const wordCount = sentence.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(8);
      });

      root.unmount();
      container.remove();
    });

    it('ensures mission tasks use concise instructions without forbidden words', () => {
      meadowsTasks.forEach((task) => {
        expect(task.label).not.toMatch(contractionRegex);
        expect(task.label).not.toMatch(forbiddenTrashWords);
        const wordCount = task.label.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(8);
      });
    });
  });

  describe('Phase 1 & Phase 2 HUD Elements', () => {
    it('renders instruction banner and narrator speech banner', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      const MeadowHudModule = await import('../src/components/game/meadows/MeadowHud');
      const MeadowHud = MeadowHudModule.MeadowHud;

      await act(async () => {
        root.render(
          React.createElement(MeadowHud, {
            levelNumber: 7,
            levelTitle: 'The Waste Pile That Changed Our Neighbourhood',
            narrative: [],
            timeLeft: 90,
            isWarning: false,
            isUrgent: false,
            isExpired: false,
            tasks: [
              { id: 'clean', label: 'Clean the waste area', done: false },
              { id: 'sort', label: 'Sort the waste correctly', done: false },
              { id: 'garden', label: 'Restore the garden', done: false },
            ],
            lensState: INITIAL_ECO_LENS_STATE,
            onActivateLens: vi.fn(),
            showJoystick: true,
            onJoystickMove: vi.fn(),
            joystickPulsing: true,
            lensGlowing: true,
            lensHintText: 'Tip: Tap Eco Lens to see what each item is made of.',
            instructionBanner: 'Step 1: Run to the waste pile on the left.',
            narratorSpeech: 'Welcome to Green Meadows Residency. Look around. Same place, two different worlds.',
          })
        );
      });

      // Instruction banner check
      const instrBanner = container.querySelector('[data-testid="instruction-banner"]');
      expect(instrBanner).not.toBeNull();
      expect(instrBanner?.textContent).toContain('Step 1: Run to the waste pile on the left.');

      // Narrator speech check
      const speechBanner = container.querySelector('[data-testid="narrator-speech"]');
      expect(speechBanner).not.toBeNull();
      expect(speechBanner?.textContent).toContain('Welcome to Green Meadows Residency');

      // Pulsing joystick check
      const stick = container.querySelector('[data-testid="virtual-joystick"]');
      expect(stick).not.toBeNull();
      expect(stick?.className).toContain('animate-pulse');

      // Glowing lens and hint bubble check
      const hintBubble = container.querySelector('[data-testid="lens-hint-bubble"]');
      expect(hintBubble).not.toBeNull();
      expect(hintBubble?.textContent).toContain('Tip: Tap Eco Lens to see what each item is made of.');

      root.unmount();
      container.remove();
    });
  });
});
