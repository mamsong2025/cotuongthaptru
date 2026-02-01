
import React from 'react';
import { Piece as PieceType, Color, PieceType as PT } from '../types';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  isLastMove?: boolean;
}

// Unicode characters for Xiangqi pieces
const PIECE_CHARS: Record<Color, Record<PT, string>> = {
  [Color.RED]: {
    [PT.KING]: '帥',
    [PT.ADVISOR]: '仕',
    [PT.ELEPHANT]: '相',
    [PT.HORSE]: '傌',
    [PT.CHARIOT]: '俥',
    [PT.CANNON]: '炮',
    [PT.SOLDIER]: '兵',
  },
  [Color.BLACK]: {
    [PT.KING]: '將',
    [PT.ADVISOR]: '士',
    [PT.ELEPHANT]: '象',
    [PT.HORSE]: '馬',
    [PT.CHARIOT]: '車',
    [PT.CANNON]: '砲',
    [PT.SOLDIER]: '卒',
  },
};

const Piece: React.FC<PieceProps> = ({ piece, isSelected, isLastMove }) => {
  const isRed = piece.color === Color.RED;
  const char = PIECE_CHARS[piece.color][piece.type];

  return (
    <div
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
      {/* Perfect circular piece with hard edges */}
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
          overflow: 'hidden',
        }}
      >
        {/* Inner ring */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            right: '3px',
            bottom: '3px',
            borderRadius: '50%',
            border: isRed
              ? '1px solid rgba(185, 28, 28, 0.15)'
              : '1px solid rgba(31, 41, 55, 0.15)',
          }}
        />

        {/* Character - using system fonts for reliability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '2px',
          }}
        >
          <span
            style={{
              fontSize: '26px',
              fontFamily: "'Noto Serif TC', 'Microsoft YaHei', 'SimHei', 'STHeiti', 'PingFang SC', 'Hiragino Sans GB', 'Source Han Sans CN', 'WenQuanYi Micro Hei', sans-serif",
              fontWeight: 900,
              color: isRed ? '#b91c1c' : '#1f2937',
              textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.5)',
              userSelect: 'none',
              lineHeight: 1,
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
            }}
          >
            {char}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Piece);
