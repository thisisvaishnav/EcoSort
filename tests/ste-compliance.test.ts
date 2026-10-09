import { describe, it, expect } from 'vitest';
import { GAME_ITEMS } from '../src/data/items';
import { GAME_LEVELS } from '../src/data/levels';
import { LEVEL_QUIZZES } from '../src/data/quizzes';

describe('ASD-STE100 Linguistic Compliance', () => {
  const contractionRegex = /\b(can't|won't|don't|it's|doesn't|didn't|isn't|aren't|haven't|hasn't)\b/i;
  const forbiddenTrashWords = /\b(trash|garbage|rubbish)\b/i;

  it('ensures all item facts contain no contractions and no forbidden words', () => {
    GAME_ITEMS.forEach((item) => {
      expect(item.fact).not.toMatch(contractionRegex);
      expect(item.fact).not.toMatch(forbiddenTrashWords);
      // Descriptions should be 20 words or fewer per sentence
      const sentences = item.fact.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
      sentences.forEach((sentence) => {
        const wordCount = sentence.split(/\s+/).length;
        expect(wordCount).toBeLessThanOrEqual(20);
      });
    });
  });

  it('ensures all level descriptions contain no forbidden words or contractions', () => {
    GAME_LEVELS.forEach((level) => {
      expect(level.learningGoal).not.toMatch(contractionRegex);
      expect(level.learningGoal).not.toMatch(forbiddenTrashWords);
      expect(level.energyLink).not.toMatch(contractionRegex);
      expect(level.energyLink).not.toMatch(forbiddenTrashWords);
    });
  });

  it('ensures all quiz questions contain no contractions or forbidden words', () => {
    Object.values(LEVEL_QUIZZES).flat().forEach((quiz) => {
      expect(quiz.question).not.toMatch(contractionRegex);
      expect(quiz.question).not.toMatch(forbiddenTrashWords);
      expect(quiz.fact).not.toMatch(contractionRegex);
      expect(quiz.fact).not.toMatch(forbiddenTrashWords);
    });
  });
});
