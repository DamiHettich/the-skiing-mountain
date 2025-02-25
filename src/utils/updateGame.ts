import { GameState, GAME_CONSTANTS, SCORE_CONSTANTS, GameStatus } from '../types/game'
import { handleGameOver } from './gameOver'

export function updateGame(
  gameState: GameState,
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>
) {
  if (gameState.gameStatus !== 'playing') return

  // Handle movement
  updatePlayerMovement(gameState);
  updatePlayerPosition(gameState);
  updateTrees(gameState);

  if (!gameState.hasCollided) {
    gameState.player.y = Math.min(
      gameState.canvas.height - 200,  
      gameState.player.y + gameState.currentSpeed * 0.03  
    )
  }


  generateObstacleTrees(gameState);
  generateBorderTrees(gameState);

  updateScoreAndDistance(gameState);
  updatePlayerAngle(gameState);
  updateMonster(gameState, setGameState);
}

// Helper functions

function updatePlayerMovement(gameState: GameState) {
  const acceleration = 0.1;
  const friction = 0.85;

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
}

function updatePlayerPosition(gameState: GameState) {
  gameState.player.x = Math.max(
    GAME_CONSTANTS.PLAYABLE_MARGIN_X,
    Math.min(
      gameState.canvas.width - GAME_CONSTANTS.PLAYABLE_MARGIN_X - gameState.player.width,
      gameState.player.x + gameState.horizontalSpeed
    )
  )
}

function updateTrees(gameState: GameState) {
  // Move all trees
  gameState.obstacles = gameState.obstacles.map(obstacle => ({
    ...obstacle,
    y: obstacle.y - gameState.currentSpeed
  }))

  gameState.borderTrees = gameState.borderTrees.map(tree => ({
    ...tree,
    y: tree.y - gameState.currentSpeed
  }))

  // Move the start line up with everything else
  if (gameState.startLine) {
    gameState.startLine.y -= gameState.currentSpeed;
  }

  // Clean up off-screen trees
  gameState.obstacles = gameState.obstacles.filter(
    obstacle => obstacle.y > -100 && obstacle.y < gameState.canvas.height + 200
  )
  gameState.borderTrees = gameState.borderTrees.filter(
    tree => tree.y > -100 && tree.y < gameState.canvas.height + 200
  )
}

function generateObstacleTrees(gameState: GameState) {
  // Generate new obstacle trees
  const minTrees = 15 + Math.floor(gameState.distance / 30);
  if (gameState.obstacles.length < minTrees) {
    const treesToAdd = Math.min(5, minTrees - gameState.obstacles.length);
    
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
}

function generateBorderTrees(gameState: GameState) {
  // Generate border trees
  const minBorderTrees = 50;
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
}

function updateScoreAndDistance(gameState: GameState) {
  gameState.score += gameState.currentSpeed
  gameState.distance += gameState.currentSpeed * SCORE_CONSTANTS.DISTANCE_MULTIPLIER
}

function updatePlayerAngle(gameState: GameState) {
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
    gameState.playerAngle *= 0.9
  }
}

function updateMonster(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState | null>>) {
  const monster = gameState.monster
  
  const playerSpeedFactor = gameState.currentSpeed / gameState.maxSpeed;
  
  // Calculate target speed - slower than player when player is at full speed
  const targetSpeed = Math.min(
    gameState.baseSpeed * 1.1,
    monster.baseSpeed + (gameState.distance * 0.0001)
  )
  const monsterSpeedMultiplier = 
    playerSpeedFactor < 0.7 ? 1 : 0.8;

  monster.speed = monster.speed + (targetSpeed * monsterSpeedMultiplier - monster.speed) * 0.05;

  const dx = gameState.player.x - monster.x
  monster.x += dx * GAME_CONSTANTS.MONSTER_HORIZONTAL_FOLLOW

  if (monster.y < gameState.player.y - 200) {
    monster.y += monster.speed * 2
  } else if (monster.y > gameState.player.y - 100) {
    monster.y += monster.speed * 0.7
  } else {
    monster.y += monster.speed;
  }

  // Check for collision with monster
  checkMonsterCollision(gameState, setGameState);
}

function checkMonsterCollision(gameState: GameState, setGameState: React.Dispatch<React.SetStateAction<GameState | null>>) {
  const monster = gameState.monster;
  
  const monsterHitbox = {
    y: monster.y + monster.height * 0.2,
    width: monster.width * 0.6,
    height: monster.height * 0.6
  }

  const playerHitbox = {
    y: gameState.player.y + gameState.player.height * 0.2,
    width: gameState.player.width * 0.6,
    height: gameState.player.height * 0.6
  }

  if (
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
  }
} 