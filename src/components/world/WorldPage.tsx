import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BinType, ItemData, PlayerProfile } from '../../types/game';
import { GAME_LEVELS } from '../../data/levels';
import { ALL_BINS } from '../../data/bins';
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
import { AvatarSelectModal } from '../game/AvatarSelectModal';
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
  // Player state
  const [profile, setProfile] = useState<PlayerProfile>(() => apiService.getLocalProfile());
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // Level & Items
  const currentLevel = useMemo(() => {
    return GAME_LEVELS.find((l) => l.id === currentLevelId) || GAME_LEVELS[0];
  }, [currentLevelId]);

  // Adaptive Spawner
  const spawner = useMemo(() => {
    return new AdaptiveSpawner(currentLevel.bins, profile.itemStats);
  }, [currentLevel.bins, profile.itemStats]);

  const [currentItem, setCurrentItem] = useState<ItemData | null>(null);
  const [itemsSorted, setItemsSorted] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(20);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);

  // Stats for current level attempt
  const [correctThrows, setCorrectThrows] = useState<number>(0);
  const [totalThrows, setTotalThrows] = useState<number>(0);
  const [levelErrors, setLevelErrors] = useState<{ itemId: string; bin: string }[]>([]);

  // Feedback & Mascot dialogue (ASD-STE100: max 8 words per sentence)
  const [mascotMessage, setMascotMessage] = useState<string>(
    `Welcome! Start in ${currentLevel.place}. Sort the waste.`
  );
  const [isPositiveFeedback, setIsPositiveFeedback] = useState<boolean>(true);
  const [isMascotCollapsed, setIsMascotCollapsed] = useState<boolean>(false);

  // Modals state
  const [showQuiz, setShowQuiz] = useState<boolean>(false);
  const [showLevelEnd, setShowLevelEnd] = useState<boolean>(false);
  const [showEcopedia, setShowEcopedia] = useState<boolean>(false);
  const [showLevelSelect, setShowLevelSelect] = useState<boolean>(false);
  const [showAvatarSelect, setShowAvatarSelect] = useState<boolean>(false);
  const [recentlyUnlockedItem, setRecentlyUnlockedItem] = useState<ItemData | null>(null);

  // Audio & Accessibility state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [slowMode, setSlowMode] = useState<boolean>(false);

  // World exploration vs Station sorting mode
  const [worldMode, setWorldMode] = useState<'EXPLORE' | 'STATION_SORT'>('EXPLORE');

  // Fullscreen tracking
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Spawn first item on level start or change
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

    const firstItem = spawner.getNextItem();
    setCurrentItem(firstItem);
    const welcomeMsg = currentLevelId === 1
      ? 'Welcome to Home. Walk to table and sort.'
      : `Welcome to ${currentLevel.name}. Walk to table.`;
    setMascotMessage(welcomeMsg);
    setIsPositiveFeedback(true);
    audio.speak(welcomeMsg);
  }, [currentLevelId, spawner, currentLevel.name]);

  const handleThrowItem = useCallback((targetBin: BinType) => {
    if (!currentItem || isThrowing) return;
    setIsThrowing(true);
    audio.playThrow();

    setTotalThrows((prev) => prev + 1);

    const isCorrect = currentItem.bin === targetBin;
    spawner.recordAttempt(currentItem.id, isCorrect);

    if (isCorrect) {
      // Correct sorting (+10 points, streak bonuses)
      audio.playCorrect();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const streakBonus = newStreak >= 3 ? 5 : 0;
      const pts = 10 + streakBonus;
      setScore((prev) => prev + pts);
      setCorrectThrows((prev) => prev + 1);

      // Energy increase
      const newEnergy = Math.min(100, energy + 12);
      setEnergy(newEnergy);

      const successMsg = `Great job! Put ${currentItem.name} in the ${ALL_BINS[targetBin].label}. ${currentItem.fact}`;
      setMascotMessage(successMsg);
      setIsPositiveFeedback(true);
      audio.speak(successMsg);

      // Unlock in Eco-pedia
      if (!profile.unlockedCards.includes(currentItem.id)) {
        const updatedCards = [...profile.unlockedCards, currentItem.id];
        setRecentlyUnlockedItem(currentItem);
        const updatedProfile = { ...profile, unlockedCards: updatedCards };
        setProfile(updatedProfile);
        apiService.saveLocalProfile(updatedProfile);
      }
    } else {
      // Wrong throw: 0 points, streak reset
      audio.playIncorrect();
      setStreak(0);
      setLevelErrors((prev) => [...prev, { itemId: currentItem.id, bin: targetBin }]);

      const errorMsg = `Not quite. Put ${currentItem.name} in the ${ALL_BINS[currentItem.bin].label}. ${currentItem.fact}`;
      setMascotMessage(errorMsg);
      setIsPositiveFeedback(false);
      audio.speak(errorMsg);
    }

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
        const next = spawner.getNextItem();
        setCurrentItem(next);
      }
    }, slowMode ? 1300 : 700);
  }, [currentItem, isThrowing, streak, energy, profile, itemsSorted, currentLevel.targetCount, currentLevelId, slowMode, spawner]);

  const finishLevel = useCallback(() => {
    const accuracy =
      totalThrows > 0 ? Math.round((correctThrows / totalThrows) * 100) : 100;
    const earnedStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : 1;

    // Update Profile & save progress to DynamoDB / LocalStorage
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

  const handleNextLevel = () => {
    setShowLevelEnd(false);
    setWorldMode('EXPLORE');
    if (currentLevelId < GAME_LEVELS.length) {
      setCurrentLevelId((prev) => prev + 1);
    } else {
      setCurrentLevelId(1);
    }
    const nextMsg = 'Great job! Walk across town to next mission.';
    setMascotMessage(nextMsg);
    audio.speak(nextMsg);
  };

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

  // =========================================================================
  // TOP BAR HUD: LEFT EXTRAS (Exit button & Hero avatar badge)
  // =========================================================================
  const topBarExtrasLeft = (
    <div className="flex items-center gap-2">
      {onExit && (
        <button
          onClick={onExit}
          title="Exit to menu"
          className="tactile-btn flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-950 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px]"
        >
          <ArrowLeft className="w-4 h-4 text-slate-950" />
          <span className="hidden sm:inline">Exit to Menu</span>
        </button>
      )}

      <button
        onClick={() => setShowAvatarSelect(true)}
        title="Select hero avatar"
        className="flex items-center gap-1.5 bg-amber-200 hover:bg-amber-300 border-2 border-slate-900 shadow-retro-sm px-2.5 py-1.5 rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        <span className="text-lg">{profile.avatar}</span>
        <span className="text-xs font-fun font-black text-slate-900 hidden sm:inline">
          {profile.nickname}
        </span>
      </button>
    </div>
  );

  // =========================================================================
  // TOP BAR HUD: CENTER (Floating compact Energy & Level HUD)
  // =========================================================================
  const topBarCenter = (
    <div className="hidden lg:flex items-center gap-3 bg-[#FDFBF7]/95 border-2 border-slate-900 rounded-2xl px-3.5 py-1.5 shadow-retro text-slate-900 backdrop-blur-sm">
      {/* Level and Item count */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-fun font-black text-slate-700 uppercase">
          {currentLevel.name}
        </span>
        <span className="text-xs font-fun font-black bg-amber-200 px-2 py-0.5 rounded-lg border border-slate-900">
          Item {Math.min(itemsSorted + 1, currentLevel.targetCount)} / {currentLevel.targetCount}
        </span>
      </div>

      <div className="h-4 w-[2px] bg-slate-300" />

      {/* Clean Energy Meter */}
      <div className="flex items-center gap-2">
        <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
        <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-900">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-amber-300 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(6, energy))}%` }}
          />
        </div>
        <span className="text-xs font-fun font-black text-emerald-800">
          {Math.round(energy)}%
        </span>
      </div>

      <div className="h-4 w-[2px] bg-slate-300" />

      {/* Score */}
      <div className="flex items-center gap-1 bg-amber-300 px-2 py-0.5 rounded-lg border border-slate-900 font-fun font-black text-xs text-slate-950">
        <Award className="w-3.5 h-3.5" />
        <span>{score} PTS</span>
      </div>

      {/* Streak bonus */}
      {streak >= 2 && (
        <div className="flex items-center gap-1 bg-orange-400 px-2 py-0.5 rounded-lg border border-slate-900 font-fun font-black text-xs text-slate-950 animate-bounce">
          <Flame className="w-3.5 h-3.5 fill-amber-300 stroke-slate-950" />
          <span>{streak}x</span>
        </div>
      )}
    </div>
  );

  // =========================================================================
  // TOP BAR HUD: RIGHT EXTRAS (Missions, Eco-pedia, Sound, Fullscreen, Report)
  // =========================================================================
  const topBarExtrasRight = (
    <div className="flex items-center gap-1.5">
      {/* Missions */}
      <button
        onClick={() => setShowLevelSelect(true)}
        title="View missions"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl text-xs font-fun font-black transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        <Map className="w-3.5 h-3.5 text-emerald-600" />
        <span className="hidden sm:inline">Missions</span>
      </button>

      {/* Eco-pedia */}
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
        {soundEnabled ? (
          <Volume2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <VolumeX className="w-4 h-4 text-rose-600" />
        )}
      </button>

      {/* Accessibility Slow Mode */}
      <button
        onClick={handleToggleSlowMode}
        title={slowMode ? 'Normal speed' : 'Slow mode'}
        className={`px-2.5 py-1.5 rounded-xl text-xs font-fun font-black border-2 border-slate-900 shadow-retro-sm transition-all active:translate-x-[1px] active:translate-y-[1px] ${
          slowMode
            ? 'bg-amber-300 text-slate-950'
            : 'bg-white text-slate-700 hover:bg-slate-100'
        }`}
      >
        🐢
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={handleToggleFullscreen}
        title={isFullscreen ? 'Exit fullscreen' : 'Full desktop view'}
        className="p-2 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-900 shadow-retro-sm rounded-xl transition-all active:translate-x-[1px] active:translate-y-[1px]"
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4 text-slate-700" />
        ) : (
          <Maximize2 className="w-4 h-4 text-slate-700" />
        )}
      </button>

      {/* Teacher Report */}
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

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-slate-950 z-40 select-none">
      {/* 3D Realistic Procedural World & Locomotion Pipeline in Whole Desktop View */}
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
      >
        {/* Floating Mascot Speech Bubble & Bedrock Assistant in Bottom-Left */}
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

        {/* Modals rendered over whole desktop view */}
        {showQuiz && (
          <QuizModal
            questions={LEVEL_QUIZZES[currentLevelId] || []}
            onCompleteQuiz={() => finishLevel()}
          />
        )}

        {showLevelEnd && (
          <LevelEndModal
            levelId={currentLevelId}
            score={score}
            accuracy={currentAccuracy}
            unlockedItem={recentlyUnlockedItem}
            onNextLevel={handleNextLevel}
            onRetry={() => {
              setShowLevelEnd(false);
              setCurrentLevelId((prev) => prev);
            }}
            onOpenEcopedia={() => {
              setShowLevelEnd(false);
              setShowEcopedia(true);
            }}
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

        {showAvatarSelect && (
          <AvatarSelectModal
            currentProfile={profile}
            onSaveProfile={(p) => {
              setProfile(p);
              apiService.saveLocalProfile(p);
            }}
            onClose={() => setShowAvatarSelect(false)}
          />
        )}
      </WorldCanvas>
    </div>
  );
};

export default WorldPage;
