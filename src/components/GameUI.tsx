import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Clock, Trophy, Zap, RotateCcw, Settings, User, Bot } from 'lucide-react';

export function GameUI() {
  const { state, dispatch } = useGame();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (state.turnTimeLeft <= 10) return 'text-red-400';
    if (state.turnTimeLeft <= 20) return 'text-yellow-400';
    return 'text-white';
  };

  return (
    <>
      {/* Top UI Bar */}
      <div className="flex justify-between items-center p-4 sm:p-6">
        {/* Game Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">MindShift</h1>
        </div>
        
        {/* Settings */}
        <button className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Player Stats */}
      <div className="flex justify-between items-start px-4 sm:px-6">
        {/* Player 1 Stats */}
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-2xl p-4 border border-blue-700/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-5 h-5 text-blue-400" />
            <span className="text-blue-200 font-medium">You</span>
            {state.currentPlayer === 'player1' && (
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold text-lg">{state.score.player1}</span>
            </div>
            
            <div className="text-xs text-slate-400">
              Zone: {state.zoneControl.player1}/36
            </div>
            
            <div className="text-xs text-slate-400">
              Undos: {state.undosLeft.player1}
            </div>
          </div>
        </div>

        {/* Center Timer */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-4 border border-slate-700/50 backdrop-blur-sm text-center min-w-[120px]">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-400">Turn Timer</span>
          </div>
          
          <div className={`text-2xl font-bold ${getTimeColor()}`}>
            {formatTime(state.turnTimeLeft)}
          </div>
          
          <div className="text-xs text-slate-400 mt-1">
            Round {state.roundNumber}
          </div>
          
          {/* Timer Progress Bar */}
          <div className="mt-3 w-full bg-slate-700/50 rounded-full h-1">
            <div 
              className={`h-1 rounded-full transition-all duration-1000 ease-linear ${
                state.turnTimeLeft <= 10 ? 'bg-red-400' :
                state.turnTimeLeft <= 20 ? 'bg-yellow-400' : 'bg-green-400'
              }`}
              style={{ width: `${(state.turnTimeLeft / 60) * 100}%` }}
            />
          </div>
        </div>

        {/* Player 2 (AI) Stats */}
        <div className="bg-gradient-to-br from-red-900/30 to-red-800/30 rounded-2xl p-4 border border-red-700/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-3">
            <Bot className="w-5 h-5 text-red-400" />
            <span className="text-red-200 font-medium">AI</span>
            {state.currentPlayer === 'player2' && (
              <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-bold text-lg">{state.score.player2}</span>
            </div>
            
            <div className="text-xs text-slate-400">
              Zone: {state.zoneControl.player2}/36
            </div>
            
            <div className="text-xs text-slate-400">
              Level: {state.difficulty}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center px-4 sm:px-6 mt-4">
        <div className="flex space-x-2">
          {/* Undo Button */}
          <button
            onClick={() => dispatch({ type: 'UNDO_MOVE' })}
            disabled={state.undosLeft[state.currentPlayer] <= 0 || state.isAnimating || state.currentPlayer !== 'player1'}
            className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Undo ({state.undosLeft[state.currentPlayer]})</span>
          </button>
        </div>
      </div>

      {/* Combos Display */}
      {state.combos.length > 0 && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          {state.combos.map((combo, index) => (
            <div 
              key={index}
              className="mb-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg shadow-2xl animate-bounce"
            >
              <div className="text-center">
                <div className="text-sm uppercase tracking-wider">{combo.type} Combo!</div>
                <div className="text-lg">+{combo.score} Points</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mutation Notification */}
      {state.mutations.length > 0 && (
        <div className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none">
          <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-2xl animate-pulse">
            <div className="text-center">
              <div className="text-sm uppercase tracking-wider">Mutation Wave!</div>
              <div className="text-lg">Tiles are changing...</div>
            </div>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      {state.gamePhase === 'playing' && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30">
          <div className={`px-6 py-3 rounded-full shadow-lg backdrop-blur-sm border transition-all duration-300 ${
            state.currentPlayer === 'player1' 
              ? 'bg-blue-900/80 border-blue-500/50 text-blue-200' 
              : 'bg-red-900/80 border-red-500/50 text-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {state.currentPlayer === 'player1' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
              <span className="font-medium">
                {state.currentPlayer === 'player1' ? "Your Turn" : "AI Thinking..."}
              </span>
              {state.isAnimating && (
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}