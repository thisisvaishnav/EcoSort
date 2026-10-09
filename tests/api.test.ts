import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiService, SaveProgressPayload } from '../src/services/api';

describe('apiService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('saves progress to localStorage when in offline or mock mode', async () => {
    const payload: SaveProgressPayload = {
      userId: 'test_hero_123',
      nickname: 'EcoScout',
      levelId: 1,
      score: 60,
      stars: 3,
      accuracy: 100,
      errors: [],
      unlockedCards: ['apple_core'],
    };

    const result = await apiService.saveProgress(payload);
    expect(result).toBe(true);

    const stored = JSON.parse(localStorage.getItem('ecosort_progress_test_hero_123') || '[]');
    expect(stored.length).toBe(1);
    expect(stored[0].nickname).toBe('EcoScout');
    expect(stored[0].stars).toBe(3);
    expect(stored[0].score).toBe(60);
  });

  it('provides a complete teacher report with impact evaluation stats', async () => {
    const report = await apiService.getTeacherReport('test-class');
    expect(report).toBeDefined();
    expect(report.studentCount).toBeGreaterThan(0);
    expect(report.avgAccuracy).toBeGreaterThan(0);
    expect(report.evaluation.preTestAccuracy).toBeDefined();
    expect(report.evaluation.postTestAccuracy).toBeDefined();
    expect(report.evaluation.learningDelta).toBe('+50%');
  });

  it('provides answers for askEco with fallback', async () => {
    const answer = await apiService.askEco('Can I recycle a cardboard pizza box?');
    expect(answer).toBeDefined();
    expect(typeof answer).toBe('string');
    expect(answer.length).toBeGreaterThan(0);
  });
});
