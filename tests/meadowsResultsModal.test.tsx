import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import {
  MeadowsResultsModal,
  formatTimeTaken,
  calculateMeadowsStars,
  getContaminationLabel,
} from '../src/components/game/meadows/MeadowsResultsModal';

// @ts-expect-error global IS_REACT_ACT_ENVIRONMENT
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Phase 8 Level End: MeadowsResultsModal', () => {
  describe('Helper functions', () => {
    it('formats seconds into mm:ss accurately', () => {
      expect(formatTimeTaken(65)).toBe('01:05');
      expect(formatTimeTaken(0)).toBe('00:00');
      expect(formatTimeTaken(90)).toBe('01:30');
      expect(formatTimeTaken(9)).toBe('00:09');
    });

    it('calculates star rating according to specification', () => {
      // 3 stars for 9-10 correct
      expect(calculateMeadowsStars(10)).toBe(3);
      expect(calculateMeadowsStars(9)).toBe(3);

      // 2 stars for 6-8 correct
      expect(calculateMeadowsStars(8)).toBe(2);
      expect(calculateMeadowsStars(7)).toBe(2);
      expect(calculateMeadowsStars(6)).toBe(2);

      // 1 star for fewer than 6
      expect(calculateMeadowsStars(5)).toBe(1);
      expect(calculateMeadowsStars(0)).toBe(1);
    });

    it('computes contamination label correctly', () => {
      expect(getContaminationLabel(0).label).toBe('Low');
      expect(getContaminationLabel(1).label).toBe('Low');
      expect(getContaminationLabel(2).label).toBe('Medium');
      expect(getContaminationLabel(3).label).toBe('High');
      expect(getContaminationLabel(4).label).toBe('High');
    });
  });

  describe('Modal rendering and interactions', () => {
    it('renders all required statistics, star rating, and button actions', async () => {
      const onPlayAgainMock = vi.fn();
      const onNextMissionMock = vi.fn();
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);

      await act(async () => {
        root.render(
          React.createElement(MeadowsResultsModal, {
            sortedCount: 8,
            totalCount: 10,
            timeTakenSeconds: 65,
            contaminationLevel: 1,
            narratorLine: 'The waste pile is gone, but the land is still bare. Next, let’s bring this side back to life.',
            onPlayAgain: onPlayAgainMock,
            onNextMission: onNextMissionMock,
          })
        );
      });

      const modal = container.querySelector('[data-testid="meadows-results-modal"]');
      expect(modal).not.toBeNull();

      // Check stats
      expect(container.textContent).toContain('8/10');
      expect(container.textContent).toContain('01:05');
      expect(container.textContent).toContain('Low');
      expect(container.textContent).toContain('⭐⭐');

      // Check narrator line
      expect(container.textContent).toContain(
        'The waste pile is gone, but the land is still bare. Next, let’s bring this side back to life.'
      );

      // Check button initially gated while narrator speaks
      const nextBtn = container.querySelector('[data-testid="meadows-next-mission-btn"]') as HTMLButtonElement;
      expect(nextBtn).not.toBeNull();
      expect(nextBtn.disabled).toBe(true);
      expect(nextBtn.textContent).toContain('Listening to area briefing...');

      // Advance timers or render with completed narration to verify unlocking
      await act(async () => {
        root.render(
          React.createElement(MeadowsResultsModal, {
            sortedCount: 8,
            totalCount: 10,
            timeTakenSeconds: 65,
            contaminationLevel: 1,
            narratorLine: 'The waste pile is gone, but the land is still bare. Next, let’s bring this side back to life.',
            initialNarrationCompleted: true,
            onPlayAgain: onPlayAgainMock,
            onNextMission: onNextMissionMock,
          })
        );
      });

      expect(nextBtn.disabled).toBe(false);
      expect(nextBtn.textContent).toContain('NEXT MISSION: Restore the Garden');

      await act(async () => {
        nextBtn.click();
      });
      expect(onNextMissionMock).toHaveBeenCalledTimes(1);

      // Check play again button
      const playAgainBtn = container.querySelector('[data-testid="meadows-play-again-btn"]') as HTMLButtonElement;
      expect(playAgainBtn).not.toBeNull();
      await act(async () => {
        playAgainBtn.click();
      });
      expect(onPlayAgainMock).toHaveBeenCalledTimes(1);

      await act(async () => {
        root.unmount();
      });
      container.remove();
    });
  });
});
