export type TileType = 'rook' | 'bishop' | 'knight' | 'queen' | 'trap' | 'power';
export type PlayerType = 'player1' | 'player2';
export type GamePhase = 'setup' | 'playing' | 'paused' | 'ended';
export type GameMode = 'ai' | 'local' | 'online';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface Position {
  row: number;
  col: number;
}

export interface Tile {
  type: TileType;
  owner: PlayerType;
  id: string;
  moveCount: number;
  lastMoved: number;
}

export interface Move {
  from: Position;
  to: Position;
  capturedTile?: Tile;
  timestamp: number;
  player: PlayerType;
}

export interface Combo {
  tiles: Position[];
  type: 'line' | 'L' | 'T' | 'cross' | 'cluster';
  score: number;
  player: PlayerType;
}

export interface GameState {
  board: (Tile | null)[][];
  currentPlayer: PlayerType;
  turnTimeLeft: number;
  score: { player1: number; player2: number };
  gamePhase: GamePhase;
  selectedTile: Position | null;
  possibleMoves: Position[];
  roundNumber: number;
  gameMode: GameMode;
  difficulty: Difficulty;
  winner: PlayerType | null;
  isAnimating: boolean;
  lastMove: Move | null;
  combos: Combo[];
  moveHistory: Move[];
  undosLeft: { player1: number; player2: number };
  mutations: Position[];
  zoneControl: { player1: number; player2: number };
  streakCount: number;
}

export type GameAction =
  | { type: 'INIT_GAME'; payload: { board: (Tile | null)[][]; mode?: GameMode; difficulty?: Difficulty } }
  | { type: 'SELECT_TILE'; payload: Position }
  | { type: 'MOVE_TILE'; payload: Position }
  | { type: 'DESELECT_TILE' }
  | { type: 'SWITCH_TURN' }
  | { type: 'UPDATE_TIMER'; payload: number }
  | { type: 'SET_ANIMATION'; payload: boolean }
  | { type: 'ADD_COMBO'; payload: Combo }
  | { type: 'CLEAR_COMBOS' }
  | { type: 'UNDO_MOVE' }
  | { type: 'MUTATE_TILES'; payload: Position[] }
  | { type: 'END_GAME'; payload: PlayerType }
  | { type: 'RESET_GAME' }
  | { type: 'AI_MOVE'; payload: { from: Position; to: Position } };

export interface TileMovement {
  type: TileType;
  directions: Position[];
  canJump: boolean;
  range: number;
}

export interface AIPersonality {
  aggression: number; // 0-1
  defense: number;    // 0-1
  risk: number;      // 0-1
  combo: number;     // 0-1
}</parameter>