import { useEffect } from 'react'
import { GameState } from '../types/game'
import { drawGame } from '../utils/drawGame.ts'
import { updateGame } from '../utils/updateGame.ts'
import { checkCollisions } from '../utils/checkCollisions.ts'

export const useGameLoop = (
  gameState: GameState | null,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) => {
  useEffect(() => {
    if (!gameState) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStatus !== 'playing') return
      switch (e.key) {
        case 'ArrowLeft':
          gameState.keys.left = true
          break
        case 'ArrowRight':
          gameState.keys.right = true
          break
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          gameState.keys.left = false
          break
        case 'ArrowRight':
          gameState.keys.right = false
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    let frameId: number

    function gameLoop() {
      if (gameState?.gameStatus === 'playing') {
        updateGame(gameState, setGameState)
        checkCollisions(gameState)
        drawGame(gameState)
      }
      frameId = requestAnimationFrame(gameLoop)
    }

    frameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, setGameState])
} 