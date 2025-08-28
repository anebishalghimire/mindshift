import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { Tile } from './Tile';
import { GameUI } from './GameUI';
import { Position } from '../types/game';

export default function GameBoard() {
  const { state, dispatch } = useGame();
  const [hoveredTile, setHoveredTile] = useState<Position | null>(null);

  const handleTileClick = (row: number, col: number) => {
    if (state.isAnimating || state.gamePhase !== 'playing') return;
    
    const clickedPosition = { row, col };
    
    // If a tile is selected and we click on a possible move
    if (state.selectedTile && 
        state.possibleMoves.some(move => move.row === row && move.col === col)) {
      dispatch({ type: 'MOVE_TILE', payload: clickedPosition });
      return;
    }
    
    // Select or deselect tile
    dispatch({ type: 'SELECT_TILE', payload: clickedPosition });
  };

  const handleTileHover = (position: Position | null) => {
    setHoveredTile(position);
  };

  const getTileClasses = (row: number, col: number) => {
    const baseClasses = [
      'relative',
      'w-12 h-12 sm:w-16 sm:h-16',
      'transform-gpu',
      'transition-all duration-300 ease-out',
      'cursor-pointer',
      'hover:scale-105',
      'z-10',
    ];

    // Isometric positioning
    const xOffset = (col - row) * 24; // Adjust for mobile
    const yOffset = (col + row) * 12;
    
    baseClasses.push(
      `translate-x-[${xOffset}px]`,
      `translate-y-[${yOffset}px]`
    );

    // Selection and hover effects
    const isSelected = state.selectedTile?.row === row && state.selectedTile?.col === col;
    const isPossibleMove = state.possibleMoves.some(move => move.row === row && move.col === col);
    const isHovered = hoveredTile?.row === row && hoveredTile?.col === col;
    const isComboTile = state.combos.some(combo => 
      combo.tiles.some(tile => tile.row === row && tile.col === col)
    );
    const isMutating = state.mutations.some(mut => mut.row === row && mut.col === col);

    if (isSelected) {
      baseClasses.push('ring-4 ring-blue-400 ring-opacity-70 shadow-xl shadow-blue-500/30');
    }
    
    if (isPossibleMove) {
      baseClasses.push('ring-2 ring-green-400 ring-opacity-60 shadow-lg shadow-green-400/20');
    }
    
    if (isHovered && !isSelected) {
      baseClasses.push('ring-2 ring-white ring-opacity-40');
    }
    
    if (isComboTile) {
      baseClasses.push('animate-pulse ring-4 ring-yellow-400 ring-opacity-80');
    }
    
    if (isMutating) {
      baseClasses.push('animate-spin');
    }

    return baseClasses.join(' ');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent)] opacity-30"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.02%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      {/* Floating UI */}
      <GameUI />
      
      {/* Main Game Board Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="relative">
          {/* Board Background */}
          <div className="absolute inset-0 transform scale-110 bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-3xl blur-xl"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 shadow-2xl backdrop-blur-sm"></div>
          
          {/* Isometric Grid */}
          <div className="relative p-8 sm:p-12 grid place-items-center">
            <div 
              className="relative"
              style={{
                width: '320px',
                height: '280px',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Grid Lines */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={`h-${i}`}>
                    {/* Horizontal grid lines */}
                    <div
                      className="absolute h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"
                      style={{
                        left: `${i * 48 - 24}px`,
                        top: `${i * 24 + 24}px`,
                        width: '288px',
                        transform: 'skewX(30deg)',
                      }}
                    />
                    {/* Vertical grid lines */}
                    <div
                      className="absolute h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"
                      style={{
                        left: `${-i * 48 + 264}px`,
                        top: `${i * 24 + 24}px`,
                        width: '288px',
                        transform: 'skewX(-30deg)',
                      }}
                    />
                  </div>
                ))}
              </div>
              
              {/* Tiles */}
              {state.board.map((row, rowIndex) =>
                row.map((tile, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={getTileClasses(rowIndex, colIndex)}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      marginLeft: '-24px',
                      marginTop: '-24px',
                      transform: `translate(${(colIndex - rowIndex) * 24}px, ${(colIndex + rowIndex) * 12}px)`,
                    }}
                    onClick={() => handleTileClick(rowIndex, colIndex)}
                    onMouseEnter={() => handleTileHover({ row: rowIndex, col: colIndex })}
                    onMouseLeave={() => handleTileHover(null)}
                  >
                    {tile && (
                      <Tile 
                        tile={tile} 
                        position={{ row: rowIndex, col: colIndex }}
                      />
                    )}
                    
                    {/* Empty tile indicator */}
                    {!tile && (
                      <div className="w-full h-full rounded-lg border-2 border-dashed border-slate-600/30 bg-slate-800/20 backdrop-blur-sm hover:border-slate-500/50 transition-colors duration-200">
                        <div className="w-full h-full rounded-md bg-gradient-to-br from-slate-700/10 to-slate-800/10"></div>
                      </div>
                    )}
                    
                    {/* Possible move indicator */}
                    {state.possibleMoves.some(move => move.row === rowIndex && move.col === colIndex) && (
                      <div className="absolute inset-0 rounded-lg bg-green-400/20 border-2 border-green-400/40 animate-pulse">
                        <div className="absolute inset-2 rounded-md bg-green-400/10 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-green-400/60"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Game Status Overlay */}
      {state.gamePhase === 'ended' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 text-center border border-slate-700/50 shadow-2xl max-w-md mx-4">
            <h2 className="text-3xl font-bold text-white mb-4">
              {state.winner === 'player1' ? '🎉 Victory!' : '🤖 AI Wins!'}
            </h2>
            <p className="text-slate-300 mb-6">
              Final Score: {state.score.player1} - {state.score.player2}
            </p>
            <button
              onClick={() => dispatch({ type: 'RESET_GAME' })}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}