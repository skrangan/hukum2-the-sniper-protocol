import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { NavbarAuth } from './components/NavbarAuth';
import { AuraMeterHUD } from './components/AuraMeterHUD';
import { DualSubtitleHUD } from './components/DualSubtitleHUD';
import { ActionDeckHUD } from './components/ActionDeckHUD';
import { MobileTouchControls } from './components/MobileTouchControls';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { LevelSelectModal } from './components/LevelSelectModal';
import { IntroVideoModal } from './components/IntroVideoModal';
import { InventoryModal } from './components/InventoryModal';
import { AudioSettingsModal } from './components/AudioSettingsModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
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
    fireworksExploded: false,
    sniperStatus: 'STANDBY',
    aiAlertCount: 0,
    aliveEnemies: 4
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
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleLoginSuccess = (newProfile: UserProfile, newProgress?: LevelProgress[]) => {
    setProfile(newProfile);
    if (newProgress && newProgress.length > 0) {
      setProgress(newProgress);
    }
    // Restore from last played level or highest unlocked level
    const restoredLevel = newProfile.last_played_level || newProfile.highest_level_unlocked || 1;
    const clamped = Math.max(1, Math.min(10, restoredLevel));
    handleSelectChapter(clamped);
    setShowAuthModal(false);

    // If player has already played past level 1, skip intro video directly to action
    if (clamped > 1) {
      setShowIntroVideo(false);
    }
  };

  const handleSignOut = () => {
    ApiClient.clearToken();
    setProfile(null);
    setProgress([]);
    setShowAuthModal(true);
  };

  const currentLevelConfig = LEVELS.find((l) => l.id === currentLevelId) || LEVELS[0];

  // Keyboard shortcut [I] for Inventory
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

          // Restore from last played level or highest unlocked level
          const restoredLevel = data.profile.last_played_level || data.profile.highest_level_unlocked || 1;
          const clampedId = ((restoredLevel - 1) % 10) + 1;
          setCurrentLevelId(clampedId);
          if (threeGameManagerRef.current) {
            threeGameManagerRef.current.loadChapter(clampedId);
          }
          const dialogueMap: Record<number, string> = {
            1: 'lvl1_intro',
            2: 'lvl2_intro',
            3: 'lvl3_intro',
            4: 'lvl4_intro',
            5: 'lvl5_intro',
            6: 'lvl6_intro',
            7: 'lvl7_intro',
            8: 'lvl8_intro',
            9: 'lvl9_intro',
            10: 'lvl10_intro'
          };
          setActiveDialogue(dialogueMap[clampedId] || 'lvl1_intro');
          setShowAuthModal(false);

          // If returning player already advanced, do not pop prologue
          if (clampedId > 1) {
            setShowIntroVideo(false);
          }
        } else {
          // Gate the game: User MUST sign up or sign in to enter
          setProfile(null);
          setShowAuthModal(true);
        }
      } catch (e) {
        console.warn('Session expired or invalid, requiring authentication:', e);
        ApiClient.clearToken();
        setProfile(null);
        setShowAuthModal(true);
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

  const handleDistract = () => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.triggerDistraction();
    }
  };

  const handleCameoSummon = () => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.summonCameo(equippedCameoId);
    }
  };

  const handleTouchMoveVector = (dx: number, dz: number) => {
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.setTouchMoveVector(dx, dz);
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
    } else if (item.id === 'temple_bell_whistle') {
      handleDistract();
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

  const handleRetry = () => {
    setShowVictory(false);
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.retry();
    }
  };

  const handleSelectChapter = (id: number) => {
    const clampedId = ((id - 1) % 10) + 1;
    setCurrentLevelId(clampedId);
    setShowVictory(false);
    if (threeGameManagerRef.current) {
      threeGameManagerRef.current.loadChapter(clampedId);
    }
    // Persist current active level so player always restores from this chapter
    ApiClient.setActiveLevel(clampedId).catch((err) =>
      console.warn('Could not sync active chapter to cloud:', err)
    );
    const dialogueMap: Record<number, string> = {
      1: 'lvl1_intro',
      2: 'lvl2_intro',
      3: 'lvl3_intro',
      4: 'lvl4_intro',
      5: 'lvl5_intro',
      6: 'lvl6_intro',
      7: 'lvl7_intro',
      8: 'lvl8_intro',
      9: 'lvl9_intro',
      10: 'lvl10_intro'
    };
    setActiveDialogue(dialogueMap[clampedId] || 'lvl1_intro');
  };

  const handleNextLevel = () => {
    setShowVictory(false);
    const nextId = currentLevelId < 10 ? currentLevelId + 1 : 1;
    handleSelectChapter(nextId);
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
        onOpenAuth={() => setShowAuthModal(true)}
        currentLevel={currentLevelId}
      />

      {/* Main 3D WebGL Three.js Game Arena */}
      <main className="flex-1 relative flex items-center justify-center p-0 pt-12 sm:pt-14 pb-0">
        <ThreeGameContainer
          gameManagerRef={threeGameManagerRef}
          onStateUpdate={(data) => setGameData(data)}
          onDialogue={(key) => setActiveDialogue(key)}
          onVictory={handleLevelCompleted}
          currentLevel={currentLevelId}
        />

        {/* Top-Left Aura Meter, Viji LOS / Sniper Discipline & Motive HUD */}
        <AuraMeterHUD
          gameData={{
            aura: gameData.aura,
            multiplier: gameData.multiplier,
            composure: Math.round(gameData.composure),
            vijiSuspicion: Math.round(gameData.vijiSuspicion),
            hukumMode: gameData.hukumMode,
            phase: gameData.phase,
            activeDialogueKey: null,
            sniperStatus: gameData.sniperStatus,
            aiAlertCount: gameData.aiAlertCount,
            aliveEnemies: gameData.aliveEnemies
          }}
          levelTitle={currentLevelConfig.titleTanglish}
          levelSetting={currentLevelConfig.setting}
          objective={currentLevelConfig.motive}
        />

        {/* Bottom-Left Virtual Thumbstick / Directional D-Pad for Mobile & Touch */}
        <MobileTouchControls
          onMoveVector={handleTouchMoveVector}
          onTriggerTrap={handleTaxiDrift}
          onDistract={handleDistract}
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
          onDistract={handleDistract}
          onCameoSummon={handleCameoSummon}
          onOpenInventory={() => setShowInventory(true)}
          equippedCameoId={equippedCameoId}
          currentLevel={currentLevelId}
          sniperStatus={gameData.sniperStatus}
        />
      </main>

      {/* Introduction Video Cutscene Modal */}
      <IntroVideoModal
        isOpen={showIntroVideo}
        onClose={() => setShowIntroVideo(false)}
        onOpenAuth={() => setShowAuthModal(true)}
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
          isGoogleUser={Boolean(profile && profile.id && (profile.id.startsWith('g_') || (!profile.id.startsWith('guest_') && profile.email && !profile.email.includes('@hukum2.local'))))}
          onOpenAuth={() => setShowAuthModal(true)}
        />
      )}

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
      />

      <LevelSelectModal
        isOpen={showLevelSelect}
        onClose={() => setShowLevelSelect(false)}
        onSelectLevel={handleSelectChapter}
        highestUnlocked={profile?.highest_level_unlocked || 1}
        progressList={progress}
      />

      {/* Google OAuth Login & Dossier Authentication Modal */}
      <GoogleAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        profile={profile}
        onLoginSuccess={handleLoginSuccess}
        onSignOut={handleSignOut}
      />
    </div>
  );
};

export default App;
