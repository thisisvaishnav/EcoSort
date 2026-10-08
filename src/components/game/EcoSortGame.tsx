import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BinType, ItemData, PlayerProfile } from '../../types/game';
import { GAME_LEVELS } from '../../data/levels';
import { ALL_BINS } from '../../data/bins';
import { LEVEL_QUIZZES } from '../../data/quizzes';
import { AdaptiveSpawner } from '../../services/spawner';
import { audio } from '../../services/audio';
import { apiService } from '../../services/api';
import { ThreeScene } from './ThreeScene';
import { MascotDialogue } from './MascotDialogue';
import { EnergyMeterHUD } from './EnergyMeterHUD';
import { QuizModal } from './QuizModal';
import { LevelEndModal } from './LevelEndModal';
import { EcopediaModal } from './EcopediaModal';
import { LevelSelectModal } from './LevelSelectModal';
import { AvatarSelectModal } from './AvatarSelectModal';
import { BookOpen, Map, Volume2, VolumeX, BarChart2 } from 'lucide-react';

interface EcoSortGameProps {
  onOpenTeacherReport?: () => void;
}

export const EcoSortGame: React.FC<EcoSortGameProps> = ({ onOpenTeacherReport }) => {
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
  const [energy, setEnergy] = useState<number>(15);
  const [isThrowing, setIsThrowing] = useState<boolean>(false);

  // Stats for current level attempt
  const [correctThrows, setCorrectThrows] = useState<number>(0);
  const [totalThrows, setTotalThrows] = useState<number>(0);
  const [levelErrors, setLevelErrors] = useState<{ itemId: string; bin: string }[]>([]);

  // Feedback & Mascot dialogue
  const [mascotMessage, setMascotMessage] = useState<string>(
    `Welcome! In ${currentLevel.place}, ${currentLevel.learningGoal}`
  );
  const [isPositiveFeedback, setIsPositiveFeedback] = useState<boolean>(true);

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
    const welcomeMsg = `Welcome to ${currentLevel.name}! ${currentLevel.learningGoal}`;
    setMascotMessage(welcomeMsg);
    setIsPositiveFeedback(true);
    audio.speak(welcomeMsg);
  }, [currentLevelId, spawner, currentLevel.name, currentLevel.learningGoal]);

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

      const successMsg = `Great job! ${currentItem.name} belongs in the ${ALL_BINS[targetBin].label}. ${currentItem.fact}`;
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
      // Wrong throw: 0 points, no penalty, streak reset (Rule: 1.5 Game Systems)
      audio.playIncorrect();
      setStreak(0);
      setLevelErrors((prev) => [...prev, { itemId: currentItem.id, bin: targetBin }]);

      const errorMsg = `Not quite. ${currentItem.name} goes in the ${ALL_BINS[currentItem.bin].label}. ${currentItem.fact}`;
      setMascotMessage(errorMsg);
      setIsPositiveFeedback(false);
      audio.speak(errorMsg);
    }

    const nextCount = itemsSorted + 1;
    setItemsSorted(nextCount);

    // Wait for throw animation to finish, then advance
    setTimeout(() => {
      setIsThrowing(false);

      if (nextCount >= currentLevel.targetCount) {
        // Level items finished! Trigger visual quiz
        setCurrentItem(null);
        const quizzes = LEVEL_QUIZZES[currentLevelId];
        if (quizzes && quizzes.length > 0) {
          setShowQuiz(true);
        } else {
          finishLevel();
        }
      } else {
        // Next item
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
    if (currentLevelId < GAME_LEVELS.length) {
      setCurrentLevelId((prev) => prev + 1);
    } else {
      setCurrentLevelId(1); // loop back
    }
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

  const currentAccuracy =
    totalThrows > 0 ? Math.round((correctThrows / totalThrows) * 100) : 100;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 backdrop-blur-md flex-wrap">
        {/* Hero Badge */}
        <button
          onClick={() => setShowAvatarSelect(true)}
          className="flex items-center gap-2 hover:bg-slate-700/50 p-1.5 rounded-xl transition-all"
        >
          <span className="text-2xl">{profile.avatar}</span>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Hero</span>
            <span className="text-sm font-fun font-bold text-white">{profile.nickname}</span>
          </div>
        </button>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLevelSelect(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-fun font-bold transition-all"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Missions</span>
          </button>

          <button
            onClick={() => setShowEcopedia(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-fun font-bold transition-all"
          >
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Eco-pedia ({profile.unlockedCards.length})</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Slow Mode Toggle */}
          <button
            onClick={handleToggleSlowMode}
            title={slowMode ? 'Normal Speed' : 'Slow Mode (Accessibility)'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              slowMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                : 'bg-slate-700 text-slate-400 border-transparent'
            }`}
          >
            🐢 {slowMode ? 'Slow' : 'Normal'}
          </button>

          {onOpenTeacherReport && (
            <button
              onClick={onOpenTeacherReport}
              title="Teacher Report"
              className="p-2 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-xl transition-all"
            >
              <BarChart2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Energy & Score HUD */}
      <EnergyMeterHUD
        score={score}
        streak={streak}
        energy={energy}
        itemsSorted={itemsSorted}
        targetCount={currentLevel.targetCount}
        levelName={currentLevel.name}
      />

      {/* 3D Interactive Sorting Canvas */}
      <ThreeScene
        currentItem={currentItem}
        activeBins={currentLevel.bins}
        energyLevel={energy}
        onThrowItem={handleThrowItem}
        isThrowing={isThrowing}
        slowMode={slowMode}
      />

      {/* Mascot Speech Bubble & Bedrock Assistant */}
      <MascotDialogue message={mascotMessage} isPositive={isPositiveFeedback} />

      {/* Modals */}
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
    </div>
  );
};
