import { GameState, GAME_CONSTANTS, SCORE_CONSTANTS, GameStatus } from '../types/game'
import { handleGameOver } from './gameOver'

export function updateGame(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  if (gameState.gameStatus !== 'playing') return

  // Handle horizontal movement with acceleration
  const acceleration = 0.1
  const friction = 0.85

  if (gameState.keys.left) {
    gameState.horizontalSpeed = Math.max(
      -gameState.maxHorizontalSpeed,
      gameState.horizontalSpeed - acceleration
    )
  }
  if (gameState.keys.right) {
    gameState.horizontalSpeed = Math.min(
      gameState.maxHorizontalSpeed,
      gameState.horizontalSpeed + acceleration
    )
  }

  // Apply friction when no keys are pressed
  if (!gameState.keys.left && !gameState.keys.right) {
    gameState.horizontalSpeed *= friction
  }

  // Update player position with bounds checking (now using margins)
  gameState.player.x = Math.max(
    GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    Math.min(
      gameState.canvas.width - GAME_CONSTANTS.PLAYABLE_MARGIN_X - gameState.player.width,
      gameState.player.x + gameState.horizontalSpeed
    )
  )

  // Move all trees (both obstacles and border trees)
  gameState.obstacles = gameState.obstacles.map(obstacle => ({
    ...obstacle,
    y: obstacle.y - gameState.currentSpeed
  }))

  gameState.borderTrees = gameState.borderTrees.map(tree => ({
    ...tree,
    y: tree.y - gameState.currentSpeed
  }))

  // Clean up off-screen trees more aggressively
  gameState.obstacles = gameState.obstacles.filter(
    obstacle => obstacle.y > -100 && obstacle.y < gameState.canvas.height + 200
  )
  gameState.borderTrees = gameState.borderTrees.filter(
    tree => tree.y > -100 && tree.y < gameState.canvas.height + 200
  )

  // Generate new trees only when needed
  const minTrees = 15
  if (gameState.obstacles.length < minTrees) {
    const treesToAdd = Math.min(3, minTrees - gameState.obstacles.length)
    
    for (let i = 0; i < treesToAdd; i++) {
      const baseX = GAME_CONSTANTS.PLAYABLE_MARGIN_X + 
                   Math.random() * (gameState.canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE)
      
      gameState.obstacles.push({
        x: baseX + (Math.random() * 40 - 20),
        y: gameState.canvas.height + Math.random() * 100,
        width: GAME_CONSTANTS.TREE_SIZE,
        height: GAME_CONSTANTS.TREE_SIZE,
        isBorder: false
      })
    }
  }

  // Generate border trees more efficiently
  const minBorderTrees = 40
  if (gameState.borderTrees.length < minBorderTrees) {
    for (let side = 0; side < 2; side++) {
      const baseX = side === 0 ? 0 : gameState.canvas.width - GAME_CONSTANTS.PLAYABLE_MARGIN_X
      
      gameState.borderTrees.push({
        x: baseX + Math.floor(Math.random() * (GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE)),
        y: gameState.canvas.height + Math.random() * 100,
        width: GAME_CONSTANTS.TREE_SIZE*1.4,
        height: GAME_CONSTANTS.TREE_SIZE*1.4,
        isBorder: true
      })
    }
  }

  // Move player down slowly when not colliding
  if (!gameState.hasCollided) {
    gameState.player.y = Math.min(
      gameState.canvas.height - 100,
      gameState.player.y + gameState.currentSpeed * 0.1
    )
  }

  // Update score based on current speed
  gameState.score += gameState.currentSpeed

  // Actualizar distancia basada en la velocidad actual
  gameState.distance += gameState.currentSpeed * SCORE_CONSTANTS.DISTANCE_MULTIPLIER

  // Inside updateGame, update the player angle based on movement
  if (gameState.keys.left) {
    gameState.playerAngle = Math.max(
      -GAME_CONSTANTS.MAX_ROTATION,
      gameState.playerAngle - GAME_CONSTANTS.PLAYER_ROTATION_SPEED
    )
  } else if (gameState.keys.right) {
    gameState.playerAngle = Math.min(
      GAME_CONSTANTS.MAX_ROTATION,
      gameState.playerAngle + GAME_CONSTANTS.PLAYER_ROTATION_SPEED
    )
  } else {
    // Return to center
    gameState.playerAngle *= 0.9
  }

  // Actualizar posición del monstruo
  const monster = gameState.monster
  
  // Velocidad base del monstruo independiente de la velocidad del jugador
  const targetSpeed = Math.min(
    gameState.baseSpeed * 1.2, // Basado en la velocidad base, no la actual
    monster.baseSpeed + (gameState.distance * 0.0001) // Aumenta gradualmente con la distancia
  )

  // Acelerar/decelerar el monstruo más suavemente
  monster.speed = monster.speed + (targetSpeed - monster.speed) * 0.1

  // Mover el monstruo hacia el jugador con más precisión
  const dx = gameState.player.x - monster.x
  monster.x += dx * GAME_CONSTANTS.MONSTER_HORIZONTAL_FOLLOW

  // Movimiento vertical del monstruo (ahora independiente de colisiones)
  if (monster.y < gameState.player.y - 200) {
    monster.y += monster.speed * 2 // Acelera más cuando está muy atrás
  } else if (monster.y > gameState.player.y - 100) {
    monster.y += monster.speed * 0.7 // Desacelera menos cuando está cerca
  } else {
    monster.y += monster.speed * 1.2 // Velocidad normal más alta
  }

  // Verificar colisión con el monstruo (hitbox más precisa)
  const monsterHitbox = {
    x: monster.x + monster.width * 0.2,
    y: monster.y + monster.height * 0.2,
    width: monster.width * 0.6,
    height: monster.height * 0.6
  }

  const playerHitbox = {
    x: gameState.player.x + gameState.player.width * 0.2,
    y: gameState.player.y + gameState.player.height * 0.2,
    width: gameState.player.width * 0.6,
    height: gameState.player.height * 0.6
  }

  if (
    playerHitbox.x < monsterHitbox.x + monsterHitbox.width &&
    playerHitbox.x + playerHitbox.width > monsterHitbox.x &&
    playerHitbox.y < monsterHitbox.y + monsterHitbox.height &&
    playerHitbox.y + playerHitbox.height > monsterHitbox.y
  ) {
    setGameState(prevState => {
      if (!prevState) return null;
      const updatedState = {
        ...prevState,
        gameStatus: 'lost' as GameStatus
      };
      handleGameOver(updatedState);
      return updatedState;
    });
    return;
  }
} 