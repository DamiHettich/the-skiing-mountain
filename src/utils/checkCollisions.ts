import { GameState } from '../types/game'

export function checkCollisions(gameState: GameState) {
  const { player, obstacles } = gameState
  let isCurrentlyColliding = false

  // Reducir la hitbox del jugador (20% más pequeña que el sprite)
  const hitboxMargin = {
    x: player.width * 0.2,
    y: player.height * 0.2
  }

  const playerHitbox = {
    x: player.x + hitboxMargin.x,
    y: player.y + hitboxMargin.y,
    width: player.width - (hitboxMargin.x * 2),
    height: player.height - (hitboxMargin.y * 2)
  }

  obstacles.forEach(obstacle => {
    // Hacer la hitbox del árbol un poco más pequeña que su sprite
    const treeHitbox = {
      x: obstacle.x + (obstacle.width * 0.25),
      y: obstacle.y + (obstacle.height * 0.3),
      width: obstacle.width * 0.5,  // 50% del ancho del sprite
      height: obstacle.height * 0.4  // 40% del alto del sprite
    }

    if (
      playerHitbox.x < treeHitbox.x + treeHitbox.width &&
      playerHitbox.x + playerHitbox.width > treeHitbox.x &&
      playerHitbox.y < treeHitbox.y + treeHitbox.height &&
      playerHitbox.y + playerHitbox.height > treeHitbox.y
    ) {
      isCurrentlyColliding = true
      // Reducción inmediata y más dramática de la velocidad
      gameState.currentSpeed = Math.max(
        gameState.baseSpeed * 0.5,
        gameState.currentSpeed - gameState.deceleration
      )
      // Empuja al jugador hacia atrás más fuertemente
      gameState.player.y = Math.max(
        50,
        gameState.player.y - 50
      )
    }
  })

  if (isCurrentlyColliding && !gameState.hasCollided) {
    gameState.hasCollided = true
  } else if (!isCurrentlyColliding) {
    gameState.hasCollided = false
    gameState.currentSpeed = Math.min(
      gameState.maxSpeed,
      gameState.currentSpeed + gameState.acceleration
    )
  }
} 