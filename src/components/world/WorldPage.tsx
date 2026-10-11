import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BinType, ItemData, PlayerProfile } from '../../types/game';
import { GAME_LEVELS } from '../../data/levels';
import { ALL_BINS } from '../../data/bins';
import { GAME_ITEMS } from '../../data/items';
import { LEVEL_QUIZZES } from '../../data/quizzes';
import { AdaptiveSpawner } from '../../services/spawner';
import { audio } from '../../services/audio';
import { apiService } from '../../services/api';
import { WorldCanvas } from './WorldCanvas';
import { MascotDialogue } from '../game/MascotDialogue';
import { QuizModal } from '../game/QuizModal';
import { LevelEndModal } from '../game/LevelEndModal';
import { EcopediaModal } from '../game/EcopediaModal';
import { LevelSelectModal } from '../game/LevelSelectModal';
import { CountdownTimer } from '../game/CountdownTimer';
import { CleanlinessMeter } from '../game/CleanlinessMeter';
import { EcoLensOverlay, EcoLensButton } from '../game/EcoLensOverlay';
import { MissionResultsModal, MissionError } from '../game/MissionResultsModal';
import { MeadowHud } from '../game/meadows/MeadowHud';
import { VirtualJoystick } from '../game/meadows/VirtualJoystick';
import { NarrativeToken } from '../game/meadows/NarrativeBanner';
import { MissionTask } from '../game/meadows/MissionPanel';
import * as THREE from 'three';
import { MigsunGameController } from '../game/migsun/MigsunGameController';
import { MigsunSceneResult } from './migsunScene';
import { MeadowsSceneResult, MEADOWS_WASTE_PILE_CENTER } from './meadowsScene';
import { MeadowsPhoneModal } from '../game/meadows/MeadowsPhoneModal';
import { MeadowsLearningCardsModal } from '../game/meadows/MeadowsLearningCardsModal';
import { MeadowsResultsModal } from '../game/meadows/MeadowsResultsModal';
import { MeadowsItemManager } from './meadowsItemManager';
import {
  MEADOWS_WRONG_BIN_HINTS,
  MEADOWS_CONTAMINATION_SPEECHES,
} from '../game/meadows/meadowsPhase5Data';
import { MigsunPhase } from '../../types/game';
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
import { usePersistentBoolean } from '../../hooks/usePersistentBoolean';
import { useCoarsePointer, useIsPortrait } from '../../hooks/useMobileInput';
import {
  INITIAL_ECO_LENS_STATE,
  activateLens,
  deactivateLens,
  tickLensCooldown,
} from '../../systems/ecoLens';
import {
  ArrowLeft,
  Map,
  BookOpen,
  Volume2,
  VolumeX,
  BarChart2,
  Maximize2,
  Minimize2,
  Zap,
  Flame,
  Award,
  ChevronUp,
  ChevronDown,
  Info,
  X,
} from 'lucide-react';

export interface WorldPageProps {
  initialLevelId?: number;
  onExit?: () => void;
  onOpenTeacherReport?: () => void;
}

export const WorldPage: React.FC<WorldPageProps> = ({
  initialLevelId = 1,
  onExit,
  onOpenTeacherReport,
}) => {
  // ── Player & Level ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<PlayerProfile>(() => apiService.getLocalProfile());
  const [currentLevelId, setCurrentLevelId] = useState<number>(initialLevelId);

  const currentLevel = useMemo(
    () => GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0],
    [currentLevelId]
  );

  const isSocietyMode = currentLevel.sceneType === 'SOCIETY';
  const isMeadowsMode = currentLevel.sceneType === 'MEADOWS';
  const isMigsunMode = currentLevel.sceneType === 'MIGSUN';

  // Migsun state
  const [migsunPhase, setMigsunPhase] = useState<MigsunPhase>('CHARACTER_INTRO');
  const [migsunCompletedMissions, setMigsunCompletedMissions] = useState<number[]>([]);
  const migsunSceneRef = useRef<MigsunSceneResult | null>(null);

  // Meadows state machine (Phase 1 to Phase 8)
  const [meadowsPhase, setMeadowsPhase] = useState<
    'INTRO' | 'WALK_TO_PILE' | 'PILE_REACHED' | 'PHONE_CALL' | 'TRUCK_ARRIVING' | 'TRUCK_ARRIVED' | 'SORTING' | 'CLEANUP' | 'LEARNING_CARDS' | 'RESULTS'
  >('INTRO');
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState<boolean>(false);
  const [isLearningCardsOpen, setIsLearningCardsOpen] = useState<boolean>(false);
  const [truckDeparting, setTruckDeparting] = useState<boolean>(false);
  const [cleanupActive, setCleanupActive] = useState<boolean>(false);
  const [narratorSubtitle, setNarratorSubtitle] = useState<string | null>(null);
  const [meadowsInstruction, setMeadowsInstruction] = useState<string | null>(null);
  const [meadowsLensHint, setMeadowsLensHint] = useState<string | null>(null);
  const meadowsSceneRef = useRef<MeadowsSceneResult | null>(null);
  const meadowsItemsRef = useRef<MeadowsItemManager | null>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Phase 5 Sorting Challenge State
  const [meadowsSortedCount, setMeadowsSortedCount] = useState<number>(0);
  const [contaminationLevel, setContaminationLevel] = useState<number>(0);
  const [meadowsTimeTaken, setMeadowsTimeTaken] = useState<number>(0);

  // Virtual joystick input sink → WorldCanvas registers the engine here
  const joystickInputRef = useRef<((x: number, y: number) => void) | null>(null);
  const handleJoystickMove = useCallback((x: number, y: number) => {
    joystickInputRef.current?.(x, y);
  }, []);

  // Items available in society/migsun scene (all items whose bin is in this level's bins)
  const societyItemPool = useMemo(
    () => (isSocietyMode || isMigsunMode)
      ? GAME_ITEMS.filter((it) => currentLevel.bins.includes(it.bin))
      : [],
    [isSocietyMode, isMigsunMode, currentLevel.bins]
  );

  // Adaptive Spawner (used for non-society modes)
  const spawner = useMemo(
    () => new AdaptiveSpawner(currentLevel.bins, profile.itemStats),
    [currentLevel.bins, profile.itemStats]
  );

  // ── Core game state ─────────────────────────────────────────────────────────
  const [currentItem, setCurrentItem] = useState<ItemData | null>(null);
  const [itemsSorted, setItemsSorted] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(20);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);

  const [correctThrows, setCorrectThrows] = useState<number>(0);
  const [totalThrows, setTotalThrows] = useState<number>(0);
  const [levelErrors, setLevelErrors] = useState<{ itemId: string; bin: string }[]>([]);

  // Society-specific stats
  const [societySortedCount, setSocietySortedCount] = useState<number>(0);
  const [societyFirstTryCount, setSocietyFirstTryCount] = useState<number>(0);
  const [societyWrongAttempts, setSocietyWrongAttempts] = useState<number>(0);
  const [societyErrors, setSocietyErrors] = useState<MissionError[]>([]);
  // Track wrong attempts per item to trigger eco lens hint on 2nd wrong
  const wrongAttemptsRef = useRef<Record<string, number>>({});

  // ── Mascot ──────────────────────────────────────────────────────────────────
  const [mascotMessage, setMascotMessage] = useState<string>(
    `Welcome! Start in ${currentLevel.place}. Sort the waste.`
  );
  const [isPositiveFeedback, setIsPositiveFeedback] = useState<boolean>(true);
  // Touch devices start with the mascot collapsed so it never covers the view
  const isCoarsePointer = useCoarsePointer();
  const isPortrait = useIsPortrait();
  const [isMascotCollapsed, setIsMascotCollapsed] = useState<boolean>(isCoarsePointer);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showLevelEnd, setShowLevelEnd] = useState<boolean>(false);
  const [showMissionResults, setShowMissionResults] = useState<boolean>(false);
  const [showEcopedia, setShowEcopedia] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showInfoMenu, setShowInfoMenu] = useState<boolean>(false);
  const [recentlyUnlockedItem, setRecentlyUnlockedItem] = useState<ItemData | null>(null);

  // ── Audio & Accessibility ───────────────────────────────────────────────────
  const [soundEnabled, setSoundEnabled] = usePersistentBoolean('ecosort_sound_enabled', true);
  const [slowMode, setSlowMode] = usePersistentBoolean('ecosort_slow_mode', false);

  // Keep the audio service in sync with the persisted preferences
  useEffect(() => {
    audio.setSoundEnabled(soundEnabled);
    audio.setSlowMode(slowMode);
  }, [soundEnabled, slowMode]);

  // Constant background music while the game is on screen
  useEffect(() => {
    if (soundEnabled) {
      audio.startMusic();
    } else {
      audio.stopMusic();
    }
    return () => audio.stopMusic();
  }, [soundEnabled]);

  // ── World mode ────────────────────────────────────────────────────────────────
  const [worldMode, setWorldMode] = useState<'EXPLORE' | 'STATION_SORT'>('EXPLORE');

  // ── Truck arrival (Society mode) ──────────────────────────────────────────────────
  const [truckArriving, setTruckArriving] = useState<boolean>(false);
  // Results modal is delayed so the truck drive-in animation stays on screen
  const truckModalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (truckModalTimerRef.current) clearTimeout(truckModalTimerRef.current);
  }, []);

  // ── Fullscreen ──────────────────────────────────────────────────────────────
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // ── Countdown Timer (Society mode) ─────────────────────────────────────────
  const timerDuration = currentLevel.timeLimit ?? 90;
  const timer = useCountdownTimer(timerDuration);

  // ── Portrait gate: pause the timer & freeze input ─────────────────────────
  // The "turn sideways" overlay is visual only; without this, rotating
  // mid-mission keeps burning timer seconds and keyboard input still moves Kai.
  const timerRef = useRef(timer);
  useEffect(() => {
    timerRef.current = timer;
  }, [timer]);
  const pausedByPortraitRef = useRef(false);
  // Set once the society mission ends so a portrait→landscape resume can never
  // restart a finished timer and re-run finishSocietyLevel.
  const missionOverRef = useRef(false);
  useEffect(() => {
    const blocked = isCoarsePointer && isPortrait;
    if (blocked) {
      if (timerRef.current.isRunning) {
        timerRef.current.pause();
        pausedByPortraitRef.current = true;
      }
    } else if (pausedByPortraitRef.current) {
      pausedByPortraitRef.current = false;
      if (!timerRef.current.isExpired && !missionOverRef.current) {
        timerRef.current.start();
      }
    }
  }, [isCoarsePointer, isPortrait]);

  useEffect(() => {
    if (!(isCoarsePointer && isPortrait)) return;
    // Capture-phase stop: blocks game key/pointer handlers (window + React root)
    // while the gate is up. Browser defaults (refresh, back) still work.
    const freeze = (e: Event) => {
      e.stopImmediatePropagation();
    };
    window.addEventListener('keydown', freeze, true);
    window.addEventListener('keyup', freeze, true);
    window.addEventListener('pointerdown', freeze, true);
    window.addEventListener('pointermove', freeze, true);
    window.addEventListener('pointerup', freeze, true);
    window.addEventListener('wheel', freeze, true);
    return () => {
      window.removeEventListener('keydown', freeze, true);
      window.removeEventListener('keyup', freeze, true);
      window.removeEventListener('pointerdown', freeze, true);
      window.removeEventListener('pointermove', freeze, true);
      window.removeEventListener('pointerup', freeze, true);
      window.removeEventListener('wheel', freeze, true);
    };
  }, [isCoarsePointer, isPortrait]);

  // ── Eco Lens (Society mode) ─────────────────────────────────────────────────
  const [lensState, setLensState] = useState(INITIAL_ECO_LENS_STATE);
  const [lensUseCount, setLensUseCount] = useState<number>(0);

  // Lens cooldown tick (society + meadows — both expose the lens ability)
  useEffect(() => {
    if ((!isSocietyMode && !isMeadowsMode) || lensState.cooldown <= 0) return;
    const interval = setInterval(() => {
      setLensState((prev) => tickLensCooldown(prev, 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSocietyMode, isMeadowsMode, lensState.cooldown]);

  // Timer warning/urgent sound cues
  const prevTimeRef = useRef<number>(timerDuration);
  useEffect(() => {
    if ((!isSocietyMode && !isMeadowsMode) || !timer.isRunning) return;
    if (prevTimeRef.current !== timer.timeLeft) {
      if (timer.timeLeft === 30) {
        audio.playTimerWarning();
        const msg = isMeadowsMode ? '30 seconds left! Sort the waste fast!' : 'The truck is on its way! Hurry!';
        if (isMeadowsMode) setMeadowsInstruction(msg);
        else setMascotMessage(msg);
        audio.speak(msg);
      } else if (timer.timeLeft === 10) {
        audio.playTruckHorn();
        const msg = 'Ten seconds left! Sort fast!';
        if (isMeadowsMode) setMeadowsInstruction(msg);
        else setMascotMessage(msg);
        audio.speak(msg);
      }
      prevTimeRef.current = timer.timeLeft;
    }
  }, [timer.timeLeft, timer.isRunning, isSocietyMode, isMeadowsMode]);

  // Timer expired → end society level or auto-collect unsorted items in Meadows
  useEffect(() => {
    if (!timer.isExpired) return;
    if (isSocietyMode) {
      audio.playTruckJingle();
      finishSocietyLevel();
    } else if (isMeadowsMode && meadowsPhase === 'SORTING') {
      // 5.5 Time pressure: Timer reaches 0: unsorted items are collected automatically, counted as mixed
      audio.playTruckHorn();
      setMeadowsTimeTaken(timerDuration);
      setMeadowsPhase('CLEANUP');
      setContaminationLevel(3);
      setMeadowsInstruction('Time up! Truck collected remaining mixed waste.');
      audio.speak('Time is up. The truck collected the remaining mixed waste.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isExpired, isSocietyMode, isMeadowsMode, meadowsPhase]);

  // ── Meadows Phase 1 (Intro) & Phase 2 (Walk to Pile) Sequence ───────────
  useEffect(() => {
    if (!isMeadowsMode) return;

    // Reset phase state
    setMeadowsPhase('INTRO');
    setMeadowsInstruction(null);
    setMeadowsLensHint(null);
    meadowsSceneRef.current?.setPathGuideVisible(true);

    // Clear any previous timers
    introTimerRef.current.forEach(clearTimeout);
    introTimerRef.current = [];

    // Line 1 (0s)
    const line1 = 'Welcome to Green Meadows Residency. Look around. Same place, two different worlds.';
    setNarratorSubtitle(line1);
    audio.speak(line1);

    // Line 2 (5.5s)
    const t1 = setTimeout(() => {
      const line2 = 'On the right, a garden full of life. On the left, a waste pile that has been growing for weeks.';
      setNarratorSubtitle(line2);
      audio.speak(line2);
    }, 5500);

    // Line 3 (12.0s)
    const t2 = setTimeout(() => {
      const line3 = 'That pile smells, attracts flies and rats, and can make people sick. Today, you will change that.';
      setNarratorSubtitle(line3);
      audio.speak(line3);
    }, 12000);

    // Transition to Phase 2: Walk to Pile (18.5s)
    const t3 = setTimeout(() => {
      setMeadowsPhase('WALK_TO_PILE');
      const step1 = 'Step 1: Run to the waste pile on the left.';
      setNarratorSubtitle(null);
      setMeadowsInstruction(step1);
      audio.speak(step1);
    }, 18500);

    introTimerRef.current = [t1, t2, t3];

    return () => {
      introTimerRef.current.forEach(clearTimeout);
      introTimerRef.current = [];
    };
  }, [isMeadowsMode, currentLevelId]);

  const handleSkipIntro = useCallback(() => {
    introTimerRef.current.forEach(clearTimeout);
    introTimerRef.current = [];
    setMeadowsPhase('WALK_TO_PILE');
    const step1 = 'Step 1: Run to the waste pile on the left.';
    setNarratorSubtitle(null);
    setMeadowsInstruction(step1);
    audio.speak(step1);
  }, []);

  // ── Level start / reset ─────────────────────────────────────────────────────
  useEffect(() => {
    setItemsSorted(0);
    setScore(0);
    setStreak(0);
    setEnergy(20);
    setCorrectThrows(0);
    setTotalThrows(0);
    setLevelErrors([]);
    setShowQuiz(false);
    setShowLevelEnd(false);
    setShowMissionResults(false);
    setSocietySortedCount(0);
    setSocietyFirstTryCount(0);
    setSocietyWrongAttempts(0);
    setSocietyErrors([]);
    setLensState(INITIAL_ECO_LENS_STATE);
    setLensUseCount(0);
    setTruckArriving(false);
    missionOverRef.current = false;
    if (truckModalTimerRef.current) {
      clearTimeout(truckModalTimerRef.current);
      truckModalTimerRef.current = null;
    }
    wrongAttemptsRef.current = {};

    if (isMigsunMode) {
      setCurrentItem(null);
      timer.reset();
      setMigsunPhase('CHARACTER_INTRO');
      setMigsunCompletedMissions([]);
      const msg = 'Welcome to Migsun Vilasa! Sort the waste to restore the area.';
      setMascotMessage(msg);
      setIsPositiveFeedback(true);
      audio.speak(msg);
    } else if (isSocietyMode) {
      // Society: player picks up items from ground — no pre-spawned item
      setCurrentItem(null);
      timer.reset();
      const msg = 'Welcome! Walk around and pick up litter. Sort it!';
      setMascotMessage(msg);
      setIsPositiveFeedback(true);
      audio.speak(msg);
    } else if (isMeadowsMode) {
      setCurrentItem(null);
      setMeadowsSortedCount(0);
      setContaminationLevel(0);
      timer.reset();
      const msg = 'Welcome to Green Meadows. Clean the path!';
      setMascotMessage(msg);
      setIsPositiveFeedback(true);
      audio.speak(msg);
    } else {
      // Classic modes: spawn first item on table
      const firstItem = spawner.getNextItem();
      setCurrentItem(firstItem);
      const msg = `Welcome to ${currentLevel.name}. Walk to table.`;
      setMascotMessage(msg);
      setIsPositiveFeedback(true);
      audio.speak(msg);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelId]);

  // ── Society / Meadows: player picks up litter ─────────────────────────────
  const handlePickupSocietyItem = useCallback((item: ItemData) => {
    setCurrentItem(item);
    // Start timer on first pickup
    if (!timer.isRunning && !timer.isExpired) {
      timer.start();
    }
    const msg = `You picked up ${item.name}. Find the right bin!`;
    setMascotMessage(msg);
    setIsPositiveFeedback(true);
  }, [timer]);

  // ── Activate Eco Lens ───────────────────────────────────────────────────────
  const handleActivateEcoLens = useCallback(() => {
    if (!currentItem) return;
    const next = activateLens(lensState, currentItem.id, currentItem.bin);
    if (next) {
      setLensState(next);
      setLensUseCount((c) => c + 1);
      audio.playLensActivate();
      const msg = `Eco Lens: ${currentItem.name} goes in the ${ALL_BINS[currentItem.bin].label}.`;
      setMascotMessage(msg);
    }
  }, [lensState, currentItem]);

  const handleDeactivateLens = useCallback(() => {
    setLensState((prev) => deactivateLens(prev));
  }, []);

  // ── Meadows Eco Lens (UI pass: ability has no items to scan yet) ─────────
  // Drives the same energy/cooldown state machine so the segmented bar and
  // cooldown badge behave exactly like the real ability.
  const lensAutoOffRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (lensAutoOffRef.current) clearTimeout(lensAutoOffRef.current);
  }, []);
  const handleMeadowsLens = useCallback(() => {
    const next = activateLens(lensState, 'meadows_scan', 'wet');
    if (!next) return;
    setLensState(next);
    setLensUseCount((c) => c + 1);
    audio.playLensActivate();
    if (lensAutoOffRef.current) clearTimeout(lensAutoOffRef.current);
    lensAutoOffRef.current = setTimeout(() => {
      setLensState((prev) => (prev.isActive ? deactivateLens(prev) : prev));
    }, 3000);
  }, [lensState]);

  // Proximity detection for Phase 2: Walk to waste pile
  const pileTriggeredRef = useRef(false);
  useEffect(() => {
    pileTriggeredRef.current = false;
  }, [currentLevelId]);

  const handleMeadowsPlayerMove = useCallback((pos: THREE.Vector3) => {
    if (!isMeadowsMode) return;

    // Phase 2 proximity trigger to waste pile
    if (!pileTriggeredRef.current) {
      const dist = pos.distanceTo(MEADOWS_WASTE_PILE_CENTER);
      if (dist < 4.0) {
        pileTriggeredRef.current = true;
        setMeadowsPhase('PILE_REACHED');
        setMeadowsInstruction(null);

        // Eco lens button glows + hint appears
        setMeadowsLensHint('Tip: Tap Eco Lens to see what each item is made of.');
        audio.playCorrect();

        // Narrator: "That is a lot of waste. We cannot carry all of it ourselves. Let us call the municipal garbage truck."
        const narratorLine = 'That is a lot of waste. We cannot carry all of it ourselves. Let us call the municipal garbage truck.';
        setNarratorSubtitle(narratorLine);
        audio.speak(narratorLine);

        // After narrator line finishes (~5.5s), transition into Phase 3: Phone call
        setTimeout(() => {
          setMeadowsPhase('PHONE_CALL');
          setNarratorSubtitle(null);
          setIsPhoneModalOpen(true);
        }, 5500);
      }
    }
  }, [isMeadowsMode]);

  // Phase 3 Phone Call completion -> Phase 4 Truck Arrival
  const handleMeadowsPhoneFinished = useCallback(() => {
    setIsPhoneModalOpen(false);
    setMeadowsPhase('TRUCK_ARRIVING');

    // Mission update toast
    const missionToast = 'Truck arriving in 90 seconds. Sort the waste before it arrives!';
    setMeadowsInstruction(missionToast);
    audio.speak(missionToast);

    // Start the 90s countdown timer
    timer.start();

    // Trigger Phase 4: Garbage truck driving in
    setTruckArriving(true);

    // Cutscene sequence: Truck drives in (takes ~4.5s)
    setTimeout(() => {
      // Truck stops, horn sounds
      audio.playTruckHorn();
      setMeadowsPhase('TRUCK_ARRIVED');

      // Four colour-coded bins placed beside truck
      meadowsSceneRef.current?.showTruckBins(true);

      // Narrator speech adhering to ASD-STE100 guidelines
      const narratorArrival =
        'The truck is here, but it only takes waste that has been separated. Mixed waste is hard to recycle or compost. Let’s sort it.';
      setNarratorSubtitle(narratorArrival);
      audio.speak(narratorArrival);

      // Transition to Phase 5: The Sorting Challenge
      setTimeout(() => {
        setMeadowsPhase('SORTING');
        setNarratorSubtitle(null);
        setMeadowsInstruction('Walk to waste items and pick them up to sort.');
      }, 6500);
    }, 4500);
  }, [timer]);



  // Phase 7 Learning Cards Finish -> Transition to Results
  const handleMeadowsFinishLearningCards = useCallback(() => {
    setIsLearningCardsOpen(false);
    setMeadowsPhase('RESULTS');
    const earnedStars = meadowsSortedCount >= 9 ? 3 : meadowsSortedCount >= 6 ? 2 : 1;

    const updatedStars = { ...profile.stars, [currentLevelId]: earnedStars };
    const updatedHighScores = {
      ...profile.highScores,
      [currentLevelId]: Math.max(profile.highScores[currentLevelId] || 0, score),
    };
    const updatedProfile: PlayerProfile = {
      ...profile,
      stars: updatedStars,
      highScores: updatedHighScores,
      totalScore: profile.totalScore + score,
    };
    setProfile(updatedProfile);
    apiService.saveLocalProfile(updatedProfile);

    // Narrator line for Phase 8 level end
    const narratorEnd = 'The waste pile is gone, but the land is still bare. Next, let’s bring this side back to life.';
    setNarratorSubtitle(narratorEnd);
    audio.speak(narratorEnd);

    setShowMissionResults(true);
  }, [contaminationLevel, meadowsSortedCount, profile, currentLevelId, score]);

  // ── Throw / Sort item ───────────────────────────────────────────────────────
  const handleThrowItem = useCallback((targetBin: BinType) => {
    if (!currentItem || isThrowing) return;
    setIsThrowing(true);
    audio.playThrow();
    setTotalThrows((prev) => prev + 1);

    const isCorrect = currentItem.bin === targetBin;
    spawner.recordAttempt(currentItem.id, isCorrect);

    if (isCorrect) {
      audio.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const streakBonus = newStreak >= 3 ? 5 : 0;
      const pts = 10 + streakBonus;
      setScore((prev) => prev + pts);
      setCorrectThrows((prev) => prev + 1);
      setEnergy((prev) => Math.min(100, prev + 12));

      if (isSocietyMode || isMigsunMode) {
        const itemWrong = wrongAttemptsRef.current[currentItem.id] ?? 0;
        setSocietySortedCount((c) => c + 1);
        if (itemWrong === 0) setSocietyFirstTryCount((c) => c + 1);
        wrongAttemptsRef.current[currentItem.id] = 0;
      }

      const successMsg = `${currentItem.name} → ${ALL_BINS[targetBin].label}. ${currentItem.fact}`;
      setMascotMessage(successMsg);
      setIsPositiveFeedback(true);
      audio.speak(successMsg);

      // Unlock Ecopedia card
      if (!profile.unlockedCards.includes(currentItem.id)) {
        const updatedCards = [...profile.unlockedCards, currentItem.id];
        setRecentlyUnlockedItem(currentItem);
        const updatedProfile = { ...profile, unlockedCards: updatedCards };
        setProfile(updatedProfile);
        apiService.saveLocalProfile(updatedProfile);
      }

      setTimeout(() => {
        setIsThrowing(false);

        if (isMeadowsMode) {
          // In Meadows: sortItem in meadowsItemsRef and advance count
          meadowsItemsRef.current?.sortItem(currentItem.id);
          setCurrentItem(null);
          setMeadowsSortedCount((c) => {
            const next = c + 1;
            if (next >= 10) {
              setMeadowsPhase('CLEANUP');
              setMeadowsInstruction('All waste sorted! Clean the area.');
              audio.playCelebration();
              const elapsed = Math.max(1, timerDuration - timer.timeLeft);
              setMeadowsTimeTaken(elapsed);
              timer.pause();

              // Start 3-second transformation: dirty mud blends to cleaner earth, waste disappears
              setCleanupActive(true);

              // After 3s cleanup transformation, workers/robotic arm lift bins and truck drives away
              setTimeout(() => {
                setTruckDeparting(true);
                audio.playTruckJingle();

                // After truck departs (~4.5s), transition into Phase 7: The Learning Pop-Ups
                setTimeout(() => {
                  setMeadowsPhase('LEARNING_CARDS');
                  setIsLearningCardsOpen(true);
                }, 4500);
              }, 3000);
            }
            return next;
          });
        } else if (isMigsunMode) {
          setCurrentItem(null);
          setSocietySortedCount((c) => {
            if (c >= currentLevel.targetCount) {
              timer.pause();
              // Trigger truck arrival sequence with Gadi Wala Aaya
              setTruckArriving(true);
              audio.playGadiWalaAaya();
              setMigsunPhase('TRUCK_ARRIVAL');
              setTimeout(() => {
                setMigsunPhase('AREA_RESTORED');
              }, 4000);
            }
            return c;
          });
        } else if (isSocietyMode) {
          // In society: clear held item; next pickup triggers via 3D proximity
          setCurrentItem(null);
          // Check if all items are sorted (targetCount reached)
          setSocietySortedCount((c) => {
            if (c >= currentLevel.targetCount) {
              timer.pause();
              finishSocietyLevel();
            }
            return c;
          });
        } else {
          const nextCount = itemsSorted + 1;
          setItemsSorted(nextCount);
          if (nextCount >= currentLevel.targetCount) {
            setCurrentItem(null);
            const quizzes = LEVEL_QUIZZES[currentLevelId];
            if (quizzes && quizzes.length > 0) {
              setShowQuiz(true);
            } else {
              finishLevel();
            }
          } else {
            setCurrentItem(spawner.getNextItem());
          }
        }
      }, slowMode ? 1300 : 700);

    } else {
      // Wrong bin
      audio.playIncorrect();
      setStreak(0);
      setLevelErrors((prev) => [...prev, { itemId: currentItem.id, bin: targetBin }]);

      if (isMeadowsMode) {
        // Meadows mode wrong throw: contamination increases, drop item back to ground
        meadowsItemsRef.current?.dropItem(currentItem.id);
        setCurrentItem(null);

        setContaminationLevel((lvl) => {
          const next = Math.min(3, lvl + 1);
          const narratorLine = MEADOWS_CONTAMINATION_SPEECHES[next];
          if (narratorLine) {
            setNarratorSubtitle(narratorLine);
            audio.speak(narratorLine);
          }
          return next;
        });

        const hint = MEADOWS_WRONG_BIN_HINTS[currentItem.id] || 'Put this item into its correct bin.';
        setMeadowsInstruction(`Tip: ${hint}`);

        setTimeout(() => setIsThrowing(false), slowMode ? 1300 : 700);
      } else if (isSocietyMode || isMigsunMode) {
        // Track wrong attempts per item
        const prev = wrongAttemptsRef.current[currentItem.id] ?? 0;
        wrongAttemptsRef.current[currentItem.id] = prev + 1;
        setSocietyWrongAttempts((c) => c + 1);

        // Log error for results screen
        setSocietyErrors((errs) => {
          const alreadyLogged = errs.some(
            (e) => e.itemId === currentItem.id && e.triedBin === targetBin
          );
          if (alreadyLogged) return errs;
          return [
            ...errs,
            {
              itemId: currentItem.id,
              itemName: currentItem.name,
              triedBin: targetBin,
              correctBin: currentItem.bin,
              fact: currentItem.fact,
            },
          ];
        });

        const errorMsg = `Not that bin! ${currentItem.name} goes in the ${ALL_BINS[currentItem.bin].label}.`;
        setMascotMessage(errorMsg);
        setIsPositiveFeedback(false);
        audio.speak(errorMsg);

        // Auto-hint: 2nd wrong attempt → activate eco lens
        if ((wrongAttemptsRef.current[currentItem.id] ?? 0) >= 2) {
          const next = activateLens(lensState, currentItem.id, currentItem.bin);
          if (next) {
            setLensState(next);
            setLensUseCount((c) => c + 1);
            audio.playLensActivate();
          }
        }

        // In society mode: item stays in hand (currentItem unchanged), just release throw lock
        setTimeout(() => setIsThrowing(false), slowMode ? 1300 : 700);
      } else {
        // Classic mode: error + advance to next item
        const errorMsg = `Not quite. Put ${currentItem.name} in the ${ALL_BINS[currentItem.bin].label}. ${currentItem.fact}`;
        setMascotMessage(errorMsg);
        setIsPositiveFeedback(false);
        audio.speak(errorMsg);

        const nextCount = itemsSorted + 1;
        setItemsSorted(nextCount);

        setTimeout(() => {
          setIsThrowing(false);
          if (nextCount >= currentLevel.targetCount) {
            setCurrentItem(null);
            const quizzes = LEVEL_QUIZZES[currentLevelId];
            if (quizzes && quizzes.length > 0) {
              setShowQuiz(true);
            } else {
              finishLevel();
            }
          } else {
            setCurrentItem(spawner.getNextItem());
          }
        }, slowMode ? 1300 : 700);
      }
    }
  }, [
    currentItem, isThrowing, streak, energy, profile,
    itemsSorted, currentLevel.targetCount, currentLevelId,
    slowMode, spawner, isSocietyMode, timer, lensState,
  ]);

  // ── Finish Society Level ────────────────────────────────────────────────────
  const finishSocietyLevel = useCallback(() => {
    missionOverRef.current = true;
    const accuracy = societySortedCount > 0
      ? Math.round((societyFirstTryCount / societySortedCount) * 100)
      : 0;
    const earnedStars = accuracy >= 90 ? 3 : accuracy >= 60 ? 2 : 1;
    const litterLeft = Math.max(0, currentLevel.targetCount - societySortedCount);

    const updatedStars = { ...profile.stars, [currentLevelId]: earnedStars };
    const updatedHighScores = {
      ...profile.highScores,
      [currentLevelId]: Math.max(profile.highScores[currentLevelId] || 0, score),
    };
    const updatedProfile: PlayerProfile = {
      ...profile,
      stars: updatedStars,
      highScores: updatedHighScores,
      totalScore: profile.totalScore + score,
    };
    setProfile(updatedProfile);
    apiService.saveLocalProfile(updatedProfile);
    apiService.saveProgress({
      userId: profile.userId,
      nickname: profile.nickname,
      levelId: currentLevelId,
      score,
      stars: earnedStars,
      accuracy,
      errors: levelErrors,
      unlockedCards: profile.unlockedCards,
    });

    // Let the truck drive in before the full-screen results modal covers it
    setTruckArriving(true);
    audio.playCelebration();
    if (truckModalTimerRef.current) clearTimeout(truckModalTimerRef.current);
    truckModalTimerRef.current = setTimeout(() => setShowMissionResults(true), 5200);
    void litterLeft; // used in MissionResultsModal via state
  }, [societySortedCount, societyFirstTryCount, currentLevel.targetCount, profile, currentLevelId, score, levelErrors]);

  // ── Finish Classic Level ────────────────────────────────────────────────────
  const finishLevel = useCallback(() => {
    const accuracy =
      totalThrows > 0 ? Math.round((correctThrows / totalThrows) * 100) : 100;
    const earnedStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    const updatedStars = { ...profile.stars, [currentLevelId]: earnedStars };
    const updatedHighScores = {
      ...profile.highScores,
      [currentLevelId]: Math.max(profile.highScores[currentLevelId] || 0, score),
    };
    const updatedProfile: PlayerProfile = {
      ...profile,
      stars: updatedStars,
      highScores: updatedHighScores,
      totalScore: profile.totalScore + score,
    };
    setProfile(updatedProfile);
    apiService.saveLocalProfile(updatedProfile);
    apiService.saveProgress({
      userId: profile.userId,
      nickname: profile.nickname,
      levelId: currentLevelId,
      score,
      stars: earnedStars,
      accuracy,
      errors: levelErrors,
      unlockedCards: profile.unlockedCards,
    });
    setShowQuiz(false);
    setShowLevelEnd(true);
  }, [totalThrows, correctThrows, currentLevelId, profile, score, levelErrors]);

  // ── Level navigation ────────────────────────────────────────────────────────
  const handleNextLevel = () => {
    setShowLevelEnd(false);
    setShowMissionResults(false);
    setWorldMode('EXPLORE');
    setCurrentLevelId((prev) => (prev < GAME_LEVELS.length ? prev + 1 : 1));
    const msg = 'Great work! On to the next mission.';
    setMascotMessage(msg);
    audio.speak(msg);
  };

  const handleRetryLevel = () => {
    setShowLevelEnd(false);
    setShowMissionResults(false);
    setCurrentLevelId((prev) => prev); // triggers reset effect
  };

  // ── Accessibility toggles ───────────────────────────────────────────────────
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  const handleToggleSlowMode = useCallback(() => {
    setSlowMode((prev) => !prev);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  const currentAccuracy =
    totalThrows > 0 ? Math.round((correctThrows / totalThrows) * 100) : 100;

  // ── HUD: LEFT ───────────────────────────────────────────────────────────────
  // Memoized so the 1 Hz countdown tick doesn't recreate HUD prop objects and
  // re-render the whole WorldCanvas subtree (props change identity every render).
  const topBarExtrasLeft = useMemo(
    () => (
      <div className="flex items-center gap-1 shrink-0">
        {onExit && (
          <button
            onClick={onExit}
            title="Exit to menu"
            aria-label="Exit"
            className="tactile-btn flex items-center justify-center gap-1 px-2 py-1 sm:px-2.5 sm:py-1.5 min-h-[30px] sm:min-h-[34px] min-w-[30px] sm:min-w-[34px] bg-white hover:bg-slate-100 text-slate-950 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-fun font-black border-2 border-slate-900 shadow-retro-xs transition-all active:translate-x-[1px] active:translate-y-[1px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="text-[11px] sm:text-xs">Exit</span>
          </button>
        )}
      </div>
    ),
    [onExit]
  );

  // ── HUD: CENTER ─────────────────────────────────────────────────────────────
  const topBarCenter = useMemo(
    () => (
    <div className="flex items-center gap-1 sm:gap-1.5 bg-[#FDFBF7]/95 border-2 border-slate-900 rounded-xl sm:rounded-2xl px-1.5 sm:px-3 py-0.5 sm:py-1.5 shadow-retro-xs sm:shadow-retro text-slate-900 backdrop-blur-sm flex-nowrap min-w-0">

      {/* Level name */}
      <span className="hidden lg:inline-block text-[11px] font-fun font-black text-slate-700 uppercase">
        {currentLevel.name}
      </span>

      {isSocietyMode ? (
        <>
          {/* Countdown Timer */}
          <div className="hidden sm:block h-4 w-[2px] bg-slate-300" />
          <CountdownTimer
            timeLeft={timer.timeLeft}
            isWarning={timer.isWarning}
            isUrgent={timer.isUrgent}
            isExpired={timer.isExpired}
          />

          {/* Cleanliness Meter */}
          <div className="h-3.5 sm:h-4 w-[2px] bg-slate-300" />
          <CleanlinessMeter
            collected={societySortedCount}
            total={currentLevel.targetCount}
          />

          {/* Score */}
          <div className="h-3.5 sm:h-4 w-[2px] bg-slate-300" />
          <div className="flex items-center gap-1 bg-amber-300 px-1.5 py-0.5 sm:px-2 rounded-lg border border-slate-900 font-fun font-black text-[11px] sm:text-xs text-slate-950 shrink-0">
            <Award className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>{score}</span>
          </div>
        </>
      ) : (
        <>
          {/* Classic mode: item counter + energy + score */}
          <span className="text-xs font-fun font-black bg-amber-200 px-2 py-0.5 rounded-lg border border-slate-900">
            Item {Math.min(itemsSorted + 1, currentLevel.targetCount)} / {currentLevel.targetCount}
          </span>

          <div className="h-4 w-[2px] bg-slate-300" />

          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500 shrink-0" />
            <div className="w-16 sm:w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-900">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(6, energy))}%` }}
              />
            </div>
            <span className="text-xs font-fun font-black text-emerald-800">{Math.round(energy)}%</span>
          </div>

          <div className="h-4 w-[2px] bg-slate-300" />

          <div className="flex items-center gap-1 bg-amber-300 px-2 py-0.5 rounded-lg border border-slate-900 font-fun font-black text-xs text-slate-950">
            <Award className="w-3.5 h-3.5" />
            <span>{score}</span>
            <span className="hidden sm:inline">&nbsp;PTS</span>
          </div>

          {streak >= 2 && (
            <div className="flex items-center gap-1 bg-orange-400 px-2 py-0.5 rounded-lg border border-slate-900 font-fun font-black text-xs text-slate-950 animate-bounce">
              <Flame className="w-3.5 h-3.5 fill-amber-300 stroke-slate-950" />
              <span>{streak}x</span>
            </div>
          )}
        </>
      )}
    </div>
    ),
    [
      isSocietyMode,
      currentLevel.name,
      currentLevel.targetCount,
      timer.timeLeft,
      timer.isWarning,
      timer.isUrgent,
      timer.isExpired,
      societySortedCount,
      score,
      itemsSorted,
      energy,
      streak,
    ]
  );

  // ── HUD: RIGHT ──────────────────────────────────────────────────────────────
  const topBarExtrasRight = useMemo(
    () => (
    <div className="flex items-center gap-1 sm:gap-1.5 relative pointer-events-auto">
      {/* Eco Lens button (society mode only) */}
      {isSocietyMode && (
        <EcoLensButton
          lensState={lensState}
          onActivate={handleActivateEcoLens}
          disabled={!currentItem || isThrowing}
        />
      )}

      {/* Info Icon Button: normally closed, opens all options & buttons on click */}
      <div className="relative">
        <button
          onClick={() => setShowInfoMenu((prev) => !prev)}
          title="Game options & info"
          aria-label="Game options and info"
          aria-expanded={showInfoMenu}
          className="p-1.5 sm:p-2 min-h-[30px] min-w-[30px] sm:min-h-[34px] sm:min-w-[34px] flex items-center justify-center bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-xs rounded-lg sm:rounded-xl font-fun font-black transition-all active:translate-x-[1px] active:translate-y-[1px]"
        >
          {showInfoMenu ? (
            <X className="w-3.5 h-3.5 text-slate-800" />
          ) : (
            <Info className="w-3.5 h-3.5 text-emerald-600" />
          )}
        </button>

        {/* Info dropdown popup menu */}
        {showInfoMenu && (
          <div className="absolute right-0 top-full mt-2 bg-[#FDFBF7] border-2 border-slate-900 shadow-retro-md rounded-2xl p-2 flex flex-col gap-1.5 z-50 min-w-[170px] animate-in fade-in zoom-in-95">
            {/* Missions */}
            <button
              onClick={() => {
                setShowInfoMenu(false);
                setShowLevelSelect(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-xs rounded-xl text-xs font-fun font-black transition-all text-left"
            >
              <Map className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Missions</span>
            </button>

            {/* Ecopedia */}
            <button
              onClick={() => {
                setShowInfoMenu(false);
                setShowEcopedia(true);
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-xs rounded-xl text-xs font-fun font-black transition-all text-left"
            >
              <BookOpen className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Cards ({profile.unlockedCards.length})</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="flex items-center justify-between px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-xs rounded-xl text-xs font-fun font-black transition-all text-left"
            >
              <span className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>Sound</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase">{soundEnabled ? 'On' : 'Off'}</span>
            </button>

            {/* Slow Mode */}
            <button
              onClick={handleToggleSlowMode}
              className={`flex items-center justify-between px-3 py-2 border-2 border-slate-900 shadow-retro-xs rounded-xl text-xs font-fun font-black transition-all text-left ${
                slowMode ? 'bg-amber-300 text-slate-950' : 'bg-white hover:bg-slate-100 text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">🐢</span>
                <span>Slow Mode</span>
              </span>
              <span className="text-[10px] text-slate-500 uppercase">{slowMode ? 'On' : 'Off'}</span>
            </button>

            {/* Fullscreen (if supported) */}
            {typeof document !== 'undefined' && 'requestFullscreen' in document.documentElement && (
              <button
                onClick={() => {
                  setShowInfoMenu(false);
                  handleToggleFullscreen();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-xs rounded-xl text-xs font-fun font-black transition-all text-left"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-slate-700 shrink-0" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-slate-700 shrink-0" />
                )}
                <span>{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
              </button>
            )}

            {/* Teacher Report */}
            {onOpenTeacherReport && (
              <button
                onClick={() => {
                  setShowInfoMenu(false);
                  onOpenTeacherReport();
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-xs rounded-xl text-xs font-fun font-black transition-all text-left"
              >
                <BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Teacher Report</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
    ),
    [
      isSocietyMode,
      lensState,
      handleActivateEcoLens,
      currentItem,
      isThrowing,
      showInfoMenu,
      profile.unlockedCards.length,
      soundEnabled,
      handleToggleSound,
      slowMode,
      handleToggleSlowMode,
      isFullscreen,
      handleToggleFullscreen,
      onOpenTeacherReport,
      setShowLevelSelect,
      setShowEcopedia,
    ]
  );

  // ── HUD: MEADOWS (Level 7 dark-glass overlay) ─────────────────────────────
  const meadowsNarrative = useMemo<NarrativeToken[]>(
    () => [
      { text: 'Clean the path. Sort ' },
      { text: 'waste', highlight: 'waste' },
      { text: '. Bring ' },
      { text: 'life', highlight: 'life' },
      { text: ' back.' },
    ],
    []
  );

  const meadowsTasks = useMemo<MissionTask[]>(
    () => [
      {
        id: 'clean',
        label: 'Clean the waste area',
        done: meadowsPhase === 'CLEANUP' || meadowsSortedCount >= 10,
      },
      {
        id: 'sort',
        label: `Sort waste correctly (${meadowsSortedCount}/10)`,
        done: meadowsSortedCount >= 10,
      },
      {
        id: 'garden',
        label: 'Restore the garden',
        done: meadowsPhase === 'CLEANUP',
      },
    ],
    [meadowsPhase, meadowsSortedCount]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-screen h-dvh overflow-hidden bg-slate-950 z-40 select-none safe-area-shell">
      <WorldCanvas
        fullScreen={true}
        currentLevelId={currentLevelId}
        currentItem={currentItem}
        activeBins={currentLevel.bins}
        energyLevel={energy}
        onThrowItem={handleThrowItem}
        isThrowing={isThrowing}
        slowMode={slowMode}
        worldMode={worldMode}
        onSetWorldMode={setWorldMode}
        topBarExtrasLeft={topBarExtrasLeft}
        topBarCenter={topBarCenter}
        topBarExtrasRight={topBarExtrasRight}
        societyItemPool={societyItemPool}
        onPickupSocietyItem={handlePickupSocietyItem}
        truckArriving={truckArriving}
        truckDeparting={truckDeparting}
        cleanupActive={cleanupActive}
        joystickInputRef={joystickInputRef}
        migsunRef={migsunSceneRef}
        meadowsRef={meadowsSceneRef}
        meadowsItemsRef={meadowsItemsRef}
        onMeadowsPlayerMove={handleMeadowsPlayerMove}
      >
        {/* Migsun Vilasa Game Controller (Level 8) */}
        {isMigsunMode && (
          <MigsunGameController
            currentPhase={migsunPhase}
            onSetPhase={setMigsunPhase}
            completedMissions={migsunCompletedMissions}
            onCompleteMission={(missionId) => {
              setMigsunCompletedMissions((prev) =>
                prev.includes(missionId) ? prev : [...prev, missionId]
              );
            }}
            score={score}
            onAddScore={(amt) => setScore((s) => s + amt)}
            itemsSorted={societySortedCount}
            totalItems={currentLevel.targetCount}
            accuracy={
              societySortedCount > 0
                ? Math.round((societyFirstTryCount / societySortedCount) * 100)
                : 100
            }
            onTriggerPlantRevival={() => {
              migsunSceneRef.current?.triggerPlantRevival();
            }}
            onShowBinsAtLocation={(locId) => {
              migsunSceneRef.current?.showBinsAtLocation(locId);
            }}
            onRemovePests={() => {
              migsunSceneRef.current?.removePests();
            }}
            onPlayAgain={() => {
              handleRetryLevel();
            }}
            onHome={() => {
              onExit?.();
            }}
          />
        )}

        {/* Meadows HUD (Level 7) — dark glass, replaces the retro top bar */}
        {isMeadowsMode && (
          <MeadowHud
            levelNumber={currentLevel.id}
            levelTitle={currentLevel.name}
            narrative={meadowsNarrative}
            timeLeft={timer.timeLeft}
            isWarning={timer.isWarning}
            isUrgent={timer.isUrgent}
            isExpired={timer.isExpired}
            tasks={meadowsTasks}
            lensState={lensState}
            onActivateLens={handleMeadowsLens}
            lensDisabled={isThrowing}
            showJoystick={isCoarsePointer}
            onJoystickMove={handleJoystickMove}
            onExit={onExit}
            joystickPulsing={meadowsPhase === 'WALK_TO_PILE'}
            lensGlowing={meadowsPhase === 'PILE_REACHED'}
            lensHintText={meadowsLensHint}
            instructionBanner={meadowsInstruction}
            narratorSpeech={narratorSubtitle}
            onSkipIntro={meadowsPhase === 'INTRO' ? handleSkipIntro : undefined}
            contaminationLevel={contaminationLevel}
          />
        )}

        {/* GTA-Style Phone Call (Meadows Phase 3) */}
        {isMeadowsMode && (
          <MeadowsPhoneModal
            isOpen={isPhoneModalOpen}
            onCallFinished={handleMeadowsPhoneFinished}
          />
        )}

        {/* Phase 7 Learning Cards Modal */}
        {isMeadowsMode && (
          <MeadowsLearningCardsModal
            isOpen={isLearningCardsOpen}
            sortedCount={meadowsSortedCount}
            totalCount={10}
            onFinish={handleMeadowsFinishLearningCards}
          />
        )}

        {/* Eco Lens overlay (SOCIETY mode) */}
        {isSocietyMode && lensState.isActive && currentItem && (
          <EcoLensOverlay
            lensState={lensState}
            itemName={currentItem.name}
            onDeactivate={handleDeactivateLens}
          />
        )}

        {/* Virtual Joystick controller for mobile touch navigation across all 3D maps */}
        {!isMeadowsMode && isCoarsePointer && (
          <div className="absolute bottom-5 left-5 z-20 pointer-events-auto">
            <VirtualJoystick onMove={handleJoystickMove} />
          </div>
        )}

        {/* Mascot (hidden in Meadows — the narrative banner carries the message) */}
        {!isMeadowsMode && (
          <div className={`absolute z-30 max-w-xs sm:max-w-sm md:max-w-md pointer-events-auto transition-all ${
            isCoarsePointer ? 'top-12 left-3' : 'bottom-3 left-3'
          }`}>
            {isMascotCollapsed ? (
              <button
                onClick={() => setIsMascotCollapsed(false)}
                title="Show mascot tips"
                className="flex items-center gap-1 bg-[#FDFBF7] border-2 border-slate-900 rounded-lg sm:rounded-xl px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-retro-xs text-[10px] sm:text-xs font-fun font-black text-slate-900 hover:bg-amber-100 transition-all active:translate-x-[1px] active:translate-y-[1px]"
              >
                <span className="text-sm sm:text-base">🌱</span>
                <span className="text-emerald-700">Eco tips</span>
                {isCoarsePointer ? (
                  <ChevronDown className="w-3 h-3 text-slate-700" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                )}
              </button>
            ) : (
              <MascotDialogue
                message={mascotMessage}
                isPositive={isPositiveFeedback}
                onCollapse={() => setIsMascotCollapsed(true)}
              />
            )}
          </div>
        )}

        {/* Classic modals */}
        {showQuiz && (
          <QuizModal
            questions={LEVEL_QUIZZES[currentLevelId] || []}
            onCompleteQuiz={() => finishLevel()}
          />
        )}

        {showLevelEnd && !isSocietyMode && (
          <LevelEndModal
            levelId={currentLevelId}
            score={score}
            accuracy={currentAccuracy}
            unlockedItem={recentlyUnlockedItem}
            onNextLevel={handleNextLevel}
            onRetry={handleRetryLevel}
            onOpenEcopedia={() => { setShowLevelEnd(false); setShowEcopedia(true); }}
          />
        )}

        {/* Society Mission Results */}
        {showMissionResults && isSocietyMode && (
          <MissionResultsModal
            totalItems={currentLevel.targetCount}
            sortedItems={societySortedCount}
            correctFirstTry={societyFirstTryCount}
            incorrectAttempts={societyWrongAttempts}
            litterLeft={Math.max(0, currentLevel.targetCount - societySortedCount)}
            ecoLensUses={lensUseCount}
            timeRemaining={timer.timeLeft}
            errors={societyErrors}
            onPlayAgain={handleRetryLevel}
            onNextLevel={handleNextLevel}
          />
        )}

        {/* Meadows Phase 8 Level End Results */}
        {showMissionResults && isMeadowsMode && (
          <MeadowsResultsModal
            sortedCount={meadowsSortedCount}
            totalCount={10}
            timeTakenSeconds={meadowsTimeTaken || Math.max(1, timerDuration - timer.timeLeft)}
            contaminationLevel={contaminationLevel}
            narratorLine="The waste pile is gone, but the land is still bare. Next, let’s bring this side back to life."
            onPlayAgain={handleRetryLevel}
            onNextMission={handleNextLevel}
          />
        )}

        {showEcopedia && (
          <EcopediaModal
            unlockedIds={profile.unlockedCards}
            onClose={() => setShowEcopedia(false)}
          />
        )}

        {showLevelSelect && (
          <LevelSelectModal
            currentLevelId={currentLevelId}
            starsMap={profile.stars}
            onSelectLevel={(lvlId) => setCurrentLevelId(lvlId)}
            onClose={() => setShowLevelSelect(false)}
          />
        )}
      </WorldCanvas>

      {/* Touch devices must play in landscape. Rendered last with a high z
          index so it paints above any open modal (they share z-50). */}
      {isCoarsePointer && isPortrait && (
        <div className="absolute inset-0 z-[100] bg-[#FDFBF7] flex flex-col items-center justify-center gap-4 px-8 text-center">
          <span className="text-6xl animate-bounce">📱</span>
          <div className="text-2xl font-fun font-black text-slate-950">Turn your device sideways</div>
          <div className="text-sm font-fun text-slate-700">The game plays in landscape.</div>
        </div>
      )}
    </div>
  );
};
