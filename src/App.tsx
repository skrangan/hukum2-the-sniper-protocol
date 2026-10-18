import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { NavbarAuth } from './components/NavbarAuth';
import { AuraMeterHUD } from './components/AuraMeterHUD';
import { DualSubtitleHUD } from './components/DualSubtitleHUD';
import { ActionDeckHUD } from './components/ActionDeckHUD';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { PhaserGameContainer } from './components/PhaserGameContainer';
import { ApiClient, UserProfile, LevelProgress } from './api/client';
import { GameEventData } from './game/scenes/MarketLevelScene';
import { LEVELS } from './data/levelsConfig';

export const App: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  // User & DB State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<LevelProgress[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // In-Game Live State
  const [gameData, setGameData] = useState<GameEventData>({
    aura: 0,
    multiplier: 1,
    composure: 100,
    vijiSuspicion: 0,
    hukumMode: false,
    phase: 'STEALTH',
    activeDialogueKey: 'lvl1_intro'
  });

  const [activeDialogue, setActiveDialogue] = useState<string | null>('lvl1_intro');
  const [showVictory, setShowVictory] = useState(false);
  const [victoryDetails, setVictoryDetails] = useState<any>(null);
  const [dbSaved, setDbSaved] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);

  const currentLevelConfig = LEVELS.find(l => l.id === currentLevelId) || LEVELS[0];

  // Initialize or Restore Player from Render PostgreSQL Database
  useEffect(() => {
    const initPlayer = async () => {
      try {
        const token = ApiClient.getToken();
        if (token) {
          const data = await ApiClient.getProfile();
          setProfile(data.profile);
          setProgress(data.progress || []);
        } else {
          // Automatic seamless guest login if no token yet
          const data = await ApiClient.guestLogin();
          setProfile(data.profile);
        }
      } catch (e) {
        console.warn('Initializing guest fallback session:', e);
        try {
          const guest = await ApiClient.guestLogin();
          setProfile(guest.profile);
        } catch (err) {
          console.error('Database connection error:', err);
        }
      }
    };

    initPlayer();
  }, []);

  // Handle Spectacle Flip Trigger from ActionDeck or Spacebar
  const handleFlipSpecs = () => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('MarketLevelScene') as any;
    if (scene && scene.triggerSpectacleFlip) {
      scene.triggerSpectacleFlip();
    }
  };

  const handleSniperPing = () => {
    handleFlipSpecs();
  };

  const handleTaxiDrift = () => {
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('MarketLevelScene') as any;
    if (scene && scene.kickCoconut) {
      scene.kickCoconut();
    }
  };

  // Level Completion Handler (Sync with Render PostgreSQL)
  const handleLevelCompleted = async (summary: any) => {
    setVictoryDetails(summary);
    setShowVictory(true);
    setDbSaved(false);

    // Dazzling Victory Confetti
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#facc15', '#ef4444', '#38bdf8', '#ffffff']
    });

    try {
      const res = await ApiClient.saveLevelProgress({
        levelNumber: summary.levelNumber || currentLevelId,
        auraScore: summary.auraScore,
        starsEarned: summary.starsEarned || 3,
        clearTimeMs: summary.clearTimeMs,
        spectacleFlipsUsed: summary.spectacleFlipsUsed || 1,
        cameosUsed: summary.cameosUsed || []
      });

      if (res.profile) {
        setProfile(res.profile);
      }
      if (res.progress) {
        setProgress(res.progress);
      }
      setDbSaved(true);
    } catch (err) {
      console.error('Failed to sync victory with Render DB:', err);
    }
  };

  const handleRetry = () => {
    setShowVictory(false);
    if (!gameRef.current) return;
    const scene = gameRef.current.scene.getScene('MarketLevelScene') as any;
    if (scene && scene.retryLevel) {
      scene.retryLevel();
    }
  };

  const handleNextLevel = () => {
    setShowVictory(false);
    setShowLevelSelect(true);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation & Profile Bar */}
      <NavbarAuth
        profile={profile}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        currentLevel={currentLevelId}
      />

      {/* Main Isometric Phaser 3 Game Arena */}
      <main className="flex-1 relative flex items-center justify-center p-2 pt-14 pb-2">
        <PhaserGameContainer
          gameRef={gameRef}
          onStateUpdate={(data) => setGameData(data)}
          onDialogue={(key) => setActiveDialogue(key)}
          onVictory={handleLevelCompleted}
          onBusted={() => setActiveDialogue('lvl1_viji_warning')}
        />

        {/* Top-Left Aura Meter & Motive HUD */}
        <AuraMeterHUD
          gameData={gameData}
          levelTitle={currentLevelConfig.titleTanglish}
          objective={currentLevelConfig.motive}
        />

        {/* Bottom-Center Dual Subtitle Dialogue Box */}
        <DualSubtitleHUD
          dialogueKey={activeDialogue}
          onDismiss={() => setActiveDialogue(null)}
        />

        {/* Bottom-Right Spectacle Flip & Hotkey Deck */}
        <ActionDeckHUD
          onFlipSpecs={handleFlipSpecs}
          isHukumMode={gameData.hukumMode}
          onSniperPing={handleSniperPing}
          onTaxiDrift={handleTaxiDrift}
        />
      </main>

      {/* Modals */}
      {showVictory && victoryDetails && (
        <VictoryModal
          score={victoryDetails.auraScore}
          stars={victoryDetails.starsEarned}
          clearTimeMs={victoryDetails.clearTimeMs}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          dbSaved={dbSaved}
        />
      )}

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        onSelectLevel={(id) => {
          setCurrentLevelId(id);
          handleRetry();
        }}
        highestUnlocked={profile?.highest_level_unlocked || 1}
        progressList={progress}
      />
    </div>
  );
};

export default App;
