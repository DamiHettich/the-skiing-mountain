import { useEffect, useState } from 'react'
import { GAME_CONSTANTS, GameState, Obstacle, HighScore } from '../types/game.ts'
import skierSvg from '../assets/sprites/skier.svg'
import treeSvg from '../assets/sprites/tree.svg'
import pineSvg from '../assets/sprites/pine.svg'
import yetiSvg from '../assets/sprites/yeti.svg'

const INITIAL_OBSTACLES: Obstacle[] = Array.from({ length: 20 }, () => ({
  x: GAME_CONSTANTS.PLAYABLE_MARGIN_X + 
     Math.random() * (GAME_CONSTANTS.CANVAS_WIDTH - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE),
  y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT,
  width: GAME_CONSTANTS.TREE_SIZE * 1.2,
  height: GAME_CONSTANTS.TREE_SIZE * 1.2,
  isBorder: false
}))

// Árboles iniciales en los bordes
const INITIAL_BORDER_TREES: Obstacle[] = (() => {
  const trees: Obstacle[] = []
  
  // Para cada lado (izquierdo y derecho)
  for (let side = 0; side < 2; side++) {
    const baseX = side === 0 ? 0 : GAME_CONSTANTS.CANVAS_WIDTH - GAME_CONSTANTS.PLAYABLE_MARGIN_X

    // Crear columnas de árboles
    for (let y = 0; y < GAME_CONSTANTS.CANVAS_HEIGHT + 300; y += GAME_CONSTANTS.TREE_SIZE) {
      trees.push({
        x: baseX + Math.floor(Math.random() * (GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE)),
        y,
        width: GAME_CONSTANTS.TREE_SIZE,
        height: GAME_CONSTANTS.TREE_SIZE,
        isBorder: true
      })
    }
  }
  
  return trees
})()

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

// Cargar puntuaciones altas del localStorage
const loadHighScores = (): HighScore[] => {
  const saved = localStorage.getItem('skiHighScores')
  if (saved) {
    return JSON.parse(saved)
  }
  return []
}

export const useGameState = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isStarted: boolean,
  isPaused: boolean
) => {
  const [gameState, setGameState] = useState<GameState | null>(null)

  // Initialize game state when canvas is available
  useEffect(() => {
    async function initGame() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Load sprites
      const [playerSprite, treeSprite, borderTreeSprite, yetiSprite] = await Promise.all<HTMLImageElement>([
        loadImage(skierSvg),
        loadImage(treeSvg),
        loadImage(pineSvg),
        loadImage(yetiSvg)
      ])

      setGameState({
        canvas,
        ctx,
        player: {
          x: canvas.width / 2,
          y: 50,
          width: 20,
          height: 30,
          speed: 2.5,
        },
        obstacles: [...INITIAL_OBSTACLES],
        borderTrees: [...INITIAL_BORDER_TREES],
        score: 0,
        hasCollided: false,
        baseSpeed: 0.5,
        currentSpeed: 0.5,
        maxSpeed: 2,
        acceleration: 0.005,
        deceleration: 1.5,
        keys: {
          left: false,
          right: false
        },
        horizontalSpeed: 0,
        maxHorizontalSpeed: 8,
        sprites: {
          player: playerSprite,
          tree: treeSprite,
          borderTree: borderTreeSprite,
          yeti: yetiSprite
        },
        playerAngle: 0,
        distance: 0,
        highScores: loadHighScores(),
        monster: {
          x: canvas.width / 2,
          y: -GAME_CONSTANTS.MONSTER_INITIAL_DISTANCE,
          width: GAME_CONSTANTS.MONSTER_WIDTH,
          height: GAME_CONSTANTS.MONSTER_HEIGHT,
          speed: GAME_CONSTANTS.MONSTER_BASE_SPEED,
          baseSpeed: GAME_CONSTANTS.MONSTER_BASE_SPEED,
          acceleration: GAME_CONSTANTS.MONSTER_ACCELERATION
        },
        gameStatus: 'playing',
        finishLine: GAME_CONSTANTS.FINISH_LINE_DISTANCE,
        playerName: null
      })
    }

    initGame()
  }, [canvasRef]) // Changed from [canvasRef.current] to [canvasRef]

  // Update game state based on isStarted and isPaused
  useEffect(() => {
    if (!isStarted || isPaused) {
      // Don't update state, game loop will handle pausing
      return;
    }
    
    if (gameState && gameState.gameStatus === 'playing') {
      setGameState(prev => ({...prev!}));
    }
  }, [isStarted, isPaused, gameState]);

  return gameState
} 