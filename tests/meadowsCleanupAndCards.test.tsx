import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import {
  MeadowsLearningCardsModal,
  MEADOWS_LEARNING_CARDS,
} from '../src/components/game/meadows/MeadowsLearningCardsModal';
import { createMeadowsScene } from '../src/components/world/meadowsScene';

// @ts-expect-error global IS_REACT_ACT_ENVIRONMENT
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Meadows Phase 6 & Phase 7 Mechanics', () => {
  describe('Phase 7 Learning Cards Modal', () => {
    it('generates 6 educational cards with STE compliance and dynamic score', () => {
      const cards = MEADOWS_LEARNING_CARDS(8, 10);
      expect(cards.length).toBe(6);
      expect(cards[0].id).toBe('card-1');
      expect(cards[0].description).toContain('8 of 10');
      expect(cards[5].id).toBe('card-6');
      expect(cards[5].title).toBe('Take Action at Home');
    });

    it('renders the modal and handles step advancement up to onFinish', async () => {
      const onFinishMock = vi.fn();
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(MeadowsLearningCardsModal, {
            isOpen: true,
            sortedCount: 10,
            totalCount: 10,
            onFinish: onFinishMock,
          })
        );
      });

      const modal = container.querySelector('[data-testid="meadows-learning-modal"]');
      expect(modal).not.toBeNull();
      expect(container.textContent).toContain('What You Just Did');

      const nextBtn = container.querySelector('[data-testid="learning-card-next-btn"]') as HTMLButtonElement;
      expect(nextBtn).not.toBeNull();
      expect(nextBtn.textContent).toContain('Next Fact');

      // Step through cards 2, 3, 4, 5, 6
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          nextBtn.click();
        });
      }

      // Card 6 is the last card
      expect(container.textContent).toContain('Take Action at Home');
      expect(nextBtn.textContent).toContain('View Results');

      // Click finish
      await act(async () => {
        nextBtn.click();
      });

      expect(onFinishMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        root.unmount();
      });
      container.remove();
    });

    it('returns null when isOpen is false', async () => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(MeadowsLearningCardsModal, {
            isOpen: false,
            sortedCount: 10,
            totalCount: 10,
            onFinish: vi.fn(),
          })
        );
      });

      expect(container.querySelector('[data-testid="meadows-learning-modal"]')).toBeNull();

      await act(async () => {
        root.unmount();
      });
      container.remove();
    });
  });

  describe('Phase 6 Scene Cleanup & Truck Departure Functions', () => {
    it('exposes animateCleanup and animateTruckDeparture in createMeadowsScene', () => {
      const scene = createMeadowsScene();
      expect(typeof scene.animateCleanup).toBe('function');
      expect(typeof scene.animateTruckDeparture).toBe('function');

      // Execute without crashing across range 0..1
      expect(() => {
        scene.animateCleanup(0);
        scene.animateCleanup(0.5);
        scene.animateCleanup(1.0);
        scene.animateTruckDeparture(0);
        scene.animateTruckDeparture(0.2);
        scene.animateTruckDeparture(0.8);
        scene.animateTruckDeparture(1.0);
      }).not.toThrow();
    });
  });
});
