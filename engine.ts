
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
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.type === PieceType.KING && p.color === color) return { r, c };
    }
  }
  return null;
};

// Tối ưu hóa kiểm tra chiếu tướng: Không tạo toàn bộ danh sách nước đi
export const isInCheck = (board: Board, color: Color): boolean => {
  const kingPos = findKing(board, color);
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
  const forward = color === Color.RED ? -1 : 1; // Hướng của mình
  // Chốt đối phương tấn công ngược chiều forward của mình
  // Ví dụ: Đỏ (dưới) forward -1. Chốt Đen (trên) đánh xuống (+1).
  // Chốt Đen ở [r-1][c] tấn công [r][c].
  // => Từ Tướng [r][c], tìm chốt Đen ở [r - (+1)][c] = [r-1][c] (tức là r + forward).
  // => Logic trước đó đúng.

  const checkDirs = [[forward, 0], [0, 1], [0, -1]];
  const oppSoldier = PieceType.SOLDIER;

  for (const [dr, dc] of checkDirs) {
    const nr = kingPos.r + dr, nc = kingPos.c + dc;
    if (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === oppSoldier && p.color === opp) return true;
    }
  }

  // 3. Mã (Horse)
  const horseDirs = [
    [2, 1], [2, -1], [-2, 1], [-2, -1],
    [1, 2], [1, -2], [-1, 2], [-1, -2]
  ];
  const oppHorse = PieceType.HORSE;

  for (const [dr, dc] of horseDirs) {
    const nr = kingPos.r + dr, nc = kingPos.c + dc;
    if (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.type === oppHorse && p.color === opp) {
        // Check blocking point (Mắt ngựa)
        // Block is at (kingPos.r + sign(dr), kingPos.c + sign(dc)) ?? No.
        // Rule: 
        // Move vertical 2 (dr=2 or -2): Block at (Start.r + sign(dr), Start.c)
        // Move horizontal 2 (dc=2 or -2): Block at (Start.r, Start.c + sign(dc))
        // Here Start is King? No.
        // Traditional: Horse moves from A to B. Block is near A.
        // Here Horse is at nr, nc. Attacking King at kingPos.
        // Block is near Horse.
        // If Abs(dr) == 2: Block is at (nr - sign(dr), nc)
        // If Abs(dc) == 2: Block is at (nr, nc - sign(dc))

        let br = nr, bc = nc;
        if (Math.abs(dr) === 2) br -= Math.sign(dr);
        else bc -= Math.sign(dc);

        if (!board[br][bc]) return true;
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
          break; // Bị cản bởi 2 quân -> Pháo không chiếu được nữa
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
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.color === color) {
        for (const m of generateMovesForPiece(board, r, c, p)) if (!isInCheck(applyMove(board, m), color)) moves.push(m);
      }
    }
  }
  return moves;
};

// =====================================================
// AI ENGINE: MINIMAX (NEGAMAX) + ALPHA-BETA PRUNING
// =====================================================

// Checkmate value (large enough to exceed any material score)
const CHECKMATE_SCORE = 1000000;
const MAX_SEARCH_DEPTH = 3;

/**
 * Static Evaluation Function
 * Returns the score relative to the RED player.
 * Positive = RED advantage, Negative = BLACK advantage.
 */
export const evaluateBoard = (board: Board): number => {
  let score = 0;

  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (!p) continue;

      let val = PIECE_VALUES_PRO[p.type];

      // Add Position Bonus (PST)
      // Note: POSITION_BONUS is defined from RED's perspective (bottom of board).
      // For BLACK, we must flip the row index.
      const isBlack = p.color === Color.BLACK;
      const rIdx = isBlack ? (9 - r) : r;

      // Safety check for array bounds
      if (POSITION_BONUS[p.type] && POSITION_BONUS[p.type][rIdx]) {
        val += POSITION_BONUS[p.type][rIdx][c] || 0;
      }

      // Add Material + Position score
      if (p.color === Color.RED) {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  return score;
};

/**
 * Orders moves to improve Alpha-Beta pruning efficiency.
 * Heuristics:
 * 1. Captures (MVV-LVA: Most Valuable Victim - Least Valuable Aggressor)
 */
const orderMoves = (moves: Move[], board: Board): Move[] => {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const targetA = board[a.to.r][a.to.c];
    const pieceA = board[a.from.r][a.from.c];
    if (targetA && pieceA) {
      scoreA = 10 * PIECE_VALUES_PRO[targetA.type] - PIECE_VALUES_PRO[pieceA.type];
    }

    const targetB = board[b.to.r][b.to.c];
    const pieceB = board[b.from.r][b.from.c];
    if (targetB && pieceB) {
      scoreB = 10 * PIECE_VALUES_PRO[targetB.type] - PIECE_VALUES_PRO[pieceB.type];
    }

    return scoreB - scoreA;
  });
};

/**
 * Negamax Search with Alpha-Beta Pruning
 * @param board Current board state
 * @param depth Remaining depth
 * @param alpha Best score for current player so far
 * @param beta Best score for opponent so far
 * @param color Current player's color
 * @returns Best score for the current player
 */
const negamax = (board: Board, depth: number, alpha: number, beta: number, color: Color): number => {
  // Base case: Max depth reached
  if (depth === 0) {
    // Return static evaluation from CURRENT player's perspective
    const rawScore = evaluateBoard(board);
    return color === Color.RED ? rawScore : -rawScore;
  }

  // Generate legal moves
  const moves = getLegalMoves(board, color);

  // Check Game Over (Stalemate / Checkmate)
  // In Xiangqi, if you have no moves, you lose.
  if (moves.length === 0) {
    return -CHECKMATE_SCORE + (MAX_SEARCH_DEPTH - depth); // Prefer losing later
  }

  // Move Ordering
  const orderedMoves = orderMoves(moves, board);

  let maxScore = -Infinity;

  for (const move of orderedMoves) {
    const nextBoard = applyMove(board, move);

    // Recursive Step: Flip color and negate score
    const nextColor = color === Color.RED ? Color.BLACK : Color.RED;
    const score = -negamax(nextBoard, depth - 1, -beta, -alpha, nextColor);

    if (score > maxScore) {
      maxScore = score;
    }

    // Alpha-Beta Pruning
    if (maxScore > alpha) {
      alpha = maxScore;
    }
    if (alpha >= beta) {
      break; // Beta Cut-off
    }
  }

  return maxScore;
};

/**
 * Finds the best move for the AI.
 * @param board Current board state
 * @param maxDepth Search depth (default 3)
 * @param isMaximizing boolean flag (Legacy support, usually means BLACK is AI)
 */
export const findBestMove = (board: Board, maxDepth: number = 3, isMaximizing: boolean): Move | null => {
  const color = isMaximizing ? Color.BLACK : Color.RED;
  const depth = maxDepth || MAX_SEARCH_DEPTH;

  console.log(`AI Starting Calculation: Turn=${color}, Depth=${depth}`);
  const startTime = Date.now();

  const moves = getLegalMoves(board, color);
  if (moves.length === 0) {
    console.log("AI has no valid moves (Game Over).");
    return null;
  }

  const orderedMoves = orderMoves(moves, board);

  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  // Alpha-Beta initialization
  let alpha = -Infinity;
  let beta = Infinity;

  // Root Alpha-Beta Search
  for (const move of orderedMoves) {
    const nextBoard = applyMove(board, move);
    const nextColor = color === Color.RED ? Color.BLACK : Color.RED;

    // Call Negamax
    const score = -negamax(nextBoard, depth - 1, -beta, -alpha, nextColor);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    if (score > alpha) {
      alpha = score;
    }
  }

  const duration = Date.now() - startTime;
  console.log(`AI Calculation Finished in ${duration}ms. Best Score: ${bestScore}`);

  if (bestMove) {
    console.log(`Best Move: [${bestMove.from.r}, ${bestMove.from.c}] -> [${bestMove.to.r}, ${bestMove.to.c}]`);
  }

  return bestMove;
};

export const clearTranspositionTable = () => {
  // Placeholder
};

export const isKingAlive = (board: Board, color: Color): boolean => {
  return findKing(board, color) !== null;
};

export const isValidMove = (board: Board, move: Move): boolean => {
  const piece = getPieceAt(board, move.from);
  if (!piece) return false;
  const legalMoves = getLegalMoves(board, piece.color);
  return legalMoves.some(m => m.from.r === move.from.r && m.from.c === move.from.c && m.to.r === move.to.r && m.to.c === move.to.c);
};
