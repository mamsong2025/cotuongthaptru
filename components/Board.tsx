
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
}

// Kích thước ô cờ linh hoạt để đạt trạng thái "Toàn màn hình" chuẩn tỷ lệ
const getCellSize = () => {
  if (typeof window === 'undefined') return 44;
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Lấy padding từ storage để tính toán chính xác hơn (mặc định 0.5/0.65)
  const hPad = Number(localStorage.getItem('adjHPadding')) || 0.5;
  const vPad = Number(localStorage.getItem('adjVPadding')) || 0.65;

  // Trừ lề an toàn cho Header và Controls
  const availableWidth = screenWidth - 20;
  const availableHeight = screenHeight - 160;

  // Tổng số "ô cờ" theo chiều ngang = 8 khoảng + 2 lần padding
  // Tổng số "ô cờ" theo chiều dọc = 9 khoảng + 2 lần padding
  const sizeByWidth = Math.floor(availableWidth / (8 + hPad * 2));
  const sizeByHeight = Math.floor(availableHeight / (9 + vPad * 2));

  return Math.min(100, Math.max(32, Math.min(sizeByWidth, sizeByHeight)));
};

const Board: React.FC<BoardProps> = ({ board, selectedPos, onCellClick, lastMove, legalMoves }) => {
  const [cellSize, setCellSize] = useState(getCellSize());

  // Trạng thái tinh chỉnh thủ công - Load từ localStorage nếu có
  const [adjHPadding, setAdjHPadding] = useState(() => {
    const saved = localStorage.getItem('adjHPadding');
    return saved !== null ? Number(saved) : 0.5; // Giảm lề mặc định để bàn cờ to hơn
  });
  const [adjVPadding, setAdjVPadding] = useState(() => {
    const saved = localStorage.getItem('adjVPadding');
    return saved !== null ? Number(saved) : 0.65;
  });
  const [adjPieceScale, setAdjPieceScale] = useState(() => Number(localStorage.getItem('adjPieceScale')) || 1.08);
  const [adjWidthScale, setAdjWidthScale] = useState(() => Number(localStorage.getItem('adjWidthScale')) || 1.0);
  const [adjHeightScale, setAdjHeightScale] = useState(() => Number(localStorage.getItem('adjHeightScale')) || 1.0);
  const [adjOffsetX, setAdjOffsetX] = useState(() => Number(localStorage.getItem('adjOffsetX')) || 0);
  const [adjOffsetY, setAdjOffsetY] = useState(() => Number(localStorage.getItem('adjOffsetY')) || 0);
  const [adjBoardX, setAdjBoardX] = useState(() => Number(localStorage.getItem('adjBoardX')) || 0);
  const [adjBoardY, setAdjBoardY] = useState(() => Number(localStorage.getItem('adjBoardY')) || 0);
  const [adjMasterScale, setAdjMasterScale] = useState(() => Number(localStorage.getItem('adjMasterScale')) || 1.0);
  const [adjBgScaleX, setAdjBgScaleX] = useState(() => Number(localStorage.getItem('adjBgScaleX')) || 1.0);
  const [adjBgScaleY, setAdjBgScaleY] = useState(() => Number(localStorage.getItem('adjBgScaleY')) || 1.0);
  const [adjBgShiftX, setAdjBgShiftX] = useState(() => Number(localStorage.getItem('adjBgShiftX')) || 0);
  const [adjBgShiftY, setAdjBgShiftY] = useState(() => Number(localStorage.getItem('adjBgShiftY')) || 0);
  const [showAdj, setShowAdj] = useState(false);

  // Tự động lưu khi có thay đổi
  useEffect(() => {
    localStorage.setItem('adjHPadding', adjHPadding.toString());
    localStorage.setItem('adjVPadding', adjVPadding.toString());
    localStorage.setItem('adjPieceScale', adjPieceScale.toString());
    localStorage.setItem('adjWidthScale', adjWidthScale.toString());
    localStorage.setItem('adjHeightScale', adjHeightScale.toString());
    localStorage.setItem('adjOffsetX', adjOffsetX.toString());
    localStorage.setItem('adjOffsetY', adjOffsetY.toString());
    localStorage.setItem('adjBoardX', adjBoardX.toString());
    localStorage.setItem('adjBoardY', adjBoardY.toString());
    localStorage.setItem('adjMasterScale', adjMasterScale.toString());
    localStorage.setItem('adjBgScaleX', adjBgScaleX.toString());
    localStorage.setItem('adjBgScaleY', adjBgScaleY.toString());
    localStorage.setItem('adjBgShiftX', adjBgShiftX.toString());
    localStorage.setItem('adjBgShiftY', adjBgShiftY.toString());
  }, [adjHPadding, adjVPadding, adjPieceScale, adjWidthScale, adjHeightScale, adjOffsetX, adjOffsetY, adjBoardX, adjBoardY, adjMasterScale, adjBgScaleX, adjBgScaleY, adjBgShiftX, adjBgShiftY]);

  useEffect(() => {
    const updateSize = () => setCellSize(getCellSize() * adjMasterScale);
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [adjMasterScale]);

  // Kích thước Container (Dựa trên ảnh nền)
  const containerWidth = cellSize * (BOARD_COLS - 1) * adjBgScaleX;
  const containerHeight = cellSize * (BOARD_ROWS - 1) * adjBgScaleY;

  // Bù đắp việc căn giữa của Parent
  const baseWidth = cellSize * (BOARD_COLS - 1);
  const baseHeight = cellSize * (BOARD_ROWS - 1);
  const visualCorrectionX = (containerWidth - baseWidth) / 2;
  const visualCorrectionY = (containerHeight - baseHeight) / 2;

  // Padding cho bàn cờ - Kéo rộng 2 bên (hPadding > vPadding)
  const vPadding = Math.round(cellSize * adjVPadding);
  const hPadding = Math.round(cellSize * adjHPadding);

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
    const logicalWidth = Math.round(containerWidth + hPadding * 2);
    const logicalHeight = Math.round(containerHeight + vPadding * 2);

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

    const PIECE_SIZE = cellSize * adjPieceScale;
    const offset = (cellSize - PIECE_SIZE) / 2;

    board.forEach((row, r) => {
      row.forEach((piece, c) => {
        if (piece &&
          !(animatingPiece && animatingPiece.toR === r && animatingPiece.toC === c) &&
          !(capturedPiece && capturedPiece.r === r && capturedPiece.c === c)) {

          const img = loadedImagesRef.current[`${piece.color}_${piece.type}`];
          // Dãn từ tâm: (c - 4) là khoảng cách tới cột giữa, (r - 4.5) là khoảng cách tới hàng giữa
          const x = hPadding + containerWidth / 2 + (c - 4) * cellSize * adjWidthScale - PIECE_SIZE / 2 + adjOffsetX;
          const y = vPadding + containerHeight / 2 + (r - 4.5) * cellSize * adjHeightScale - PIECE_SIZE / 2 + adjOffsetY;

          if (img) {
            // Shadow
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 4;

            // Paint piece - Round coordinates to avoid blur
            ctx.drawImage(img, Math.round(x), Math.round(y), Math.round(PIECE_SIZE), Math.round(PIECE_SIZE));

            // Side color ring (Red vs Black) - ALWAYS PERFECT CIRCLE
            ctx.beginPath();
            // We use a fixed radius based on PIECE_SIZE to ensure it's not skewed by adjWidthScale/adjHeightScale
            const ringRadius = PIECE_SIZE * 0.41;
            ctx.arc(
              Math.round(x + PIECE_SIZE / 2),
              Math.round(y + PIECE_SIZE / 2),
              Math.round(ringRadius),
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
        const x = hPadding + containerWidth / 2 + (from.c - 4) * cellSize * adjWidthScale + adjOffsetX;
        const y = vPadding + containerHeight / 2 + (from.r - 4.5) * cellSize * adjHeightScale + adjOffsetY;
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
  }, [board, imagesLoaded, animatingPiece, capturedPiece, selectedPos, lastMove, cellSize, containerWidth, containerHeight, hPadding, vPadding, isSelected, isLastMoveTo, adjWidthScale, adjHeightScale, adjPieceScale, adjOffsetX, adjOffsetY]);

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
        width: containerWidth + hPadding * 2,
        height: containerHeight + vPadding * 2,
        boxShadow: '0 25px 60px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.2)',
        transform: `translate(${adjBoardX + visualCorrectionX}px, ${adjBoardY + visualCorrectionY}px)`,
        transition: showAdj ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Lớp nền bàn cờ (Brightened) - Có bo góc và overflow hidden ở đây */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/board_royal.jpg")',
          backgroundSize: `${100 * adjBgScaleX}% ${100 * adjBgScaleY}%`,
          backgroundPosition: 'center center', // Bỏ cố định, quay về căn giữa
          filter: 'brightness(1.25) contrast(1.05)',
          zIndex: 0,
          borderRadius: '8px',
          overflow: 'hidden'
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

      <canvas id="piece-layer" ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 20 }} />

      {/* Interaction Layer - Expanded to handle clicks comfortably at edges */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 30 }}>
        {Array.from({ length: BOARD_ROWS }).map((_, r) => (
          Array.from({ length: BOARD_COLS }).map((_, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: hPadding + containerWidth / 2 + (c - 4) * cellSize * adjWidthScale - (cellSize * adjWidthScale) / 2 + adjOffsetX,
                top: vPadding + containerHeight / 2 + (r - 4.5) * cellSize * adjHeightScale - (cellSize * adjHeightScale) / 2 + adjOffsetY,
                width: cellSize * adjWidthScale,
                height: cellSize * adjHeightScale,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => onCellClick({ r, c })}
            >
              {isLegalTarget(r, c) && !board[r][c] && <div style={{ width: cellSize / 2, height: cellSize / 2, borderRadius: '50%', background: '#22c55e', border: '2px solid white', boxShadow: '0 0 10px #22c55e' }} />}
              {isLegalTarget(r, c) && board[r][c] && <div style={{ position: 'absolute', inset: 0, border: '4px solid #ef4444', borderRadius: '50%', animation: 'pulse 0.5s infinite' }} />}

              {/* Vòng chọn quân - Thiết kế mới nhỏ gọn và tỏa sáng */}
              {isSelected(r, c) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse-gold" style={{ width: '85%', height: '85%', borderRadius: '50%', border: '3px solid #fbbf24', boxShadow: '0 0 15px #fbbf24, inset 0 0 10px #fbbf24' }} />
                </div>
              )}

              {/* Vòng nước đi cuối - Xanh dương tinh tế */}
              {isLastMoveTo(r, c) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div style={{ width: '85%', height: '85%', borderRadius: '50%', border: '2px dashed #60a5fa', boxShadow: '0 0 10px #60a5fa' }} />
                </div>
              )}

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
        <div style={{ position: 'absolute', left: hPadding + adjOffsetX, top: vPadding + adjOffsetY, width: containerWidth, height: containerHeight, pointerEvents: 'none', zIndex: 100 }}>
          <div
            style={{
              position: 'absolute',
              left: containerWidth / 2 + (animatingPiece.fromC - 4) * cellSize * adjWidthScale - (cellSize * adjWidthScale) / 2,
              top: containerHeight / 2 + (animatingPiece.fromR - 4.5) * cellSize * adjHeightScale - (cellSize * adjHeightScale) / 2,
              width: cellSize * adjWidthScale,
              height: cellSize * adjHeightScale,
              transform: animatingPiece.isAnimating
                ? `translate(${(animatingPiece.toC - animatingPiece.fromC) * cellSize * adjWidthScale}px, ${(animatingPiece.toR - animatingPiece.fromR) * cellSize * adjHeightScale}px) scale(1.2)`
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
        @keyframes pulse-gold { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } }
        .animate-pulse-gold { animation: pulse-gold 1.5s infinite ease-in-out; }
      `}</style>

      {/* Nút tinh chỉnh đã ẩn để không gian chơi cờ sạch sẽ */}
      {/* 
      <button
        onClick={() => setShowAdj(!showAdj)}
        style={{ position: 'absolute', top: '-30px', right: 0, background: '#1a365d', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: '2px solid #fbbf24', zIndex: 3000, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
      >
        {showAdj ? '✖ Đóng' : '🛠 Chỉnh tâm bàn'}
      </button>
      */}

      {/* Bảng điều chỉnh thông số - Thu nhỏ và nằm ngoài bàn cờ */}
      {/* Bảng điều chỉnh đã được ẩn theo yêu cầu */}
    </div>
  );
};

export default React.memo(Board);
