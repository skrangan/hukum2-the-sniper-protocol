import React from 'react';
import { Volume2 } from 'lucide-react';
import dialoguesData from '../data/dialogues.json';
import { soundManager } from '../game/audio/SoundManager';

interface DualSubtitleHUDProps {
  dialogueKey: string | null;
  onDismiss?: () => void;
}

export const DualSubtitleHUD: React.FC<DualSubtitleHUDProps> = ({
  dialogueKey,
  onDismiss
}) => {
  if (!dialogueKey) return null;

  const dialogue = (dialoguesData.dialogues as any)[dialogueKey];
  if (!dialogue) return null;

  const getPortraitSrc = (portrait: string) => {
    switch (portrait) {
      case 'tiger_smirk':
      case 'tiger_glasses_flip':
      case 'tiger_coffee':
        return '/assets/portraits/tiger.jpg';
      case 'viji_scowl':
        return '/assets/portraits/viji.jpg';
      case 'vimal_taxi':
        return '/assets/portraits/vimal.jpg';
      case 'narasimha_rage':
        return '/assets/portraits/narasimha.jpg';
      case 'mathew_cigar':
        return '/assets/portraits/mathew.jpg';
      default:
        return '/assets/portraits/tiger.jpg';
    }
  };

  const getRoleTitle = (speaker: string) => {
    switch (speaker) {
      case 'TIGER':
        return 'MUTHUVEL PANDIAN // THE RETIRED JAILER';
      case 'VIJI':
        return 'VIJI PANDIAN // DOMESTIC SURVEILLANCE';
      case 'VIMAL':
        return 'VIMAL // GOA TOURIST TAXI CORPS';
      case 'NARASIMHA':
        return 'NARASIMHA // MANDYA SYNDICATE KINGPIN';
      case 'MATHEW':
        return 'MATHEW // KERALA OVERLORD';
      default:
        return 'FIELD TRANSMISSION // ENCRYPTED';
    }
  };

  return (
    <div
      onClick={() => {
        soundManager.playUiClick();
        if (onDismiss) onDismiss();
      }}
      data-testid="dual-subtitle-hud"
      className="absolute bottom-5 left-5 sm:left-1/2 sm:-translate-x-1/2 z-30 w-11/12 max-w-xl cursor-pointer select-none"
    >
      <div className="relative bg-slate-950/92 backdrop-blur-xl border border-amber-500/45 rounded-2xl p-3.5 shadow-[0_15px_45px_rgba(0,0,0,0.9)] flex items-center space-x-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Top Anamorphic Accent Line */}
        <div className="absolute top-0 inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Realistic Character Portrait Frame */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-lg bg-slate-900">
          <img
            src={getPortraitSrc(dialogue.portrait)}
            alt={dialogue.speaker}
            className="w-full h-full object-cover object-top filter contrast-115"
          />
          <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-mono text-amber-300 text-center uppercase py-0.5">
            {dialogue.speaker}
          </div>
        </div>

        {/* Dual Subtitles Content */}
        <div className="flex-1 text-left min-w-0">
          {/* Speaker Role Tag */}
          <div className="flex items-center space-x-1.5 text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400/90">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span className="truncate">{getRoleTitle(dialogue.speaker)}</span>
          </div>

          {/* Primary Line: Bold Yellow Tanglish */}
          <div className="text-sm sm:text-base font-bold text-amber-300 font-dialogue leading-snug mt-0.5">
            "{dialogue.tanglish}"
          </div>

          {/* Secondary Line: Crisp White/Cyan English Subtitle */}
          <div className="text-xs font-medium text-slate-300 mt-0.5 italic leading-snug">
            "{dialogue.english}"
          </div>
        </div>

        {/* Dismiss indicator */}
        <div className="flex-shrink-0 self-end text-[9px] font-mono text-slate-500 uppercase tracking-widest">
          [DISMISS]
        </div>
      </div>
    </div>
  );
};
