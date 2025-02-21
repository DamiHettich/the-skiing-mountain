import { GameState } from '../types/game'
import { GAME_CONSTANTS } from '../types/game'

export function drawGame(gameState: GameState) {
  const { ctx, canvas, player, obstacles, borderTrees, sprites, playerAngle } = gameState

  // Clear canvas
  ctx.fillStyle = '#1a1a1a' // Fondo muy oscuro
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw snow area (ahora gris oscuro)
  ctx.fillStyle = '#2c2c2c' // Pista gris oscura
  ctx.fillRect(
    GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    0,
    canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    canvas.height
  )

  // Draw border trees
  borderTrees.forEach(tree => {
    ctx.drawImage(
      sprites.borderTree,
      tree.x,
      tree.y,
      tree.width,
      tree.height
    )
  })

  // Draw obstacles (trees)
  obstacles.forEach(obstacle => {
    ctx.drawImage(
      sprites.tree,
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    )
  })

  // Draw player with rotation
  ctx.save()
  ctx.translate(player.x + player.width / 2, player.y + player.height / 2)
  ctx.rotate(playerAngle)
  ctx.drawImage(
    sprites.player,
    -player.width / 2,
    -player.height / 2,
    player.width,
    player.height
  )
  ctx.restore()

  // Dibujar puntuación actual
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '20px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Distancia: ${Math.floor(gameState.distance)}m`, 20, 30)

  // Dibujar mejores puntuaciones
  if (gameState.highScores.length > 0) {
    ctx.font = '16px Arial'
    ctx.fillText('Mejores puntuaciones:', 20, 60)
    gameState.highScores.forEach((score, index) => {
      ctx.fillText(
        `${index + 1}. ${score.playerName}: ${Math.floor(score.distance)}m`,
        20,
        90 + (index * 25)
      )
    })
  }

  // Dibujar yeti
  ctx.save()
  ctx.translate(gameState.monster.x + gameState.monster.width / 2, 
               gameState.monster.y + gameState.monster.height / 2)

  // Efecto de "balanceo" mientras persigue
  const swayAmount = Math.sin(Date.now() * 0.01) * 0.1
  ctx.rotate(swayAmount)

  ctx.drawImage(
    gameState.sprites.yeti,
    -gameState.monster.width / 2,
    -gameState.monster.height / 2,
    gameState.monster.width,
    gameState.monster.height
  )
  ctx.restore()

  // Dibujar meta si está cerca
  if (GAME_CONSTANTS.FINISH_LINE_DISTANCE - gameState.distance < gameState.canvas.height) {
    ctx.fillStyle = '#FFFF00'
    ctx.fillRect(
      GAME_CONSTANTS.PLAYABLE_MARGIN_X,
      gameState.canvas.height - (GAME_CONSTANTS.FINISH_LINE_DISTANCE - gameState.distance),
      gameState.canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X,
      10
    )
  }

  // Mostrar mensaje de fin de juego si corresponde
  if (gameState.gameStatus !== 'playing') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height)
    
    ctx.fillStyle = '#FFFFFF'
    ctx.font = '48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(
      gameState.gameStatus === 'won' ? '¡Victoria!' : 'Game Over',
      gameState.canvas.width / 2,
      gameState.canvas.height / 2
    )
  }
} 