
import React from 'react';
import { Piece as PieceType, Color, PieceType as PT } from '../types';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  isLastMove?: boolean;
}

// Ký tự Hán cho quân cờ
const PIECE_CHARS: Record<Color, Record<PT, string>> = {
  [Color.RED]: {
    [PT.KING]: '帥',
    [PT.ADVISOR]: '仕',
    [PT.ELEPHANT]: '相',
    [PT.HORSE]: '馬',
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
      {/* Nền quân cờ */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #fff8e7, #f0e4c8 50%, #dccca0)',
          border: '2.5px solid #7a6540',
          boxShadow: isSelected
            ? '0 0 0 3px #fbbf24, 0 4px 15px rgba(0,0,0,0.5)'
            : isLastMove
              ? '0 0 0 2px #60a5fa, 0 3px 10px rgba(0,0,0,0.35)'
              : '0 3px 8px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.5)',
        }}
      />

      {/* Vòng tròn viền trong - ĐẬM HƠN */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '4px',
          right: '4px',
          bottom: '4px',
          borderRadius: '50%',
          border: isRed ? '2px solid #b91c1c' : '2px solid #1e3a5f',
        }}
      />

      {/* Chữ Hán - ĐẬM HƠN, căn giữa và xuống chút */}
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
            fontSize: '28px',
            fontFamily: "'Zhi Mang Xing', 'Ma Shan Zheng', 'Noto Serif TC', cursive, serif",
            fontWeight: 400,
            color: isRed ? '#a01010' : '#000000',
            textShadow: isRed
              ? '0.5px 0.5px 0px rgba(255,255,255,0.4)'
              : '0.5px 0.5px 0px rgba(255,255,255,0.2)',
            userSelect: 'none',
            lineHeight: 1,
            WebkitFontSmoothing: 'antialiased',
          }}
        >
          {char}
        </span>
      </div>
    </div>
  );
};

export default Piece;
