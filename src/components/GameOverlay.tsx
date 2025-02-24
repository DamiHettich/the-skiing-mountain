import React from 'react'
import { GameState } from '../types/game'

interface GameOverlayProps {
  gameState: GameState
  onRestart: () => void
  onNameSubmit: (name: string) => void
  isInitial?: boolean
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState,
  onRestart,
  onNameSubmit,
  isInitial = false
}) => {
  const [playerName, setPlayerName] = React.useState('')


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (playerName.trim()) {
      onNameSubmit(playerName)
    }
  }

  if (isInitial) {
    return (
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
        <div className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl border border-blue-900/30 text-center">
          <h2 className="text-2xl font-bold mb-4 text-blue-400">
            Ingresa tu nombre
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-gray-800 border border-blue-900 text-blue-400 px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Mi nombre"
              maxLength={15}
            />
            <button
              type="submit"
              className="block w-full bg-blue-900/50 hover:bg-blue-800/50 px-6 py-2 rounded-lg transition-all border border-blue-900 text-blue-400"
            >
              Jugar
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (gameState.gameStatus === 'lost') {
    return (
      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
        <div className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl border border-blue-900/30 text-center">
          <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
            Perdiste u.u
          </h2>
          <p className="text-blue-400 mb-6">
            Distancia: <span className="font-mono">{Math.floor(gameState.distance)}m</span>
          </p>
          <button
            onClick={onRestart}
            className="bg-blue-900/50 hover:bg-blue-800/50 px-6 py-2 rounded-lg transition-all border border-blue-900 text-blue-400"
          >
            Jugar de nuevo
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default GameOverlay