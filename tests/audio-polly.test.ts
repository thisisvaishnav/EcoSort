// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { audio } from '../src/services/audio';

describe('Amazon Polly Audio Integration', () => {
  beforeEach(() => {
    audio.setSoundEnabled(true);
    audio.setVoiceEnabled(true);
    audio.setPollyVoice('Kevin');
    audio.stopSpeech();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    audio.stopSpeech();
  });

  it('configures and updates the Polly Voice ID', () => {
    expect(audio.getPollyVoice()).toBe('Kevin');
    audio.setPollyVoice('Kajal');
    expect(audio.getPollyVoice()).toBe('Kajal');
  });

  it('fetches speech from the Polly endpoint and caches the result', async () => {
    const mockAudioData = 'data:audio/mp3;base64,SUQzBAAAAAAA';
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ audio: mockAudioData, voiceId: 'Kevin' }),
    } as Response);

    audio.speak('Food scraps go in the green bin.');

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe('/api/speak');
    expect(JSON.parse((options as RequestInit).body as string)).toEqual({
      text: 'Food scraps go in the green bin.',
      voiceId: 'Kevin',
    });

    // Wait microtask tick for promise resolution
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Calling speak with the exact same phrase should use the cache without calling fetch again
    audio.speak('Food scraps go in the green bin.');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('falls back to browser SpeechSynthesis when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    class MockUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      voice = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    (window as any).SpeechSynthesisUtterance = MockUtterance;

    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    window.speechSynthesis = {
      speak: mockSpeak,
      cancel: mockCancel,
      getVoices: () => [],
      paused: false,
      pending: false,
      speaking: false,
      onvoiceschanged: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };

    audio.speak('Clean plastic goes in the blue bin.');

    // Wait microtask tick for promise rejection & fallback
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(mockSpeak).toHaveBeenCalled();
  });

  it('safely stops speech on stopSpeech call', () => {
    const mockCancel = vi.fn();
    window.speechSynthesis = {
      speak: vi.fn(),
      cancel: mockCancel,
      getVoices: () => [],
      paused: false,
      pending: false,
      speaking: false,
      onvoiceschanged: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
    };

    audio.stopSpeech();
    expect(mockCancel).toHaveBeenCalled();
  });
});
