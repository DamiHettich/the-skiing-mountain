import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useGameState } from '../hooks/useGameState'
import { useGameLoop } from '../hooks/useGameLoop'
import { getPlayerName, savePlayerName } from '../utils/playerStorage';
import Leaderboard from './Leaderboard'
import GameOverlay from './GameOverlay'

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playerName, setPlayerName] = useState<string>(getPlayerName() || '');
  const [isStarted, setIsStarted] = useState(!!playerName)
  const [isPaused, setIsPaused] = useState(false)
  
  const [gameState, setGameState] = useGameState(canvasRef, isStarted, isPaused, playerName)
  
  useGameLoop(gameState, setGameState)
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'p' || e.key === 'P') {
      if (isStarted) {
        setIsPaused(prev => !prev)
      }
    }
  }, [isStarted])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const handleRestart = useCallback(() => {
    window.location.reload()
  }, [])

  const handleNameSubmit = useCallback((name: string) => {
    setPlayerName(name)
    savePlayerName(name);
    setIsStarted(true)
  }, [])

  return (
    <div className="relative flex flex-col lg:flex-row items-start justify-center gap-8 p-8">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border border-blue-900/30 rounded-2xl"
        />

        {isPaused && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <p className="text-2xl text-blue-400">PAUSED</p>
          </div>
        )}

        {!playerName && (
          <GameOverlay
            gameState={gameState!}
            onRestart={handleRestart}
            onNameSubmit={handleNameSubmit}
            isInitial={true}
          />
        )}

        {gameState?.gameStatus === 'lost' && (
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
          playerName={playerName}
          onChangeName={(name) => {
            setPlayerName(name);
            savePlayerName(name);
          }}
        />
      </div>
    </div>
  )
}

export default GameCanvas