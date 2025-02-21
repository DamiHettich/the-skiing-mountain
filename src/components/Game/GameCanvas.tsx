import React, { useEffect, useRef, useState } from 'react'
import { useGameState } from '../../hooks/useGameState'
import { useGameLoop } from '../../hooks/useGameLoop'
import Leaderboard from '../Leaderboard'
import GameOverlay from '../GameOverlay'

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [playerName, setPlayerName] = useState('')
  
  // Pass isPaused to gameState
  const gameState = useGameState(canvasRef, isStarted, isPaused)
  
  useGameLoop(gameState)
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (isStarted) {
          setIsPaused(prev => !prev);
        }
        return;
      }

      if (!isStarted && playerName) {
        setIsStarted(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, playerName]);

  const handleRestart = () => {
    window.location.reload();
  };

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
  };

  const getOverlayMessage = () => {
    if (!playerName) return "Enter your name to play";
    if (!isStarted) return "Press any key to start";
    if (isPaused) return "PAUSED";
    return "";
  };

  return (
    <div className="relative flex flex-col lg:flex-row items-start justify-center gap-8 p-8">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-blue-900/30 rounded-2xl"
        />

        {/* Show overlay for: no name, not started, or paused */}
        {(!isStarted || isPaused || !playerName) && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <p className="text-4xl text-white font-bold">
              {getOverlayMessage()}
            </p>
            {!playerName && (
              <div className="absolute top-1/2 mt-12">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => handleNameSubmit(e.target.value)}
                  className="bg-gray-800 border border-blue-900 text-blue-400 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="Enter your name"
                  maxLength={15}
                />
              </div>
            )}
          </div>
        )}

        {gameState && (
          <GameOverlay
            gameState={gameState}
            onRestart={handleRestart}
            onNameSubmit={handleNameSubmit}
          />
        )}
      </div>

      <div className="w-full lg:w-80">
        <Leaderboard
          scores={gameState?.highScores ?? []}
          onNameSubmit={handleNameSubmit}
          playerName={playerName}
          currentDistance={gameState?.distance ?? 0}
        />
      </div>
    </div>
  )
}

export default GameCanvas 