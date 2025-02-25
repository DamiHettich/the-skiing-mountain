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
  maxSpeed: number
}

export type GameStatus = 'playing' | 'lost' | 'paused' | 'waiting'

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
  playerName: string | null
  startLine: {
    y: number
    width: number
    x: number
  }
}

export interface HighScore {
  playerName: string
  distance: number
  date: string
}

export const GAME_CONSTANTS = {
  PLAYABLE_MARGIN_X: 100,
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
  MONSTER_ACCELERATION: 0.00001,
  MONSTER_INITIAL_DISTANCE: 300,
  MONSTER_HORIZONTAL_FOLLOW: 0.03,
  MONSTER_MAX_SPEED: 0.1,
  START_LINE_Y: 150,
  START_LINE_WIDTH: 800 - 2 * 100,
  START_LINE_X: 100
} as const

export const SCORE_CONSTANTS = {
  DISTANCE_MULTIPLIER: 0.1,
  MAX_HIGH_SCORES: 5
} as const 