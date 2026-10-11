/**
 * Audio Service
 * Provides speech synthesis (Eco mascot voice) and procedural Web Audio sound effects.
 * Sound preferences persist to localStorage so mute state survives page reloads.
 */

import { startMusicLoop, stopMusicLoop, isMusicPlaying } from './music';

const SOUND_ENABLED_KEY = 'ecosort_sound_enabled';
const SLOW_MODE_KEY = 'ecosort_slow_mode';
const VOLUME_KEY = 'ecosort_volume';
const MUSIC_VOLUME = 0.4;

export function readStoredBoolean(key: string, defaultValue: boolean): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === 'true';
  } catch {
    return defaultValue;
  }
}

export function writeStoredBoolean(key: string, value: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage blocked (private mode). Ignore.
  }
}

function readStoredNumber(key: string, defaultValue: number): number {
  if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeStoredNumber(key: string, value: number): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage blocked (private mode). Ignore.
  }
}

class AudioService {
  private soundEnabled: boolean = true;
  private voiceEnabled: boolean = true;
  private slowMode: boolean = false;
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private volume: number = 0.85;
  private lastPlayedAt: Record<string, number> = {};
  private musicGain: GainNode | null = null;
  private musicWanted: boolean = false;
  private pollyAudio: HTMLAudioElement | null = null;
  private pollyCache: Map<string, string> = new Map();
  private pollyInFlight: Map<string, Promise<string | null>> = new Map();
  private speechSequence: number = 0;
  private lastSpokenText: string = '';
  private lastSpokenTime: number = 0;
  private pollyVoiceId: string =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_POLLY_VOICE_ID) || 'Kevin';

  constructor() {
    this.soundEnabled = readStoredBoolean(SOUND_ENABLED_KEY, true);
    this.voiceEnabled = this.soundEnabled;
    this.slowMode = readStoredBoolean(SLOW_MODE_KEY, false);
    const storedVolume = readStoredNumber(VOLUME_KEY, this.volume);
    this.volume = Math.min(1, Math.max(0, storedVolume));
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.masterGain = this.audioCtx.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
  }

  /**
   * Unlock the AudioContext from a user gesture. Browsers start the context
   * in a suspended state and reject sound until a gesture happens.
   */
  public unlock() {
    this.initContext();
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }
    if (this.musicWanted && this.soundEnabled) {
      this.startMusic();
    }
  }

  /** Destination node for every oscillator. Falls back to speakers. */
  private getOutput(): AudioNode | null {
    this.initContext();
    if (!this.audioCtx) return null;
    return this.masterGain ?? this.audioCtx.destination;
  }

  /**
   * Rate limit so rapid repeats never stack into noise.
   */
  private canPlay(id: string, cooldownMs: number): boolean {
    if (!this.soundEnabled) return false;
    const now = Date.now();
    const last = this.lastPlayedAt[id];
    if (last !== undefined && now - last < cooldownMs) return false;
    this.lastPlayedAt[id] = now;
    return true;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.voiceEnabled = enabled;
    writeStoredBoolean(SOUND_ENABLED_KEY, enabled);
    if (enabled) {
      if (this.musicWanted) this.startMusic();
    } else {
      this.fadeOutMusic();
      this.stopSpeech();
    }
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    if (!enabled) {
      this.stopSpeech();
    }
  }

  public isVoiceEnabled(): boolean {
    return this.voiceEnabled;
  }

  public setSlowMode(enabled: boolean) {
    this.slowMode = enabled;
    writeStoredBoolean(SLOW_MODE_KEY, enabled);
  }

  public isSlowMode(): boolean {
    return this.slowMode;
  }

  /** Master volume 0..1 applied to every sound effect. */
  public setVolume(volume: number) {
    const clamped = Math.min(1, Math.max(0, volume));
    this.volume = clamped;
    if (this.masterGain) {
      this.masterGain.gain.value = clamped;
    }
    if (this.pollyAudio) {
      try {
        this.pollyAudio.volume = clamped;
      } catch {
        // pass
      }
    }
    writeStoredNumber(VOLUME_KEY, clamped);
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Start the constant background music loop (soft four-chord progression).
   * Safe to call before the AudioContext is unlocked; it starts on unlock().
   */
  public startMusic() {
    this.musicWanted = true;
    if (!this.soundEnabled) return;
    this.initContext();
    if (!this.audioCtx) return;

    if (!this.musicGain) {
      this.musicGain = this.audioCtx.createGain();
      this.musicGain.gain.value = MUSIC_VOLUME;
      this.musicGain.connect(this.masterGain ?? this.audioCtx.destination);
    } else if (this.musicGain.gain.value < MUSIC_VOLUME) {
      this.musicGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.musicGain.gain.setValueAtTime(MUSIC_VOLUME, this.audioCtx.currentTime);
    }

    startMusicLoop(this.audioCtx, this.musicGain);
  }

  /**
   * Stop the background music loop and silence any notes still ringing out.
   */
  public stopMusic() {
    this.musicWanted = false;
    this.fadeOutMusic();
  }

  public isMusicOn(): boolean {
    return this.musicWanted && this.soundEnabled && isMusicPlaying();
  }

  private fadeOutMusic() {
    stopMusicLoop();
    if (this.musicGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
      this.musicGain.gain.linearRampToValueAtTime(0.0001, now + 0.3);
    }
  }

  /**
   * Mascot Speech: speaks short sentences using Amazon Polly Neural Voice
   * (falls back gracefully to browser SpeechSynthesis if offline or unconfigured).
   */
  public speak(text: string) {
    if (!this.voiceEnabled || typeof window === 'undefined') return;
    const trimmed = (text || '').trim();
    if (!trimmed) return;

    // 1. Debounce rapid duplicate calls for the same text (e.g. React StrictMode double mounts)
    const now = Date.now();
    if (trimmed === this.lastSpokenText && now - this.lastSpokenTime < 600) {
      return;
    }
    this.lastSpokenText = trimmed;
    this.lastSpokenTime = now;

    // 2. Stop any existing speech immediately
    this.stopSpeech();

    // 3. Increment speech token so older in-flight requests are dropped
    const currentSeq = ++this.speechSequence;

    // 4. Instant cache hit
    const cacheKey = `${this.pollyVoiceId}:${trimmed}`;
    const cachedUrl = this.pollyCache.get(cacheKey);
    if (cachedUrl) {
      this.playPollyAudio(cachedUrl);
      return;
    }

    // 5. Fetch Polly audio with request deduplication
    this.fetchPollyAudio(cacheKey, trimmed)
      .then((audioData) => {
        // If another speech request arrived or speech was stopped, drop this stale response
        if (this.speechSequence !== currentSeq) return;

        if (audioData) {
          this.playPollyAudio(audioData);
        } else {
          this.fallbackSpeech(trimmed);
        }
      })
      .catch(() => {
        if (this.speechSequence !== currentSeq) return;
        this.fallbackSpeech(trimmed);
      });
  }

  private fetchPollyAudio(cacheKey: string, text: string): Promise<string | null> {
    if (this.pollyCache.has(cacheKey)) {
      return Promise.resolve(this.pollyCache.get(cacheKey) || null);
    }

    if (this.pollyInFlight.has(cacheKey)) {
      return this.pollyInFlight.get(cacheKey)!;
    }

    if (typeof fetch !== 'function') {
      return Promise.resolve(null);
    }

    const apiEndpoint = typeof import.meta !== 'undefined' ? (import.meta.env?.VITE_API_ENDPOINT || '') : '';
    const speakEndpoint = apiEndpoint ? `${apiEndpoint}/speak` : '/api/speak';

    const promise = fetch(speakEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: this.pollyVoiceId,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.audio) {
          this.pollyCache.set(cacheKey, data.audio);
          return data.audio as string;
        }
        return null;
      })
      .catch((err) => {
        console.warn('Polly synthesis notice:', err.message);
        return null;
      })
      .finally(() => {
        this.pollyInFlight.delete(cacheKey);
      });

    this.pollyInFlight.set(cacheKey, promise);
    return promise;
  }

  /**
   * Stop both Amazon Polly audio and browser speech synthesis.
   */
  public stopSpeech() {
    this.speechSequence++; // Invalidate all pending in-flight requests
    if (this.pollyAudio) {
      try {
        this.pollyAudio.pause();
        this.pollyAudio.currentTime = 0;
        this.pollyAudio.src = '';
      } catch {
        // pass
      }
      this.pollyAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // pass
      }
    }
  }

  private playPollyAudio(audioSrc: string) {
    if (typeof Audio === 'undefined') return;
    try {
      // Ensure previous audio is fully stopped
      if (this.pollyAudio) {
        try {
          this.pollyAudio.pause();
          this.pollyAudio.src = '';
        } catch {
          // pass
        }
        this.pollyAudio = null;
      }

      // Ensure no browser speech synthesis is running
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // pass
        }
      }

      const audio = new Audio(audioSrc);
      audio.volume = this.volume;
      this.pollyAudio = audio;

      audio.onended = () => {
        if (this.pollyAudio === audio) {
          this.pollyAudio = null;
        }
      };

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((err) => {
          console.warn('Polly playback notice:', err);
        });
      }
    } catch {
      // Audio element fallback
    }
  }

  private fallbackSpeech(text: string) {
    if (
      typeof window === 'undefined' ||
      !window.speechSynthesis ||
      typeof SpeechSynthesisUtterance === 'undefined'
    ) {
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop prior speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = this.slowMode ? 0.75 : 0.95;
      utterance.pitch = 1.15; // Friendly mascot pitch

      // Choose child-friendly or english voice if available
      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
      );
      if (friendlyVoice) {
        utterance.voice = friendlyVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // pass
    }
  }

  public setPollyVoice(voiceId: string) {
    this.pollyVoiceId = voiceId;
  }

  public getPollyVoice(): string {
    return this.pollyVoiceId;
  }

  /**
   * Sound effect: UI button click (soft filtered noise tick).
   */
  public playClick() {
    if (!this.canPlay('click', 45)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    if (!this.noiseBuffer) {
      const frameCount = Math.floor(this.audioCtx.sampleRate * 0.03);
      const buffer = this.audioCtx.createBuffer(1, frameCount, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / frameCount);
      }
      this.noiseBuffer = buffer;
    }

    const source = this.audioCtx.createBufferSource();
    source.buffer = this.noiseBuffer;

    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    filter.Q.value = 1.2;

    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(output);

    source.start(now);
    source.stop(now + 0.05);
  }

  /**
   * Sound effect: Pick up item (gentle pop)
   */
  public playPickup() {
    if (!this.canPlay('pickup', 100)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(output);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Sound effect: Throw whoosh
   */
  public playThrow() {
    if (!this.canPlay('throw', 120)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(output);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Sound effect: Correct sort (bright rising arpeggio with a sparkle note)
   */
  public playCorrect() {
    if (!this.canPlay('correct', 150)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
      const start = now + idx * 0.06;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(idx === notes.length - 1 ? 0.14 : 0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);

      osc.connect(gain);
      gain.connect(output);

      osc.start(start);
      osc.stop(start + 0.28);
    });
  }

  /**
   * Sound effect: Wrong bin (soft two-tone thud, gentle and non-punishing)
   */
  public playIncorrect() {
    if (!this.canPlay('incorrect', 180)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(196, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.18);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.2);

    const body = this.audioCtx.createOscillator();
    const bodyGain = this.audioCtx.createGain();
    body.type = 'triangle';
    body.frequency.setValueAtTime(98, now);
    bodyGain.gain.setValueAtTime(0.06, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    body.connect(bodyGain);
    bodyGain.connect(output);
    body.start(now);
    body.stop(now + 0.16);
  }

  /**
   * Sound effect: Garbage truck horn (low freq) at 10s warning.
   */
  public playTruckHorn() {
    if (!this.canPlay('truckHorn', 500)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sawtooth';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(65, now + 0.4);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Sound effect: Eco Lens scan activation (sci-fi sweep).
   */
  public playLensActivate() {
    if (!this.canPlay('lens', 250)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Sound effect: GTA-style phone ringing tone (dual-tone standard telephone ring).
   */
  public playPhoneRing() {
    if (!this.canPlay('phoneRing', 300)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;
    const freqs = [440, 480]; // standard US dial/ring tone pair
    freqs.forEach((f) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(output);
      osc.start(now);
      osc.stop(now + 0.5);
    });
  }

  /**
   * Sound effect: Short electronic phone keypad/beep click.
   */
  public playPhoneBeep() {
    if (!this.canPlay('phoneBeep', 150)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(697, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Sound effect: Timer warning ticking (gentle tick-tock at 30s).
   */
  public playTimerWarning() {
    if (!this.canPlay('timerWarning', 400)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  /**
   * Sound effect: Timer urgent (faster tick at 10s).
   */
  public playTimerUrgent() {
    if (!this.canPlay('timerUrgent', 300)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'triangle';
    const now = this.audioCtx.currentTime;

    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  /**
   * Sound effect: Cheerful garbage truck arrival jingle.
   */
  public playTruckJingle() {
    if (!this.canPlay('truckJingle', 400)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const melody = [523.25, 659.25, 523.25, 783.99, 659.25];
    const now = this.audioCtx.currentTime;

    melody.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.12;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  }

  /**
   * Sound effect: Level complete celebration
   */
  public playCelebration() {
    if (!this.canPlay('celebration', 600)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const notes = [440, 554.37, 659.25, 880];
    const now = this.audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.1;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  /**
   * Sound effect: Iconic "Gadi Wala Aaya, Ghar Se Kachra Nikalo" truck jingle
   */
  public playGadiWalaAaya() {
    if (!this.canPlay('gadiWalaAaya', 1000)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    // Melody notes approximation (C major / D major kid-friendly melody)
    const melody = [
      { freq: 523.25, dur: 0.22 }, // C5
      { freq: 587.33, dur: 0.22 }, // D5
      { freq: 659.25, dur: 0.22 }, // E5
      { freq: 587.33, dur: 0.22 }, // D5
      { freq: 523.25, dur: 0.45 }, // C5
      { freq: 659.25, dur: 0.22 }, // E5
      { freq: 783.99, dur: 0.35 }, // G5
      { freq: 659.25, dur: 0.35 }, // E5
      { freq: 523.25, dur: 0.5 },  // C5
    ];

    let t = this.audioCtx.currentTime;
    melody.forEach((note) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, t);
      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur);

      osc.connect(gain);
      gain.connect(output);
      osc.start(t);
      osc.stop(t + note.dur);
      t += note.dur * 0.95;
    });
  }

  /**
   * Sound effect: Plant revival chime & chime cascade
   */
  public playPlantRevival() {
    if (!this.canPlay('plantRevival', 500)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const notes = [587.33, 739.99, 880.0, 1174.66];
    const now = this.audioCtx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      const start = now + idx * 0.12;

      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  }

  /**
   * Sound effect: Dustbin install heavy clank + success chord
   */
  public playBinInstall() {
    if (!this.canPlay('binInstall', 400)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;
    // Clank (square drop)
    const osc1 = this.audioCtx.createOscillator();
    const gain1 = this.audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(output);
    osc1.start(now);
    osc1.stop(now + 0.2);

    // Chime
    const osc2 = this.audioCtx.createOscillator();
    const gain2 = this.audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.1);
    gain2.gain.setValueAtTime(0.2, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc2.connect(gain2);
    gain2.connect(output);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.5);
  }

  /**
   * Sound effect: Resident doorbell / prompt
   */
  public playResidentQuestion() {
    if (!this.canPlay('residentQuestion', 300)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;
    [659.25, 523.25].forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      const start = now + idx * 0.18;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  /**
   * Sound effect: Resident correct answer celebration
   */
  public playResidentCorrect() {
    if (!this.canPlay('residentCorrect', 300)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;
    [523.25, 659.25, 1046.5].forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.08;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  /**
   * Sound effect: Eco Lens cause-effect analysis sweep
   */
  public playEcoScan() {
    if (!this.canPlay('ecoScan', 300)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(output);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Sound effect: Health dashboard reveal swell
   */
  public playDashboardReveal() {
    if (!this.canPlay('dashboardReveal', 500)) return;
    const output = this.getOutput();
    if (!this.audioCtx || !output) return;

    const now = this.audioCtx.currentTime;
    [261.63, 329.63, 392.0, 523.25].forEach((freq, idx) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      osc.type = 'sine';
      const start = now + idx * 0.07;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.connect(gain);
      gain.connect(output);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  }
}

export const audio = new AudioService();
