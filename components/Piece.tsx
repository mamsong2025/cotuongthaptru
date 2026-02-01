
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
      {/* Traditional Xiangqi piece with colored ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f5f0e8 0%, #ebe6de 100%)',
          border: `4px solid ${isRed ? '#c41e3a' : '#2d5016'}`,
          boxShadow: isSelected
            ? `0 0 0 3px #fbbf24, 0 4px 15px rgba(0,0,0,0.5)`
            : isLastMove
              ? `0 0 0 2px #60a5fa, 0 3px 10px rgba(0,0,0,0.4)`
              : '0 3px 8px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Inner ivory circle */}
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fdfaf0 0%, #f4f0e6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Character with ultra-comprehensive font stack */}
          <span
            style={{
              fontSize: '28px',
              fontFamily: `
                "Noto Serif TC",
                "Noto Sans TC", 
                "Microsoft JhengHei",
                "Microsoft YaHei",
                "PingFang TC",
                "PingFang SC",
                "Heiti TC",
                "STHeiti",
                "SimHei",
                "SimSun",
                "MingLiU",
                "PMingLiU",
                "Apple LiGothic",
                "Hiragino Sans GB",
                "Hiragino Kaku Gothic Pro",
                "WenQuanYi Micro Hei",
                "WenQuanYi Zen Hei",
                "AR PL UMing TW",
                "AR PL UKai TW",
                "Droid Sans Fallback",
                sans-serif
              `,
              fontWeight: 900,
              color: isRed ? '#8b0000' : '#1a4d2e',
              textShadow: '0px 0px 1px rgba(0,0,0,0.3)',
              userSelect: 'none',
              lineHeight: 1,
              WebkitFontSmoothing: 'antialiased',
              MozOsxFontSmoothing: 'grayscale',
              textRendering: 'optimizeLegibility',
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
