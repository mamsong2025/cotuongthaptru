
import React, { useState, useEffect, useRef } from 'react';
import { Board as BoardType, Position, Move, Color } from '../types';
import Piece from './Piece';
import { BOARD_COLS, BOARD_ROWS } from '../constants';

interface RiverMessage {
  text: string;
  mode: 'sweet' | 'toxic';
}

interface BoardProps {
  board: BoardType;
  selectedPos: Position | null;
  onCellClick: (pos: Position) => void;
  lastMove: Move | null;
  legalMoves: Move[];
  riverMessage?: RiverMessage | null;
}

// Kích thước ô cờ linh hoạt
// Kích thước ô cờ linh hoạt để đạt trạng thái "Toàn màn hình" chuẩn tỷ lệ
const getCellSize = () => {
  if (typeof window === 'undefined') return 44;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Trừ lề Header (~100px) và Controls (~80px)
  const availableWidth = screenWidth - 40;
  const availableHeight = screenHeight - 180;

  // Xiangqi board has 8 intervals width, 9 intervals height
  // Total intersections: 9 vertical lines, 10 horizontal lines
  const sizeByWidth = Math.floor(availableWidth / 9);
  const sizeByHeight = Math.floor(availableHeight / 10);

  return Math.min(60, Math.max(34, Math.min(sizeByWidth, sizeByHeight)));
};

const Board: React.FC<BoardProps> = ({ board, selectedPos, onCellClick, lastMove, legalMoves, riverMessage }) => {
  const [cellSize, setCellSize] = useState(getCellSize());

  useEffect(() => {
    const handleResize = () => setCellSize(getCellSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const boardWidth = cellSize * (BOARD_COLS - 1);
  const boardHeight = cellSize * (BOARD_ROWS - 1);
  const padding = cellSize / 1.5; // Padding nhỏ hơn để bàn cờ trông gọn hơn
  const animationDuration = 350; // Nhanh hơn để mượt hơn
  const [animatingPiece, setAnimatingPiece] = useState<{
    piece: any;
    fromR: number;
    fromC: number;
    toR: number;
    toC: number;
    isAnimating: boolean;
  } | null>(null);

  const prevLastMoveRef = useRef<Move | null>(null);

  // Detect when a new move happens and trigger animation
  useEffect(() => {
    if (lastMove && lastMove !== prevLastMoveRef.current) {
      const piece = board[lastMove.to.r][lastMove.to.c];
      if (piece) {
        // First render at starting position
        setAnimatingPiece({
          piece,
          fromR: lastMove.from.r,
          fromC: lastMove.from.c,
          toR: lastMove.to.r,
          toC: lastMove.to.c,
          isAnimating: false,
        });

        // Then trigger animation after a frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimatingPiece(prev => prev ? { ...prev, isAnimating: true } : null);
          });
        });

        // Clear animation after it completes
        setTimeout(() => {
          setAnimatingPiece(null);
        }, animationDuration + 50);
      }
    }
    prevLastMoveRef.current = lastMove;
  }, [lastMove, board, animationDuration]);

  const isSelected = (r: number, c: number) => selectedPos?.r === r && selectedPos?.c === c;
  const isLastMoveFrom = (r: number, c: number) => lastMove?.from.r === r && lastMove?.from.c === c;
  const isLastMoveTo = (r: number, c: number) => lastMove?.to.r === r && lastMove?.to.c === c;
  const isLegalTarget = (r: number, c: number) => legalMoves.some(m => m.to.r === r && m.to.c === c);

  return (
    <div
      className="relative rounded-lg shadow-2xl flex-shrink-0 overflow-hidden"
      style={{
        width: boardWidth + padding * 2,
        height: boardHeight + padding * 2,
        background: '#c9a66b',
        border: `${Math.max(6, cellSize / 4)}px solid #5c3a21`, // Viền đậm hơn cho rầm rộ
        boxSizing: 'content-box',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 2px 10px rgba(255,255,255,0.3)',
      }}
    >
      {/* Vân gỗ nhẹ (dùng gradient thay cho filter nặng) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(rgba(101, 67, 33, 0.1), transparent)',
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />

      {/* Vân gỗ ngang */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 8px,
              rgba(101, 67, 33, 0.06) 8px,
              rgba(101, 67, 33, 0.06) 10px,
              transparent 10px,
              transparent 25px
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(139, 90, 43, 0.08) 40px,
              rgba(139, 90, 43, 0.08) 42px,
              transparent 42px,
              transparent 80px
            )
          `,
        }}
      />

      {/* Vân gỗ uốn lượn */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            repeating-linear-gradient(
              2deg,
              transparent,
              transparent 60px,
              rgba(101, 67, 33, 0.04) 60px,
              rgba(101, 67, 33, 0.04) 62px
            ),
            repeating-linear-gradient(
              -1deg,
              transparent,
              transparent 45px,
              rgba(80, 50, 20, 0.05) 45px,
              rgba(80, 50, 20, 0.05) 47px
            )
          `,
        }}
      />

      {/* Lớp gradient nhẹ tạo chiều sâu */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }}
      />

      {/* Lưới bàn cờ - SVG */}
      <svg
        className="absolute pointer-events-none"
        width={boardWidth + 4}
        height={boardHeight + 4}
        style={{ left: padding - 2, top: padding - 2, zIndex: 2 }}
      >
        {/* Đường ngang */}
        {Array.from({ length: BOARD_ROWS }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1={2}
            y1={cellSize * i + 2}
            x2={boardWidth + 2}
            y2={cellSize * i + 2}
            stroke="#4a3520"
            strokeWidth="1.5"
          />
        ))}

        {/* Đường dọc - phần trên */}
        {Array.from({ length: BOARD_COLS }).map((_, i) => (
          <line
            key={`v-top-${i}`}
            x1={cellSize * i + 2}
            y1={2}
            x2={cellSize * i + 2}
            y2={cellSize * 4 + 2}
            stroke="#4a3520"
            strokeWidth="1.5"
          />
        ))}

        {/* Đường dọc - phần dưới */}
        {/* Đường dọc - phần dưới */}
        {Array.from({ length: BOARD_COLS }).map((_, i) => (
          <line
            key={`v-bot-${i}`}
            x1={cellSize * i + 2}
            y1={cellSize * 5 + 2}
            x2={cellSize * i + 2}
            y2={boardHeight + 2}
            stroke="#4a3520"
            strokeWidth="1.5"
          />
        ))}

        {/* Cung Đen */}
        <line x1={cellSize * 3 + 2} y1={2} x2={cellSize * 5 + 2} y2={cellSize * 2 + 2} stroke="#4a3520" strokeWidth="1" />
        <line x1={cellSize * 5 + 2} y1={2} x2={cellSize * 3 + 2} y2={cellSize * 2 + 2} stroke="#4a3520" strokeWidth="1" />

        {/* Cung Đỏ */}
        <line x1={cellSize * 3 + 2} y1={cellSize * 7 + 2} x2={cellSize * 5 + 2} y2={cellSize * 9 + 2} stroke="#4a3520" strokeWidth="1" />
        <line x1={cellSize * 5 + 2} y1={cellSize * 7 + 2} x2={cellSize * 3 + 2} y2={cellSize * 9 + 2} stroke="#4a3520" strokeWidth="1" />

        {/* Khung viền bàn cờ */}
        <rect
          x={2}
          y={2}
          width={boardWidth}
          height={boardHeight}
          fill="none"
          stroke="#4a3520"
          strokeWidth="3"
        />
      </svg>

      {/* Vùng sông - Chữ Hán hoặc tin nhắn */}
      <div
        style={{
          position: 'absolute',
          top: padding + cellSize * 4.5, // Giữa sông
          left: padding,
          right: padding,
          height: cellSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {riverMessage ? (
          <div
            key={riverMessage.text} // Fix: Force animation restart on text change
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 700,
              fontSize: '12px',
              maxWidth: '85%',
              background: riverMessage.mode === 'sweet'
                ? 'rgba(20, 184, 166, 0.92)'
                : 'rgba(220, 38, 38, 0.95)',
              color: 'white',
              border: riverMessage.mode === 'sweet' ? '1px solid #5eead4' : '1px solid #fca5a5',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
              zIndex: 150,
              pointerEvents: 'none',
              animation: 'fadeSlide 8s ease-in-out forwards',
            }}
          >
            <span style={{ marginRight: '4px', fontSize: '10px' }}>
              {riverMessage.mode === 'sweet' ? '🍯' : '🔥'}
            </span>
            {riverMessage.text}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '50px',
              fontWeight: 700,
              fontSize: '18px',
              color: '#4a3520',
              fontFamily: '"SimSun", "KaiTi", serif',
              letterSpacing: '4px',
              textShadow: '1px 1px 2px rgba(255,255,255,0.4)',
            }}
          >
            <span>楚 河</span>
            <span>漢 界</span>
          </div>
        )}
      </div>

      {/* Lớp tương tác - căn chính xác với giao điểm lưới */}
      <div
        style={{
          position: 'absolute',
          left: padding,
          top: padding,
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_COLS}, 0px)`, // Fix grid distortion
          zIndex: 10,
        }}
      >
        {Array.from({ length: BOARD_ROWS }).map((_, r) => (
          Array.from({ length: BOARD_COLS }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * cellSize - cellSize / 2,
                top: r * cellSize - cellSize / 2,
                width: cellSize,
                height: cellSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => onCellClick({ r, c })}
            >
              {/* Chấm xanh - nước đi hợp lệ */}
              {isLegalTarget(r, c) && !board[r][c] && (
                <div
                  style={{
                    position: 'absolute',
                    width: `${cellSize / 3}px`,
                    height: `${cellSize / 3}px`,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #22c55e, #15803d)',
                    boxShadow: '0 0 8px rgba(34,197,94,0.6)',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
              )}

              {/* Viền đỏ - có thể ăn quân */}
              {isLegalTarget(r, c) && board[r][c] && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '3px',
                    borderRadius: '50%',
                    border: '2px solid #ef4444',
                    boxShadow: '0 0 10px rgba(239,68,68,0.6)',
                    animation: 'pulse 1s infinite',
                  }}
                />
              )}

              {/* Highlight nước đi cuối */}
              {(isLastMoveFrom(r, c) || isLastMoveTo(r, c)) && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '4px',
                    borderRadius: '50%',
                    background: 'rgba(250,204,21,0.25)',
                    border: '1px dashed #eab308',
                  }}
                />
              )}

              {/* Quân cờ - ẩn khi đang animate */}
              {board[r][c] && !(animatingPiece && animatingPiece.toR === r && animatingPiece.toC === c) && (
                <Piece
                  piece={board[r][c]!}
                  isSelected={isSelected(r, c)}
                  isLastMove={isLastMoveTo(r, c)}
                />
              )}
            </div>
          ))
        ))}
      </div>

      {/* Quân cờ đang di chuyển - layer riêng với animation */}
      {animatingPiece && (
        <div
          style={{
            position: 'absolute',
            left: padding,
            top: padding,
            width: boardWidth,
            height: boardHeight,
            pointerEvents: 'none',
            zIndex: 100,
          }}
        >
          <div
            className="animating-piece"
            style={{
              position: 'absolute',
              left: animatingPiece.fromC * cellSize - cellSize / 2,
              top: animatingPiece.fromR * cellSize - cellSize / 2,
              width: cellSize,
              height: cellSize,
              transform: animatingPiece.isAnimating
                ? `translate(${(animatingPiece.toC - animatingPiece.fromC) * cellSize}px, ${(animatingPiece.toR - animatingPiece.fromR) * cellSize}px) scale(1.1)`
                : 'translate(0, 0) scale(1)',
              transition: `transform ${animationDuration}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Piece
              piece={animatingPiece.piece}
              isSelected={false}
              isLastMove={true}
            />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(5px); }
          10% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        @keyframes pieceMove {
          0% { transform: scale(0.5); opacity: 0.3; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Board;
