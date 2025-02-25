import { useEffect, useState } from 'react'
import { GAME_CONSTANTS, GameState, Obstacle, HighScore, GameStatus } from '../types/game.ts'
import skierSvg from '../assets/sprites/skier.svg'
import treeSvg from '../assets/sprites/tree.svg'
import pineSvg from '../assets/sprites/pine.svg'
import yetiSvg from '../assets/sprites/yeti.svg'

const INITIAL_OBSTACLES: Obstacle[] = Array.from({ length: 6}, () => ({
  x: GAME_CONSTANTS.PLAYABLE_MARGIN_X + 
     Math.random() * (GAME_CONSTANTS.CANVAS_WIDTH - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE),
  y: Math.random() * GAME_CONSTANTS.CANVAS_HEIGHT,
  width: GAME_CONSTANTS.TREE_SIZE,
  height: GAME_CONSTANTS.TREE_SIZE,
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
        width: GAME_CONSTANTS.TREE_SIZE*1.3,
        height: GAME_CONSTANTS.TREE_SIZE*1.3,
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
    try {
      return JSON.parse(saved)
    } catch {
      return []
    }
  }
  return []
}

// Break down the game state management into smaller, focused hooks and functions
export const useGameState = (
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isStarted: boolean,
  isPaused: boolean,
  playerName: string
): [GameState | null, React.Dispatch<React.SetStateAction<GameState | null>>] => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [spritesLoaded, setSpritesLoaded] = useState(false)

  // Load sprites and initialize game
  useEffect(() => {
    async function initGame() {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      try {
        // Load sprites
        const sprites = await loadGameSprites()
        setSpritesLoaded(true)
        
        // Initialize game state
        const initialState = createInitialGameState(canvas, ctx, sprites, playerName)
        setGameState(initialState)
      } catch (error) {
        console.error('Error loading game assets:', error)
      }
    }

    initGame()
  }, [canvasRef, playerName])

  // Handle game status changes
  useEffect(() => {
    if (!gameState || !spritesLoaded) return
    
    const newStatus = determineGameStatus(isStarted, isPaused, gameState.gameStatus)
    
    if (newStatus !== gameState.gameStatus) {
      setGameState(prev => ({
        ...prev!,
        gameStatus: newStatus
      }))
    }
  }, [isStarted, isPaused, spritesLoaded, gameState])

  return [gameState, setGameState]
}

// Helper functions 
async function loadGameSprites(): Promise<{
  player: HTMLImageElement,
  tree: HTMLImageElement,
  borderTree: HTMLImageElement,
  yeti: HTMLImageElement
  }> {
  const [playerSprite, treeSprite, borderTreeSprite, yetiSprite] = await Promise.all([
    loadImage(skierSvg),
    loadImage(treeSvg),
    loadImage(pineSvg),
    loadImage(yetiSvg)
  ])
  
  return {
    player: playerSprite,
    tree: treeSprite,
    borderTree: borderTreeSprite,
    yeti: yetiSprite
  }
}

function createInitialGameState(
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D,
  sprites: {
    player: HTMLImageElement,
    tree: HTMLImageElement,
    borderTree: HTMLImageElement,
    yeti: HTMLImageElement
  },
  playerName: string
): GameState {
  return {
    canvas,
    ctx,
    player: createPlayerState(canvas),
    obstacles: [...INITIAL_OBSTACLES],
    borderTrees: [...INITIAL_BORDER_TREES],
    score: 0,
    hasCollided: false,
    baseSpeed: 0.5,
    currentSpeed: 0.5,
    maxSpeed: 3,
    acceleration: 0.001,
    deceleration: 1.5,
    keys: { left: false, right: false },
    horizontalSpeed: 0,
    maxHorizontalSpeed: 8,
    sprites,
    playerAngle: 0,
    distance: 0,
    highScores: loadHighScores(),
    monster: createMonsterState(canvas),
    gameStatus: 'waiting',
    playerName,
    startLine: {
      y: 150, // Position just below the player
      width: canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X,
      x: GAME_CONSTANTS.PLAYABLE_MARGIN_X
    }
  }
}

function createPlayerState(canvas: HTMLCanvasElement) {
  return {
    x: canvas.width / 2,
    y: 50,
    width: 20,
    height: 30,
    speed: 5,
  }
}

function createMonsterState(canvas: HTMLCanvasElement) {
  return {
    x: canvas.width / 2,
    y: -GAME_CONSTANTS.MONSTER_INITIAL_DISTANCE,
    width: GAME_CONSTANTS.MONSTER_WIDTH,
    height: GAME_CONSTANTS.MONSTER_HEIGHT,
    speed: GAME_CONSTANTS.MONSTER_BASE_SPEED,
    maxSpeed: GAME_CONSTANTS.MONSTER_MAX_SPEED,
    baseSpeed: GAME_CONSTANTS.MONSTER_BASE_SPEED,
    acceleration: GAME_CONSTANTS.MONSTER_ACCELERATION
  }
}

function determineGameStatus(
  isStarted: boolean, 
  isPaused: boolean, 
  currentStatus: GameStatus
): GameStatus {
  if (!isStarted) return 'waiting'
  if (isPaused) return 'paused'
  if (currentStatus === 'lost') return currentStatus
  return 'playing'
} 