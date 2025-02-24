import React, { useState } from 'react'
import { HighScore } from '../types/game'

interface LeaderboardProps {
  scores: HighScore[]
  playerName: string
  onChangeName: (name: string) => void
}

const Leaderboard: React.FC<LeaderboardProps> = ({ scores, playerName, onChangeName }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [newName, setNewName] = useState(playerName)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      onChangeName(newName.trim())
      setIsEditing(false)
    }
  }

  const sortedScores = scores
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 10)

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-900/30 w-[440px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
            Podio
          </h2>
        </div>
        {isEditing ? (
          <div className="flex items-center">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-blue-800/50 text-white px-2 py-1 rounded mr-2"
              />
              <button type="submit" className="text-blue-200 text-sm">Guardar</button>
            </form>
          </div>
          
        ) : (
          <div className="flex items-center">
            <span className="text-blue-200 mr-2">{playerName}</span>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-blue-300 text-sm"
            >
              Cambiar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {sortedScores.map((entry, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-2 rounded-lg bg-black/30`}
          >
            <div className="flex items-center gap-3">
              <span className="text-blue-400 font-mono w-6">{index + 1}.</span>
              <span className="text-blue-300">
                {entry.playerName || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white font-mono">
                {Math.floor(entry.distance)}m
              </span>
              <span className="text-gray-500 text-sm">
                {new Date(entry.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
        {sortedScores.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No hay mejores puntuaciones
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
