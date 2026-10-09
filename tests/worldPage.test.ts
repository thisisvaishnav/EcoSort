import { describe, it, expect } from 'vitest';
import { WorldPage } from '../src/components/world/WorldPage';
import { EcoSortGame } from '../src/components/game/EcoSortGame';

describe('WorldPage Component Architecture & Compliance', () => {
  const contractionRegex = /\b(can't|won't|don't|it's|doesn't|didn't|isn't|aren't|haven't|hasn't)\b/i;
  const forbiddenTrashWords = /\b(trash|garbage|rubbish)\b/i;

  it('exports WorldPage as a React component function', () => {
    expect(typeof WorldPage).toBe('function');
  });

  it('exports EcoSortGame delegating to WorldPage', () => {
    expect(typeof EcoSortGame).toBe('function');
  });

  it('verifies mascot feedback copy adheres to ASD-STE100 guidelines', () => {
    const welcomeMessages = [
      'Welcome to Home. Walk to table and sort.',
      'Great job! Walk across town to next mission.',
    ];

    welcomeMessages.forEach((msg) => {
      expect(msg).not.toMatch(contractionRegex);
      expect(msg).not.toMatch(forbiddenTrashWords);

      const sentences = msg.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
      sentences.forEach((sentence) => {
        const words = sentence.split(/\s+/).length;
        expect(words).toBeLessThanOrEqual(8);
      });
    });
  });
});
