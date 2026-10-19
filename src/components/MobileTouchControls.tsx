import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Gamepad2, Bell } from 'lucide-react';
import { soundManager } from '../game/audio/SoundManager';

interface MobileTouchControlsProps {
  onMoveVector: (dx: number, dz: number) => void;
  onTriggerTrap: () => void;
  onDistract: () => void;
  forceShow?: boolean;
}

export const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  onMoveVector,
  onTriggerTrap,
  onDistract,
  forceShow = false
}) => {
  const [isTouchOrMobile, setIsTouchOrMobile] = useState<boolean>(false);
  const [manualVisible, setManualVisible] = useState<boolean>(false);
  const [knobOffset, setKnobOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeDir, setActiveDir] = useState<string | null>(null);
  const padRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<boolean>(false);

  useEffect(() => {
    const checkViewport = () => {
      const mobileWidth = window.innerWidth <= 900;
      const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches;
      setIsTouchOrMobile(Boolean(mobileWidth || coarsePointer));
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const showPad = forceShow || isTouchOrMobile || manualVisible;

  const updateStickFromPoint = (clientX: number, clientY: number) => {
    if (!padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxRadius = rect.width * 0.36;

    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);

    if (dist > maxRadius && dist > 0) {
      dx = (dx / dist) * maxRadius;
      dy = (dy / dist) * maxRadius;
    }

    setKnobOffset({ x: dx, y: dy });

    const normX = Math.abs(dx) < 6 ? 0 : dx / maxRadius;
    const normZ = Math.abs(dy) < 6 ? 0 : dy / maxRadius;
    onMoveVector(normX, normZ);
  };

  const resetStick = () => {
    draggingRef.current = false;
    setKnobOffset({ x: 0, y: 0 });
    setActiveDir(null);
    onMoveVector(0, 0);
  };

  const handleDirPress = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT', dx: number, dz: number) => {
    setActiveDir(dir);
    setKnobOffset({ x: dx * 24, y: dz * 24 });
    onMoveVector(dx, dz);
  };

  return (
    <div
      className="absolute bottom-3 left-3 sm:bottom-5 sm:left-5 z-30 flex flex-col items-start space-y-2 select-none"
      data-testid="mobile-touch-controls"
    >
      {/* Toggle Touch Pad Pill on Desktop / Mobile */}
      <button
        type="button"
        onClick={() => {
          soundManager.playUiClick();
          setManualVisible((v) => !v);
        }}
        data-testid="toggle-touch-controls"
        className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-stone-950/90 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg hover:bg-stone-900 transition"
      >
        <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
        <span>{showPad ? 'Touch Pad: ON' : 'Touch Pad'}</span>
      </button>

      {showPad && (
        <div className="flex items-end space-x-2.5">
          {/* 360° Virtual Thumbstick + D-Pad Ring */}
          <div
            ref={padRef}
            data-testid="virtual-thumbstick"
            onPointerDown={(e) => {
              e.stopPropagation();
              draggingRef.current = true;
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              updateStickFromPoint(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!draggingRef.current) return;
              e.stopPropagation();
              updateStickFromPoint(e.clientX, e.clientY);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              resetStick();
            }}
            onPointerCancel={resetStick}
            className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-stone-950/88 backdrop-blur-xl border-2 border-amber-500/50 shadow-[0_8px_30px_rgba(0,0,0,0.9)] touch-none flex items-center justify-center"
          >
            {/* Outer Brass Tactical Compass Ring */}
            <div className="absolute inset-2 rounded-full border border-amber-500/25 pointer-events-none" />

            {/* Directional D-Pad Quadrant Buttons for Crisp Taps */}
            <button
              type="button"
              aria-label="Walk North"
              data-testid="dpad-up"
              onPointerDown={(e) => {
                e.stopPropagation();
                handleDirPress('UP', 0, -1);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                resetStick();
              }}
              onPointerLeave={resetStick}
              className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-7 rounded-lg flex items-center justify-center transition ${
                activeDir === 'UP'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Walk South"
              data-testid="dpad-down"
              onPointerDown={(e) => {
                e.stopPropagation();
                handleDirPress('DOWN', 0, 1);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                resetStick();
              }}
              onPointerLeave={resetStick}
              className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-7 rounded-lg flex items-center justify-center transition ${
                activeDir === 'DOWN'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Walk West"
              data-testid="dpad-left"
              onPointerDown={(e) => {
                e.stopPropagation();
                handleDirPress('LEFT', -1, 0);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                resetStick();
              }}
              onPointerLeave={resetStick}
              className={`absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-8 rounded-lg flex items-center justify-center transition ${
                activeDir === 'LEFT'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              aria-label="Walk East"
              data-testid="dpad-right"
              onPointerDown={(e) => {
                e.stopPropagation();
                handleDirPress('RIGHT', 1, 0);
              }}
              onPointerUp={(e) => {
                e.stopPropagation();
                resetStick();
              }}
              onPointerLeave={resetStick}
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-8 rounded-lg flex items-center justify-center transition ${
                activeDir === 'RIGHT'
                  ? 'bg-amber-500 text-stone-950'
                  : 'text-amber-400/80 hover:text-amber-300'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Draggable Gold Thumbstick Knob */}
            <div
              style={{
                transform: `translate(${knobOffset.x}px, ${knobOffset.y}px)`
              }}
              className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 border-2 border-yellow-200 shadow-[0_0_18px_rgba(245,158,11,0.65)] flex items-center justify-center pointer-events-none transition-transform duration-75"
            >
              <span className="text-[8px] font-black text-stone-950 uppercase tracking-tighter">
                WALK
              </span>
            </div>
          </div>

          {/* Quick Thumb Buttons for Distract & Trap on Mobile */}
          <div className="flex flex-col space-y-1.5">
            <button
              type="button"
              onClick={() => {
                soundManager.playAlert();
                onDistract();
              }}
              data-testid="mobile-distract-btn"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-950/92 border border-cyan-500/45 text-cyan-300 active:scale-95 shadow-lg text-xs font-black uppercase"
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bell [Q]</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onTriggerTrap();
              }}
              data-testid="mobile-trap-btn"
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-stone-950/92 border border-amber-500/45 text-amber-300 active:scale-95 shadow-lg text-xs font-black uppercase"
            >
              <span>Trap [E]</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
