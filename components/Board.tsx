
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Board as BoardType, Position, Move, Color, PieceType } from '../types';
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

  return Math.min(100, Math.max(32, Math.min(sizeByWidth, sizeByHeight)));
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

  // Padding cho bàn cờ
  // Padding cho bàn cờ - Đảm bảo là số nguyên để tránh nhòe hình (Sub-pixel rendering)
  const vPadding = Math.round(cellSize * 0.65);
  const hPadding = Math.round(cellSize * 0.65);

  const animationDuration = 350;

  // States cho hiệu ứng và animation
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

  // Canvas States & Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const loadedImagesRef = useRef<Record<string, HTMLImageElement>>({});

  const isSelected = useCallback((r: number, c: number) => selectedPos?.r === r && selectedPos?.c === c, [selectedPos]);
  const isLastMoveTo = useCallback((r: number, c: number) => lastMove?.to.r === r && lastMove?.to.c === c, [lastMove]);
  const isLegalTarget = useCallback((r: number, c: number) => legalMoves.some(m => m.to.r === r && m.to.c === c), [legalMoves]);

  // 1. Preload images once
  useEffect(() => {
    const pieceTypes = ['KING', 'ADVISOR', 'ELEPHANT', 'HORSE', 'CHARIOT', 'CANNON', 'SOLDIER'];
    const colors = ['RED', 'BLACK'];
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

    let loadedCount = 0;
    const totalImages = colors.length * pieceTypes.length;

    colors.forEach(color => {
      pieceTypes.forEach(type => {
        const img = new Image();
        img.src = `/pieces/${pieceFileMap[color][type]}`;
        const checkDone = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            setImagesLoaded(true);
          }
        };
        img.onload = () => {
          loadedImagesRef.current[`${color}_${type}`] = img;
          checkDone();
        };
        img.onerror = () => {
          console.warn(`Failed to load image: ${img.src}`);
          checkDone();
        };
      });
    });
  }, []);

  // 2. High-DPI Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = Math.round(boardWidth + hPadding * 2);
    const logicalHeight = Math.round(boardHeight + vPadding * 2);

    // Cập nhật kích thước canvas nếu cần
    if (canvas.width !== Math.floor(logicalWidth * dpr) || canvas.height !== Math.floor(logicalHeight * dpr)) {
      canvas.width = Math.floor(logicalWidth * dpr);
      canvas.height = Math.floor(logicalHeight * dpr);
      canvas.style.width = `${logicalWidth}px`;
      canvas.style.height = `${logicalHeight}px`;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.clearRect(0, 0, logicalWidth, logicalHeight);

    const PIECE_SIZE = cellSize * 1.08;
    const offset = (cellSize - PIECE_SIZE) / 2;

    board.forEach((row, r) => {
      row.forEach((piece, c) => {
        if (piece &&
          !(animatingPiece && animatingPiece.toR === r && animatingPiece.toC === c) &&
          !(capturedPiece && capturedPiece.r === r && capturedPiece.c === c)) {

          const img = loadedImagesRef.current[`${piece.color}_${piece.type}`];
          const x = hPadding + c * cellSize - cellSize / 2 + offset;
          const y = vPadding + r * cellSize - cellSize / 2 + offset;

          if (img) {
            // Shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;

            // Paint piece - Round coordinates to avoid blur
            ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(PIECE_SIZE), Math.round(PIECE_SIZE));

            // Side color ring (Red vs Black) - Shrunk diameter to fit inside
            ctx.beginPath();
            ctx.arc(
              Math.round(x + PIECE_SIZE / 2),
              Math.round(y + PIECE_SIZE / 2),
              Math.round(PIECE_SIZE * 0.41), // Reduced radius (approx 82% of total size)
              0,
              Math.PI * 2
            );
            ctx.strokeStyle = piece.color === 'RED' ? '#dc2626' : '#111827';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reset shadow
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            if (isSelected(r, c)) {
              ctx.beginPath();
              ctx.arc(x + PIECE_SIZE / 2, y + PIECE_SIZE / 2, PIECE_SIZE / 2 + 2, 0, Math.PI * 2);
              ctx.strokeStyle = '#fbbf24';
              ctx.lineWidth = 4;
              ctx.stroke();
            }

            if (isLastMoveTo(r, c)) {
              ctx.beginPath();
              ctx.arc(x + PIECE_SIZE / 2, y + PIECE_SIZE / 2, PIECE_SIZE / 2 + 2, 0, Math.PI * 2);
              ctx.strokeStyle = '#60a5fa';
              ctx.lineWidth = 3;
              ctx.stroke();
            }
          }
        }
      });
    });

    if (lastMove) {
      const { from } = lastMove;
      if (!board[from.r][from.c]) {
        const x = hPadding + from.c * cellSize;
        const y = vPadding + from.r * cellSize;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fill();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    }
  }, [board, imagesLoaded, animatingPiece, capturedPiece, selectedPos, lastMove, cellSize, boardWidth, boardHeight, hPadding, vPadding, isSelected, isLastMoveTo]);

  // 3. Move Animations
  useEffect(() => {
    if (lastMove && lastMove !== prevLastMoveRef.current) {
      const movingPiece = board[lastMove.to.r][lastMove.to.c];
      const targetR = lastMove.to.r;
      const targetC = lastMove.to.c;
      const previouslyAtTarget = prevBoardRef.current[targetR][targetC];
      const isCapture = previouslyAtTarget !== null;

      if (movingPiece) {
        if (isCapture) {
          setCapturedPiece({ piece: previouslyAtTarget, r: targetR, c: targetC });
          setFlash(true);
          setShake(true);
          setTimeout(() => { setFlash(false); setShake(false); }, 200);

          const newParticles = Array.from({ length: 30 }).map(() => ({
            id: particleIdRef.current++,
            r: targetR,
            c: targetC,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            color: previouslyAtTarget.color === Color.RED ? '#ff0000' : '#ffd700',
            size: Math.random() * 8 + 2
          }));
          setParticles(prev => [...prev, ...newParticles]);
          setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 800);
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

        setTimeout(() => setAnimatingPiece(null), animationDuration + 50);
      }
    }
    prevLastMoveRef.current = lastMove;
    prevBoardRef.current = board.map(row => [...row]);
  }, [lastMove, board, animationDuration]);

  return (
    <div
      className={`relative rounded-lg shadow-2xl flex-shrink-0 ${flash ? 'animate-flash' : ''} ${shake ? 'animate-shake' : ''}`}
      style={{
        width: boardWidth + hPadding * 2,
        height: boardHeight + vPadding * 2,
        boxShadow: '0 25px 60px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}
    >
      {/* Lớp nền bàn cờ (Brightened) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/board_royal.jpg")',
          backgroundSize: '100% 100%',
          filter: 'brightness(1.25) contrast(1.05)',
          zIndex: 0
        }}
      />
      {/* Particles */}
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: hPadding + p.c * cellSize,
            top: vPadding + p.r * cellSize,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            zIndex: 1000,
            transform: `translate(${p.vx * 15}px, ${p.vy * 15}px) scale(0)`,
            animation: 'particleFlyMega 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards',
            boxShadow: `0 0 10px ${p.color}`,
          }}
        />
      ))}

      {/* Sông */}
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
          <div className="animate-cartoon-pop" style={{ padding: '4px 12px', borderRadius: '8px', fontWeight: 900, fontSize: '12px', background: riverMessage.mode === 'sweet' ? '#14b8a6' : '#dc2626', color: 'white', border: '2px solid white', boxShadow: '0 4px 0 #000' }}>
            {riverMessage.text}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '40px', fontWeight: 900, fontSize: '18px', color: '#4a3520', fontFamily: "'Ma Shan Zheng', serif" }}>
            <span>楚 河</span>
            <span>漢 界</span>
          </div>
        )}
      </div>

      <canvas id="piece-layer" ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 20 }} />

      {/* Interaction Layer - Expanded to handle clicks comfortably at edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 30 }}>
        {Array.from({ length: BOARD_ROWS }).map((_, r) => (
          Array.from({ length: BOARD_COLS }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              style={{ position: 'absolute', left: hPadding + c * cellSize - cellSize / 2, top: vPadding + r * cellSize - cellSize / 2, width: cellSize, height: cellSize, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onClick={() => onCellClick({ r, c })}
            >
              {isLegalTarget(r, c) && !board[r][c] && <div style={{ width: cellSize / 2, height: cellSize / 2, borderRadius: '50%', background: '#22c55e', border: '2px solid white', boxShadow: '0 0 10px #22c55e' }} />}
              {isLegalTarget(r, c) && board[r][c] && <div style={{ position: 'absolute', inset: 0, border: '4px solid #ef4444', borderRadius: '50%', animation: 'pulse 0.5s infinite' }} />}
              {capturedPiece && capturedPiece.r === r && capturedPiece.c === c && (
                <div style={{ position: 'absolute', inset: 0, animation: 'captureExplodeMega 0.3s forwards', zIndex: 50 }}>
                  <Piece piece={capturedPiece.piece} />
                </div>
              )}
            </div>
          ))
        ))}
      </div>

      {/* Animating Piece */}
      {animatingPiece && (
        <div style={{ position: 'absolute', left: hPadding, top: vPadding, width: boardWidth, height: boardHeight, pointerEvents: 'none', zIndex: 100 }}>
          <div
            style={{
              position: 'absolute',
              left: animatingPiece.fromC * cellSize - cellSize / 2,
              top: animatingPiece.fromR * cellSize - cellSize / 2,
              width: cellSize,
              height: cellSize,
              transform: animatingPiece.isAnimating
                ? `translate(${(animatingPiece.toC - animatingPiece.fromC) * cellSize}px, ${(animatingPiece.toR - animatingPiece.fromR) * cellSize}px) scale(1.2)`
                : 'translate(0, 0) scale(1.1)',
              transition: `transform ${animationDuration}ms cubic-bezier(0.85, 0, 0.15, 1)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Piece piece={animatingPiece.piece} isSelected={false} isLastMove={true} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes captureExplodeMega { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(3); opacity: 0; } }
        @keyframes particleFlyMega { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { opacity: 0; } }
        @keyframes flash { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(1.5); } }
        @keyframes shake { 0%, 100% { transform: translate(0,0); } 25% { transform: translate(-5px, 5px); } 50% { transform: translate(5px, -5px); } }
        .animate-flash { animation: flash 0.2s; }
        .animate-shake { animation: shake 0.2s; }
        .animate-cartoon-pop { animation: pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes pop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default React.memo(Board);
