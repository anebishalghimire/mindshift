import { Position, Tile, PlayerType, Difficulty, GameState } from '../types/game';
import { calculatePossibleMoves, evaluatePosition, detectCombos } from './gameLogic';

interface Move {
  from: Position;
  to: Position;
  score: number;
}

export function makeAIMove(
  board: (Tile | null)[][],
  difficulty: Difficulty,
  gameState: GameState
): { from: Position; to: Position } | null {
  const aiPlayer: PlayerType = 'player2';
  const depth = getDifficultyDepth(difficulty);
  
  const bestMove = minimax(board, depth, -Infinity, Infinity, true, aiPlayer, gameState);
  return bestMove ? { from: bestMove.from, to: bestMove.to } : null;
}

function getDifficultyDepth(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 2;
    case 'medium': return 3;
    case 'hard': return 4;
    case 'expert': return 5;
    default: return 3;
  }
}

function minimax(
  board: (Tile | null)[][],
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: PlayerType,
  gameState: GameState
): Move | null {
  if (depth === 0) {
    return {
      from: { row: -1, col: -1 },
      to: { row: -1, col: -1 },
      score: evaluatePosition(board, player),
    };
  }
  
  const moves = getAllPossibleMoves(board, maximizing ? player : getOpponent(player));
  
  if (moves.length === 0) {
    return {
      from: { row: -1, col: -1 },
      to: { row: -1, col: -1 },
      score: maximizing ? -Infinity : Infinity,
    };
  }
  
  let bestMove: Move | null = null;
  
  if (maximizing) {
    let maxScore = -Infinity;
    
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const score = minimax(newBoard, depth - 1, alpha, beta, false, player, gameState);
      
      if (score && score.score > maxScore) {
        maxScore = score.score;
        bestMove = { ...move, score: maxScore };
      }
      
      alpha = Math.max(alpha, maxScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
  } else {
    let minScore = Infinity;
    
    for (const move of moves) {
      const newBoard = makeMove(board, move.from, move.to);
      const score = minimax(newBoard, depth - 1, alpha, beta, true, player, gameState);
      
      if (score && score.score < minScore) {
        minScore = score.score;
        bestMove = { ...move, score: minScore };
      }
      
      beta = Math.min(beta, minScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
  }
  
  return bestMove;
}

function getAllPossibleMoves(board: (Tile | null)[][], player: PlayerType): Move[] {
  const moves: Move[] = [];
  
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const tile = board[row][col];
      if (tile && tile.owner === player) {
        const possibleMoves = calculatePossibleMoves(board, { row, col }, tile);
        
        possibleMoves.forEach(to => {
          // Calculate move score based on various factors
          let score = 0;
          
          // Capture bonus
          const targetTile = board[to.row][to.col];
          if (targetTile && targetTile.owner !== player) {
            score += getTileValue(targetTile.type) * 10;
          }
          
          // Center control bonus
          const centerDistance = Math.abs(2.5 - to.row) + Math.abs(2.5 - to.col);
          score += (5 - centerDistance) * 2;
          
          // Combo potential
          const tempBoard = makeMove(board, { row, col }, to);
          const combos = detectCombos(tempBoard, to, player);
          score += combos.reduce((sum, combo) => sum + combo.score, 0) * 15;
          
          // Avoid danger (simplified)
          const opponentThreats = getThreatsToPosition(board, to, getOpponent(player));
          score -= opponentThreats * 5;
          
          moves.push({
            from: { row, col },
            to,
            score,
          });
        });
      }
    }
  }
  
  // Sort moves by score for better alpha-beta pruning
  return moves.sort((a, b) => b.score - a.score);
}

function makeMove(
  board: (Tile | null)[][],
  from: Position,
  to: Position
): (Tile | null)[][] {
  const newBoard = board.map(row => [...row]);
  const tile = newBoard[from.row][from.col];
  
  if (tile) {
    newBoard[to.row][to.col] = tile;
    newBoard[from.row][from.col] = null;
  }
  
  return newBoard;
}

function getTileValue(type: string): number {
  const values: { [key: string]: number } = {
    rook: 5,
    bishop: 5,
    knight: 4,
    queen: 9,
    trap: 2,
    power: 3,
  };
  return values[type] || 1;
}

function getOpponent(player: PlayerType): PlayerType {
  return player === 'player1' ? 'player2' : 'player1';
}

function getThreatsToPosition(
  board: (Tile | null)[][],
  position: Position,
  opponent: PlayerType
): number {
  let threats = 0;
  
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 6; col++) {
      const tile = board[row][col];
      if (tile && tile.owner === opponent) {
        const moves = calculatePossibleMoves(board, { row, col }, tile);
        if (moves.some(move => move.row === position.row && move.col === position.col)) {
          threats++;
        }
      }
    }
  }
  
  return threats;
}