import { GameState } from '../types/game'
import { GAME_CONSTANTS } from '../types/game'

export function drawGame(gameState: GameState) {
  const { ctx, canvas } = gameState

  // Clear canvas
  clearCanvas(ctx, canvas)
  
  // Draw game elements
  drawSnowArea(ctx, canvas)
  drawStartLine(gameState)
  drawTrees(gameState)
  drawPlayer(gameState)
  drawMonster(gameState)
  drawUI(gameState)
}

// Helper functions that can be tested independently

function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.fillStyle = '#1a1a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}

function drawSnowArea(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
  ctx.fillStyle = '#2c2c2c'
  ctx.fillRect(
    GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    0,
    canvas.width - 2 * GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    canvas.height
  )
}

function drawStartLine(gameState: GameState) {
  const { ctx, startLine } = gameState;
  
  if (startLine && startLine.y > -50 && startLine.y < gameState.canvas.height + 50) {
    // Draw start line
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(startLine.x, startLine.y, startLine.width, 5);
    
    // Draw start text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PARTIDA', gameState.canvas.width / 2, startLine.y - 10);
  }
}

function drawTrees(gameState: GameState) {
  const { ctx, canvas, obstacles, borderTrees, sprites } = gameState
  
  // Get only visible trees for performance
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
}

function drawPlayer(gameState: GameState) {
  const { ctx, player, sprites, playerAngle } = gameState
  
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
}

function drawMonster(gameState: GameState) {
  const { ctx, canvas, monster, sprites } = gameState
  
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
}

function drawUI(gameState: GameState) {
  const { ctx, distance } = gameState
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = '20px Arial'
  ctx.textAlign = 'left'
  ctx.fillText(`Distancia: ${Math.floor(distance)}m`, 20, 30)
} 