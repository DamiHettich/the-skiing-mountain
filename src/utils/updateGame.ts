import { GameState, GAME_CONSTANTS, SCORE_CONSTANTS } from '../types/game'
import { handleGameOver } from './gameOver'

export function updateGame(gameState: GameState) {
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

  // Generate border trees if needed (more gradually)
  if (gameState.borderTrees.length < 120) { // Increased for better coverage
    // Add one column of trees on each side per frame
    const leftX = Math.floor(Math.random() * (GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE))
    const rightX = gameState.canvas.width - GAME_CONSTANTS.PLAYABLE_MARGIN_X + 
                  Math.floor(Math.random() * (GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE))

    // Add a column of trees at each X position
    for (let yOffset = 0; yOffset < 300; yOffset += GAME_CONSTANTS.TREE_SIZE) {
      // Left side tree
      gameState.borderTrees.push({
        x: leftX,
        y: gameState.canvas.height + yOffset,
        width: GAME_CONSTANTS.TREE_SIZE,
        height: GAME_CONSTANTS.TREE_SIZE,
        isBorder: true
      })

      // Right side tree
      gameState.borderTrees.push({
        x: rightX,
        y: gameState.canvas.height + yOffset,
        width: GAME_CONSTANTS.TREE_SIZE,
        height: GAME_CONSTANTS.TREE_SIZE,
        isBorder: true
      })
    }
  }

  // Generate actual obstacles in the playable area
  if (gameState.obstacles.length < 25) {
    // Añadir 2-3 árboles a la vez para crear grupos más densos
    const treesToAdd = Math.floor(Math.random() * 2) + 2 // 2 o 3 árboles
    
    for (let i = 0; i < treesToAdd; i++) {
      const baseX = GAME_CONSTANTS.PLAYABLE_MARGIN_X + 
                   Math.random() * (gameState.canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X - GAME_CONSTANTS.TREE_SIZE)
      
      gameState.obstacles.push({
        x: baseX + (Math.random() * 40 - 20),
        y: gameState.canvas.height + Math.random() * 200,
        width: GAME_CONSTANTS.TREE_SIZE * 1.2,  // 20% más grande visualmente
        height: GAME_CONSTANTS.TREE_SIZE * 1.2,
        isBorder: false
      })
    }
  }

  // Clean up off-screen trees and obstacles
  gameState.obstacles = gameState.obstacles.filter(
    obstacle => obstacle.y > -50
  )
  gameState.borderTrees = gameState.borderTrees.filter(
    tree => tree.y > -50
  )

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
    gameState.gameStatus = 'lost'
    handleGameOver(gameState)
  }

  // Verificar victoria (llegada a la meta)
  if (gameState.distance >= GAME_CONSTANTS.FINISH_LINE_DISTANCE) {
    gameState.gameStatus = 'won'
    handleGameOver(gameState)
  }
} 