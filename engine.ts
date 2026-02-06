
import { Board, Color, Move, PieceType, Position, Piece } from './types';
import { BOARD_COLS, BOARD_ROWS } from './constants';

export const isWithinBoard = (r: number, c: number) => r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS;
export const getPieceAt = (board: Board, pos: Position) => board[pos.r][pos.c];

// =====================================================
// BẢNG ĐIỂM VỊ TRÍ & GIÁ TRỊ QUÂN CỜ
// =====================================================

const PIECE_VALUES_PRO: Record<PieceType, number> = {
  [PieceType.KING]: 100000,
  [PieceType.ADVISOR]: 250,
  [PieceType.ELEPHANT]: 250,
  [PieceType.HORSE]: 650,
  [PieceType.CHARIOT]: 1350,
  [PieceType.CANNON]: 700,
  [PieceType.SOLDIER]: 150,
};

const POSITION_BONUS: Record<PieceType, number[][]> = {
  [PieceType.KING]: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, -8, 1, 0, 0, 0], [0, 0, 0, 2, 8, 2, 0, 0, 0], [0, 0, 0, 11, 15, 11, 0, 0, 0]
  ],
  [PieceType.ADVISOR]: [
    [0, 0, 0, 20, 0, 20, 0, 0, 0], [0, 0, 0, 0, 23, 0, 0, 0, 0], [0, 0, 0, 20, 0, 20, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 20, 0, 20, 0, 0, 0], [0, 0, 0, 0, 23, 0, 0, 0, 0], [0, 0, 0, 20, 0, 20, 0, 0, 0]
  ],
  [PieceType.ELEPHANT]: [
    [0, 0, 20, 0, 0, 0, 20, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [18, 0, 0, 0, 23, 0, 0, 0, 18],
    [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 20, 0, 0, 0, 20, 0, 0], [0, 0, 20, 0, 0, 0, 20, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [18, 0, 0, 0, 23, 0, 0, 0, 18], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 20, 0, 0, 0, 20, 0, 0]
  ],
  [PieceType.HORSE]: [
    [4, 8, 16, 12, 4, 12, 16, 8, 4], [4, 10, 28, 16, 8, 16, 28, 10, 4], [12, 14, 16, 20, 18, 20, 16, 14, 12],
    [8, 24, 18, 24, 20, 24, 18, 24, 8], [6, 16, 14, 18, 16, 18, 14, 16, 6], [4, 12, 16, 14, 12, 14, 16, 12, 4],
    [2, 6, 8, 6, 10, 6, 8, 6, 2], [4, 2, 8, 8, 4, 8, 8, 2, 4], [0, 2, 4, 4, -2, 4, 4, 2, 0], [0, -4, 0, 0, 0, 0, 0, -4, 0]
  ],
  [PieceType.CHARIOT]: [
    [14, 14, 12, 18, 16, 18, 12, 14, 14], [16, 20, 18, 24, 26, 24, 18, 20, 16], [12, 12, 12, 18, 18, 18, 12, 12, 12],
    [12, 18, 16, 22, 22, 22, 16, 18, 12], [12, 14, 12, 18, 18, 18, 12, 14, 12], [12, 16, 14, 20, 20, 20, 14, 16, 12],
    [6, 10, 8, 14, 14, 14, 8, 10, 6], [4, 8, 6, 14, 12, 14, 6, 8, 4], [8, 4, 8, 16, 8, 16, 8, 4, 8], [-2, 10, 6, 14, 12, 14, 6, 10, -2]
  ],
  [PieceType.CANNON]: [
    [6, 4, 0, -10, -12, -10, 0, 4, 6], [2, 2, 0, -4, -14, -4, 0, 2, 2], [2, 2, 0, -10, -8, -10, 0, 2, 2],
    [0, 0, -2, 4, 10, 4, -2, 0, 0], [0, 0, 0, 2, 8, 2, 0, 0, 0], [-2, 0, 4, 2, 6, 2, 4, 0, -2],
    [0, 0, 0, 2, 4, 2, 0, 0, 0], [4, 0, 8, 6, 10, 6, 8, 0, 4], [0, 2, 4, 6, 6, 6, 4, 2, 0], [0, 0, 2, 6, 6, 6, 2, 0, 0]
  ],
  [PieceType.SOLDIER]: [
    [0, 3, 6, 9, 12, 9, 6, 3, 0], [18, 36, 56, 80, 120, 80, 56, 36, 18], [14, 26, 42, 60, 80, 60, 42, 26, 14],
    [10, 20, 30, 34, 40, 34, 30, 20, 10], [6, 12, 18, 18, 20, 18, 18, 12, 6], [2, 0, 8, 0, 8, 0, 8, 0, 2],
    [0, 0, -2, 0, 4, 0, -2, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0, 0]
  ]
};

// =====================================================
// DI CHUYỂN & HỢP LỆ
// =====================================================

const generateMovesForPiece = (board: Board, r: number, c: number, piece: Piece, onlyCaptures = false): Move[] => {
  const moves: Move[] = [];
  const color = piece.color;
  const oppColor = color === Color.RED ? Color.BLACK : Color.RED;

  const addMove = (nr: number, nc: number) => {
    const target = board[nr][nc];
    if (onlyCaptures) {
      if (target && target.color === oppColor) moves.push({ from: { r, c }, to: { r: nr, c: nc } });
    } else {
      if (!target || target.color === oppColor) moves.push({ from: { r, c }, to: { r: nr, c: nc } });
    }
  };

  switch (piece.type) {
    case PieceType.KING:
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nr = r + dr, nc = c + dc;
        if (nc >= 3 && nc <= 5 && ((color === Color.BLACK && nr <= 2) || (color === Color.RED && nr >= 7)) && isWithinBoard(nr, nc)) addMove(nr, nc);
      }
      break;
    case PieceType.ADVISOR:
      for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nc >= 3 && nc <= 5 && ((color === Color.BLACK && nr <= 2) || (color === Color.RED && nr >= 7)) && isWithinBoard(nr, nc)) addMove(nr, nc);
      }
      break;
    case PieceType.ELEPHANT:
      for (const [dr, dc] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
        const nr = r + dr, nc = c + dc;
        if (((color === Color.BLACK && nr <= 4) || (color === Color.RED && nr >= 5)) && isWithinBoard(nr, nc)) {
          if (board[r + dr / 2][c + dc / 2] === null) addMove(nr, nc);
        }
      }
      break;
    case PieceType.HORSE:
      for (const [dr, dc, ldr, ldc] of [[2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0], [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (isWithinBoard(nr, nc) && board[r + ldr][c + ldc] === null) addMove(nr, nc);
      }
      break;
    case PieceType.CHARIOT:
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        let nr = r + dr, nc = c + dc;
        while (isWithinBoard(nr, nc)) {
          const t = board[nr][nc];
          if (!t) { if (!onlyCaptures) moves.push({ from: { r, c }, to: { r: nr, c: nc } }); }
          else { if (t.color === oppColor) moves.push({ from: { r, c }, to: { r: nr, c: nc } }); break; }
          nr += dr; nc += dc;
        }
      }
      break;
    case PieceType.CANNON:
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        let nr = r + dr, nc = c + dc, j = false;
        while (isWithinBoard(nr, nc)) {
          const t = board[nr][nc];
          if (!j) {
            if (!t) { if (!onlyCaptures) moves.push({ from: { r, c }, to: { r: nr, c: nc } }); }
            else j = true;
          } else {
            if (t) { if (t.color === oppColor) moves.push({ from: { r, c }, to: { r: nr, c: nc } }); break; }
          }
          nr += dr; nc += dc;
        }
      }
      break;
    case PieceType.SOLDIER:
      const f = color === Color.BLACK ? 1 : -1;
      if (isWithinBoard(r + f, c)) addMove(r + f, c);
      if ((color === Color.BLACK && r > 4) || (color === Color.RED && r < 5)) {
        for (const dc of [-1, 1]) if (isWithinBoard(r, c + dc)) addMove(r, c + dc);
      }
      break;
  }
  return moves;
};

const findKing = (board: Board, color: Color): Position | null => {
  // Optimization: King is always in the palace (3-5 columns)
  const startR = color === Color.BLACK ? 0 : 7;
  const endR = color === Color.BLACK ? 2 : 9;
  for (let r = startR; r <= endR; r++) {
    for (let c = 3; c <= 5; c++) {
      const p = board[r][c];
      if (p && p.type === PieceType.KING && p.color === color) return { r, c };
    }
  }
  return null;
};

// Tối ưu hóa kiểm tra chiếu tướng
export const isInCheck = (board: Board, color: Color, providedKingPos?: Position | null): boolean => {
  const kingPos = providedKingPos || findKing(board, color);
  if (!kingPos) return true;
  const opp = color === Color.RED ? Color.BLACK : Color.RED;

  // 1. Kiểm tra Lộ mặt Tướng (Face-to-face Kings)
  const oppKing = findKing(board, opp);
  if (oppKing && kingPos.c === oppKing.c) {
    let blocked = false;
    for (let r = Math.min(kingPos.r, oppKing.r) + 1; r < Math.max(kingPos.r, oppKing.r); r++) {
      if (board[r][kingPos.c]) { blocked = true; break; }
    }
    if (!blocked) return true;
  }

  // 2. Chốt (Soldier)
  const forward = color === Color.RED ? -1 : 1;
  const oppSoldier = PieceType.SOLDIER;
  for (const [dr, dc] of [[forward, 0], [0, 1], [0, -1]]) {
    const nr = kingPos.r + dr, nc = kingPos.c + dc;
    if (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === oppSoldier && p.color === opp) return true;
    }
  }

  // 3. Mã (Horse)
  const horseDirs = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
  for (const [dr, dc] of horseDirs) {
    const nr = kingPos.r + dr, nc = kingPos.c + dc;
    if (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === PieceType.HORSE && p.color === opp) {
        let br = nr, bc = nc;
        if (Math.abs(dr) === 2) br -= Math.sign(dr);
        else bc -= Math.sign(dc);
        if (isWithinBoard(br, bc) && !board[br][bc]) return true;
      }
    }
  }

  // 4. Xe & Pháo (Chariot & Cannon)
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    let nr = kingPos.r + dr, nc = kingPos.c + dc;
    let count = 0;
    while (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p) {
        if (count === 0) {
          if (p.color === opp && p.type === PieceType.CHARIOT) return true;
          count = 1;
        } else {
          if (p.color === opp && p.type === PieceType.CANNON) return true;
          break;
        }
      }
      nr += dr; nc += dc;
    }
  }
  return false;
};

const applyMove = (board: Board, move: Move): Board => {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = null;
  return newBoard;
};

export const getLegalMoves = (board: Board, color: Color): Move[] => {
  const moves: Move[] = [];
  // Find king once to reuse
  const kingPos = findKing(board, color);

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        const pieceMoves = generateMovesForPiece(board, r, c, p);
        for (const m of pieceMoves) {
          const nextBoard = applyMove(board, m);
          // If the king moved, its position changed
          const nextKingPos = (p.type === PieceType.KING) ? m.to : kingPos;
          if (!isInCheck(nextBoard, color, nextKingPos)) moves.push(m);
        }
      }
    }
  }
  return moves;
};


// =====================================================
// AI ENGINE: OPTIMIZED SEARCH WITH MAKE/UNMAKE
// =====================================================

const ZOBRIST_PIECES: number[][][] = []; // [piece_index][r][c]
const ZOBRIST_TURN: number = Math.floor(Math.random() * 0xFFFFFFFF);
let currentHash = 0;

const getPieceIndex = (piece: Piece): number => {
  const typeIdx = Object.values(PieceType).indexOf(piece.type);
  const colorIdx = piece.color === Color.RED ? 0 : 1;
  return typeIdx * 2 + colorIdx;
};

// Initialize Zobrist hashing bits
const initZobrist = () => {
  for (let i = 0; i < 14; i++) {
    ZOBRIST_PIECES[i] = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
      ZOBRIST_PIECES[i][r] = [];
      for (let c = 0; c < BOARD_COLS; c++) {
        ZOBRIST_PIECES[i][r][c] = Math.floor(Math.random() * 0xFFFFFFFF);
      }
    }
  }
};
initZobrist();

export const computeHash = (board: Board, turn: Color): number => {
  let hash = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p) hash ^= ZOBRIST_PIECES[getPieceIndex(p)][r][c];
    }
  }
  if (turn === Color.BLACK) hash ^= ZOBRIST_TURN;
  return hash;
};

interface UndoInfo {
  move: Move;
  captured: Piece | null;
  oldHash: number;
}

const makeMove = (board: Board, move: Move): UndoInfo => {
  const fromPiece = board[move.from.r][move.from.c]!;
  const capturedPiece = board[move.to.r][move.to.c];
  const oldHash = currentHash;

  // Update Hash: Remove piece from 'from'
  currentHash ^= ZOBRIST_PIECES[getPieceIndex(fromPiece)][move.from.r][move.from.c];
  if (capturedPiece) {
    // Update Hash: Remove captured piece
    currentHash ^= ZOBRIST_PIECES[getPieceIndex(capturedPiece)][move.to.r][move.to.c];
  }
  // Update Hash: Add piece to 'to'
  currentHash ^= ZOBRIST_PIECES[getPieceIndex(fromPiece)][move.to.r][move.to.c];
  // Update Hash: Flip turn
  currentHash ^= ZOBRIST_TURN;

  board[move.to.r][move.to.c] = fromPiece;
  board[move.from.r][move.from.c] = null;

  return { move, captured: capturedPiece, oldHash };
};

const unmakeMove = (board: Board, undo: UndoInfo) => {
  const piece = board[undo.move.to.r][undo.move.to.c]!;
  board[undo.move.from.r][undo.move.from.c] = piece;
  board[undo.move.to.r][undo.move.to.c] = undo.captured;
  currentHash = undo.oldHash;
};

const TRANSPOSITION_TABLE = new Map<number, { depth: number, score: number, type: 'exact' | 'alpha' | 'beta', bestMove?: Move }>();
const MAX_TT_ENTRIES = 50000; // Bảo vệ bộ nhớ, không cho phép lưu quá 50k thế cờ
const CHECKMATE_SCORE = 1000000;
const MAX_SEARCH_DEPTH = 4; // Default safe depth

export const evaluateBoard = (board: Board): number => {
  let score = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (!p) continue;
      let val = PIECE_VALUES_PRO[p.type];
      const isBlack = p.color === Color.BLACK;
      const rIdx = isBlack ? (9 - r) : r;
      if (POSITION_BONUS[p.type] && POSITION_BONUS[p.type][rIdx]) {
        val += POSITION_BONUS[p.type][rIdx][c] || 0;
      }
      score += (p.color === Color.RED ? val : -val);
    }
  }
  return score;
};

const scoreMove = (move: Move, board: Board, ttBestMove?: Move): number => {
  if (ttBestMove && move.from.r === ttBestMove.from.r && move.from.c === ttBestMove.from.c &&
    move.to.r === ttBestMove.to.r && move.to.c === ttBestMove.to.c) return 1000000;

  const target = board[move.to.r][move.to.c];
  const piece = board[move.from.r][move.from.c]!;
  if (target) {
    return 10 * PIECE_VALUES_PRO[target.type] - PIECE_VALUES_PRO[piece.type];
  }
  return 0;
};

const negamax = (board: Board, depth: number, alpha: number, beta: number, color: Color): number => {
  const ttEntry = TRANSPOSITION_TABLE.get(currentHash);
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.type === 'exact') return ttEntry.score;
    if (ttEntry.type === 'alpha' && ttEntry.score <= alpha) return alpha;
    if (ttEntry.type === 'beta' && ttEntry.score >= beta) return beta;
  }

  if (depth === 0) {
    const rawScore = evaluateBoard(board);
    return color === Color.RED ? rawScore : -rawScore;
  }

  const moves = getLegalMoves(board, color);
  if (moves.length === 0) return -CHECKMATE_SCORE + (10 - depth);

  // Order moves using TT candidate first
  moves.sort((a, b) => scoreMove(b, board, ttEntry?.bestMove) - scoreMove(a, board, ttEntry?.bestMove));

  let maxScore = -Infinity;
  let originalAlpha = alpha;
  let bestMoveInThisNode: Move | null = null;

  for (const move of moves) {
    const undo = makeMove(board, move);
    const score = -negamax(board, depth - 1, -beta, -alpha, color === Color.RED ? Color.BLACK : Color.RED);
    unmakeMove(board, undo);

    if (score > maxScore) {
      maxScore = score;
      bestMoveInThisNode = move;
    }
    if (score > alpha) alpha = score;
    if (alpha >= beta) break;
  }

  let type: 'exact' | 'alpha' | 'beta' = 'exact';
  if (maxScore <= originalAlpha) type = 'alpha';
  else if (maxScore >= beta) type = 'beta';

  // Định kỳ dọn dẹp bộ nhớ đệm nếu quá tải
  if (TRANSPOSITION_TABLE.size > MAX_TT_ENTRIES) {
    TRANSPOSITION_TABLE.clear();
  }

  TRANSPOSITION_TABLE.set(currentHash, {
    depth,
    score: maxScore,
    type,
    bestMove: bestMoveInThisNode || undefined
  });

  return maxScore;
};

export const findBestMove = (board: Board, maxDepth: number = 3, isMaximizing: boolean): Move | null => {
  const color = isMaximizing ? Color.BLACK : Color.RED;
  const targetDepth = maxDepth;

  currentHash = computeHash(board, color);
  const startTime = Date.now();
  let bestMoveLastIteration: Move | null = null;

  // Iterative Deepening for better move ordering and time control
  for (let d = 1; d <= targetDepth; d++) {
    const moves = getLegalMoves(board, color);
    if (moves.length === 0) break;

    // Order using previous best move
    moves.sort((a, b) => scoreMove(b, board, bestMoveLastIteration || undefined) - scoreMove(a, board, bestMoveLastIteration || undefined));

    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      const undo = makeMove(board, move);
      const score = -negamax(board, d - 1, -beta, -alpha, color === Color.RED ? Color.BLACK : Color.RED);
      unmakeMove(board, undo);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      if (score > alpha) alpha = score;
    }

    if (bestMove) {
      bestMoveLastIteration = bestMove;
      const duration = Date.now() - startTime;
      console.log(`Depth ${d} finished in ${duration}ms. Best move: ${bestMove.from.r},${bestMove.from.c}`);
    }

    // Time limit: 3 seconds for professional feeling
    if (Date.now() - startTime > 3000) break;
  }

  return bestMoveLastIteration;
};

export const clearTranspositionTable = () => {
  TRANSPOSITION_TABLE.clear();
};

export const isKingAlive = (board: Board, color: Color): boolean => findKing(board, color) !== null;

export const isValidMove = (board: Board, move: Move): boolean => {
  const piece = getPieceAt(board, move.from);
  if (!piece) return false;
  return getLegalMoves(board, piece.color).some(m =>
    m.from.r === move.from.r && m.from.c === move.from.c &&
    m.to.r === move.to.r && m.to.c === move.to.c
  );
};


