import React, { useEffect, useRef } from 'react';
import { ThreeGameManager } from '../game/three/ThreeGameManager';
import { Game3DState } from '../game/three/MarketScene3D';

interface ThreeGameContainerProps {
  onStateUpdate: (state: Game3DState) => void;
  onDialogue: (key: string) => void;
  onVictory: (summary: any) => void;
  gameManagerRef: React.MutableRefObject<ThreeGameManager | null>;
}

export const ThreeGameContainer: React.FC<ThreeGameContainerProps> = ({
  onStateUpdate,
  onDialogue,
  onVictory,
  gameManagerRef
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

    return () => {
      manager.destroy();
      gameManagerRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
      {/* 3D WebGL Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-crosshair select-none"
      />

      {/* 3D Visual Overlay Controls Guide */}
      <div className="absolute top-20 right-6 z-20 hidden md:flex flex-col space-y-1 bg-slate-900/75 backdrop-blur-md border border-slate-700/60 p-2.5 rounded-xl text-left pointer-events-none select-none text-[11px] text-slate-300">
        <div className="text-[10px] font-black text-yellow-400 uppercase tracking-widest font-mono">
          3D CONTROLS
        </div>
        <div><span className="font-bold text-white">[WASD / Arrows]</span> Swagger Walk</div>
        <div><span className="font-bold text-white">[Click / E]</span> Kick Coconut</div>
        <div><span className="font-bold text-yellow-400">[SPACE]</span> Spectacle Flip (3D Bullet-Time)</div>
      </div>
    </div>
  );
};
