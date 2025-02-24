import { GameState, HighScore, SCORE_CONSTANTS } from '../types/game'

export function handleGameOver(gameState: GameState) {
  const newScore: HighScore = {
    playerName: gameState.playerName || 'Anonymous',
    distance: Math.floor(gameState.distance),
    date: new Date().toISOString()
  }
  const scoreExists = gameState.highScores.some(
    score => 
      score.playerName === newScore.playerName && 
      score.distance === newScore.distance &&
      // Compare only the first part of the date to handle small timing differences
      score.date.substring(0, 16) === newScore.date.substring(0, 16)
  );

  if (scoreExists) {
    return; 
  }

  // Add new score and sort
  const updatedScores = [...gameState.highScores, newScore]
    .sort((a, b) => b.distance - a.distance)
    .slice(0, SCORE_CONSTANTS.MAX_HIGH_SCORES)

  // Update state and localStorage
  gameState.highScores = updatedScores
  localStorage.setItem('skiHighScores', JSON.stringify(updatedScores))
} 