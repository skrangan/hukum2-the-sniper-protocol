import React, { useState, useEffect } from 'react';
import { Play, SkipForward, Sparkles, Crosshair, Film } from 'lucide-react';
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

  // Directly inspired by the iconic Jailer Movie Trailer & Official Showcase
  const trailerScenes = [
    {
      trailerTag: "OFFICIAL TRAILER // SCENE 01",
      speaker: "VIJI (RAMYA KRISHNAN)",
      title: "THE DECEPTIVE RETIREMENT",
      quoteTanglish: "Avar romba innocent... Yaar koodayum sanda poda maattaru. Thappu nadandha kooda thala kuninju poiduvaaru.",
      quoteEnglish: "He is completely harmless... He never fights with anyone. Even if insulted, he just lowers his head and walks away.",
      image: "/assets/portraits/viji.jpg",
      characterName: "VIJI PANDIAN",
      characterSub: "TIGER'S UNSUSPECTING FAMILY",
      bgGradient: "from-slate-950 via-slate-900 to-amber-950/40",
      accentColor: "border-amber-500/40 text-amber-400"
    },
    {
      trailerTag: "OFFICIAL TRAILER // SCENE 02",
      speaker: "VARMAN / KALPAK SYNDICATE",
      title: "THE FATAL PROVOCATION",
      quoteTanglish: "Oru alavukku mela namma kitta pesave koodathu nu oru vishayam irukku... Aana ivan koodave ninnu pesuraan. Mudichu vidunga avana!",
      quoteEnglish: "There is a line you never cross with us... But this retired old man keeps defying us. Wipe him and his family out!",
      image: "/assets/portraits/vimal.jpg",
      characterName: "THE CRIME SYNDICATE",
      characterSub: "FATAL MISTAKE: TARGETING THE JAILER",
      bgGradient: "from-slate-950 via-slate-900 to-red-950/50",
      accentColor: "border-red-500/40 text-red-400"
    },
    {
      trailerTag: "OFFICIAL TRAILER // SCENE 03",
      speaker: "TIGER MUTHUVEL PANDIAN",
      title: "THE MONSTER AWAKENS",
      quoteTanglish: "Naan paatha velai vera... Ippo paakura velai vera. Oru mudivu eduthutta, pinvaanga maatten.",
      quoteEnglish: "The job I retired from was brutal... What I am about to do now is far worse. Once I take a decision, I never step back.",
      image: "/assets/portraits/tiger.jpg",
      characterName: "SUPERSTAR RAJINIKANTH",
      characterSub: "AS 'TIGER' MUTHUVEL PANDIAN",
      bgGradient: "from-slate-950 via-zinc-900 to-yellow-950/60",
      accentColor: "border-yellow-500/60 text-yellow-400"
    },
    {
      trailerTag: "OFFICIAL TRAILER // SCENE 04",
      speaker: "MATHEW & NARASIMHA",
      title: "THE PAN-INDIA ALLIES",
      quoteTanglish: "Tiger sonna... Thalaigal urulum. Ivide oru phone call vandhal, Chennai-ye ratha kaadaa maarum.",
      quoteEnglish: "When Tiger gives the word... heads roll. One phone call to Kerala and Karnataka, and this entire city turns into a warzone.",
      image: "/assets/portraits/mathew.jpg",
      characterName: "MOHANLAL & SHIVA RAJKUMAR",
      characterSub: "MATHEW (KERALA) & NARASIMHA (KARNATAKA)",
      bgGradient: "from-slate-950 via-purple-950/50 to-slate-950",
      accentColor: "border-purple-500/50 text-purple-400"
    },
    {
      trailerTag: "OFFICIAL TRAILER // CLIMAX",
      speaker: "TIGER MUTHUVEL PANDIAN",
      title: "THE FINAL VERDICT",
      quoteTanglish: "Alappara Kelapparom! Thambi... Unna maadhiri ethanayo per-ah paathavan naan. HUKUM... TIGER KA HUKUM!",
      quoteEnglish: "Total mayhem begins! Kid... I've dealt with dozens of monsters like you. THE VERDICT... IS TIGER'S ALONE!",
      image: "/assets/portraits/poster.jpg",
      characterName: "HUKUM 2: THE SNIPER PROTOCOL",
      characterSub: "10 HIGH-STAKES CHAPTERS • 3D ACTION SET-PIECES",
      bgGradient: "from-slate-950 via-red-950/60 to-yellow-950/40",
      accentColor: "border-yellow-400 text-yellow-400"
    }
  ];

  // Sound and timing sync with trailer beats
  useEffect(() => {
    if (!isOpen) return;

    // Trigger audio cues corresponding to trailer beat
    if (sceneIndex === 0) {
      soundManager.playAlert();
    } else if (sceneIndex === 2) {
      soundManager.playSpectacleFlipBassDrop(); // The bass drops when Tiger's past is revealed
    } else if (sceneIndex === 4) {
      soundManager.playSniperShot();
      soundManager.playSpectacleFlipBassDrop();
    }

    const timer = setInterval(() => {
      setSceneIndex((prev) => {
        if (prev < trailerScenes.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [isOpen, sceneIndex]);

  if (!isOpen) return null;

  const current = trailerScenes[sceneIndex];

  const handleNext = () => {
    if (sceneIndex < trailerScenes.length - 1) {
      setSceneIndex(sceneIndex + 1);
    } else {
      soundManager.playSpectacleFlipBassDrop();
      onStartGame();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black text-white select-none animate-in fade-in duration-500 overflow-hidden">
      {/* Top Anamorphic Cinema Letterbox Bar (2.35:1 Widescreen) */}
      <div className="w-full h-12 md:h-16 bg-black z-30 flex items-center justify-between px-8 border-b border-white/10">
        <div className="flex items-center space-x-2.5 text-xs font-mono text-yellow-400 tracking-wider">
          <Film className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="font-bold">JAILER 2 // OFFICIAL SHOWCASE TRAILER</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-400">BEAT {sceneIndex + 1} OF 5</span>
        </div>

        <button
          onClick={() => {
            onStartGame();
            onClose();
          }}
          className="flex items-center space-x-1.5 px-4 py-1.5 text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-200 rounded-full transition"
        >
          <span>SKIP TO 3D GAMEPLAY</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Cinematic Video Stage */}
      <div className={`flex-1 relative flex items-center justify-center p-6 bg-gradient-to-br ${current.bgGradient} transition-colors duration-1000`}>
        {/* Film grain and vignette overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50" />

        <div className="relative max-w-5xl w-full flex flex-col md:flex-row items-center gap-8 md:gap-12 z-20">
          {/* Character Visual Frame with Cinematic Glow */}
          <div className="relative w-64 h-80 md:w-88 md:h-[420px] rounded-3xl overflow-hidden border-2 border-yellow-500/50 shadow-[0_0_60px_rgba(234,179,8,0.35)] flex-shrink-0 bg-slate-950 group">
            <img
              src={current.image}
              alt={current.characterName}
              className="w-full h-full object-cover object-top filter contrast-125 saturate-110 group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Cinematic Gradient Vignette on Portrait */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

            {/* Character Badge Overlay */}
            <div className="absolute bottom-0 inset-x-0 p-4 text-left">
              <div className="text-[10px] font-mono font-bold tracking-widest text-yellow-400 uppercase flex items-center space-x-1">
                <Crosshair className="w-3 h-3 text-red-500" />
                <span>{current.characterSub}</span>
              </div>
              <div className="text-sm font-black text-white font-display uppercase tracking-wider mt-0.5">
                {current.characterName}
              </div>
            </div>
          </div>

          {/* Cinematic Dialogue & Trailer Typography */}
          <div className="flex-1 text-left space-y-4">
            {/* Trailer Scene Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-[10px] font-mono tracking-widest uppercase text-slate-300">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>{current.trailerTag}</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl md:text-5xl font-black text-white font-display uppercase tracking-wider leading-none drop-shadow-xl">
              {current.title}
            </h2>

            {/* Speaker Tag */}
            <div className="text-xs font-black uppercase tracking-widest text-yellow-500 font-mono">
              — {current.speaker}
            </div>

            {/* Dual Tanglish + English Subtitle Box (Movie Trailer Localization) */}
            <div className="bg-slate-900/90 backdrop-blur-md border-l-4 border-yellow-500 p-5 rounded-r-2xl space-y-2 shadow-2xl">
              <div className="text-lg md:text-2xl font-bold text-yellow-300 font-dialogue leading-snug">
                "{current.quoteTanglish}"
              </div>
              <div className="text-xs md:text-sm text-slate-300 italic font-medium leading-relaxed">
                "{current.quoteEnglish}"
              </div>
            </div>

            {/* Beat Progress Dots & Action Buttons */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-2">
                {trailerScenes.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSceneIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === sceneIndex ? 'w-8 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]' : 'w-2.5 bg-slate-800 hover:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl shadow-xl hover:brightness-110 active:scale-95 transition text-xs uppercase tracking-wider font-display"
              >
                <span>{sceneIndex === trailerScenes.length - 1 ? 'ENTER 3D BATTLE' : 'NEXT TRAILER BEAT'}</span>
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Anamorphic Cinema Letterbox Bar */}
      <div className="w-full h-12 md:h-16 bg-black z-30 flex items-center justify-between px-8 border-t border-white/10 text-[11px] text-slate-500 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>ANIRUDH RAVICHANDER ORIGINAL SCORE SYNTHESIS</span>
        </div>
        <div className="hidden sm:block">HUKUM 2: THE SNIPER PROTOCOL // THREE.JS 3D ENGINE</div>
      </div>
    </div>
  );
};
