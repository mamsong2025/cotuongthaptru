
import { Board, Color, Move, PieceType, Position, Piece } from './types';
import { BOARD_COLS, BOARD_ROWS, PIECE_VALUES } from './constants';

export const isWithinBoard = (r: number, c: number) => r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS;

export const getPieceAt = (board: Board, pos: Position) => board[pos.r][pos.c];

// =====================================================
// BẢNG ĐIỂM VỊ TRÍ CHUYÊN NGHIỆP CHO CỜ TƯỚNG
// =====================================================

// Điểm thưởng Xe - ưu tiên cột mở và xâm nhập
const CHARIOT_BONUS = [
  [14, 14, 12, 18, 16, 18, 12, 14, 14],
  [16, 20, 18, 24, 26, 24, 18, 20, 16],
  [12, 12, 12, 18, 18, 18, 12, 12, 12],
  [12, 18, 16, 22, 22, 22, 16, 18, 12],
  [12, 14, 12, 18, 18, 18, 12, 14, 12],
  [12, 16, 14, 20, 20, 20, 14, 16, 12],
  [6, 10, 8, 14, 14, 14, 8, 10, 6],
  [4, 8, 6, 14, 12, 14, 6, 8, 4],
  [8, 4, 8, 16, 8, 16, 8, 4, 8],
  [-2, 10, 6, 14, 12, 14, 6, 10, -2]
];

// Điểm thưởng Mã - ưu tiên trung tâm và tấn công
const HORSE_BONUS = [
  [4, 8, 16, 12, 4, 12, 16, 8, 4],
  [4, 10, 28, 16, 8, 16, 28, 10, 4],
  [12, 14, 16, 20, 18, 20, 16, 14, 12],
  [8, 24, 18, 24, 20, 24, 18, 24, 8],
  [6, 16, 14, 18, 16, 18, 14, 16, 6],
  [4, 12, 16, 14, 12, 14, 16, 12, 4],
  [2, 6, 8, 6, 10, 6, 8, 6, 2],
  [4, 2, 8, 8, 4, 8, 8, 2, 4],
  [0, 2, 4, 4, -2, 4, 4, 2, 0],
  [0, -4, 0, 0, 0, 0, 0, -4, 0]
];

// Điểm thưởng Pháo - ưu tiên đường mở 
const CANNON_BONUS = [
  [6, 4, 0, -10, -12, -10, 0, 4, 6],
  [2, 2, 0, -4, -14, -4, 0, 2, 2],
  [2, 2, 0, -10, -8, -10, 0, 2, 2],
  [0, 0, -2, 4, 10, 4, -2, 0, 0],
  [0, 0, 0, 2, 8, 2, 0, 0, 0],
  [-2, 0, 4, 2, 6, 2, 4, 0, -2],
  [0, 0, 0, 2, 4, 2, 0, 0, 0],
  [4, 0, 8, 6, 10, 6, 8, 0, 4],
  [0, 2, 4, 6, 6, 6, 4, 2, 0],
  [0, 0, 2, 6, 6, 6, 2, 0, 0]
];

// Điểm thưởng Tốt/Binh - ưu tiên tiến lên và cột giữa
const SOLDIER_BONUS = [
  [0, 3, 6, 9, 12, 9, 6, 3, 0],
  [18, 36, 56, 80, 120, 80, 56, 36, 18],
  [14, 26, 42, 60, 80, 60, 42, 26, 14],
  [10, 20, 30, 34, 40, 34, 30, 20, 10],
  [6, 12, 18, 18, 20, 18, 18, 12, 6],
  [2, 0, 8, 0, 8, 0, 8, 0, 2],
  [0, 0, -2, 0, 4, 0, -2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0]
];

// Điểm thưởng Sĩ
const ADVISOR_BONUS = [
  [0, 0, 0, 20, 0, 20, 0, 0, 0],
  [0, 0, 0, 0, 23, 0, 0, 0, 0],
  [0, 0, 0, 20, 0, 20, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 20, 0, 20, 0, 0, 0],
  [0, 0, 0, 0, 23, 0, 0, 0, 0],
  [0, 0, 0, 20, 0, 20, 0, 0, 0]
];

// Điểm thưởng Tượng
const ELEPHANT_BONUS = [
  [0, 0, 20, 0, 0, 0, 20, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [18, 0, 0, 0, 23, 0, 0, 0, 18],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 20, 0, 0, 0, 20, 0, 0],
  [0, 0, 20, 0, 0, 0, 20, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [18, 0, 0, 0, 23, 0, 0, 0, 18],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 20, 0, 0, 0, 20, 0, 0]
];

// Điểm thưởng Vua/Tướng - giữ ở cung
const KING_BONUS = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, -8, 1, 0, 0, 0],
  [0, 0, 0, 2, 8, 2, 0, 0, 0],
  [0, 0, 0, 11, 15, 11, 0, 0, 0]
];

const POSITION_BONUS: Record<PieceType, number[][]> = {
  [PieceType.KING]: KING_BONUS,
  [PieceType.ADVISOR]: ADVISOR_BONUS,
  [PieceType.ELEPHANT]: ELEPHANT_BONUS,
  [PieceType.HORSE]: HORSE_BONUS,
  [PieceType.CHARIOT]: CHARIOT_BONUS,
  [PieceType.CANNON]: CANNON_BONUS,
  [PieceType.SOLDIER]: SOLDIER_BONUS,
};

// Giá trị quân cờ cải tiến
const PIECE_VALUES_PRO: Record<PieceType, number> = {
  [PieceType.KING]: 10000,
  [PieceType.ADVISOR]: 120,
  [PieceType.ELEPHANT]: 120,
  [PieceType.HORSE]: 270,
  [PieceType.CHARIOT]: 600,
  [PieceType.CANNON]: 285,
  [PieceType.SOLDIER]: 30,
};

// =====================================================
// TRANSPOSITION TABLE (Bảng băm)
// =====================================================

interface TTEntry {
  depth: number;
  score: number;
  flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND';
  bestMove: Move | null;
}

const transpositionTable = new Map<string, TTEntry>();
const MAX_TT_SIZE = 30000; // Giảm từ 100000 để tiết kiệm RAM

function getBoardHash(board: Board): string {
  let hash = '';
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece) {
        hash += `${r}${c}${piece.type}${piece.color}`;
      }
    }
  }
  return hash;
}

// =====================================================
// LOGIC DI CHUYỂN
// =====================================================

export const isValidMove = (board: Board, move: Move): boolean => {
  const { from, to } = move;
  const piece = getPieceAt(board, from);
  const target = getPieceAt(board, to);

  if (!piece) return false;
  if (target && target.color === piece.color) return false;

  const dr = to.r - from.r;
  const dc = to.c - from.c;
  const absDr = Math.abs(dr);
  const absDc = Math.abs(dc);

  switch (piece.type) {
    case PieceType.KING:
      // Kiểm tra "đối mặt tướng"
      if (absDr === 0 && absDc === 0) return false;
      if (to.c < 3 || to.c > 5) return false;
      if (piece.color === Color.BLACK && to.r > 2) return false;
      if (piece.color === Color.RED && to.r < 7) return false;
      return (absDr + absDc === 1);
    case PieceType.ADVISOR:
      if (to.c < 3 || to.c > 5) return false;
      if (piece.color === Color.BLACK && to.r > 2) return false;
      if (piece.color === Color.RED && to.r < 7) return false;
      return (absDr === 1 && absDc === 1);
    case PieceType.ELEPHANT:
      if (absDr !== 2 || absDc !== 2) return false;
      if (piece.color === Color.BLACK && to.r > 4) return false;
      if (piece.color === Color.RED && to.r < 5) return false;
      const eyeR = from.r + dr / 2;
      const eyeC = from.c + dc / 2;
      if (board[eyeR][eyeC] !== null) return false;
      return true;
    case PieceType.HORSE:
      if (!((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2))) return false;
      const legR = from.r + (absDr === 2 ? dr / 2 : 0);
      const legC = from.c + (absDc === 2 ? dc / 2 : 0);
      if (board[legR][legC] !== null) return false;
      return true;
    case PieceType.CHARIOT:
      if (dr !== 0 && dc !== 0) return false;
      return countPiecesBetween(board, from, to) === 0;
    case PieceType.CANNON:
      if (dr !== 0 && dc !== 0) return false;
      const between = countPiecesBetween(board, from, to);
      if (!target) return between === 0;
      return between === 1;
    case PieceType.SOLDIER:
      if (piece.color === Color.BLACK) {
        if (dr < 0) return false;
        return (from.r <= 4) ? (dr === 1 && dc === 0) : ((dr === 1 && dc === 0) || (dr === 0 && absDc === 1));
      } else {
        if (dr > 0) return false;
        return (from.r >= 5) ? (dr === -1 && dc === 0) : ((dr === -1 && dc === 0) || (dr === 0 && absDc === 1));
      }
  }
  return false;
};

const countPiecesBetween = (board: Board, from: Position, to: Position): number => {
  let count = 0;
  const dr = Math.sign(to.r - from.r);
  const dc = Math.sign(to.c - from.c);
  let r = from.r + dr;
  let c = from.c + dc;
  while (r !== to.r || c !== to.c) {
    if (board[r][c] !== null) count++;
    r += dr;
    c += dc;
  }
  return count;
};

// =====================================================
// SINH NƯỚC ĐI NHANH
// =====================================================

const generateMovesForPiece = (board: Board, r: number, c: number, piece: Piece): Move[] => {
  const moves: Move[] = [];
  const color = piece.color;

  switch (piece.type) {
    case PieceType.KING:
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const nr = r + dr, nc = c + dc;
        if (nc >= 3 && nc <= 5) {
          if ((color === Color.BLACK && nr <= 2) || (color === Color.RED && nr >= 7)) {
            if (isWithinBoard(nr, nc)) {
              const target = board[nr][nc];
              if (!target || target.color !== color) {
                moves.push({ from: { r, c }, to: { r: nr, c: nc } });
              }
            }
          }
        }
      }
      break;

    case PieceType.ADVISOR:
      for (const [dr, dc] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nr = r + dr, nc = c + dc;
        if (nc >= 3 && nc <= 5) {
          if ((color === Color.BLACK && nr <= 2) || (color === Color.RED && nr >= 7)) {
            const target = board[nr]?.[nc];
            if (target === undefined) continue;
            if (!target || target.color !== color) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } });
            }
          }
        }
      }
      break;

    case PieceType.ELEPHANT:
      for (const [dr, dc] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
        const nr = r + dr, nc = c + dc;
        const eyeR = r + dr / 2, eyeC = c + dc / 2;
        if ((color === Color.BLACK && nr <= 4) || (color === Color.RED && nr >= 5)) {
          if (isWithinBoard(nr, nc) && board[eyeR]?.[eyeC] === null) {
            const target = board[nr][nc];
            if (!target || target.color !== color) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } });
            }
          }
        }
      }
      break;

    case PieceType.HORSE:
      const horseMoves = [
        [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
        [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]
      ];
      for (const [dr, dc, legDr, legDc] of horseMoves) {
        const nr = r + dr, nc = c + dc;
        const legR = r + legDr, legC = c + legDc;
        if (isWithinBoard(nr, nc) && board[legR]?.[legC] === null) {
          const target = board[nr][nc];
          if (!target || target.color !== color) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          }
        }
      }
      break;

    case PieceType.CHARIOT:
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        let nr = r + dr, nc = c + dc;
        while (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!target) {
            moves.push({ from: { r, c }, to: { r: nr, c: nc } });
          } else {
            if (target.color !== color) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } });
            }
            break;
          }
          nr += dr;
          nc += dc;
        }
      }
      break;

    case PieceType.CANNON:
      for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        let nr = r + dr, nc = c + dc;
        let jumped = false;
        while (isWithinBoard(nr, nc)) {
          const target = board[nr][nc];
          if (!jumped) {
            if (!target) {
              moves.push({ from: { r, c }, to: { r: nr, c: nc } });
            } else {
              jumped = true;
            }
          } else {
            if (target) {
              if (target.color !== color) {
                moves.push({ from: { r, c }, to: { r: nr, c: nc } });
              }
              break;
            }
          }
          nr += dr;
          nc += dc;
        }
      }
      break;

    case PieceType.SOLDIER:
      const forward = color === Color.BLACK ? 1 : -1;
      const crossed = color === Color.BLACK ? r > 4 : r < 5;

      // Tiến lên
      const fr = r + forward;
      if (isWithinBoard(fr, c)) {
        const target = board[fr][c];
        if (!target || target.color !== color) {
          moves.push({ from: { r, c }, to: { r: fr, c } });
        }
      }

      // Ngang (nếu đã qua sông)
      if (crossed) {
        for (const dc of [-1, 1]) {
          const nc = c + dc;
          if (isWithinBoard(r, nc)) {
            const target = board[r][nc];
            if (!target || target.color !== color) {
              moves.push({ from: { r, c }, to: { r, c: nc } });
            }
          }
        }
      }
      break;
  }

  return moves;
};

// =====================================================
// KIỂM TRA CHIẾU TƯỚNG
// =====================================================

// Tìm vị trí Tướng
const findKing = (board: Board, color: Color): Position | null => {
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.type === PieceType.KING && piece.color === color) {
        return { r, c };
      }
    }
  }
  return null;
};

// Kiểm tra Tướng có đang bị chiếu không
export const isInCheck = (board: Board, color: Color): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return true; // Tướng đã bị ăn = thua

  const opponent = color === Color.RED ? Color.BLACK : Color.RED;

  // Kiểm tra xem có quân đối phương nào có thể ăn Tướng không
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.color === opponent) {
        const moves = generateMovesForPiece(board, r, c, piece);
        for (const move of moves) {
          if (move.to.r === kingPos.r && move.to.c === kingPos.c) {
            return true;
          }
        }
      }
    }
  }

  // Kiểm tra đối mặt Tướng (hai Tướng nhìn thấy nhau)
  const opponentKingPos = findKing(board, opponent);
  if (opponentKingPos && kingPos.c === opponentKingPos.c) {
    let blocked = false;
    const minR = Math.min(kingPos.r, opponentKingPos.r);
    const maxR = Math.max(kingPos.r, opponentKingPos.r);
    for (let r = minR + 1; r < maxR; r++) {
      if (board[r][kingPos.c]) {
        blocked = true;
        break;
      }
    }
    if (!blocked) return true; // Đối mặt Tướng = chiếu
  }

  return false;
};

// Kiểm tra Tướng còn tồn tại không
export const isKingAlive = (board: Board, color: Color): boolean => {
  return findKing(board, color) !== null;
};

// Áp dụng nước đi tạm thời để kiểm tra
const applyMoveTemp = (board: Board, move: Move): Board => {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = null;
  return newBoard;
};

export const getLegalMoves = (board: Board, color: Color): Move[] => {
  const moves: Move[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const pieceMoves = generateMovesForPiece(board, r, c, piece);

        // Lọc ra các nước đi khiến Tướng của mình bị chiếu
        for (const move of pieceMoves) {
          const newBoard = applyMoveTemp(board, move);
          if (!isInCheck(newBoard, color)) {
            moves.push(move);
          }
        }
      }
    }
  }
  return moves;
};

// =====================================================
// CHIẾN THUẬT & KHẨU QUYẾT CỜ TƯỚNG (PHÂN TÍCH)
// =====================================================

// Đếm số quân trên bàn cờ để xác định giai đoạn
const countPieces = (board: Board): number => {
  let count = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      if (board[r][c]) count++;
    }
  }
  return count;
};

// Đánh giá độ linh hoạt của quân cờ (Mobility)
const getPieceMobility = (board: Board, r: number, c: number, piece: Piece): number => {
  const moves = generateMovesForPiece(board, r, c, piece);
  return moves.length;
};

// Đánh giá kiểm soát bờ sông (River Control)
const evaluateRiverControl = (board: Board, color: Color): number => {
  let score = 0;
  const riverRow = color === Color.RED ? 4 : 5; // Hàng sông của mình

  // Xe/Pháo tuần hà (đứng ở hàng sông)
  for (let c = 0; c < BOARD_COLS; c++) {
    const piece = board[riverRow][c];
    if (piece && piece.color === color) {
      if (piece.type === PieceType.CHARIOT) score += 50; // Tăng từ 30 lên 50
      if (piece.type === PieceType.CANNON) score += 30; // Tăng từ 20 lên 30
    }
  }
  return score;
};

// Đếm số lượng quân của loại cụ thể
const countPiecesByType = (board: Board, color: Color, type: PieceType): number => {
  let count = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === type) count++;
    }
  }
  return count;
}

// Hàm đánh giá chiến lược tổng hợp (Strategic Evaluation)
const evaluateStrategic = (board: Board, color: Color, phase: 'OPENING' | 'MIDGAME' | 'ENDGAME'): number => {
  let score = 0;
  const opponent = color === Color.RED ? Color.BLACK : Color.RED;

  // 1. Khẩu quyết: "Nhất xa thập tử hàn" (Xe mạnh ở tàn cuộc)
  const chariotBonus = phase === 'ENDGAME' ? 150 : 0; // Tăng bonus
  if (chariotBonus > 0) {
    if (countPiecesByType(board, color, PieceType.CHARIOT) > 0) score += chariotBonus;
  }

  // 2. Khẩu quyết: "Hai sĩ khuyết tượng ngại pháo công"
  // Kiểm tra cấu trúc phòng thủ
  const elephantCount = countPiecesByType(board, color, PieceType.ELEPHANT);
  const advisorCount = countPiecesByType(board, color, PieceType.ADVISOR);

  if (advisorCount === 2 && elephantCount === 0) {
    // Nếu đối phương còn Pháo -> Phạt nặng
    if (countPiecesByType(board, opponent, PieceType.CANNON) > 0) score -= 200; // Tăng phạt
  }

  // 3. Khẩu quyết: "2 tượng khuyết sĩ sợ tốt đâm"
  if (elephantCount === 2 && advisorCount === 0) {
    if (countPiecesByType(board, opponent, PieceType.SOLDIER) > 0) score -= 200; // Tăng phạt
  }

  // 4. Kiểm soát trung lộ (Central Control)
  // Nếu có Pháo đầu (Pháo ở cột 5)
  const centerCol = 4;
  for (let r = 0; r < BOARD_ROWS; r++) {
    const p = board[r][centerCol];
    if (p && p.color === color && p.type === PieceType.CANNON) {
      score += 40; // Có pháo đầu (tăng từ 20)
      // Nếu đối phương không có Sĩ bảo vệ -> Thưởng thêm
    }
  }

  // 5. Tốt qua sông (Advanced Pawn)
  // Tốt qua sông đặc biệt giá trị ở tàn cuộc
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === PieceType.SOLDIER) {
        const crossedRiver = color === Color.RED ? r < 5 : r > 4;
        if (crossedRiver) {
          score += phase === 'ENDGAME' ? 80 : 40; // Tăng giá trị
          // Tốt áp sát cung
          const nearPalace = color === Color.RED ? r <= 2 : r >= 7;
          if (nearPalace && c >= 3 && c <= 5) score += 60; // Tăng giá trị
        }
      }
    }
  }

  // 6. Mã Ngọa Tào (Corner Horse - attacking palace)
  // Mã đứng ở các vị trí hiểm hóc tấn công cung tướng
  // Vị trí (3,2), (3,6) cho Đen tấn công Đỏ (nếu tính từ góc nhìn bàn cờ)
  // Logic: Quân Mã của 'color' đang ở hàng áp chót của 'opponent' và cột 2 hoặc 6?
  // Red Palace: R7-9, C3-5. Mã Ngọa Tào thường ở R8, C2/6 hoặc R7, C7/1?
  // Mã ở (8,2) check (9,4) (Red King). Mã ở (8,6) check (9,4).
  // Black attacking Red: Horse at (8,2) or (8,6).
  // Red attacking Black: Horse at (1,2) or (1,6).

  const targetRow = color === Color.BLACK ? 8 : 1;
  if (board[targetRow][2]?.type === PieceType.HORSE && board[targetRow][2]?.color === color) score += 80; // Tăng từ 50
  if (board[targetRow][6]?.type === PieceType.HORSE && board[targetRow][6]?.color === color) score += 80;

  // 7. Mã Liên Hoàn (Linked Horses)
  const horses: Position[] = [];
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === PieceType.HORSE) {
        horses.push({ r, c });
      }
    }
  }
  if (horses.length >= 2) {
    for (let i = 0; i < horses.length; i++) {
      for (let j = i + 1; j < horses.length; j++) {
        const h1 = horses[i];
        const h2 = horses[j];
        const dr = Math.abs(h1.r - h2.r);
        const dc = Math.abs(h1.c - h2.c);
        if ((dr === 2 && dc === 1) || (dr === 1 && dc === 2)) {
          const legR = h1.r + (dr === 2 ? (h2.r - h1.r) / 2 : 0);
          const legC = h1.c + (dc === 2 ? (h2.c - h1.c) / 2 : 0);
          if (!board[legR][legC]) {
            score += 60;
          }
        }
      }
    }
  }

  // 8. Pháo Trùng (Double Cannons)
  // Hai pháo cùng cột đe dọa cực mạnh
  for (let c = 0; c < BOARD_COLS; c++) {
    let cannonCount = 0;
    let pieceCountInCol = 0;
    for (let r = 0; r < BOARD_ROWS; r++) {
      const p = board[r][c];
      if (p) {
        pieceCountInCol++;
        if (p.color === color && p.type === PieceType.CANNON) cannonCount++;
      }
    }
    if (cannonCount === 2) {
      score += 50; // Bonus Pháo trùng
      // Nếu cột đó là cột giữa (4) hoặc lộ 3, 7 thì càng mạnh
      if (c === 4 || c === 2 || c === 6) score += 30;
    }
  }

  // 9. Xe Pháo (Chariot Backed by Cannon) - "Tử xa hậu pháo"
  // Xe và Pháo cùng cột hoặc cùng hàng tấn công
  // Kiểm tra cùng cột (dễ nhất)
  for (let c = 0; c < BOARD_COLS; c++) {
    let hasChariot = false;
    let hasCannon = false;
    for (let r = 0; r < BOARD_ROWS; r++) {
      const p = board[r][c];
      if (p && p.color === color) {
        if (p.type === PieceType.CHARIOT) hasChariot = true;
        if (p.type === PieceType.CANNON) hasCannon = true;
      }
    }
    if (hasChariot && hasCannon) {
      score += 40; // Bonus phối hợp Xe Pháo
    }
  }

  // 10. Tam tử đồng biên (3 pieces attacking one side)
  // Xe, Pháo, Mã tập trung ở 1 cánh (trái hoặc phải)
  const midCol = 4;
  let leftWingCount = 0;
  let rightWingCount = 0;
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const p = board[r][c];
      if (p && p.color === color && (p.type === PieceType.CHARIOT || p.type === PieceType.CANNON || p.type === PieceType.HORSE)) {
        if (c < midCol) leftWingCount++;
        else if (c > midCol) rightWingCount++;
      }
    }
  }
  if (leftWingCount >= 3) score += 40; // Tập trung cánh trái
  if (rightWingCount >= 3) score += 40; // Tập trung cánh phải

  // 14. Đòn Rút (Discovered Attack/Ambush) - Kế sách "Dụ địch"
  // Kiểm tra các quân Tốt/Mã/Pháo/Xe của MÌNH đang đứng trước mặt Xe/Pháo của MÌNH
  // Và đường ngắm đó đang hướng tới Tướng/Xe của đối phương.
  // Nếu có -> Đây là bẫy/ngòi nổ.
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        // Quân này có phải là 'ngòi' (trigger) không?
        // Check 4 hướng xem có quân Xe/Pháo nào của mình đang bị quân này cản không
        // Và phía bên kia của quân này có mục tiêu giá trị không
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        for (const [dr, dc] of directions) {
          // 1. Nhìn về phía sau (tìm Pháo/Xe mình)
          let backR = r - dr;
          let backC = c - dc;
          let backPiece: Piece | null = null;

          // Scan backwards
          while (isWithinBoard(backR, backC)) {
            const p = board[backR][backC];
            if (p) { backPiece = p; break; } // Tìm thấy quân đầu tiên
            backR -= dr;
            backC -= dc;
          }

          if (backPiece && backPiece.color === color) {
            const isCannon = backPiece.type === PieceType.CANNON;
            const isChariot = backPiece.type === PieceType.CHARIOT;

            if (isCannon || isChariot) {
              // 2. Nhìn về phía trước (tìm mục tiêu)
              let frontR = r + dr;
              let frontC = c + dc;
              let targetPiece: Piece | null = null;
              let screens = 0; // Số quân cản phía trước

              while (isWithinBoard(frontR, frontC)) {
                const p = board[frontR][frontC];
                if (p) {
                  if (screens === 0) targetPiece = p; // Mục tiêu đầu tiên
                  screens++;
                }
                frontR += dr;
                frontC += dc;
              }

              // Đánh giá bẫy
              if (targetPiece && targetPiece.color === opponent) {
                const targetVal = PIECE_VALUES_PRO[targetPiece.type];
                // Xe rút (Chariot Discovery): Cần 0 quân cản (nhưng quân trigger chính là quân cản).
                // Khi quân trigger di chuyển đi, Xe sẽ tấn công target.
                // Vậy logic hiện tại: BackPiece -- TriggerPiece -- Target
                // Nếu BackPiece là Xe: Khi Trigger đi, Xe tấn công Target.
                if (isChariot && screens === 1) { // Chỉ có TriggerPiece là cản
                  if (targetVal > 300) score += 60; // Bẫy bắt xe/tướng
                }
                // Pháo rút (Cannon Discovery):
                // Cần 1 quân cản (TriggerPiece) để Pháo bắn Target? KHÔNG.
                // Pháo bắn cần 1 ngòi.
                // Nếu TriggerPiece đi chỗ khác, Pháo sẽ MẤT ngòi -> Không bắn được.
                // TRỪ KHI: TriggerPiece nhảy đi chiếu, hoặc nhảy đi ăn quân, để lộ đường cho Xe?
                // Hoặc: BackPiece là Pháo. TriggerPiece là ngòi. Target là địch.
                // Nếu Trigger di chuyển, Pháo vẫn cần ngòi khác??
                // Discovered check for Cannon is rare (Simultaneous check?).
                // Thường là Xe rút.

                // Trường hợp Pháo trùng: Pháo sau -- Pháo trước (Trigger) -- Địch
                // Nếu Pháo trước đi ra, Pháo sau bắn? Không, mất ngòi.

                // Trường hợp Pháo Giác/Pháo lồng:
                // Xe -- Pháo (Trigger) -- Tướng.
                // Pháo di chuyển -> Xe chiếu. Đây là "Tiền Pháo Hậu Xe" (Cannon moves, Chariot checks).
                if (isChariot && piece.type === PieceType.CANNON && screens === 1 && targetPiece.type === PieceType.KING) {
                  score += 100; // Sát cục rút pháo
                }
              }
            }
          }
        }
      }
    }
  }

  // 11. Tiểu Đao Oan Tâm (Pawn in Palace)
  // Tốt đã nhập cung (vào cửu cung của đối phương)
  const palaceRowStart = color === Color.BLACK ? 7 : 0;
  const palaceRowEnd = color === Color.BLACK ? 9 : 2;
  for (let r = palaceRowStart; r <= palaceRowEnd; r++) {
    for (let c = 3; c <= 5; c++) {
      const p = board[r][c];
      if (p && p.color === color && p.type === PieceType.SOLDIER) {
        score += 150; // Bonus cực lớn cho Tốt nhập cung (Tiểu đao)
      }
    }
  }

  // 12. Thiết Môn Thuyên (Iron Gate)
  // Pháo đầu + Xe chọc xuống đánh vào sĩ
  const throatRow = color === Color.BLACK ? 7 : 2; // Hàng áp chót
  let centralCannon = false;
  // Tìm pháo đầu (cột 4 - index 4)
  for (let r = 0; r < BOARD_ROWS; r++) {
    const p = board[r][4];
    if (p && p.color === color && p.type === PieceType.CANNON) {
      // Check nếu không có quân nào cản giữa pháo và tướng đối phương? (Khó check nhanh)
      // Tạm thời chỉ check existence
      centralCannon = true;
    }
  }

  if (centralCannon) {
    // Check Xe ở hàng họng (throat row)
    let chariotAtThroat = false;
    for (let c = 3; c <= 5; c++) {
      const p = board[throatRow][c];
      if (p && p.color === color && p.type === PieceType.CHARIOT) chariotAtThroat = true;
    }
    if (chariotAtThroat) score += 100; // Thiết môn thuyên
  }

  // 13. Nhị Quỷ (Two Ghosts)
  // Hai Xe hoặc Xe Pháo, Xe Tốt tấn công 2 góc sĩ (4,3) và (4,5) hoặc (7,3) và (7,5) ???
  // Throat points: (2,3) & (2,5) [Black attacking Red ?? No. Red palace is 7-9. Throat is 7 ??]
  // Palace: Red 7-9, Black 0-2.
  // Attack Red: Throat is 7. Attack Black: Throat is 2.
  if (board[throatRow][3]?.color === color && (board[throatRow][3]?.type === PieceType.CHARIOT || board[throatRow][3]?.type === PieceType.SOLDIER)) {
    if (board[throatRow][5]?.color === color && (board[throatRow][5]?.type === PieceType.CHARIOT || board[throatRow][5]?.type === PieceType.SOLDIER)) {
      score += 80; // Nhị quỷ
    }
  }

  return score;
};

// =====================================================
// ĐÁNH GIÁ BÀN CỜ CHUYÊN NGHIỆP (Updated)
// =====================================================

const evaluateBoard = (board: Board): number => {
  let score = 0;

  // 1. Phân tích giai đoạn trận đấu
  const totalPieces = countPieces(board);

  let pieceCount = 0;
  for (let r = 0; r < BOARD_ROWS; r++) for (let c = 0; c < BOARD_COLS; c++) if (board[r][c]) pieceCount++;

  let phase: 'OPENING' | 'MIDGAME' | 'ENDGAME' = 'MIDGAME';
  if (totalPieces > 26) phase = 'OPENING';
  else if (totalPieces < 16) phase = 'ENDGAME';

  // 2. Đánh giá cơ bản (Material + Position)
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece) {
        let val = PIECE_VALUES_PRO[piece.type];

        // Điều chỉnh giá trị quân theo giai đoạn
        if (piece.type === PieceType.CHARIOT && phase === 'ENDGAME') val += 50;
        if (piece.type === PieceType.CANNON && phase === 'OPENING') val += 20;
        if (piece.type === PieceType.HORSE && phase === 'MIDGAME') val += 10;

        // Sửa rIdx: Vùng mục tiêu của mỗi bên là khác nhau. 
        // Bảng Bonus được định nghĩa cho bên đang tiến công (Hàng 0 là hàng xa nhất). 
        // Red (9 -> 0): Mục tiêu là hàng 0 => rIdx = r
        // Black (0 -> 9): Mục tiêu là hàng 9 => rIdx = 9 - r
        const rIdx = piece.color === Color.RED ? r : (9 - r);
        const bonus = POSITION_BONUS[piece.type][rIdx]?.[c] || 0;

        // Thêm đánh giá mobility (nhẹ) để tránh bị "đè"
        // Chỉ tính cho Xe/Mã/Pháo để tiết kiệm CPU
        let mobility = 0;
        if (piece.type === PieceType.CHARIOT || piece.type === PieceType.HORSE || piece.type === PieceType.CANNON) {
          mobility = getPieceMobility(board, r, c, piece);
        }

        const totalVal = val + bonus + (mobility * 2);

        if (piece.color === Color.BLACK) score += totalVal;
        else score -= totalVal;
      }
    }
  }

  // ===================================
  // ĐÁNH GIÁ TREO QUÂN (Hanging Pieces)
  // ===================================
  // Kiểm tra nhanh các quân giá trị cao (Xe, Pháo, Mã) có bị bắt mà không có bảo vệ không
  // Đây là phần quan trọng để tránh "đưa quân cho ăn"
  for (let r = 0; r < BOARD_ROWS; r++) {
    for (let c = 0; c < BOARD_COLS; c++) {
      const piece = board[r][c];
      if (piece && (piece.type === PieceType.CHARIOT || piece.type === PieceType.HORSE || piece.type === PieceType.CANNON)) {
        // Nếu là quân AI (Đen)
        if (piece.color === Color.BLACK) {                 // Kiểm tra có bị Đỏ tấn công không
          if (isSquareAttacked(board, { r, c }, Color.RED)) {
            // Nếu bị tấn công, kiểm tra có bảo vệ không?
            const protectedBy = isProtected(board, { r, c }, Color.BLACK);
            if (!protectedBy) {
              score -= PIECE_VALUES_PRO[piece.type] * 0.8; // Phạt nặng nếu không có bảo vệ
            }
            // (Đã xóa logic phạt Bad Trade để tránh lỗi nhận diện sai khi quân địch bị ghim)
            // Search sẽ tự tính toán việc đổi quân.
          }
        }
        // Nếu là quân Người (Đỏ) -> AI nên tấn công
        else {
          if (isSquareAttacked(board, { r, c }, Color.BLACK)) {
            const protectedBy = isProtected(board, { r, c }, Color.RED);
            if (!protectedBy) {
              score += PIECE_VALUES_PRO[piece.type] * 0.8;
            }
          }
        }
      }
    }
  }

  // 3. Đánh giá chiến lược & chiến thuật
  score += evaluateStrategic(board, Color.BLACK, phase);
  score -= evaluateStrategic(board, Color.RED, phase);

  // 4. Kiểm soát bờ sông
  score += evaluateRiverControl(board, Color.BLACK);
  score -= evaluateRiverControl(board, Color.RED);

  return score;
};

// Tìm danh sách quân tấn công (để so sánh giá trị)
const getAttackers = (board: Board, pos: Position, attackerColor: Color): Piece[] => {
  const attackers: Piece[] = [];
  // Reuse logic check attack but push to array
  // 1. Horse
  const horseMoves = [
    [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
    [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]
  ];
  for (const [dr, dc, legDr, legDc] of horseMoves) {
    const nr = pos.r + dr, nc = pos.c + dc;
    if (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      if (p && p.color === attackerColor && p.type === PieceType.HORSE) {
        const legR_rev = Math.abs(dr) === 2 ? pos.r + dr / 2 : pos.r;
        const legC_rev = Math.abs(dc) === 2 ? pos.c + dc / 2 : pos.c;
        if (!board[legR_rev][legC_rev]) attackers.push(p);
      }
    }
  }
  // 2. Straight (Xe/Pháo/Tốt/Tướng)
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    let r = pos.r + dr;
    let c = pos.c + dc;
    let piecesBetween = 0;
    while (isWithinBoard(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === attackerColor) {
          if (p.type === PieceType.CHARIOT && piecesBetween === 0) attackers.push(p);
          else if (p.type === PieceType.CANNON && piecesBetween === 1) attackers.push(p);
          else if (p.type === PieceType.SOLDIER && piecesBetween === 0) {
            // Check soldier dir
            const pawnDir = attackerColor === Color.RED ? 1 : -1; // Red moves up (r-1), Black moves down (r+1)
            // If attacker is at (r,c) and target is (pos.r, pos.c)
            // Vertical attack: attacker must be at (pos.r + pawnDir, pos.c)
            if (c === pos.c && r === pos.r + pawnDir) {
              attackers.push(p);
            }
            // Horizontal attack (if crossed river): attacker must be at (pos.r, pos.c +/- 1)
            const crossedRiver = attackerColor === Color.RED ? pos.r < 5 : pos.r > 4;
            if (crossedRiver && r === pos.r && Math.abs(c - pos.c) === 1) {
              attackers.push(p);
            }
          }
          else if (p.type === PieceType.KING && piecesBetween === 0 && Math.abs(r - pos.r) + Math.abs(c - pos.c) === 1) attackers.push(p);
        }
        piecesBetween++;
        if (piecesBetween > 1) break;
      }
      r += dr;
      c += dc;
    }
  }
  return attackers;
};

// Hàm phụ trợ: Kiểm tra ô có bị phe 'attackerColor' tấn công không
const isSquareAttacked = (board: Board, pos: Position, attackerColor: Color): boolean => {
  // Duyệt qua tất cả quân của attackerCOlor xem có quân nào đi được tới pos không
  // Để tối ưu, ta làm ngược lại: Từ pos, xem có quân nào của attackerColor có thể đánh tới không
  // (Giống logic checkmate)

  // 1. Kiểm tra Mã
  const horseMoves = [
    [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0],
    [1, 2, 0, 1], [1, -2, 0, -1], [-1, 2, 0, 1], [-1, -2, 0, -1]
  ];
  for (const [dr, dc, legDr, legDc] of horseMoves) {
    const nr = pos.r + dr, nc = pos.c + dc;
    const legR = pos.r + legDr, legC = pos.c + legDc;
    if (isWithinBoard(nr, nc)) {
      const p = board[nr][nc];
      // Lưu ý: Logic ngược. Mã đối phương ở (nr, nc) muốn đánh vào pos.
      // Chân mã phải không bị cản.
      // Chân mã từ (nr, nc) đến pos nằm ở (nr - legDr?, no). 
      // Mã từ A đến B thì chân ở C. Mã từ B đến A thì chân VẪN Ở C.
      // legDr, legDc là offset từ A->Chân.
      // Vậy từ B(nr,nc) đến A(pos) thì offset là -dr + legDr? No.
      // Check lại generateMovesForPiece: 
      // Target (nr, nc) = Current(r,c) + (dr, dc). Leg = Current + Leg.
      // Giờ ta đứng ở Target (pos). Tìm Source (nr, nc).
      // Source = Target - (dr, dc) = pos - (dr, dc).
      // Leg = Source + Leg = pos - (dr, dc) + (legDr, legDc).
      // Nhưng ta loop dr, dc là hướng TỪ pos RA.
      // Nên nếu ở (pos+dr, pos+dc) có Mã địch, thì nó đánh vào pos?
      // Mã ở A đánh B nếu valid. Mã ở B đánh A nếu valid.
      // Valid A<->B symmetric if no blocks.
      // Block logic: Chân mã là trung điểm của chiều dài L.
      const pAtSource = board[nr][nc];
      if (pAtSource && pAtSource.color === attackerColor && pAtSource.type === PieceType.HORSE) {
        // Check block
        // Source = nr, nc. Dest = pos.
        // Vector = pos - source = (-dr, -dc).
        // Abs dr, dc vẫn thế.
        // Leg của Source->Dest: Source + (dr/2 ??).
        // Ta có dr, dc là từ POS -> SOURCE.
        // Vậy vector SOURCE -> POS là (-dr, -dc).
        // Chiều dài 2 là theo chiều dọc hay ngang?
        // Nếu |dr| = 2 -> Leg ở r + dr/2. (r ở đây là pos). 
        // KO PHẢI. Leg tính từ Source.
        // Source = pos + dr. Dest = pos.
        // Leg = Source + (delta/2).
        // Delta = Dest - Source = -dr, -dc.
        // Leg = (pos + dr) + (-dr/2) = pos + dr/2.
        // => Leg position relative to POS is exactly dr/2, dc/2.
        const checkLegR = pos.r + dr / 2; // dr/2 vẫn đúng vì dr là +/- 2
        const checkLegC = pos.c + dc / 2; // dc/2 đúng.
        // Nhưng loop dr, dc ở trên là [2, 1]...
        // Nếu dr=2, dc=1. Thì checkLegR = pos.r + 1. checkLegC = pos.c + 0.5 (sai).
        // Logic horseMoves ở trên là: dr, dc là Target Offset. legDr là Leg Offset.
        // Leg Offset luôn là 0 hoặc 1.
        // Check lại logic generateMovesForPiece.
        // dr=2, dc=1 => legDr=1, legDc=0.
        // Leg = r+1, c+0.
        // Vậy nếu ta làm ngược: Ta tìm Mã ở (r+dr, c+dc). 
        // Thì chân mã để nó đánh vào r,c nằm ở đâu?
        // Nó đi từ (r+dr, c+dc) đến (r,c).
        // Vector di chuyển: (-dr, -dc).
        // Chân nằm ở (r+dr, c+dc) + halfVector.
        // = r+dr - dr/2 = r + dr/2. 
        // = c+dc - dc/2 = c + dc/2.
        // Nếu dr=2 => Leg ở r+1. Nếu dr=1 => Leg ở r. (Lưu ý int division).
        // Với JS, 1/2 = 0.5. Cần Math.trunc hoặc check |dr|=2.

        const legR_rev = Math.abs(dr) === 2 ? pos.r + dr / 2 : pos.r; // Nếu dr=2 -> Leg cách pos 1. Nếu dr=1 -> Leg ngang hàng pos.
        const legC_rev = Math.abs(dc) === 2 ? pos.c + dc / 2 : pos.c;

        if (!board[legR_rev][legC_rev]) return true;
      }
    }
  }

  // 2. Kiểm tra Xe/Pháo (dọc/ngang)
  for (const [dr, dc] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
    let r = pos.r + dr;
    let c = pos.c + dc;
    let piecesBetween = 0;

    while (isWithinBoard(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === attackerColor) {
          if (p.type === PieceType.CHARIOT && piecesBetween === 0) return true;
          if (p.type === PieceType.CANNON && piecesBetween === 1) return true;
        }
        piecesBetween++;
        if (piecesBetween > 1) break; // Pháo chỉ cần 1 ngòi
      }
      r += dr;
      c += dc;
    }
  }

  // 3. Kiểm tra Tốt (chỉ đi tới)
  // Tốt địch ở đâu có thể ăn vào pos?
  // Nếu địch là ĐỎ (ở dưới, đi lên). Tốt Đỏ ở (r+1) có thể đánh vào r? Có.
  // Tốt Đỏ chỉ ăn lên. Nên Source phải ở High Row hơn (nếu Red at bottom).
  // ... Chờ chút. Red at 7-9. Go UP (row 0).
  // Tốt Đỏ ở r+1 đánh vào r.
  // Nếu địch là ĐEN (ở trên, đi xuống). Tốt Đen ở r-1 đánh vào r.

  const pawnDir = attackerColor === Color.RED ? 1 : -1; // Red đánh lên (-dr), nhưng ta tìm nguồn nên là +1?
  // Red moves r -> r-1. So Source of Red attack on r is r+1. Correct.
  if (isWithinBoard(pos.r + pawnDir, pos.c)) {
    const p = board[pos.r + pawnDir][pos.c];
    if (p && p.color === attackerColor && p.type === PieceType.SOLDIER) return true;
  }
  // Tốt ngang?
  // Nếu qua sông.
  // Red qua sông nếu r < 5. (Red moves up).
  // Nếu pos nằm ở vùng Red đã qua sông (tức pos.r < 5).
  // Thì Tốt Red ở pos.c +/- 1 cũng đánh được.
  // Lưu ý: Source p phải là đã qua sông.
  // Source p ở r, c+/-1. p.color Red. p passed river? (p.r < 5).
  // Vì Source.r = pos.r. Nên ta check pos.r.
  const crossedRiver = attackerColor === Color.RED ? pos.r < 5 : pos.r > 4;
  if (crossedRiver) {
    for (const dc of [-1, 1]) {
      if (isWithinBoard(pos.r, pos.c + dc)) {
        const p = board[pos.r][pos.c + dc];
        if (p && p.color === attackerColor && p.type === PieceType.SOLDIER) return true;
      }
    }
  }

  // 4. Tướng (Face-to-face)? Bỏ qua vì evaluateBoard gọi trong search đã check.

  return false;
};

// Hàm phụ trợ: Kiểm tra ô có được bảo vệ bởi phe 'defendColor' không
const isProtected = (board: Board, pos: Position, defendColor: Color): boolean => {
  // Tương tự isSquareAttacked nhưng là tìm quân CÙNG MÀU có thể đi vào pos
  return isSquareAttacked(board, pos, defendColor);
};


const applyMove = (board: Board, move: Move): Board => {
  const newBoard = board.map(row => [...row]);
  newBoard[move.to.r][move.to.c] = newBoard[move.from.r][move.from.c];
  newBoard[move.from.r][move.from.c] = null;
  return newBoard;
};

// =====================================================
// QUIESCENCE SEARCH (Tìm kiếm yên tĩnh)
// =====================================================

const quiescenceSearch = (board: Board, alpha: number, beta: number, isMaximizing: boolean): number => {
  const standPat = evaluateBoard(board);

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;
  }

  // Chỉ xem xét các nước ăn quân
  const moves = getLegalMoves(board, isMaximizing ? Color.BLACK : Color.RED);
  const captures = moves.filter(m => board[m.to.r][m.to.c] !== null);

  // Sắp xếp theo giá trị quân bị ăn
  captures.sort((a, b) => {
    const valA = board[a.to.r][a.to.c] ? PIECE_VALUES_PRO[board[a.to.r][a.to.c]!.type] : 0;
    const valB = board[b.to.r][b.to.c] ? PIECE_VALUES_PRO[board[b.to.r][b.to.c]!.type] : 0;
    return valB - valA;
  });

  for (const move of captures.slice(0, 8)) { // Tăng lên 8 nước ăn để tránh sót đòn
    const nextBoard = applyMove(board, move);
    const score = quiescenceSearch(nextBoard, alpha, beta, !isMaximizing);

    if (isMaximizing) {
      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    } else {
      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
  }

  return isMaximizing ? alpha : beta;
};

// =====================================================
// NEGAMAX VỚI ALPHA-BETA VÀ TRANSPOSITION TABLE
// =====================================================

// =====================================================
// AI STATE (History & Killer)
// =====================================================
const historyTable = Array.from({ length: 90 }, () => Array(90).fill(0)); // Maps 0..89 (r*9+c)
const killerMoves: Move[][] = Array.from({ length: 20 }, () => []); // Max depth 20

const getMoveIndex = (m: Move) => m.from.r * 9 + m.from.c;
const getDestIndex = (m: Move) => m.to.r * 9 + m.to.c;

// =====================================================
// QUANTUM SEARCH (NEGAMAX + OPTIMIZATIONS)
// =====================================================

const negamax = (
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number => {
  const alphaOrig = alpha;
  const hash = getBoardHash(board);

  // 1. Transposition Table Lookup
  const ttEntry = transpositionTable.get(hash);
  if (ttEntry && ttEntry.depth >= depth) {
    if (ttEntry.flag === 'EXACT') return ttEntry.score;
    if (ttEntry.flag === 'LOWERBOUND') alpha = Math.max(alpha, ttEntry.score);
    else if (ttEntry.flag === 'UPPERBOUND') beta = Math.min(beta, ttEntry.score);
    if (alpha >= beta) return ttEntry.score;
  }

  if (depth <= 0) {
    return quiescenceSearch(board, alpha, beta, isMaximizing);
  }

  // 2. NULL MOVE PRUNING
  const inCheck = isInCheck(board, isMaximizing ? Color.BLACK : Color.RED);
  if (!inCheck && depth >= 4 && countPieces(board) > 10) { // Tăng depth min lên 4
    const R = 2;
    const score = -negamax(board, depth - 1 - R, -beta, -beta + 1, !isMaximizing);

    if (score >= beta) return beta; // Prune
  }

  const moves = getLegalMoves(board, isMaximizing ? Color.BLACK : Color.RED);
  if (moves.length === 0) return isMaximizing ? -20000 : 20000;

  // 4. MOVE ORDERING (QUAN TRỌNG)
  moves.sort((a, b) => {
    // 1. TT Move
    if (ttEntry?.bestMove) {
      if (isSameMove(a, ttEntry.bestMove)) return -10000;
      if (isSameMove(b, ttEntry.bestMove)) return 10000;
    }

    // 2. Captures (MVV-LVA)
    const targetA = board[a.to.r][a.to.c];
    const targetB = board[b.to.r][b.to.c];
    const valA = targetA ? PIECE_VALUES_PRO[targetA.type] : 0;
    const valB = targetB ? PIECE_VALUES_PRO[targetB.type] : 0;
    const diff = valB - valA;
    if (diff !== 0) return diff;

    // 3. Killer Moves
    if (isKillerMove(a, depth)) return -500;
    if (isKillerMove(b, depth)) return 500;

    // 4. History Heuristic
    const histA = historyTable[getMoveIndex(a)][getDestIndex(a)] || 0;
    const histB = historyTable[getMoveIndex(b)][getDestIndex(b)] || 0;
    return histB - histA;
  });

  let bestScore = -Infinity;
  let bestMove: Move | null = null;

  for (const move of moves) {
    const nextBoard = applyMove(board, move);

    // CHECK EXTENSION (Chiếu tướng gia hạn độ sâu)
    // Nếu nước đi tạo ra chiếu tướng, ta không giảm độ sâu (newDepth = depth)
    // Để AI tiếp tục đào sâu dòng sát cục.
    const givesCheck = isInCheck(nextBoard, isMaximizing ? Color.RED : Color.BLACK);
    const newDepth = givesCheck ? depth : depth - 1;

    let score = -negamax(nextBoard, newDepth, -beta, -alpha, !isMaximizing);

    // Nếu dùng PVS:
    // if (index > 0) {
    //    score = -negamax(nextBoard, depth-1, -alpha-1, -alpha, !max);
    //    if (score > alpha && score < beta) score = -negamax...
    // }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }

    if (score > alpha) {
      alpha = score;
    }

    if (alpha >= beta) {
      // BETA CUTOFF
      // Update Killer Moves
      if (!board[move.to.r][move.to.c]) { // Quiet move
        storeKillerMove(move, depth);
        // Update History
        historyTable[getMoveIndex(move)][getDestIndex(move)] += depth * depth;
      }
      break;
    }
  }

  // Lưu vào bảng băm (FIFO purging if full)
  if (transpositionTable.size >= MAX_TT_SIZE) {
    const firstKey = transpositionTable.keys().next().value;
    if (firstKey !== undefined) transpositionTable.delete(firstKey);
  }

  let flag: 'EXACT' | 'LOWERBOUND' | 'UPPERBOUND' = 'EXACT';
  if (bestScore <= alphaOrig) flag = 'UPPERBOUND';
  else if (bestScore >= beta) flag = 'LOWERBOUND';

  transpositionTable.set(hash, { depth, score: bestScore, flag, bestMove });

  return isMaximizing ? bestScore : -bestScore;
};

// Helpers for Heuristics
const isSameMove = (a: Move, b: Move) => a.from.r === b.from.r && a.from.c === b.from.c && a.to.r === b.to.r && a.to.c === b.to.c;

const isKillerMove = (m: Move, depth: number) => {
  if (!killerMoves[depth]) return false;
  return killerMoves[depth].some(k => isSameMove(k, m));
}

const storeKillerMove = (m: Move, depth: number) => {
  if (!killerMoves[depth]) killerMoves[depth] = [];
  // Keep last 2 killers
  if (!killerMoves[depth].some(k => isSameMove(k, m))) {
    killerMoves[depth].unshift(m);
    if (killerMoves[depth].length > 2) killerMoves[depth].pop();
  }
}

// =====================================================
// CỜ PHỔ - OPENING BOOK
// =====================================================

interface OpeningMove {
  from: Position;
  to: Position;
}

// Các khai cuộc phổ biến cho AI (Đen)
const OPENINGS: OpeningMove[][] = [
  // 1. Pháo đầu (Central Cannon)
  [
    { from: { r: 2, c: 7 }, to: { r: 2, c: 4 } },
    { from: { r: 0, c: 1 }, to: { r: 2, c: 2 } },
    { from: { r: 0, c: 0 }, to: { r: 1, c: 0 } }, // Xe hoành
  ],
  // 2. Bình phong mã (Screen Horse Defense)
  [
    { from: { r: 0, c: 1 }, to: { r: 2, c: 2 } },
    { from: { r: 0, c: 7 }, to: { r: 2, c: 6 } },
    { from: { r: 2, c: 1 }, to: { r: 2, c: 4 } }, // Pháo vào giữ (hoặc tốt lên)
  ],
  // 3. Tiên nhân chỉ lộ (Angel points the way - Tốt 3/7 tấn 1)
  [
    { from: { r: 3, c: 4 }, to: { r: 4, c: 4 } }, // Tốt đầu (hoặc tốt 3)
    { from: { r: 0, c: 1 }, to: { r: 2, c: 2 } },
  ],
  // 4. Phản cung mã (Sandwich Horse)
  [
    { from: { r: 0, c: 1 }, to: { r: 2, c: 2 } },
    { from: { r: 0, c: 7 }, to: { r: 2, c: 6 } },
    { from: { r: 2, c: 1 }, to: { r: 1, c: 3 } }, // Pháo giác
  ],
  // 5. Thuận Pháo (Same Direction Cannon) - Đối công
  [
    { from: { r: 2, c: 7 }, to: { r: 2, c: 4 } }, // Pháo 8 bình 5
    { from: { r: 0, c: 0 }, to: { r: 1, c: 0 } }, // Xe 9 tấn 1 (Xe hoành)
  ],
  // 6. Nghịch Pháo (Opposite Direction Cannon)
  [
    { from: { r: 2, c: 1 }, to: { r: 2, c: 4 } }, // Pháo 2 bình 5
    { from: { r: 0, c: 1 }, to: { r: 2, c: 2 } }, // Mã 2 tấn 3
  ]
];

// Tìm nước đi từ cờ phổ
const getOpeningMove = (board: Board): Move | null => {
  const pieceCount = countPieces(board);

  // Chỉ dùng cờ phổ khi còn đầy đủ quân (32 hoặc gần đó)
  if (pieceCount < 28) return null;

  // Chọn ngẫu nhiên 1 khai cuộc
  const openingIndex = Math.floor(Math.random() * OPENINGS.length);
  const opening = OPENINGS[openingIndex];

  // Tìm nước đi hợp lệ và an toàn từ khai cuộc
  for (const move of opening) {
    const piece = board[move.from.r]?.[move.from.c];
    if (piece && piece.color === Color.BLACK) {
      // Kiểm tra nước đi có hợp lệ không
      const legalMoves = getLegalMoves(board, Color.BLACK);
      const isValid = legalMoves.some(m =>
        m.from.r === move.from.r && m.from.c === move.from.c &&
        m.to.r === move.to.r && m.to.c === move.to.c
      );

      if (isValid) {
        // SAFETY CHECK: Kiểm tra nước đi có an toàn không
        // Giả lập nước đi của AI (Đen)
        const nextBoard = applyMove(board, move);

        // Sau khi Đen đi, đến lượt Đỏ. Đỏ sẽ tìm nước tốt nhất cho Đỏ (Minimize score).
        // Gọi Quiescence Search với isMaximizing = false (Đỏ đi).
        // Hàm trả về giá trị bàn cờ (thấp = tốt cho Đỏ).
        const score = quiescenceSearch(nextBoard, -Infinity, Infinity, false);

        // Nếu điểm số rớt xuống dưới -50 (tức là Đỏ bắt đầu dẫn điểm) -> Nguy hiểm.
        // Blunder check.
        if (score > -50) {
          return move;
        } else {
          console.log("Skipping unsafe opening move:", move, "Score:", score);
        }
      }
    }
  }

  return null;
};

// =====================================================
// TÌM NƯỚC ĐI TỐT NHẤT (SMART & FAST)
// =====================================================

export const findBestMove = (board: Board, maxDepth: number, isMaximizing: boolean): Move | null => {
  const startTime = Date.now();
  const TIME_LIMIT = 1200; // Tăng lên 1.2s để AI tính sâu hơn

  // 1. Use Opening Book (Safe Mode)
  if (isMaximizing && countPieces(board) > 28) {
    const openingMove = getOpeningMove(board);
    if (openingMove && Math.random() < 0.9) return openingMove;
  }

  // 2. Iterative Deepening
  const moves = getLegalMoves(board, isMaximizing ? Color.BLACK : Color.RED);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  // Start with depth 1, go as deep as time allows
  // Max depth 10 is usually enough for <1s JS engine
  for (let depth = 1; depth <= 8; depth++) {
    let alpha = -Infinity;
    let beta = Infinity;
    let currentBestMove: Move | null = null;
    let currentBestScore = -Infinity;
    let depthCompleted = true; // Flag to check if current depth iteration completed

    // Move ordering optimization for root node
    moves.sort((a, b) => {
      // 1. PV Move from previous iteration (bestMove)
      if (bestMove && a.from.r === bestMove.from.r && a.from.c === bestMove.from.c && a.to.r === bestMove.to.r && a.to.c === bestMove.to.c) return -10000;
      if (bestMove && b.from.r === bestMove.from.r && b.from.c === bestMove.from.c && b.to.r === bestMove.to.r && b.to.c === bestMove.to.c) return 10000;

      // 2. Captures MVV-LVA
      const targetA = board[a.to.r][a.to.c];
      const targetB = board[b.to.r][b.to.c];
      const valA = targetA ? PIECE_VALUES_PRO[targetA.type] : 0;
      const valB = targetB ? PIECE_VALUES_PRO[targetB.type] : 0;
      return valB - valA;
    });

    for (const move of moves) {
      const nextBoard = applyMove(board, move);
      const score = isMaximizing
        ? negamax(nextBoard, depth - 1, alpha, beta, false)
        : -negamax(nextBoard, depth - 1, -beta, -alpha, true);

      // Time check inside loop to break early if timeout? 
      // Or just break loop after full iteration?
      // Better to finish the current root move?
      // If we timeout in the middle of a root move calc, the score is invalid.
      // So we generally check time at the start of new depth.

      if (score > currentBestScore) {
        currentBestScore = score;
        currentBestMove = move;
      }

      if (isMaximizing) {
        alpha = Math.max(alpha, score);
      } else {
        beta = Math.min(beta, score);
      }

      // Strict panic check
      if (Date.now() - startTime > TIME_LIMIT) {
        depthCompleted = false; // Mark current depth as incomplete
        break; // Break inner loop
      }
    }

    // Only update global best if we finished the iteration or found a better move
    // Actually if we timeout, the current depth results might be partial (but beta cutoff logic holds).
    // Safe strategy: Update best move from completed depths.

    if (depthCompleted) { // Only update if the full depth was searched within time
      bestMove = currentBestMove;
      bestScore = currentBestScore;
    } else {
      // If we timed out during this depth, we stop deepening.
      // The bestMove from the *previous* completed depth is already stored.
      // If it timed out on depth 1, and no bestMove was set, then currentBestMove is the best we have.
      if (!bestMove && currentBestMove) { // If no move from previous depths, take the partial one from depth 1
        bestMove = currentBestMove;
      }
      break; // Stop deepening
    }
  }

  // 3. BLUNDER CHECK (Safety Net)
  // Nếu nước đi tốt nhất dẫn đến việc bị ăn quân chủ lực ngay lập tức (Depth 1 check)
  // Thì hãy kiểm tra lại bằng Quiescence Search
  if (bestMove) {
    const tempBoard = applyMove(board, bestMove);
    // Check if opponent can capture something big immediately?
    // Use Quiescence Search from opponent perspective
    // Current AI is Maximizing (Black). Opponent is Minimizing (Red).
    // If we made a move, it's Red's turn. 
    // We want to know the resulting board value.

    const currentStaticScore = evaluateBoard(board);
    const resultingScore = quiescenceSearch(tempBoard, -Infinity, Infinity, !isMaximizing);

    // resultingScore is board value. 
    // If isMaximizing (Black), large positive is good.
    // After Black moves, it's Red turn (!isMaximizing).
    // quiescenceSearch will minimize the score for Red.
    // If the resulting score is, say, -500 (Red winning big), then Black blundered.

    if (resultingScore < currentStaticScore - 300) { // Lost > Cannon (285)
      // BLUNDER DETECTED!
      // Try to find a safer move (just 1-ply search for safety)
      // console.log("Blunder detected:", bestMove);
      const safeMoves = moves.filter(m => {
        const b = applyMove(board, m);
        // Check 1-ply deep
        const s = quiescenceSearch(b, -Infinity, Infinity, !isMaximizing);
        return s >= currentStaticScore - 100; // Accept small loss/positional change
      });

      if (safeMoves.length > 0) {
        // Pick the one with best static evaluation
        safeMoves.sort((a, b) => {
          const boardA = applyMove(board, a);
          const boardB = applyMove(board, b);
          return evaluateBoard(boardB) - evaluateBoard(boardA); // Descending score
        });
        return safeMoves[0];
      }
    }
  }

  return bestMove;
};

// Xóa bảng băm và cache khi bắt đầu ván mới
export const clearTranspositionTable = () => {
  transpositionTable.clear();
  // Xóa history table để tiết kiệm RAM
  for (let i = 0; i < 90; i++) {
    for (let j = 0; j < 90; j++) {
      historyTable[i][j] = 0;
    }
  }
  // Xóa killer moves
  for (let d = 0; d < killerMoves.length; d++) {
    killerMoves[d] = [];
  }
};
