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
import { useCountdownTimer } from '../../hooks/useCountdownTimer';
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface WorldPageProps {
  onExit?: () => void;
  onOpenTeacherReport?: () => void;
}

export const WorldPage: React.FC<WorldPageProps> = ({
  onExit,
  onOpenTeacherReport,
}) => {
  // ── Player & Level ─────────────────────────────────────────────────────────
  const [profile, setProfile] = useState<PlayerProfile>(() => apiService.getLocalProfile());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  const currentLevel = useMemo(
    () => GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0],
    [currentLevelId]
  );

  const isSocietyMode = currentLevel.sceneType === 'SOCIETY';

  // Items available in society scene (all items whose bin is in this level's bins)
  const societyItemPool = useMemo(
    () => isSocietyMode
      ? GAME_ITEMS.filter((it) => currentLevel.bins.includes(it.bin))
      : [],
    [isSocietyMode, currentLevel.bins]
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
  const [isMascotCollapsed, setIsMascotCollapsed] = useState<boolean>(false);

  // ── Modals ──────────────────────────────────────────────────────────────────
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showLevelEnd, setShowLevelEnd] = useState<boolean>(false);
  const [showMissionResults, setShowMissionResults] = useState<boolean>(false);
  const [showEcopedia, setShowEcopedia] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [recentlyUnlockedItem, setRecentlyUnlockedItem] = useState<ItemData | null>(null);

  // ── Audio & Accessibility ───────────────────────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [slowMode, setSlowMode] = useState<boolean>(false);

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

  // ── Eco Lens (Society mode) ─────────────────────────────────────────────────
  const [lensState, setLensState] = useState(INITIAL_ECO_LENS_STATE);
  const [lensUseCount, setLensUseCount] = useState<number>(0);

  // Lens cooldown tick
  useEffect(() => {
    if (!isSocietyMode || lensState.cooldown <= 0) return;
    const interval = setInterval(() => {
      setLensState((prev) => tickLensCooldown(prev, 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSocietyMode, lensState.cooldown]);

  // Timer warning/urgent sound cues
  const prevTimeRef = useRef<number>(timerDuration);
  useEffect(() => {
    if (!isSocietyMode || !timer.isRunning) return;
    if (prevTimeRef.current !== timer.timeLeft) {
      if (timer.timeLeft === 30) {
        audio.playTimerWarning();
        const msg = 'The truck is on its way! Hurry!';
        setMascotMessage(msg);
        audio.speak(msg);
      } else if (timer.timeLeft === 10) {
        audio.playTruckHorn();
        const msg = 'Ten seconds left! Sort fast!';
        setMascotMessage(msg);
        audio.speak(msg);
      }
      prevTimeRef.current = timer.timeLeft;
    }
  }, [timer.timeLeft, timer.isRunning, isSocietyMode]);

  // Timer expired → end society level
  useEffect(() => {
    if (!isSocietyMode || !timer.isExpired) return;
    audio.playTruckJingle();
    finishSocietyLevel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.isExpired, isSocietyMode]);

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
    if (truckModalTimerRef.current) {
      clearTimeout(truckModalTimerRef.current);
      truckModalTimerRef.current = null;
    }
    wrongAttemptsRef.current = {};

    if (isSocietyMode) {
      // Society: player picks up items from ground — no pre-spawned item
      setCurrentItem(null);
      timer.reset();
      const msg = 'Welcome! Walk around and pick up litter. Sort it!';
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

  // ── Society: player picks up litter ────────────────────────────────────────
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

      if (isSocietyMode) {
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

        if (isSocietyMode) {
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

      if (isSocietyMode) {
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
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setSoundEnabled(next);
    audio.setVoiceEnabled(next);
  };

  const handleToggleSlowMode = () => {
    const next = !slowMode;
    setSlowMode(next);
    audio.setSlowMode(next);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const currentAccuracy =
    totalThrows > 0 ? Math.round((correctThrows / totalThrows) * 100) : 100;

  // ── HUD: LEFT ───────────────────────────────────────────────────────────────
  const topBarExtrasLeft = (
    <div className="flex items-center gap-2">
      {onExit && (
        <button
          onClick={onExit}
          title="Exit to menu"
          className="tactile-btn flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-950" />
          <span className="hidden sm:inline">Exit</span>
        </button>
      )}
    </div>
  );

  // ── HUD: CENTER ─────────────────────────────────────────────────────────────
  const topBarCenter = (
    <div className="hidden lg:flex items-center gap-2 bg-[#FDFBF7]/95 border-2 border-slate-900 rounded-2xl px-3 py-1.5 shadow-retro text-slate-900 backdrop-blur-sm flex-wrap">

      {/* Level name */}
      <span className="text-[11px] font-fun font-black text-slate-700 uppercase">
        {currentLevel.name}
      </span>

      {isSocietyMode ? (
        <>
          {/* Countdown Timer */}
          <div className="h-4 w-[2px] bg-slate-300" />
          <CountdownTimer
            timeLeft={timer.timeLeft}
            isWarning={timer.isWarning}
            isUrgent={timer.isUrgent}
            isExpired={timer.isExpired}
          />

          {/* Cleanliness Meter */}
          <div className="h-4 w-[2px] bg-slate-300" />
          <CleanlinessMeter
            collected={societySortedCount}
            total={currentLevel.targetCount}
          />

          {/* Score */}
          <div className="h-4 w-[2px] bg-slate-300" />
          <div className="flex items-center gap-1 bg-amber-300 px-2 py-0.5 rounded-lg border border-slate-900 font-fun font-black text-xs text-slate-950">
            <Award className="w-3.5 h-3.5" />
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

          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-900">
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
            <span>{score} PTS</span>
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
  );

  // ── HUD: RIGHT ──────────────────────────────────────────────────────────────
  const topBarExtrasRight = (
    <div className="flex items-center gap-1.5">
      {/* Eco Lens button (society mode only) */}
      {isSocietyMode && (
        <EcoLensButton
          lensState={lensState}
          onActivate={handleActivateEcoLens}
          disabled={!currentItem || isThrowing}
        />
      )}

      {/* Missions */}
      <button
        onClick={() => setShowLevelSelect(true)}
        title="View missions"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl text-xs font-fun font-black transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        <Map className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Missions</span>
      </button>

      {/* Ecopedia */}
      <button
        onClick={() => setShowEcopedia(true)}
        title="View Eco-pedia cards"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl text-xs font-fun font-black transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        <BookOpen className="w-3.5 h-3.5 text-teal-600" />
        <span className="hidden md:inline">Cards ({profile.unlockedCards.length})</span>
      </button>

      {/* Sound Toggle */}
      <button
        onClick={handleToggleSound}
        title={soundEnabled ? 'Mute sound' : 'Enable sound'}
        className="p-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-rose-600" />}
      </button>

      {/* Slow Mode */}
      <button
        onClick={handleToggleSlowMode}
        title={slowMode ? 'Normal speed' : 'Slow mode'}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px] ${
          slowMode ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-700 hover:bg-slate-100'
        }`}
      >
        🐢
      </button>

      {/* Fullscreen */}
      <button
        onClick={handleToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Full desktop view'}
        className="p-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4 text-slate-700" /> : <Maximize2 className="w-4 h-4 text-slate-700" />}
      </button>

      {onOpenTeacherReport && (
        <button
          onClick={onOpenTeacherReport}
          title="Teacher report"
          className="p-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
        >
          <BarChart2 className="w-4 h-4 text-blue-600" />
        </button>
      )}
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 z-40 select-none">
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
      >
        {/* Eco Lens overlay (SOCIETY mode) */}
        {isSocietyMode && lensState.isActive && currentItem && (
          <EcoLensOverlay
            lensState={lensState}
            itemName={currentItem.name}
            onDeactivate={handleDeactivateLens}
          />
        )}

        {/* Mascot */}
        <div className="absolute bottom-4 left-4 z-30 max-w-xs sm:max-w-sm md:max-w-md pointer-events-auto transition-all">
          {isMascotCollapsed ? (
            <button
              onClick={() => setIsMascotCollapsed(false)}
              title="Show mascot tips"
              className="flex items-center gap-2 bg-[#FDFBF7] border-2 border-slate-900 rounded-2xl px-3.5 py-2 shadow-retro text-xs font-fun font-black text-slate-900 hover:bg-amber-100 transition-all active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span className="text-xl">🌱</span>
              <span className="text-emerald-700">Eco tips</span>
              <ChevronUp className="w-4 h-4 text-slate-700" />
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsMascotCollapsed(true)}
                title="Minimize mascot tips"
                className="absolute top-3 right-3 p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 z-10 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <MascotDialogue message={mascotMessage} isPositive={isPositiveFeedback} />
            </div>
          )}
        </div>

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
    </div>
  );
};
