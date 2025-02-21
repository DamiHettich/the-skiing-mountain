import React from 'react'
import { GameState } from '../types/game'

interface GameOverlayProps {
  gameState: GameState
  onRestart: () => void
  onNameSubmit: (name: string) => void
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState,
  onRestart,
  onNameSubmit,
}) => {
  const [playerName, setPlayerName] = React.useState('')

  if (gameState.gameStatus === 'playing') return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNameSubmit(playerName)
  }

  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
      <div className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl border border-blue-900/30 text-center">
        <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
          {gameState.gameStatus === 'won' ? '¡Victoria!' : 'Game Over'}
        </h2>
        <p className="text-blue-400 mb-6">
          Distance: <span className="font-mono">{Math.floor(gameState.distance)}m</span>
        </p>

        {!gameState.playerName && (
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-gray-800 border border-blue-900 text-blue-400 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter your name"
              maxLength={15}
            />
            <button
              type="submit"
              className="block w-full bg-blue-900/50 hover:bg-blue-800/50 px-6 py-2 rounded-lg transition-all border border-blue-900 text-blue-400"
            >
              Save Score
            </button>
          </form>
        )}

        <button
          onClick={onRestart}
          className="bg-blue-900/50 hover:bg-blue-800/50 px-6 py-2 rounded-lg transition-all border border-blue-900 text-blue-400"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}

export default GameOverlay