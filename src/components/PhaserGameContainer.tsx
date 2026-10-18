import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BootScene } from '../game/scenes/BootScene';
import { MarketLevelScene, GameEventData } from '../game/scenes/MarketLevelScene';

interface PhaserGameContainerProps {
  onStateUpdate: (data: GameEventData) => void;
  onDialogue: (key: string) => void;
  onVictory: (summary: any) => void;
  onBusted: () => void;
  gameRef: React.MutableRefObject<Phaser.Game | null>;
}

export const PhaserGameContainer: React.FC<PhaserGameContainerProps> = ({
  onStateUpdate,
  onDialogue,
  onVictory,
  onBusted,
  gameRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1024,
      height: 600,
      backgroundColor: '#090d16',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: [BootScene, MarketLevelScene]
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Listen to game events
    game.events.on('hud-update', onStateUpdate);
    game.events.on('show-dialogue', onDialogue);
    game.events.on('level-completed', onVictory);
    game.events.on('player-busted', onBusted);

    return () => {
      game.events.off('hud-update', onStateUpdate);
      game.events.off('show-dialogue', onDialogue);
      game.events.off('level-completed', onVictory);
      game.events.off('player-busted', onBusted);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
      <div ref={containerRef} className="w-full max-w-[1024px] aspect-[1024/600] shadow-2xl rounded-2xl overflow-hidden border border-slate-800" />
    </div>
  );
};
