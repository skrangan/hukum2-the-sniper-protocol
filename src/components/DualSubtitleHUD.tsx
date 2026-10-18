import React from 'react';
import dialoguesData from '../data/dialogues.json';

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

  // Portrait emoji / symbol
  const getPortraitIcon = (portrait: string) => {
    switch (portrait) {
      case 'tiger_smirk':
      case 'tiger_glasses_flip':
      case 'tiger_coffee':
        return '🕶️';
      case 'viji_scowl':
        return '👩‍🍳';
      case 'vimal_taxi':
        return '🚕';
      case 'moorthy_clueless':
        return '👓';
      case 'narasimha_rage':
        return '🐅';
      case 'mathew_cigar':
        return '🚬';
      default:
        return '👤';
    }
  };

  return (
    <div
      onClick={onDismiss}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-2xl cursor-pointer select-none"
    >
      <div className="bg-slate-900/90 backdrop-blur-md border-2 border-yellow-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex items-start space-x-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Character Portrait Box */}
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-yellow-500/30 flex items-center justify-center text-3xl shadow-inner">
          {getPortraitIcon(dialogue.portrait)}
        </div>

        {/* Dual Subtitles Content */}
        <div className="flex-1 text-left">
          {/* Speaker Name Tag */}
          <div className="text-[10px] font-black uppercase tracking-widest text-yellow-500 font-display">
            {dialogue.speaker}
          </div>

          {/* Primary Line: Bold Yellow Tanglish */}
          <div className="text-base sm:text-lg font-bold text-yellow-300 font-dialogue leading-snug mt-0.5">
            "{dialogue.tanglish}"
          </div>

          {/* Secondary Line: Crisp White/Cyan English Subtitle */}
          <div className="text-xs sm:text-sm font-medium text-slate-300 mt-1 italic">
            "{dialogue.english}"
          </div>
        </div>

        {/* Click to continue hint */}
        <div className="flex-shrink-0 self-end text-[10px] text-slate-500 uppercase tracking-widest animate-pulse">
          TAP ▾
        </div>
      </div>
    </div>
  );
};
