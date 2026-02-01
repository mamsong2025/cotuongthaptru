
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

// Kích thước ô cờ linh hoạt để đạt trạng thái "Toàn màn hình" chuẩn tỷ lệ
const getCellSize = () => {
  if (typeof window === 'undefined') return 44;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Trừ lề Header (~100px) và Controls (~80px)
  const availableWidth = screenWidth - 40;
  const availableHeight = screenHeight - 180;

  // Xiangqi board has 8 intervals width, 9 intervals height
  const sizeByWidth = Math.floor(availableWidth / 9);
  const sizeByHeight = Math.floor(availableHeight / 10);

  return Math.min(60, Math.max(28, Math.min(sizeByWidth, sizeByHeight)));
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

  // TINH CHỈNH CUỐI CÙNG - Điều chỉnh thêm một chút nữa
  const [vPaddingMultiplier, setVPaddingMultiplier] = useState(0.498);
  const [hPaddingMultiplier, setHPaddingMultiplier] = useState(0.538);

  const vPadding = cellSize * vPaddingMultiplier;
  const hPadding = cellSize * hPaddingMultiplier;

  const currentTheme = {
    bg: 'url("/board_royal.jpg")',
    border: '#4a3520',
    shadow: '0 25px 60px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.2)',
    hideBorder: true
  };

  const animationDuration = 350;
  const [animatingPiece, setAnimatingPiece] = useState<{
    piece: any;
    fromR: number;
    fromC: number;
    toR: number;
    toC: number;
    isAnimating: boolean;
  } | null>(null);

  const [capturedPiece, setCapturedPiece] = useState<{
    piece: any;
    r: number;
    c: number;
  } | null>(null);

  const [flash, setFlash] = useState<boolean>(false);
  const [shake, setShake] = useState<boolean>(false);
  const [particles, setParticles] = useState<{ id: number; r: number; c: number; vx: number; vy: number; color: string; size: number }[]>([]);

  const prevLastMoveRef = useRef<Move | null>(null);
  const prevBoardRef = useRef<BoardType>(board);
  const particleIdRef = useRef(0);

  // Detect when a new move happens and trigger animation
  useEffect(() => {
    if (lastMove && lastMove !== prevLastMoveRef.current) {
      const movingPiece = board[lastMove.to.r][lastMove.to.c];
      const targetR = lastMove.to.r;
      const targetC = lastMove.to.c;

      const previouslyAtTarget = prevBoardRef.current[targetR][targetC];
      const isCapture = previouslyAtTarget !== null;

      if (movingPiece) {
        if (isCapture) {
          setCapturedPiece({
            piece: previouslyAtTarget,
            r: targetR,
            c: targetC
          });

          // OVERLOAD EFFECTS: Flash, Shake and 50+ Particles
          setFlash(true);
          setShake(true);
          setTimeout(() => {
            setFlash(false);
            setShake(false);
          }, 200);

          const newParticles = Array.from({ length: 50 }).map(() => ({
            id: particleIdRef.current++,
            r: targetR,
            c: targetC,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            color: previouslyAtTarget.color === Color.RED ? '#ff0000' : '#ffd700',
            size: Math.random() * 10 + 4
          }));
          setParticles(prev => [...prev, ...newParticles]);
          setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
          }, 800);

          setTimeout(() => setCapturedPiece(null), 300);
        }

        setAnimatingPiece({
          piece: movingPiece,
          fromR: lastMove.from.r,
          fromC: lastMove.from.c,
          toR: targetR,
          toC: targetC,
          isAnimating: false,
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimatingPiece(prev => prev ? { ...prev, isAnimating: true } : null);
          });
        });

        setTimeout(() => {
          setAnimatingPiece(null);
        }, animationDuration + 50);
      }
    }
    prevLastMoveRef.current = lastMove;
    prevBoardRef.current = board;
  }, [lastMove, board, animationDuration]);

  const isSelected = (r: number, c: number) => selectedPos?.r === r && selectedPos?.c === c;
  const isLastMoveFrom = (r: number, c: number) => lastMove?.from.r === r && lastMove?.from.c === c;
  const isLastMoveTo = (r: number, c: number) => lastMove?.to.r === r && lastMove?.to.c === c;
  const isLegalTarget = (r: number, c: number) => legalMoves.some(m => m.to.r === r && m.to.c === c);

  return (
    <div
      className={`relative rounded-lg shadow-2xl flex-shrink-0 overflow-hidden ${flash ? 'animate-flash' : ''} ${shake ? 'animate-shake' : ''}`}
      style={{
        width: boardWidth + hPadding * 2,
        height: boardHeight + vPadding * 2,
        backgroundImage: currentTheme.bg,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        border: currentTheme.hideBorder ? 'none' : `${Math.max(6, cellSize / 4)}px solid ${currentTheme.border}`,
        boxSizing: 'content-box',
        boxShadow: currentTheme.shadow,
      }}
    >
      {/* Particle Overload Layer */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: hPadding + p.c * cellSize + (cellSize / 2),
            top: vPadding + p.r * cellSize + (cellSize / 2),
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: '2px', // Square particles for arcade feel
            zIndex: 1000,
            transform: `translate(${p.vx * 15}px, ${p.vy * 15}px) scale(0) rotate(${Math.random() * 360}deg)`,
            animation: 'particleFlyMega 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards',
            boxShadow: `0 0 15px ${p.color}`,
          }}
        />
      ))}

      {/* Vùng sông (Chỉ hiển thị message nếu có, không vẽ lưới) */}
      <div
        style={{
          position: 'absolute',
          top: vPadding + cellSize * 4,
          left: 0,
          right: 0,
          height: cellSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 150,
          pointerEvents: 'none',
        }}
      >
        {riverMessage ? (
          <div
            key={riverMessage.text}
            className="animate-cartoon-pop"
            style={{
              padding: '4px 12px',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 900,
              fontSize: '12px',
              background: riverMessage.mode === 'sweet' ? '#14b8a6' : '#dc2626',
              color: 'white',
              border: '2px solid white',
              boxShadow: '0 4px 0 #000',
            }}
          >
            {riverMessage.text}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '40px', fontWeight: 900, fontSize: '18px', color: '#4a3520', fontFamily: "'Ma Shan Zheng', 'Noto Serif TC', 'STKaiti', 'KaiTi', serif" }}>
            <span>楚 河</span>
            <span>漢 界</span>
          </div>
        )}
      </div>

      {/* Lớp hiển thị quân cờ tĩnh bằng Canvas (Tối ưu hiệu năng & Độ sắc nét) */}
      <canvas
        id="piece-layer"
        width={boardWidth + hPadding * 2}
        height={boardHeight + vPadding * 2}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 20
        }}
        ref={(canvas) => {
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const CELL_SIZE = cellSize;
          const PIECE_SIZE = CELL_SIZE * 0.82; // Giảm nhẹ để vừa vặn hơn với ô cờ gỗ
          const offset = (CELL_SIZE - PIECE_SIZE) / 2;

          board.forEach((row, r) => {
            row.forEach((piece, c) => {
              // Chỉ vẽ những quân không trong trạng thái bị ăn hoặc đang di chuyển
              if (piece &&
                !(animatingPiece && animatingPiece.toR === r && animatingPiece.toC === c) &&
                !(capturedPiece && capturedPiece.r === r && capturedPiece.c === c)) {

                // Mapping chính xác tên file ảnh
                const pieceFileMap: Record<string, Record<string, string>> = {
                  'RED': {
                    'KING': 'red_king_shuai.png',
                    'ADVISOR': 'red_advisor_shi.png',
                    'ELEPHANT': 'red_elephant_xiang.png',
                    'HORSE': 'red_horse_ma.png',
                    'CHARIOT': 'red_chariot_ju.png',
                    'CANNON': 'red_cannon_pao.png',
                    'SOLDIER': 'red_soldier_bing.png'
                  },
                  'BLACK': {
                    'KING': 'black_king_jiang.png',
                    'ADVISOR': 'black_advisor_shi.png',
                    'ELEPHANT': 'black_elephant_xiang.png',
                    'HORSE': 'black_horse_ma.png',
                    'CHARIOT': 'black_chariot_ju.png',
                    'CANNON': 'black_cannon_pao.png',
                    'SOLDIER': 'black_soldier_zu.png'
                  }
                };

                const img = new Image();
                img.src = `/pieces/${pieceFileMap[piece.color][piece.type]}`;

                const x = hPadding + c * CELL_SIZE - CELL_SIZE / 2 + offset;
                const y = vPadding + r * CELL_SIZE - CELL_SIZE / 2 + offset;

                // Render piece
                if (img.complete) {
                  ctx.drawImage(img, x, y, PIECE_SIZE, PIECE_SIZE);

                  // Thêm hiệu ứng Highlight nếu là quân đang được chọn
                  if (isSelected(r, c)) {
                    ctx.beginPath();
                    ctx.arc(x + PIECE_SIZE / 2, y + PIECE_SIZE / 2, PIECE_SIZE / 2 + 2, 0, Math.PI * 2);
                    ctx.strokeStyle = '#fbbf24';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                  }

                  // Hiệu ứng nước đi cuối
                  if (isLastMoveTo(r, c)) {
                    ctx.beginPath();
                    ctx.arc(x + PIECE_SIZE / 2, y + PIECE_SIZE / 2, PIECE_SIZE / 2 + 2, 0, Math.PI * 2);
                    ctx.strokeStyle = '#60a5fa';
                    ctx.lineWidth = 2;
                    ctx.stroke();
                  }
                } else {
                  img.onload = () => {
                    ctx.drawImage(img, x, y, PIECE_SIZE, PIECE_SIZE);
                  };
                }
              }
            });
          });
        }}
      />

      {/* Lớp tương tác (Giữ nguyên cho sự kiện click) */}
      <div style={{ position: 'absolute', left: hPadding, top: vPadding, display: 'grid', gridTemplateColumns: `repeat(${BOARD_COLS}, 0px)`, zIndex: 30 }}>
        {Array.from({ length: BOARD_ROWS }).map((_, r) => (
          Array.from({ length: BOARD_COLS }).map((_, c) => (
            <div key={`${r}-${c}`} style={{ position: 'absolute', left: c * cellSize - cellSize / 2, top: r * cellSize - cellSize / 2, width: cellSize, height: cellSize, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => onCellClick({ r, c })}>
              {isLegalTarget(r, c) && !board[r][c] && <div style={{ position: 'absolute', width: cellSize / 2, height: cellSize / 2, borderRadius: '50%', background: '#22c55e', border: '2px solid white', boxShadow: '0 0 10px #22c55e' }} />}
              {isLegalTarget(r, c) && board[r][c] && <div style={{ position: 'absolute', inset: 0, border: '4px solid #ef4444', borderRadius: '50%', animation: 'pulse 0.5s infinite' }} />}
              {/* Quân cờ bị ăn (Explosion effect) */}
              {capturedPiece && capturedPiece.r === r && capturedPiece.c === c && (
                <div style={{ position: 'absolute', inset: 0, animation: 'captureExplodeMega 0.3s forwards', zIndex: 50 }}>
                  <Piece piece={capturedPiece.piece} />
                </div>
              )}
            </div>
          ))
        ))}
      </div>

      {/* Quân cờ đang di chuyển (Dùng DOM để animation mượt mà) */}
      {animatingPiece && (
        <div style={{ position: 'absolute', left: hPadding, top: vPadding, width: boardWidth, height: boardHeight, pointerEvents: 'none', zIndex: 100 }}>
          <div
            className={`animating-piece ${animatingPiece.isAnimating ? 'motion-blur-extreme' : ''}`}
            style={{
              position: 'absolute',
              left: animatingPiece.fromC * cellSize - cellSize / 2,
              top: animatingPiece.fromR * cellSize - cellSize / 2,
              width: cellSize,
              height: cellSize,
              transform: animatingPiece.isAnimating
                ? `translate(${(animatingPiece.toC - animatingPiece.fromC) * cellSize}px, ${(animatingPiece.toR - animatingPiece.fromR) * cellSize}px) scale(1.5)`
                : 'translate(0, 0) scale(1.1)',
              transition: `transform ${animationDuration}ms cubic-bezier(1, 0, 0, 1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Piece piece={animatingPiece.piece} isSelected={false} isLastMove={true} />
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes captureExplodeMega {
          0% { transform: scale(1) rotate(0); filter: brightness(1) white; }
          50% { transform: scale(3) rotate(45deg); filter: brightness(10); }
          100% { transform: scale(0) rotate(90deg); opacity: 0; }
        }
        @keyframes particleFlyMega {
          0% { transform: translate(0, 0) scale(2) rotate(0); opacity: 1; }
          100% { transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0) rotate(720deg); opacity: 0; }
        }
        @keyframes flash {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(2) contrast(1.5); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-10px, 10px); }
          50% { transform: translate(10px, -10px); }
          75% { transform: translate(-5px, -5px); }
        }
        .animate-flash { animation: flash 0.15s ease-out; }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
        .motion-blur-extreme { filter: blur(4px) contrast(2) brightness(1.5); }
        .animate-cartoon-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
      `}</style>

      {/* DEBUG CONTROLS - Tinh chỉnh cuối cùng */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0,0,0,0.85)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        zIndex: 9999,
        fontFamily: 'monospace',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: '#4ade80' }}>🔧 TINH CHỈNH</div>
        <div style={{ marginBottom: '5px' }}>vPadding: {vPaddingMultiplier.toFixed(3)}</div>
        <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
          <button onClick={() => setVPaddingMultiplier(v => Math.max(0, v - 0.001))} style={{ padding: '4px 10px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>↑ Lên</button>
          <button onClick={() => setVPaddingMultiplier(v => v + 0.001)} style={{ padding: '4px 10px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>↓ Xuống</button>
        </div>
        <div style={{ marginBottom: '5px' }}>hPadding: {hPaddingMultiplier.toFixed(3)}</div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button onClick={() => setHPaddingMultiplier(h => Math.max(0, h - 0.001))} style={{ padding: '4px 10px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>← Trái</button>
          <button onClick={() => setHPaddingMultiplier(h => h + 0.001)} style={{ padding: '4px 10px', background: '#374151', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' }}>→ Phải</button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Board);
