import React, { useEffect, useRef } from 'react';
import { Crosshair } from 'lucide-react';
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

      {/* Realistic Cinematic Vignette & Subtle Film Grain Overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, transparent 58%, rgba(2, 6, 23, 0.72) 100%)'
        }}
      />

      {/* Top-Right Tactical Field Manual & Keybind Telemetry */}
      <div className="absolute top-16 right-5 z-20 hidden md:flex flex-col space-y-1.5 bg-slate-950/88 backdrop-blur-xl border border-amber-500/30 p-3 rounded-2xl text-left pointer-events-none select-none text-[11px] text-slate-300 shadow-2xl w-64">
        <div className="flex items-center justify-between text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono border-b border-slate-800 pb-1">
          <span className="flex items-center space-x-1">
            <Crosshair className="w-3 h-3 text-red-400" />
            <span>FIELD PROTOCOLS</span>
          </span>
          <span className="text-emerald-400">LIVE 3D</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Swagger Stride</span>
          <span className="font-mono font-bold text-white">[WASD / Arrows]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Coconut Hazard</span>
          <span className="font-mono font-bold text-amber-300">[E / Click / 2]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Spectacle Flip</span>
          <span className="font-mono font-bold text-yellow-400">[SPACE]</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Armory & Loadout</span>
          <span className="font-mono font-bold text-cyan-300">[I]</span>
        </div>
      </div>
    </div>
  );
};
