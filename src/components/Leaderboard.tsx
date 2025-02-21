import React from 'react'
import { HighScore } from '../types/game'

interface LeaderboardProps {
  scores: HighScore[]
  onNameSubmit: (name: string) => void
  playerName: string
  currentDistance: number
}

const Leaderboard: React.FC<LeaderboardProps> = ({
  scores,
  onNameSubmit,
  playerName,
  currentDistance
}) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [tempName, setTempName] = React.useState(playerName)

  const sortedScores = scores
    .sort((a, b) => b.distance - a.distance)
    .slice(0, 10)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNameSubmit(tempName)
    setIsEditing(false)
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-blue-900/30 w-[440px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white">
            Top Scores
          </h2>
          <p className="text-sm text-blue-400 mt-1">
            Current Distance: <span className="font-mono">{Math.floor(currentDistance)}m</span>
          </p>
          {playerName && (
            <p className="text-sm text-blue-400 mt-1">
              Playing as: <span className="font-mono">{playerName}</span>
            </p>
          )}
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-all border border-blue-900/50 text-blue-400"
          >
            {playerName ? 'Change Name' : 'Set Name'}
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="bg-gray-800 border border-blue-900 text-blue-400 px-2 py-1 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-32"
              placeholder="Enter your name"
              maxLength={15}
            />
            <button
              type="submit"
              className="text-sm bg-blue-900/50 hover:bg-blue-800/50 px-3 py-1 rounded-lg transition-all border border-blue-900 text-blue-400"
            >
              Save
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2">
        {sortedScores.map((entry, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-2 rounded-lg ${
              entry.playerName === playerName
                ? 'bg-blue-900/30 border border-blue-900/50'
                : 'bg-black/30'
            }`}
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
            No scores yet
          </div>
        )}
      </div>
    </div>
  )
}

export default Leaderboard
