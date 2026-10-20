import React, { useState } from 'react';
import { Play, SkipForward, Sparkles, Crosshair, Music } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: () => void;
  onOpenAuth?: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  onOpenAuth
}) => {
  const [sceneIndex, setSceneIndex] = useState(0);

  const scenes = [
    {
      badge: 'PROLOGUE I • THE LEGACY OF TIHAR JAIL & ARJUN’S SACRIFICE',
      headline: 'A RETIRED JAILER’S SILENT DHARMA',
      quoteTanglish: 'Viji kooda peaceful-ah market poratha thaan plan pannom... Aana Varman-oda Goa cartel innum mudiyala.',
      quoteEnglish: 'After upholding dharma over my own corrupt son Arjun and ending Varman, I wanted peace with Viji and Rithu... until the Goa cartel came hunting.',
      image: '/assets/portraits/tiger.jpg',
      tagline: "'TIGER' MUTHUVEL PANDIAN • FORMER TIHAR JAILER",
      bgGradient: 'from-stone-950 via-amber-950/50 to-stone-950'
    },
    {
      badge: 'PROLOGUE II • MYLAPORE MARKET & FAMILY SECRECY',
      headline: 'VIJI PANDIAN WATCHING CLOSELY',
      quoteTanglish: 'Ennanga! Kaila enna Pollachi coconut-u? Rithu school street-la vambu ethuvum pannalayae?',
      quoteEnglish: "Hey! What's that Pollachi coconut in your hand? You better not be picking fights near Rithu's school!",
      image: '/assets/portraits/viji.jpg',
      tagline: 'VIJI PANDIAN • PROTECT HER FROM THE TRUTH & STREET VIOLENCE',
      bgGradient: 'from-stone-950 via-rose-950/45 to-stone-950'
    },
    {
      badge: 'PROLOGUE III • MOORTHY SIR’S DECOY & VIMAL’S TAXI',
      headline: '6 SUVs ON THE BRIDGE & TWO SHAKES OF THE SPECS',
      quoteTanglish: 'Aiyayyo Thalaiva! 6 black SUV vazhiya marichu nikkudhu... Kannadiya rendu vaati aatuna car key en kayila vandhu vizhudha?!',
      quoteEnglish: 'Boss! 6 black SUVs block the bridge while Moorthy Sir brags... Shake your aviators twice and the hilltop snipers bounce the keys into Vimal’s hands!',
      image: '/assets/portraits/vimal.jpg',
      tagline: 'VIMAL (PREMIER PADMINI TAXI) & MOORTHY SIR (CLUELESS PAWN)',
      bgGradient: 'from-stone-950 via-yellow-950/45 to-stone-950'
    },
    {
      badge: 'PROLOGUE IV • KOCHI PORT, MANDYA & TIHAR BROTHERHOOD',
      headline: 'MATHEW, NARASIMHA & RODDY STAND READY',
      quoteTanglish: 'Ivide oru vintage Mercedes vandhaal... Kalpak cartel barricades ellam thool-aakum!',
      quoteEnglish: 'From Mathew at Kochi Port to Narasimha in Mysuru and Roddy in the skies — Tiger’s brotherhood answers a single call.',
      image: '/assets/portraits/mathew.jpg',
      tagline: 'MATHEW (KOCHI) • NARASIMHA (MANDYA) • RODDY (AIR SUPPORT)',
      bgGradient: 'from-stone-950 via-stone-900 to-stone-950'
    },
    {
      badge: 'PROLOGUE V • THE KALPAK DYNASTY IN GOA (10 CHAPTERS)',
      headline: 'HUKUM... TIGER KA HUKUM!',
      quoteTanglish: 'Kantha, Bodhi, Chakri Kalpak... 24 mani nerathula alapara kelapparom! HUKUM... TIGER KA HUKUM!',
      quoteEnglish: "Against Dileep, Kantha, Bodhi, and patriarch Chakri Kalpak — Unleash total mayhem! The Verdict Is Tiger's Alone!",
      image: '/assets/portraits/poster.jpg',
      tagline: 'JAILER 2: HUKUM — THE SNIPER PROTOCOL',
      bgGradient: 'from-stone-950 via-red-950/55 to-stone-950'
    }
  ];

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
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none animate-in fade-in duration-500 overflow-y-auto"
      data-testid="intro-video-modal"
    >
      {/* Top Anamorphic Cinema Letterbox Bar */}
      <div className="w-full h-12 md:h-16 bg-black z-30 flex items-center justify-between px-4 md:px-8 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center space-x-2 text-[11px] md:text-xs font-mono text-amber-400">
          <Crosshair className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="truncate">JAILER 2: HUKUM • STORY PROLOGUE</span>
        </div>
        <div className="flex items-center space-x-2">
          {onOpenAuth && (
            <button
              onClick={() => {
                soundManager.playUiClick();
                onOpenAuth();
              }}
              data-testid="prologue-google-login"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 hover:border-amber-500/50 text-stone-200 rounded-full transition flex-shrink-0"
            >
              {/* Google G SVG */}
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Sign In with Google</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}

          <button
            onClick={() => {
              soundManager.playUiClick();
              soundManager.startCinematicBgm('stealth');
              onStartGame();
              onClose();
            }}
            data-testid="skip-intro-button"
            className="flex items-center space-x-1.5 px-3 md:px-4 py-1.5 text-xs font-bold bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-full transition flex-shrink-0"
          >
            <span>ENTER MARKET SCENE</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Cinematic Video Stage */}
      <div
        className={`flex-1 relative flex items-center justify-center p-4 md:p-6 bg-gradient-to-br ${currentScene.bgGradient} transition-colors duration-700`}
      >
        <div className="relative max-w-4xl w-full flex flex-col md:flex-row items-center gap-5 md:gap-8 z-20">
          {/* Realistic Character Visual Frame */}
          <div className="relative w-48 h-56 sm:w-60 sm:h-72 md:w-80 md:h-96 rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-[0_0_55px_rgba(245,158,11,0.3)] flex-shrink-0 bg-stone-950">
            <img
              key={currentScene.image}
              src={currentScene.image}
              alt={currentScene.headline}
              data-testid={`prologue-portrait-${sceneIndex}`}
              className="w-full h-full object-cover object-top filter contrast-115"
            />
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/85 to-transparent">
              <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-amber-400 uppercase block leading-tight">
                {currentScene.tagline}
              </span>
            </div>
          </div>

          {/* Cinematic Titles & Dual Subtitles */}
          <div className="flex-1 text-left space-y-3 md:space-y-4">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] md:text-[10px] font-bold tracking-widest uppercase">
              <Sparkles className="w-3 h-3 flex-shrink-0" />
              <span>{currentScene.badge}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white font-display uppercase tracking-wider leading-none drop-shadow-lg">
              {currentScene.headline}
            </h2>

            {/* Dual Tanglish + English Subtitle Box */}
            <div className="bg-stone-900/85 backdrop-blur-md border-l-4 border-amber-500 p-3.5 md:p-4 rounded-r-2xl space-y-1.5 md:space-y-2 shadow-xl">
              <div className="text-base md:text-xl font-bold text-amber-300 font-dialogue leading-snug">
                &ldquo;{currentScene.quoteTanglish}&rdquo;
              </div>
              <div className="text-xs md:text-sm text-stone-300 italic font-medium">
                &ldquo;{currentScene.quoteEnglish}&rdquo;
              </div>
            </div>

            {/* Scene Progression Dots & Action */}
            <div className="flex items-center justify-between pt-2 md:pt-4">
              <div className="flex space-x-2">
                {scenes.map((sc, idx) => (
                  <button
                    key={idx}
                    data-testid={`prologue-dot-${idx}`}
                    onClick={() => {
                      soundManager.playUiClick();
                      setSceneIndex(idx);
                    }}
                    title={sc.tagline}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === sceneIndex ? 'w-8 bg-amber-400' : 'w-2.5 bg-stone-700 hover:bg-stone-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                data-testid="prologue-next-button"
                className="flex items-center space-x-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-stone-950 font-black text-xs md:text-sm rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition"
              >
                <span>{sceneIndex === scenes.length - 1 ? 'START CHAPTER 1' : 'NEXT DOSSIER'}</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Anamorphic Cinema Letterbox Bar */}
      <div className="w-full h-10 md:h-16 bg-black z-30 flex items-center justify-between px-4 md:px-8 border-t border-white/10 text-[10px] md:text-xs text-stone-400 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Music className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span className="truncate">MUSIC INSPIRED BY ANIRUDH RAVICHANDER • HUKUM THEME</span>
        </div>
        <div className="hidden sm:block">MUTHUVEL PANDIAN • CHENNAI • KOCHI • MYSURU • GOA</div>
      </div>
    </div>
  );
};
