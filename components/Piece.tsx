
import React from 'react';
import { Piece as PieceType, Color, PieceType as PT } from '../types';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  isLastMove?: boolean;
}

// Ký tự Hán cho quân cờ
// SVG Paths for Xiangqi Characters (Baked-in geometry, not font)
const PIECE_PATHS: Record<Color, Record<PT, string>> = {
  [Color.RED]: {
    [PT.KING]: "M50,15 L65,15 L65,25 L35,25 L35,15 L50,15 M30,35 L70,35 L70,45 L30,45 L30,35 M45,45 L45,85 M55,45 L55,85 M30,65 L70,65", // Simplified 帥
    [PT.ADVISOR]: "M30,25 L70,25 M50,25 L50,75 M30,75 L70,75 M35,45 L65,45", // Simplified 仕
    [PT.ELEPHANT]: "M30,30 L70,30 M50,30 L50,80 M30,55 L70,55 M30,80 L70,80", // Simplified 相
    [PT.HORSE]: "M35,30 L65,30 L65,70 L35,70 L35,30 M50,30 L50,70 M35,50 L65,50 M30,80 L40,80 M50,80 L60,80 M70,80 L75,80", // Simplified 傌
    [PT.CHARIOT]: "M30,25 L70,25 L70,75 L30,75 L30,25 M30,50 L70,50 M50,25 L50,75", // Simplified 俥
    [PT.CANNON]: "M30,30 L70,30 L70,50 L30,50 L30,30 M50,50 L50,85 M30,70 L70,70", // Simplified 炮
    [PT.SOLDIER]: "M30,30 L70,30 M50,30 L50,80 M30,55 L70,55 M40,80 L60,80", // Simplified 兵
  },
  [Color.BLACK]: {
    [PT.KING]: "M30,25 L70,25 L70,45 L30,45 L30,25 M50,45 L50,85 M35,65 L65,65 M30,85 L70,85", // Simplified 將
    [PT.ADVISOR]: "M30,30 L70,30 M50,30 L50,80 M35,55 L65,55", // Simplified 士
    [PT.ELEPHANT]: "M30,30 L70,30 L70,80 L30,80 L30,30 M30,55 L70,55 M50,30 L50,80", // Simplified 象
    [PT.HORSE]: "M30,30 L70,30 L70,70 L30,70 L30,30 M50,30 L50,70 M30,50 L70,50", // Simplified 馬
    [PT.CHARIOT]: "M30,30 L70,30 L70,80 L30,80 L30,30 M30,55 L70,55 M50,30 L50,80", // Simplified 車
    [PT.CANNON]: "M30,30 L70,30 L70,60 L30,60 L30,30 M50,60 L50,90 M30,75 L70,75", // Simplified 砲
    [PT.SOLDIER]: "M30,40 L70,40 M50,20 L50,80 M40,60 L60,60", // Simplified 卒
  },
};

const Piece: React.FC<PieceProps> = ({ piece, isSelected, isLastMove }) => {
  const isRed = piece.color === Color.RED;
  const pathData = PIECE_PATHS[piece.color][piece.type];

  return (
    <div
      className={`silk-grain ${isSelected ? 'selected' : ''}`}
      style={{
        width: '100%',
        height: '100%',
        padding: '5%',
        boxSizing: 'border-box',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.15s ease',
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
        zIndex: isSelected ? 20 : 1,
      }}
    >
      {/* Nền quân cờ - NGÀ VOI (Ivory White) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `
            linear-gradient(135deg, #fdfaf0 0%, #f4f0e6 100%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(139, 90, 43, 0.03) 2px,
              rgba(139, 90, 43, 0.03) 4px
            )
          `,
          backgroundBlendMode: 'soft-light',
          border: '1.5px solid #dcd7c9',
          boxShadow: isSelected
            ? '0 0 0 3px #fbbf24, 0 4px 15px rgba(0,0,0,0.4)'
            : isLastMove
              ? '0 0 0 2px #60a5fa, 0 3px 10px rgba(0,0,0,0.3)'
              : '0 3px 8px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,1)',
        }}
      />

      {/* Vòng tròn viền trong */}
      <div
        style={{
          position: 'absolute',
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          borderRadius: '50%',
          border: isRed ? '1px solid rgba(185, 28, 28, 0.15)' : '1px solid rgba(31, 41, 55, 0.15)',
        }}
      />

      {/* Ký tự Baked-in (SVG Path) */}
      <div
        style={{
          position: 'absolute',
          inset: '12%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          style={{
            width: '85%',
            height: '85%',
            filter: 'drop-shadow(0.5px 0.5px 0px rgba(255,255,255,0.6))',
          }}
        >
          <path
            d={pathData}
            fill="none"
            stroke={isRed ? '#b91c1c' : '#1f2937'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              // Hiệu ứng khắc sâu (Engraved look)
              filter: 'brightness(0.9)',
            }}
          />
        </svg>
      </div>
    </div>
  );
};

export default React.memo(Piece);
