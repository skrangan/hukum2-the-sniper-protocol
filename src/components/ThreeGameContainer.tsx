import React, { useEffect, useRef } from 'react';
import { Compass } from 'lucide-react';
import { ThreeGameManager } from '../game/three/ThreeGameManager';
import { Game3DState } from '../game/three/MarketScene3D';

interface ThreeGameContainerProps {
  onStateUpdate: (state: Game3DState) => void;
  onDialogue: (key: string) => void;
  onVictory: (summary: any) => void;
  gameManagerRef: React.MutableRefObject<ThreeGameManager | null>;
  currentLevel?: number;
}

export const ThreeGameContainer: React.FC<ThreeGameContainerProps> = ({
  onStateUpdate,
  onDialogue,
  onVictory,
  gameManagerRef,
  currentLevel = 1
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new ThreeGameManager(
      mountRef.current,
      onStateUpdate,
      onDialogue,
      onVictory
    );
    gameManagerRef.current = manager;

    if (currentLevel && currentLevel > 1) {
      manager.loadChapter(currentLevel);
    }

    return () => {
      manager.destroy();
      gameManagerRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-stone-950 overflow-hidden">
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-crosshair select-none touch-none"
      />

      {/* Subtle Cinema Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 60%, rgba(12, 8, 5, 0.72) 100%)'
        }}
      />

      {/* Top-Right Controls Guide */}
      <div className="absolute top-16 right-5 z-20 hidden lg:flex flex-col space-y-1.5 bg-stone-950/88 backdrop-blur-xl border border-amber-600/30 p-3 rounded-2xl text-left pointer-events-none select-none text-[11px] text-stone-300 shadow-2xl w-68">
        <div className="flex items-center justify-between text-[10px] font-black text-amber-400 uppercase tracking-widest border-b border-stone-800 pb-1">
          <span className="flex items-center space-x-1">
            <Compass className="w-3 h-3 text-amber-400" />
            <span>TACTICAL CONTROLS</span>
          </span>
          <span className="text-amber-200/80">CHAPTER {currentLevel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Walk / Tap Street</span>
          <span className="font-mono font-bold text-white">[WASD / Tap]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Distract / Temple Bell</span>
          <span className="font-mono font-bold text-cyan-300">[Q]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Street Trap</span>
          <span className="font-mono font-bold text-amber-300">[E / Click / 2]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">
            {currentLevel === 2 ? 'Shake Specs (2x)' : 'Flip Shades (Hukum)'}
          </span>
          <span className="font-mono font-bold text-yellow-400">[SPACE]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-400">Inventory & Allies</span>
          <span className="font-mono font-bold text-amber-200">[I]</span>
        </div>
      </div>
    </div>
  );
};
