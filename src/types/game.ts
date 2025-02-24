export interface Player {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

export interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  isBorder?: boolean
}

export interface Monster {
  x: number
  y: number
  width: number
  height: number
  speed: number
  baseSpeed: number
  acceleration: number
}

export type GameStatus = 'playing' | 'won' | 'lost' | 'paused' | 'waiting'

export interface GameState {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  player: Player
  obstacles: Obstacle[]
  borderTrees: Obstacle[]
  score: number
  hasCollided: boolean
  baseSpeed: number
  currentSpeed: number
  maxSpeed: number
  acceleration: number
  deceleration: number
  keys: {
    left: boolean
    right: boolean
  }
  horizontalSpeed: number
  maxHorizontalSpeed: number
  sprites: {
    player: HTMLImageElement
    tree: HTMLImageElement
    borderTree: HTMLImageElement
    yeti: HTMLImageElement
  }
  playerAngle: number
  distance: number
  highScores: HighScore[]
  monster: Monster
  gameStatus: GameStatus
  finishLine: number
  playerName: string | null
}

export interface HighScore {
  playerName: string
  distance: number
  date: string
}

export const GAME_CONSTANTS = {
  PLAYABLE_MARGIN_X: 100, // Margen desde los bordes
  TREE_SIZE: 40,
  PLAYER_WIDTH: 30,
  PLAYER_HEIGHT: 40,
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PLAYER_ROTATION_SPEED: 0.15,
  MAX_ROTATION: Math.PI / 4, // 45 grados
  MONSTER_WIDTH: 50,
  MONSTER_HEIGHT: 50,
  MONSTER_BASE_SPEED: 0.05,
  MONSTER_ACCELERATION: 0.0001,
  MONSTER_INITIAL_DISTANCE: 300,
  MONSTER_HORIZONTAL_FOLLOW: 0.03,
  FINISH_LINE_DISTANCE: 5000,
} as const

// Constantes para el sistema de puntuación
export const SCORE_CONSTANTS = {
  DISTANCE_MULTIPLIER: 0.1, // Para convertir la velocidad en distancia
  MAX_HIGH_SCORES: 5 // Número de puntuaciones altas a mantener
} as const 