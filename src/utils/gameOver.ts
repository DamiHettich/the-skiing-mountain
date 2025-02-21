import { GameState, HighScore, SCORE_CONSTANTS } from '../types/game'

export function handleGameOver(gameState: GameState) {
  const newScore = Math.floor(gameState.distance)
  
  // Verificar si es una puntuación alta
  const isHighScore = gameState.highScores.length < SCORE_CONSTANTS.MAX_HIGH_SCORES ||
                     newScore > gameState.highScores[gameState.highScores.length - 1].distance

  if (isHighScore) {
    const playerName = prompt('¡Nueva puntuación alta! Ingresa tu nombre:')
    if (playerName) {
      const newHighScore: HighScore = {
        playerName,
        distance: newScore,
        date: new Date().toISOString()
      }

      // Añadir nueva puntuación y ordenar
      const updatedScores = [...gameState.highScores, newHighScore]
        .sort((a, b) => b.distance - a.distance)
        .slice(0, SCORE_CONSTANTS.MAX_HIGH_SCORES)

      // Actualizar estado y localStorage
      gameState.highScores = updatedScores
      localStorage.setItem('skiHighScores', JSON.stringify(updatedScores))
    }
  }

  return isHighScore
} 