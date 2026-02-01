
import React from 'react';
import { Piece as PieceType, Color, PieceType as PT } from '../types';

interface PieceProps {
  piece: PieceType;
  isSelected?: boolean;
  isLastMove?: boolean;
}

// Mapping từ piece type sang URL ảnh (Baked-in Image Assets)
const PIECE_IMAGES: Record<Color, Record<PT, string>> = {
  [Color.RED]: {
    [PT.KING]: '/pieces/red_king_shuai.png',
    [PT.ADVISOR]: '/pieces/red_advisor_shi.png',
    [PT.ELEPHANT]: '/pieces/red_elephant_xiang.png',
    [PT.HORSE]: '/pieces/red_horse_ma.png',
    [PT.CHARIOT]: '/pieces/red_chariot_ju.png',
    [PT.CANNON]: '/pieces/red_cannon_pao.png',
    [PT.SOLDIER]: '/pieces/red_soldier_bing.png',
  },
  [Color.BLACK]: {
    [PT.KING]: '/pieces/black_king_jiang.png',
    [PT.ADVISOR]: '/pieces/black_advisor_shi.png',
    [PT.ELEPHANT]: '/pieces/black_elephant_xiang.png',
    [PT.HORSE]: '/pieces/black_horse_ma.png',
    [PT.CHARIOT]: '/pieces/black_chariot_ju.png',
    [PT.CANNON]: '/pieces/black_cannon_pao.png',
    [PT.SOLDIER]: '/pieces/black_soldier_zu.png',
  },
};

const Piece: React.FC<PieceProps> = ({ piece, isSelected, isLastMove }) => {
  const imageUrl = PIECE_IMAGES[piece.color][piece.type];

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '8%',
        boxSizing: 'border-box',
        position: 'relative',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isSelected ? 'scale(1.2) translateY(-5px)' : 'scale(1)',
        zIndex: isSelected ? 100 : 1,
      }}
    >
      {/* Container cho quân cờ với bóng đổ và highlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `3px solid ${piece.color === Color.RED ? '#dc2626' : '#111827'}`,
          boxShadow: isSelected
            ? '0 10px 30px rgba(0,0,0,0.6), 0 0 0 4px #fbbf24, inset 0 2px 10px rgba(255,255,255,0.4)'
            : isLastMove
              ? '0 5px 15px rgba(0,0,0,0.4), 0 0 0 3px #60a5fa'
              : '0 6px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box'
        }}
      >
        <img
          src={imageUrl}
          alt={`${piece.color} ${piece.type}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            userSelect: 'none',
            pointerEvents: 'none',
            display: 'block',
          }}
          draggable={false}
        />

        {/* Subtle Highlight Overlay for glossiness */}
        <div style={{
          position: 'absolute',
          inset: '10%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
      </div>
    </div>
  );
};

export default React.memo(Piece);
