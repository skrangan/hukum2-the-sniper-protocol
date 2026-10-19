import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { NavbarAuth } from './components/NavbarAuth';
import { AuraMeterHUD } from './components/AuraMeterHUD';
import { DualSubtitleHUD } from './components/DualSubtitleHUD';
import { ActionDeckHUD } from './components/ActionDeckHUD';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { IntroVideoModal } from './components/IntroVideoModal';
import { InventoryModal } from './components/InventoryModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { ThreeGameContainer } from './components/ThreeGameContainer';
import { ThreeGameManager } from './game/three/ThreeGameManager';
import { Game3DState } from './game/three/MarketScene3D';
import { ApiClient, UserProfile, LevelProgress } from './api/client';
import { LEVELS } from './data/levelsConfig';
import { InventoryItem } from './data/inventoryData';
import { soundManager } from './game/audio/SoundManager';

export const App: React.FC = () => {
  const threeGameManagerRef = useRef<ThreeGameManager | null>(null);

  // User & DB State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [progress, setProgress] = useState<LevelProgress[]>([]);
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);

  // In-Game 3D Live State
  const [gameData, setGameData] = useState<Game3DState>({
    aura: 0,
    multiplier: 1,
    composure: 100,
    vijiSuspicion: 0,
    hukumMode: false,
    phase: 'STEALTH',
    coconutKicked: false,
    rickshawRolling: false,
    fireworksExploded: false
  });

  // Loadout & Inventory State
  const [equippedGearId, setEquippedGearId] = useState<string>('sniper_designator');
  const [equippedCameoId, setEquippedCameoId] = useState<string>('mathew_mercedes');
  const [equippedAttireId, setEquippedAttireId] = useState<string>('driver_veshti');

  // Modals & Overlays
  const [activeDialogue, setActiveDialogue] = useState<string | null>('lvl1_intro');
  const [showVictory, setShowVictory] = useState(false);
  const [victoryDetails, setVictoryDetails] = useState<any>(null);
  const [dbSaved, setDbSaved] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(true);

  const currentLevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Keyboard shortcut [I] for Inventory & [M] for Audio Settings
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.code === 'KeyI') {
        setShowInventory((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

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

  const handleFlipSpecs = () => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.triggerSpectacleFlip();
    }
  };

  const handleSniperPing = () => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.pingSniperTargets();
    }
  };

  const handleTaxiDrift = () => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.kickCoconut();
    }
  };

  const handleCameoSummon = () => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.summonCameo(equippedCameoId);
    }
  };

  const handleEquipItem = (item: InventoryItem) => {
    if (item.category === 'GEAR' || item.category === 'HAZARD') {
      setEquippedGearId(item.id);
    } else if (item.category === 'CAMEO') {
      setEquippedCameoId(item.id);
    } else if (item.category === 'ATTIRE') {
      setEquippedAttireId(item.id);
      if (threeGameManagerRef.current) {
        threeGameManagerRef.current.setTigerAttire(item.id);
      }
    }
  };

  const handleDeployAction = (item: InventoryItem) => {
    handleEquipItem(item);
    if (item.id === 'gold_aviators') {
      handleFlipSpecs();
    } else if (item.id === 'sniper_designator') {
      handleSniperPing();
    } else if (item.id === 'pollachi_coconut' || item.id === 'vimal_taxi') {
      handleTaxiDrift();
    } else if (item.category === 'CAMEO') {
      if (threeGameManagerRef.current) {
        threeGameManagerRef.current.summonCameo(item.id);
      }
    }
  };

  const handleLevelCompleted = async (summary: any) => {
    setVictoryDetails(summary);
    setShowVictory(true);
    setDbSaved(false);

    confetti({
      particleCount: 120,
      spread: 90,
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
        cameosUsed: summary.cameosUsed || [equippedCameoId]
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

  const loadLevel = (levelId: number) => {
    setCurrentLevelId(levelId);
    setShowVictory(false);
    setShowLevelSelect(false);
    setActiveDialogue(`lvl${levelId}_intro`);
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.loadChapter(levelId);
    }
  };

  const handleRetry = () => {
    setShowVictory(false);
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.retry();
    }
  };

  const handleSelectChapter = (id: number) => {
    setCurrentLevelId(id);
    setShowVictory(false);
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.setChapterAtmosphere(id);
      threeGameManagerRef.current.retry();
    }
    const dialogueMap: Record<number, string> = {
      1: 'lvl1_intro',
      2: 'lvl2_intro',
      3: 'lvl3_intro',
      4: 'lvl4_intro',
      7: 'lvl7_cameo_narasimha',
      10: 'lvl10_finale'
    };
    setActiveDialogue(dialogueMap[id] || 'lvl1_intro');
  };

  const handleNextLevel = () => {
    setShowVictory(false);
    const nextId = Math.min(10, currentLevelId + 1);
    loadLevel(nextId);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation & Profile Bar */}
      <NavbarAuth
        profile={profile}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        onOpenLevelSelect={() => setShowLevelSelect(true)}
        onOpenIntroVideo={() => setShowIntroVideo(true)}
        onOpenInventory={() => setShowInventory(true)}
        onOpenAudioSettings={() => setShowAudioSettings(true)}
        currentLevel={currentLevelId}
      />

      {/* Main 3D WebGL Three.js Game Arena */}
      <main className="flex-1 relative flex items-center justify-center p-0 pt-14 pb-0">
        <ThreeGameContainer
          gameManagerRef={threeGameManagerRef}
          onStateUpdate={(data) => setGameData(data)}
          onDialogue={(key) => setActiveDialogue(key)}
          onVictory={handleLevelCompleted}
        />

        {/* Top-Left Aura Meter & Motive HUD */}
        <AuraMeterHUD
          gameData={{
            aura: gameData.aura,
            multiplier: gameData.multiplier,
            composure: gameData.composure,
            vijiSuspicion: Math.round(gameData.vijiSuspicion),
            hukumMode: gameData.hukumMode,
            phase: gameData.phase,
            activeDialogueKey: null
          }}
          levelTitle={currentLevelConfig.titleTanglish}
          levelSetting={currentLevelConfig.setting}
          objective={currentLevelConfig.motive}
        />

        {/* Bottom-Center Dual Subtitle Dialogue Box */}
        <DualSubtitleHUD
          dialogueKey={activeDialogue}
          onDismiss={() => setActiveDialogue(null)}
        />

        {/* Bottom-Right Spectacle Flip & Tactical Loadout Deck */}
        <ActionDeckHUD
          onFlipSpecs={handleFlipSpecs}
          isHukumMode={gameData.hukumMode}
          onSniperPing={handleSniperPing}
          onTaxiDrift={handleTaxiDrift}
          onCameoSummon={handleCameoSummon}
          onOpenInventory={() => setShowInventory(true)}
          equippedCameoId={equippedCameoId}
        />
      </main>

      {/* Introduction Video Cutscene Modal */}
      <IntroVideoModal
        isOpen={showIntroVideo}
        onClose={() => setShowIntroVideo(false)}
        onStartGame={() => {
          soundManager.startCinematicBgm('stealth');
          setShowIntroVideo(false);
        }}
      />

      {/* Tactical Inventory & Loadout Modal */}
      <InventoryModal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        equippedGearId={equippedGearId}
        equippedCameoId={equippedCameoId}
        equippedAttireId={equippedAttireId}
        onEquipItem={handleEquipItem}
        onDeployAction={handleDeployAction}
      />

      {/* Audio & Soundstage Settings Modal (Distinct Music & SFX Toggles) */}
      <AudioSettingsModal
        isOpen={showAudioSettings}
        onClose={() => setShowAudioSettings(false)}
      />

      {/* Victory Modal */}
      {showVictory && victoryDetails && (
        <VictoryModal
          score={victoryDetails.auraScore}
          stars={victoryDetails.starsEarned}
          clearTimeMs={victoryDetails.clearTimeMs}
          onNextLevel={handleNextLevel}
          onRetry={handleRetry}
          dbSaved={dbSaved}
          currentLevel={currentLevelId}
          currentLevelTitle={currentLevelConfig.titleTanglish}
          nextLevelTitle={LEVELS.find(l => l.id === currentLevelId + 1)?.titleTanglish || 'Campaign Finale'}
        />
      )}

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        onSelectLevel={handleSelectChapter}
        highestUnlocked={profile?.highest_level_unlocked || 1}
        progressList={progress}
      />
    </div>
  );
};

export default App;
