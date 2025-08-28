import React from 'react';
import { Tile as TileType, Position } from '../types/game';
import { 
  Castle, 
  Zap, 
  Crown, 
  Shield, 
  Sparkles,
  ChevronRight,
  ChevronUp,
  Move,
  X
} from 'lucide-react';

interface TileProps {
  tile: TileType;
  position: Position;
}

export function Tile({ tile, position }: TileProps) {
  const getTileIcon = () => {
    switch (tile.type) {
      case 'rook':
        return <Castle className="w-6 h-6" />;
      case 'bishop':
        return <ChevronUp className="w-6 h-6" />;
      case 'knight':
        return <Move className="w-6 h-6" />;
      case 'queen':
        return <Crown className="w-6 h-6" />;
      case 'trap':
        return <X className="w-6 h-6" />;
      case 'power':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Shield className="w-6 h-6" />;
    }
  };

  const getTileColors = () => {
    const isPlayer1 = tile.owner === 'player1';
    
    switch (tile.type) {
      case 'rook':
        return {
          bg: isPlayer1 
            ? 'from-blue-600 to-blue-800' 
            : 'from-red-600 to-red-800',
          border: isPlayer1 ? 'border-blue-400' : 'border-red-400',
          text: 'text-white',
          shadow: isPlayer1 ? 'shadow-blue-500/30' : 'shadow-red-500/30',
          glow: isPlayer1 ? 'bg-blue-400/20' : 'bg-red-400/20'
        };
      case 'bishop':
        return {
          bg: isPlayer1 
            ? 'from-indigo-600 to-indigo-800' 
            : 'from-pink-600 to-pink-800',
          border: isPlayer1 ? 'border-indigo-400' : 'border-pink-400',
          text: 'text-white',
          shadow: isPlayer1 ? 'shadow-indigo-500/30' : 'shadow-pink-500/30',
          glow: isPlayer1 ? 'bg-indigo-400/20' : 'bg-pink-400/20'
        };
      case 'knight':
        return {
          bg: isPlayer1 
            ? 'from-purple-600 to-purple-800' 
            : 'from-orange-600 to-orange-800',
          border: isPlayer1 ? 'border-purple-400' : 'border-orange-400',
          text: 'text-white',
          shadow: isPlayer1 ? 'shadow-purple-500/30' : 'shadow-orange-500/30',
          glow: isPlayer1 ? 'bg-purple-400/20' : 'bg-orange-400/20'
        };
      case 'queen':
        return {
          bg: isPlayer1 
            ? 'from-yellow-500 to-yellow-700' 
            : 'from-rose-600 to-rose-800',
          border: isPlayer1 ? 'border-yellow-300' : 'border-rose-400',
          text: 'text-white',
          shadow: isPlayer1 ? 'shadow-yellow-500/30' : 'shadow-rose-500/30',
          glow: isPlayer1 ? 'bg-yellow-400/20' : 'bg-rose-400/20'
        };
      case 'trap':
        return {
          bg: 'from-slate-700 to-slate-900',
          border: 'border-slate-500',
          text: 'text-slate-300',
          shadow: 'shadow-slate-500/30',
          glow: 'bg-slate-400/20'
        };
      case 'power':
        return {
          bg: isPlayer1 
            ? 'from-emerald-500 to-emerald-700' 
            : 'from-cyan-600 to-cyan-800',
          border: isPlayer1 ? 'border-emerald-300' : 'border-cyan-400',
          text: 'text-white',
          shadow: isPlayer1 ? 'shadow-emerald-500/30' : 'shadow-cyan-500/30',
          glow: isPlayer1 ? 'bg-emerald-400/20' : 'bg-cyan-400/20'
        };
      default:
        return {
          bg: 'from-slate-600 to-slate-800',
          border: 'border-slate-400',
          text: 'text-white',
          shadow: 'shadow-slate-500/30',
          glow: 'bg-slate-400/20'
        };
    }
  };

  const colors = getTileColors();
  
  return (
    <div className="relative w-full h-full group">
      {/* Glow Effect */}
      <div className={`absolute inset-0 rounded-lg ${colors.glow} blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 scale-110`}></div>
      
      {/* Main Tile */}
      <div className={`
        relative w-full h-full
        bg-gradient-to-br ${colors.bg}
        border-2 ${colors.border}
        rounded-lg
        shadow-lg ${colors.shadow}
        transform transition-all duration-200
        group-hover:scale-105
        group-hover:shadow-xl
        flex flex-col items-center justify-center
        backdrop-blur-sm
      `}>
        {/* Tile Icon */}
        <div className={`${colors.text} mb-1 transition-transform duration-200 group-hover:scale-110`}>
          {getTileIcon()}
        </div>
        
        {/* Tile Type Label */}
        <div className={`text-xs font-bold uppercase tracking-wider ${colors.text} opacity-80`}>
          {tile.type.slice(0, 3)}
        </div>
        
        {/* Owner Indicator */}
        <div className={`
          absolute -top-1 -right-1 
          w-3 h-3 rounded-full border border-white/50
          ${tile.owner === 'player1' 
            ? 'bg-blue-400 shadow-blue-400/50' 
            : 'bg-red-400 shadow-red-400/50'
          }
          shadow-md
        `}></div>
        
        {/* Movement Count Indicator */}
        {tile.moveCount > 0 && (
          <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-slate-700 rounded-full border border-slate-500 flex items-center justify-center">
            <span className="text-xs text-slate-300 font-bold">{tile.moveCount}</span>
          </div>
        )}
        
        {/* Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
      </div>
      
      {/* Movement Pattern Indicator (on hover) */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg px-2 py-1 border border-slate-700/50 whitespace-nowrap">
          <div className="text-xs text-slate-300 font-medium">
            {getMovementDescription(tile.type)}
          </div>
        </div>
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900/90 mx-auto"></div>
      </div>
    </div>
  );
}

function getMovementDescription(type: TileType['type']): string {
  switch (type) {
    case 'rook':
      return 'Horizontal & Vertical';
    case 'bishop':
      return 'Diagonal Lines';
    case 'knight':
      return 'L-shaped Jumps';
    case 'queen':
      return 'Any Direction (3 spaces)';
    case 'trap':
      return 'Adjacent Squares';
    case 'power':
      return 'King Movement';
    default:
      return 'Unknown';
  }
}