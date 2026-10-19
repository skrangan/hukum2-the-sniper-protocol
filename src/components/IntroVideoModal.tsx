import React, { useState, useEffect } from 'react';
import { Play, SkipForward, Sparkles, Crosshair, Music } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({
  isOpen,
  onClose,
  onStartGame
}) => {
  const [sceneIndex, setSceneIndex] = useState(0);

  const scenes = [
    {
      badge: 'PROLOGUE // CHENNAI BAZAAR 2026',
      headline: 'A RETIRED LEGEND IN PEACE',
      quoteTanglish: 'Viji kooda peaceful-ah market poratha thaan plan pannom...',
      quoteEnglish: 'I planned a quiet retirement... just vegetable shopping with my wife.',
      image: '/assets/portraits/tiger.jpg',
      tagline: "SUPERSTAR RAJINIKANTH AS 'TIGER' MUTHUVEL PANDIAN",
      bgGradient: 'from-slate-950 via-amber-950/50 to-slate-950'
    },
    {
      badge: 'THE FAMILY',
      headline: 'DOMESTIC STEALTH PROTOCOL',
      quoteTanglish: 'Ennanga! Kaila enna coconut-u? Market-la vambu ethuvum pannalayae?',
      quoteEnglish: "Hey! What's that coconut in your hand? You better not be picking fights!",
      image: '/assets/portraits/viji.jpg',
      tagline: "VIJI PANDIAN — AVOID HER SURVEILLANCE CONE",
      bgGradient: 'from-slate-950 via-rose-950/45 to-slate-950'
    },
    {
      badge: 'THE GETAWAY',
      headline: 'GOA TOURIST TAXI CORPS',
      quoteTanglish: 'Thalaiva! Auto handbrake loose-ah thaan irukku. Oru thattu thattuna flat-u!',
      quoteEnglish: 'Boss! The rickshaw handbrake is loose. One tap and those thugs are wiped out!',
      image: '/assets/portraits/vimal.jpg',
      tagline: 'VIMAL — PREMIER PADMINI EXTRACTION SPECIALIST',
      bgGradient: 'from-slate-950 via-yellow-950/45 to-slate-950'
    },
    {
      badge: 'THE ALLIES ASSEMBLE',
      headline: 'THE CAMEO SYNDICATE',
      quoteTanglish: 'Ivide oru Mercedes vandhaal... Barricades ellam thool-aakum.',
      quoteEnglish: 'When this vintage Mercedes rolls in... barricades turn to dust.',
      image: '/assets/portraits/mathew.jpg',
      tagline: 'MATHEW (MOHANLAL) & NARASIMHA (SHIVA RAJKUMAR)',
      bgGradient: 'from-slate-950 via-purple-950/45 to-slate-950'
    },
    {
      badge: 'THE VERDICT',
      headline: 'HUKUM 2: THE SNIPER PROTOCOL',
      quoteTanglish: 'Alapara Kelapparom! HUKUM... TIGER KA HUKUM!',
      quoteEnglish: "Unleash total mayhem! The Verdict... Is Tiger's Alone!",
      image: '/assets/portraits/poster.jpg',
      tagline: '10 HIGH-STAKES CHAPTERS • REALISTIC 3D OVERWATCH',
      bgGradient: 'from-slate-950 via-red-950/55 to-slate-950'
    }
  ];

  useEffect(() => {
    if (!isOpen) return;

    soundManager.playSpectacleFlipBassDrop();
    soundManager.startCinematicBgm('stealth');

    const timer = setInterval(() => {
      setSceneIndex((prev) => {
        if (prev < scenes.length - 1) {
          soundManager.playAlert();
          return prev + 1;
        }
        return prev;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentScene = scenes[sceneIndex];

  const handleNext = () => {
    if (sceneIndex < scenes.length - 1) {
      soundManager.playAlert();
      setSceneIndex(sceneIndex + 1);
    } else {
      soundManager.playSpectacleFlipBassDrop();
      soundManager.startCinematicBgm('stealth');
      onStartGame();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none animate-in fade-in duration-500 overflow-hidden"
      data-testid="intro-video-modal"
    >
      {/* Top Anamorphic Cinema Letterbox Bar */}
      <div className="w-full h-12 md:h-16 bg-black z-30 flex items-center justify-between px-8 border-b border-white/10">
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
          <Crosshair className="w-4 h-4 animate-spin text-red-500" />
          <span>CINEMATIC PROLOGUE // 2.35:1 ANAMORPHIC WIDESCREEN</span>
        </div>
        <button
          onClick={() => {
            soundManager.playUiClick();
            soundManager.startCinematicBgm('stealth');
            onStartGame();
            onClose();
          }}
          data-testid="skip-intro-button"
          className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-full transition"
        >
          <span>ENTER 3D BAZAAR</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Cinematic Video Stage */}
      <div
        className={`flex-1 relative flex items-center justify-center p-6 bg-gradient-to-br ${currentScene.bgGradient} transition-colors duration-1000`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

        <div className="relative max-w-4xl w-full flex flex-col md:flex-row items-center gap-8 z-20">
          {/* Realistic Character Visual Frame */}
          <div className="relative w-64 h-80 md:w-80 md:h-96 rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_55px_rgba(245,158,11,0.3)] flex-shrink-0 bg-slate-950">
            <img
              src={currentScene.image}
              alt={currentScene.headline}
              className="w-full h-full object-cover object-top filter contrast-115 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-0 inset-x-0 p-3.5 bg-gradient-to-t from-black via-black/85 to-transparent">
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                {currentScene.tagline}
              </span>
            </div>
          </div>

          {/* Cinematic Titles & Dual Subtitles */}
          <div className="flex-1 text-left space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono tracking-widest uppercase">
              <Sparkles className="w-3 h-3" />
              <span>{currentScene.badge}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase tracking-wider leading-none drop-shadow-lg">
              {currentScene.headline}
            </h2>

            {/* Dual Tanglish + English Subtitle Box */}
            <div className="bg-slate-900/85 backdrop-blur-md border-l-4 border-amber-500 p-4 rounded-r-2xl space-y-2 shadow-xl">
              <div className="text-lg md:text-xl font-bold text-amber-300 font-dialogue leading-snug">
                "{currentScene.quoteTanglish}"
              </div>
              <div className="text-sm text-slate-300 italic font-medium">
                "{currentScene.quoteEnglish}"
              </div>
            </div>

            {/* Scene Progression Dots & Action */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-2">
                {scenes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSceneIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === sceneIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition"
              >
                <span>{sceneIndex === scenes.length - 1 ? 'DEPLOY 3D TIGER' : 'NEXT SCENE'}</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Anamorphic Cinema Letterbox Bar */}
      <div className="w-full h-12 md:h-16 bg-black z-30 flex items-center justify-between px-8 border-t border-white/10 text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-2">
          <Music className="w-3.5 h-3.5 text-amber-400" />
          <span>AUDIO: 7.1 DOLBY SURROUND SYNTHESIS (ANIRUDH MASS SCORE)</span>
        </div>
        <div>HUKUM 2: THE SNIPER PROTOCOL • WEBGL 3D ENGINE</div>
      </div>
    </div>
  );
};
