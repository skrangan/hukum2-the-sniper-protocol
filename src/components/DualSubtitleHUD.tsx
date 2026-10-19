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
      case 'moorthy_clueless':
        return '/assets/portraits/moorthy.jpg';
      default:
        return '/assets/portraits/tiger.jpg';
    }
  };

  const getRoleTitle = (speaker: string) => {
    switch (speaker) {
      case 'TIGER':
        return 'MUTHUVEL PANDIAN • THE RETIRED JAILER';
      case 'VIJI':
        return 'VIJI PANDIAN • TIGER’S WIFE';
      case 'VIMAL':
        return 'VIMAL • GOA TOURIST TAXI DRIVER';
      case 'NARASIMHA':
        return 'NARASIMHA • MANDYA BROTHERHOOD';
      case 'MATHEW':
        return 'MATHEW • KOCHI KINGPIN';
      default:
        return speaker;
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
      <div className="relative bg-stone-950/92 backdrop-blur-xl border border-amber-500/45 rounded-2xl p-3.5 shadow-[0_15px_45px_rgba(0,0,0,0.9)] flex items-center space-x-3.5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Top Anamorphic Accent Line */}
        <div className="absolute top-0 inset-x-8 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Realistic Character Portrait Frame */}
        <div className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 border-amber-400/60 shadow-lg bg-stone-900">
          <img
            src={getPortraitSrc(dialogue.portrait)}
            alt={dialogue.speaker}
            className="w-full h-full object-cover object-top filter contrast-115"
          />
          <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-bold text-amber-300 text-center uppercase py-0.5">
            {dialogue.speaker}
          </div>
        </div>

        {/* Dual Subtitles Content */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-400/90">
            <Volume2 className="w-3 h-3 text-amber-400" />
            <span className="truncate">{getRoleTitle(dialogue.speaker)}</span>
          </div>

          {/* Primary Line: Bold Yellow Tanglish */}
          <div className="text-sm sm:text-base font-bold text-amber-300 font-dialogue leading-snug mt-0.5">
            &ldquo;{dialogue.tanglish}&rdquo;
          </div>

          {/* Secondary Line: Crisp English Subtitle */}
          <div className="text-xs font-medium text-stone-300 mt-0.5 italic leading-snug">
            &ldquo;{dialogue.english}&rdquo;
          </div>
        </div>
      </div>
    </div>
  );
};
