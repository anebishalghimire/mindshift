import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameAction, TileType, Position, PlayerType, Tile, Move, Combo } from '../types/game';
import { generateInitialBoard, calculatePossibleMoves, detectCombos, calculateZoneControl } from '../utils/gameLogic';
import { makeAIMove } from '../utils/aiEngine';

const initialState: GameState = {
  board: [],
  currentPlayer: 'player1',
  turnTimeLeft: 60,
  score: { player1: 0, player2: 0 },
  gamePhase: 'setup',
  selectedTile: null,
  possibleMoves: [],
  roundNumber: 1,
  gameMode: 'ai',
  difficulty: 'medium',
  winner: null,
  isAnimating: false,
  lastMove: null,
  combos: [],
  moveHistory: [],
  undosLeft: { player1: 2, player2: 2 },
  mutations: [],
  zoneControl: { player1: 0, player2: 0 },
  streakCount: 0,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT_GAME': {
      const board = action.payload.board.length > 0 ? action.payload.board : generateInitialBoard();
      return {
        ...initialState,
        board,
        gameMode: action.payload.mode || 'ai',
        difficulty: action.payload.difficulty || 'medium',
        gamePhase: 'playing',
        zoneControl: calculateZoneControl(board),
      };
    }
    
    case 'SELECT_TILE': {
      if (state.isAnimating || state.gamePhase !== 'playing') return state;
      
      const { row, col } = action.payload;
      const tile = state.board[row][col];
      
      if (!tile || tile.owner !== state.currentPlayer) {
        return { 
          ...state, 
          selectedTile: null, 
          possibleMoves: [] 
        };
      }
      
      const possibleMoves = calculatePossibleMoves(state.board, action.payload, tile);
      
      return {
        ...state,
        selectedTile: action.payload,
        possibleMoves,
      };
    }
    
    case 'MOVE_TILE': {
      if (state.isAnimating || !state.selectedTile || state.gamePhase !== 'playing') {
        return state;
      }
      
      const from = state.selectedTile;
      const to = action.payload;
      
      // Validate move
      const isValidMove = state.possibleMoves.some(
        move => move.row === to.row && move.col === to.col
      );
      
      if (!isValidMove) return state;
      
      // Create new board with move
      const newBoard = state.board.map(row => [...row]);
      const movingTile = newBoard[from.row][from.col];
      const capturedTile = newBoard[to.row][to.col];
      
      if (!movingTile) return state;
      
      // Execute move
      newBoard[to.row][to.col] = { 
        ...movingTile, 
        moveCount: movingTile.moveCount + 1,
        lastMoved: Date.now()
      };
      newBoard[from.row][from.col] = null;
      
      // Calculate score increase
      let scoreIncrease = capturedTile ? getTileValue(capturedTile.type) : 1;
      const combos = detectCombos(newBoard, to, state.currentPlayer);
      
      combos.forEach(combo => {
        scoreIncrease += combo.score;
      });
      
      // Create move record
      const move: Move = {
        from,
        to,
        capturedTile,
        timestamp: Date.now(),
        player: state.currentPlayer,
      };
      
      const newScore = { ...state.score };
      newScore[state.currentPlayer] += scoreIncrease;
      
      // Check for streak bonus
      const streakBonus = state.streakCount > 2 ? Math.floor(state.streakCount / 3) : 0;
      if (streakBonus > 0) {
        newScore[state.currentPlayer] += streakBonus;
      }
      
      const newZoneControl = calculateZoneControl(newBoard);
      
      // Check win conditions
      let winner: PlayerType | null = null;
      if (newScore.player1 >= 50) winner = 'player1';
      if (newScore.player2 >= 50) winner = 'player2';
      if (newZoneControl.player1 >= 25) winner = 'player1'; // 70% of 36 tiles
      if (newZoneControl.player2 >= 25) winner = 'player2';
      
      return {
        ...state,
        board: newBoard,
        selectedTile: null,
        possibleMoves: [],
        lastMove: move,
        moveHistory: [...state.moveHistory, move],
        score: newScore,
        combos,
        zoneControl: newZoneControl,
        streakCount: combos.length > 0 ? state.streakCount + 1 : 0,
        winner,
        gamePhase: winner ? 'ended' : 'playing',
        isAnimating: true,
      };
    }
    
    case 'SWITCH_TURN': {
      const nextPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1';
      
      // Check if it's time for mutation (every 3 rounds)
      let shouldMutate = false;
      let newRoundNumber = state.roundNumber;
      
      if (nextPlayer === 'player1') {
        newRoundNumber = state.roundNumber + 1;
        shouldMutate = newRoundNumber % 3 === 0;
      }
      
      return {
        ...state,
        currentPlayer: nextPlayer,
        turnTimeLeft: 60,
        roundNumber: newRoundNumber,
        mutations: shouldMutate ? getMutationPositions(state.board) : [],
        undosLeft: nextPlayer === 'player1' ? { player1: 2, player2: 2 } : state.undosLeft,
      };
    }
    
    case 'UPDATE_TIMER': {
      if (state.gamePhase !== 'playing') return state;
      
      const newTime = Math.max(0, action.payload);
      
      if (newTime === 0) {
        // Time's up, switch turns
        return gameReducer(state, { type: 'SWITCH_TURN' });
      }
      
      return {
        ...state,
        turnTimeLeft: newTime,
      };
    }
    
    case 'SET_ANIMATION': {
      return {
        ...state,
        isAnimating: action.payload,
      };
    }
    
    case 'CLEAR_COMBOS': {
      return {
        ...state,
        combos: [],
      };
    }
    
    case 'UNDO_MOVE': {
      if (state.undosLeft[state.currentPlayer] <= 0 || state.moveHistory.length === 0) {
        return state;
      }
      
      const lastMove = state.moveHistory[state.moveHistory.length - 1];
      if (lastMove.player !== state.currentPlayer) return state;
      
      // Revert the board state
      const newBoard = state.board.map(row => [...row]);
      const tile = newBoard[lastMove.to.row][lastMove.to.col];
      
      if (tile) {
        newBoard[lastMove.from.row][lastMove.from.col] = tile;
        newBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedTile || null;
      }
      
      const newUndosLeft = { ...state.undosLeft };
      newUndosLeft[state.currentPlayer]--;
      
      return {
        ...state,
        board: newBoard,
        moveHistory: state.moveHistory.slice(0, -1),
        undosLeft: newUndosLeft,
        selectedTile: null,
        possibleMoves: [],
        combos: [],
      };
    }
    
    case 'MUTATE_TILES': {
      const newBoard = state.board.map(row => [...row]);
      
      action.payload.forEach(pos => {
        const tile = newBoard[pos.row][pos.col];
        if (tile) {
          const tileTypes: TileType[] = ['rook', 'bishop', 'knight', 'queen', 'power'];
          const newType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
          newBoard[pos.row][pos.col] = { ...tile, type: newType };
        }
      });
      
      return {
        ...state,
        board: newBoard,
        mutations: [],
      };
    }
    
    case 'END_GAME': {
      return {
        ...state,
        winner: action.payload,
        gamePhase: 'ended',
      };
    }
    
    case 'RESET_GAME': {
      const board = generateInitialBoard();
      return {
        ...initialState,
        board,
        gamePhase: 'playing',
        gameMode: state.gameMode,
        difficulty: state.difficulty,
        zoneControl: calculateZoneControl(board),
      };
    }
    
    case 'AI_MOVE': {
      return gameReducer(state, { type: 'MOVE_TILE', payload: action.payload.to });
    }
    
    default:
      return state;
  }
}

function getTileValue(type: TileType): number {
  const values = {
    rook: 5,
    bishop: 5,
    knight: 4,
    queen: 9,
    trap: 2,
    power: 3,
  };
  return values[type];
}

function getMutationPositions(board: (Tile | null)[][]): Position[] {
  const positions: Position[] = [];
  const tiles: Position[] = [];
  
  // Collect all tile positions
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col]) {
        tiles.push({ row, col });
      }
    }
  }
  
  // Select random tiles for mutation (10% of total tiles)
  const mutationCount = Math.max(1, Math.floor(tiles.length * 0.1));
  
  for (let i = 0; i < mutationCount; i++) {
    const randomIndex = Math.floor(Math.random() * tiles.length);
    positions.push(tiles.splice(randomIndex, 1)[0]);
  }
  
  return positions;
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  // Initialize game on mount
  useEffect(() => {
    dispatch({ 
      type: 'INIT_GAME', 
      payload: { 
        board: [],
        mode: 'ai',
        difficulty: 'medium'
      } 
    });
  }, []);
  
  // Handle turn timer
  useEffect(() => {
    if (state.gamePhase !== 'playing' || state.isAnimating) return;
    
    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_TIMER', payload: state.turnTimeLeft - 1 });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [state.gamePhase, state.turnTimeLeft, state.isAnimating]);
  
  // Handle AI moves
  useEffect(() => {
    if (state.currentPlayer === 'player2' && 
        state.gameMode === 'ai' && 
        state.gamePhase === 'playing' && 
        !state.isAnimating) {
      
      const timer = setTimeout(() => {
        const aiMove = makeAIMove(state.board, state.difficulty, state);
        if (aiMove) {
          dispatch({ type: 'SELECT_TILE', payload: aiMove.from });
          setTimeout(() => {
            dispatch({ type: 'AI_MOVE', payload: aiMove });
          }, 500);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.currentPlayer, state.gameMode, state.gamePhase, state.isAnimating]);
  
  // Handle animations
  useEffect(() => {
    if (state.isAnimating) {
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_ANIMATION', payload: false });
        if (state.combos.length > 0) {
          setTimeout(() => {
            dispatch({ type: 'CLEAR_COMBOS' });
          }, 500);
        }
        setTimeout(() => {
          dispatch({ type: 'SWITCH_TURN' });
        }, 800);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.isAnimating, state.combos.length]);
  
  // Handle mutations
  useEffect(() => {
    if (state.mutations.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: 'MUTATE_TILES', payload: state.mutations });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [state.mutations]);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}