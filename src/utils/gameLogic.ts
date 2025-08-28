import { TileType, Position, Tile, PlayerType, Combo } from '../types/game';

export function generateInitialBoard(): (Tile | null)[][] {
  const board: (Tile | null)[][] = Array(6).fill(null).map(() => Array(6).fill(null));
  
  // Player 1 (bottom) starting positions
  const player1Setup = [
    { row: 5, col: 0, type: 'rook' as TileType },
    { row: 5, col: 1, type: 'knight' as TileType },
    { row: 5, col: 2, type: 'bishop' as TileType },
    { row: 5, col: 3, type: 'queen' as TileType },
    { row: 5, col: 4, type: 'bishop' as TileType },
    { row: 5, col: 5, type: 'rook' as TileType },
    { row: 4, col: 0, type: 'power' as TileType },
    { row: 4, col: 1, type: 'power' as TileType },
    { row: 4, col: 2, type: 'trap' as TileType },
    { row: 4, col: 3, type: 'trap' as TileType },
    { row: 4, col: 4, type: 'power' as TileType },
    { row: 4, col: 5, type: 'power' as TileType },
  ];
  
  // Player 2 (top) starting positions
  const player2Setup = [
    { row: 0, col: 0, type: 'rook' as TileType },
    { row: 0, col: 1, type: 'knight' as TileType },
    { row: 0, col: 2, type: 'bishop' as TileType },
    { row: 0, col: 3, type: 'queen' as TileType },
    { row: 0, col: 4, type: 'bishop' as TileType },
    { row: 0, col: 5, type: 'rook' as TileType },
    { row: 1, col: 0, type: 'power' as TileType },
    { row: 1, col: 1, type: 'power' as TileType },
    { row: 1, col: 2, type: 'trap' as TileType },
    { row: 1, col: 3, type: 'trap' as TileType },
    { row: 1, col: 4, type: 'power' as TileType },
    { row: 1, col: 5, type: 'power' as TileType },
  ];
  
  // Place player 1 tiles
  player1Setup.forEach(({ row, col, type }) => {
    board[row][col] = {
      type,
      owner: 'player1',
      id: `p1-${row}-${col}`,
      moveCount: 0,
      lastMoved: 0,
    };
  });
  
  // Place player 2 tiles
  player2Setup.forEach(({ row, col, type }) => {
    board[row][col] = {
      type,
      owner: 'player2',
      id: `p2-${row}-${col}`,
      moveCount: 0,
      lastMoved: 0,
    };
  });
  
  return board;
}

export function calculatePossibleMoves(
  board: (Tile | null)[][],
  position: Position,
  tile: Tile
): Position[] {
  const moves: Position[] = [];
  const { row, col } = position;
  
  switch (tile.type) {
    case 'rook':
      // Horizontal and vertical moves
      for (let i = 0; i < 6; i++) {
        if (i !== col && isValidMove(board, row, i, tile.owner)) {
          moves.push({ row, col: i });
        }
        if (i !== row && isValidMove(board, i, col, tile.owner)) {
          moves.push({ row: i, col });
        }
      }
      break;
    
    case 'bishop':
      // Diagonal moves
      for (let i = 1; i < 6; i++) {
        const directions = [
          { row: row + i, col: col + i },
          { row: row + i, col: col - i },
          { row: row - i, col: col + i },
          { row: row - i, col: col - i },
        ];
        
        directions.forEach(pos => {
          if (isInBounds(pos.row, pos.col) && isValidMove(board, pos.row, pos.col, tile.owner)) {
            moves.push(pos);
          }
        });
      }
      break;
    
    case 'knight':
      // L-shaped moves
      const knightMoves = [
        { row: row + 2, col: col + 1 },
        { row: row + 2, col: col - 1 },
        { row: row - 2, col: col + 1 },
        { row: row - 2, col: col - 1 },
        { row: row + 1, col: col + 2 },
        { row: row + 1, col: col - 2 },
        { row: row - 1, col: col + 2 },
        { row: row - 1, col: col - 2 },
      ];
      
      knightMoves.forEach(pos => {
        if (isInBounds(pos.row, pos.col) && isValidMove(board, pos.row, pos.col, tile.owner)) {
          moves.push(pos);
        }
      });
      break;
    
    case 'queen':
      // Combination of rook and bishop moves (limited range)
      for (let i = 1; i <= 3; i++) {
        const directions = [
          { row: row + i, col },      // Up
          { row: row - i, col },      // Down
          { row, col: col + i },      // Right
          { row, col: col - i },      // Left
          { row: row + i, col: col + i }, // Up-right
          { row: row + i, col: col - i }, // Up-left
          { row: row - i, col: col + i }, // Down-right
          { row: row - i, col: col - i }, // Down-left
        ];
        
        directions.forEach(pos => {
          if (isInBounds(pos.row, pos.col) && isValidMove(board, pos.row, pos.col, tile.owner)) {
            moves.push(pos);
          }
        });
      }
      break;
    
    case 'trap':
      // Can only move to adjacent squares
      const trapMoves = [
        { row: row + 1, col },
        { row: row - 1, col },
        { row, col: col + 1 },
        { row, col: col - 1 },
      ];
      
      trapMoves.forEach(pos => {
        if (isInBounds(pos.row, pos.col) && isValidMove(board, pos.row, pos.col, tile.owner)) {
          moves.push(pos);
        }
      });
      break;
    
    case 'power':
      // Can move like a king (one square in any direction)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const newRow = row + dr;
          const newCol = col + dc;
          
          if (isInBounds(newRow, newCol) && isValidMove(board, newRow, newCol, tile.owner)) {
            moves.push({ row: newRow, col: newCol });
          }
        }
      }
      break;
  }
  
  return moves;
}

function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row < 6 && col >= 0 && col < 6;
}

function isValidMove(
  board: (Tile | null)[][],
  row: number,
  col: number,
  owner: PlayerType
): boolean {
  const targetTile = board[row][col];
  
  // Can move to empty square
  if (!targetTile) return true;
  
  // Can capture opponent's tile
  if (targetTile.owner !== owner) return true;
  
  // Cannot move to own tile
  return false;
}

export function detectCombos(
  board: (Tile | null)[][],
  lastMovePos: Position,
  player: PlayerType
): Combo[] {
  const combos: Combo[] = [];
  const { row, col } = lastMovePos;
  const movedTile = board[row][col];
  
  if (!movedTile || movedTile.owner !== player) return combos;
  
  // Check for horizontal combo
  const horizontalCombo = findLineCombo(board, row, col, player, 'horizontal');
  if (horizontalCombo.length >= 3) {
    combos.push({
      tiles: horizontalCombo,
      type: 'line',
      score: horizontalCombo.length * 2,
      player,
    });
  }
  
  // Check for vertical combo
  const verticalCombo = findLineCombo(board, row, col, player, 'vertical');
  if (verticalCombo.length >= 3) {
    combos.push({
      tiles: verticalCombo,
      type: 'line',
      score: verticalCombo.length * 2,
      player,
    });
  }
  
  // Check for diagonal combos
  const diagonal1Combo = findLineCombo(board, row, col, player, 'diagonal1');
  if (diagonal1Combo.length >= 3) {
    combos.push({
      tiles: diagonal1Combo,
      type: 'line',
      score: diagonal1Combo.length * 2,
      player,
    });
  }
  
  const diagonal2Combo = findLineCombo(board, row, col, player, 'diagonal2');
  if (diagonal2Combo.length >= 3) {
    combos.push({
      tiles: diagonal2Combo,
      type: 'line',
      score: diagonal2Combo.length * 2,
      player,
    });
  }
  
  // Check for special patterns
  const lPattern = findLPattern(board, row, col, player);
  if (lPattern.length >= 4) {
    combos.push({
      tiles: lPattern,
      type: 'L',
      score: lPattern.length * 3,
      player,
    });
  }
  
  const tPattern = findTPattern(board, row, col, player);
  if (tPattern.length >= 5) {
    combos.push({
      tiles: tPattern,
      type: 'T',
      score: tPattern.length * 4,
      player,
    });
  }
  
  return combos;
}

function findLineCombo(
  board: (Tile | null)[][],
  row: number,
  col: number,
  player: PlayerType,
  direction: 'horizontal' | 'vertical' | 'diagonal1' | 'diagonal2'
): Position[] {
  const combo: Position[] = [{ row, col }];
  const tile = board[row][col];
  
  if (!tile || tile.owner !== player) return [];
  
  const directions = {
    horizontal: [{ dr: 0, dc: 1 }, { dr: 0, dc: -1 }],
    vertical: [{ dr: 1, dc: 0 }, { dr: -1, dc: 0 }],
    diagonal1: [{ dr: 1, dc: 1 }, { dr: -1, dc: -1 }],
    diagonal2: [{ dr: 1, dc: -1 }, { dr: -1, dc: 1 }],
  };
  
  directions[direction].forEach(({ dr, dc }) => {
    let currentRow = row + dr;
    let currentCol = col + dc;
    
    while (isInBounds(currentRow, currentCol)) {
      const currentTile = board[currentRow][currentCol];
      
      if (currentTile && 
          currentTile.owner === player && 
          currentTile.type === tile.type) {
        combo.push({ row: currentRow, col: currentCol });
        currentRow += dr;
        currentCol += dc;
      } else {
        break;
      }
    }
  });
  
  return combo.length >= 3 ? combo : [];
}

function findLPattern(
  board: (Tile | null)[][],
  row: number,
  col: number,
  player: PlayerType
): Position[] {
  const tile = board[row][col];
  if (!tile || tile.owner !== player) return [];
  
  // Check all possible L formations
  const lPatterns = [
    // L facing different directions
    [{ dr: 0, dc: 1 }, { dr: 0, dc: 2 }, { dr: 1, dc: 0 }],  // Right-Down L
    [{ dr: 0, dc: -1 }, { dr: 0, dc: -2 }, { dr: 1, dc: 0 }], // Left-Down L
    [{ dr: 0, dc: 1 }, { dr: 0, dc: 2 }, { dr: -1, dc: 0 }],  // Right-Up L
    [{ dr: 0, dc: -1 }, { dr: 0, dc: -2 }, { dr: -1, dc: 0 }], // Left-Up L
  ];
  
  for (const pattern of lPatterns) {
    const lTiles: Position[] = [{ row, col }];
    let isValidL = true;
    
    for (const { dr, dc } of pattern) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (isInBounds(newRow, newCol)) {
        const checkTile = board[newRow][newCol];
        if (checkTile && checkTile.owner === player && checkTile.type === tile.type) {
          lTiles.push({ row: newRow, col: newCol });
        } else {
          isValidL = false;
          break;
        }
      } else {
        isValidL = false;
        break;
      }
    }
    
    if (isValidL && lTiles.length >= 4) {
      return lTiles;
    }
  }
  
  return [];
}

function findTPattern(
  board: (Tile | null)[][],
  row: number,
  col: number,
  player: PlayerType
): Position[] {
  const tile = board[row][col];
  if (!tile || tile.owner !== player) return [];
  
  // Check for T patterns (vertical line with horizontal crossbar)
  const tPatterns = [
    // T with crossbar above
    [
      { dr: -1, dc: 0 }, { dr: -2, dc: 0 }, // Vertical up
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }   // Horizontal crossbar
    ],
    // T with crossbar below
    [
      { dr: 1, dc: 0 }, { dr: 2, dc: 0 },   // Vertical down
      { dr: 0, dc: -1 }, { dr: 0, dc: 1 }   // Horizontal crossbar
    ],
  ];
  
  for (const pattern of tPatterns) {
    const tTiles: Position[] = [{ row, col }];
    let isValidT = true;
    
    for (const { dr, dc } of pattern) {
      const newRow = row + dr;
      const newCol = col + dc;
      
      if (isInBounds(newRow, newCol)) {
        const checkTile = board[newRow][newCol];
        if (checkTile && checkTile.owner === player && checkTile.type === tile.type) {
          tTiles.push({ row: newRow, col: newCol });
        } else {
          isValidT = false;
          break;
        }
      } else {
        isValidT = false;
        break;
      }
    }
    
    if (isValidT && tTiles.length >= 5) {
      return tTiles;
    }
  }
  
  return [];
}

export function calculateZoneControl(board: (Tile | null)[][]): { player1: number; player2: number } {
  let player1Count = 0;
  let player2Count = 0;
  
  board.forEach(row => {
    row.forEach(tile => {
      if (tile) {
        if (tile.owner === 'player1') player1Count++;
        if (tile.owner === 'player2') player2Count++;
      }
    });
  });
  
  return { player1: player1Count, player2: player2Count };
}

export function evaluatePosition(board: (Tile | null)[][], player: PlayerType): number {
  let score = 0;
  const tileValues = { rook: 5, bishop: 5, knight: 4, queen: 9, trap: 2, power: 3 };
  
  board.forEach((row, r) => {
    row.forEach((tile, c) => {
      if (tile) {
        const value = tileValues[tile.type];
        const centerBonus = Math.max(0, 2 - Math.abs(2.5 - r) - Math.abs(2.5 - c));
        
        if (tile.owner === player) {
          score += value + centerBonus;
        } else {
          score -= value + centerBonus;
        }
      }
    });
  });
  
  return score;
}