import { GameState } from '../types/game'
import { GAME_CONSTANTS } from '../types/game'

export function drawGame(gameState: GameState) {
  const { ctx, canvas, player, obstacles, borderTrees, sprites, playerAngle } = gameState

  // Clear only the necessary area
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw snow area
  ctx.fillStyle = '#2c2c2c'
  ctx.fillRect(
    GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    0,
    canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    canvas.height
  )

  // Draw only visible trees
  const visibleTrees = [...borderTrees, ...obstacles].filter(tree => 
    tree.y > -50 && tree.y < canvas.height + 50
  )

  // Draw all visible trees
  visibleTrees.forEach(tree => {
    ctx.drawImage(
      tree.isBorder ? sprites.borderTree : sprites.tree,
      tree.x,
      tree.y,
      tree.width,
      tree.height
    )
  })

  // Draw player
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

  // Draw monster
  const monster = gameState.monster
  if (monster.y > -50 && monster.y < canvas.height + 50) {
    ctx.save()
    ctx.translate(
      monster.x + monster.width / 2,
      monster.y + monster.height / 2
    )
    ctx.rotate(Math.sin(Date.now() * 0.01) * 0.1)
    ctx.drawImage(
      sprites.yeti,
      -monster.width / 2,
      -monster.height / 2,
      monster.width,
      monster.height
    )
    ctx.restore()
  }

  // Draw UI
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '20px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Distancia: ${Math.floor(gameState.distance)}m`, 20, 30)
} 