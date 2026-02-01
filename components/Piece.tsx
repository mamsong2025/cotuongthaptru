
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
      {/* Quân cờ dạng Image Asset (100% device independent) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: isSelected
            ? '0 0 0 3px #fbbf24, 0 4px 15px rgba(0,0,0,0.4)'
            : isLastMove
              ? '0 0 0 2px #60a5fa, 0 3px 10px rgba(0,0,0,0.3)'
              : '0 3px 8px rgba(0,0,0,0.2)',
        }}
      >
        <img
          src={imageUrl}
          alt={`${piece.color} ${piece.type}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default React.memo(Piece);
