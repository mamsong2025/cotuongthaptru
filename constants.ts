
import { PieceType, Color, Board } from './types';

export const BOARD_ROWS = 10;
export const BOARD_COLS = 9;

export const PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.KING]: 10000,
  [PieceType.CHARIOT]: 900,
  [PieceType.CANNON]: 450,
  [PieceType.HORSE]: 400,
  [PieceType.ELEPHANT]: 200,
  [PieceType.ADVISOR]: 200,
  [PieceType.SOLDIER]: 100,
};

// Initial state: Red at the bottom (Rows 6-9), Black at the top (Rows 0-3)
export const INITIAL_BOARD: Board = [
  // Row 0 (Black Back Rank)
  [
    { type: PieceType.CHARIOT, color: Color.BLACK, id: 'b-r1' },
    { type: PieceType.HORSE, color: Color.BLACK, id: 'b-h1' },
    { type: PieceType.ELEPHANT, color: Color.BLACK, id: 'b-e1' },
    { type: PieceType.ADVISOR, color: Color.BLACK, id: 'b-a1' },
    { type: PieceType.KING, color: Color.BLACK, id: 'b-k' },
    { type: PieceType.ADVISOR, color: Color.BLACK, id: 'b-a2' },
    { type: PieceType.ELEPHANT, color: Color.BLACK, id: 'b-e2' },
    { type: PieceType.HORSE, color: Color.BLACK, id: 'b-h2' },
    { type: PieceType.CHARIOT, color: Color.BLACK, id: 'b-r2' },
  ],
  // Row 1
  new Array(9).fill(null),
  // Row 2 (Black Cannons)
  [
    null, { type: PieceType.CANNON, color: Color.BLACK, id: 'b-c1' }, null, null, null, null, null, { type: PieceType.CANNON, color: Color.BLACK, id: 'b-c2' }, null
  ],
  // Row 3 (Black Soldiers)
  [
    { type: PieceType.SOLDIER, color: Color.BLACK, id: 'b-s1' }, null, { type: PieceType.SOLDIER, color: Color.BLACK, id: 'b-s2' }, null, { type: PieceType.SOLDIER, color: Color.BLACK, id: 'b-s3' }, null, { type: PieceType.SOLDIER, color: Color.BLACK, id: 'b-s4' }, null, { type: PieceType.SOLDIER, color: Color.BLACK, id: 'b-s5' }
  ],
  // Empty Rows 4, 5 (River)
  new Array(9).fill(null),
  new Array(9).fill(null),
  // Row 6 (Red Soldiers)
  [
    { type: PieceType.SOLDIER, color: Color.RED, id: 'r-s1' }, null, { type: PieceType.SOLDIER, color: Color.RED, id: 'r-s2' }, null, { type: PieceType.SOLDIER, color: Color.RED, id: 'r-s3' }, null, { type: PieceType.SOLDIER, color: Color.RED, id: 'r-s4' }, null, { type: PieceType.SOLDIER, color: Color.RED, id: 'r-s5' }
  ],
  // Row 7 (Red Cannons)
  [
    null, { type: PieceType.CANNON, color: Color.RED, id: 'r-c1' }, null, null, null, null, null, { type: PieceType.CANNON, color: Color.RED, id: 'r-c2' }, null
  ],
  // Row 8
  new Array(9).fill(null),
  // Row 9 (Red Back Rank)
  [
    { type: PieceType.CHARIOT, color: Color.RED, id: 'r-r1' },
    { type: PieceType.HORSE, color: Color.RED, id: 'r-h1' },
    { type: PieceType.ELEPHANT, color: Color.RED, id: 'r-e1' },
    { type: PieceType.ADVISOR, color: Color.RED, id: 'r-a1' },
    { type: PieceType.KING, color: Color.RED, id: 'r-k' },
    { type: PieceType.ADVISOR, color: Color.RED, id: 'r-a2' },
    { type: PieceType.ELEPHANT, color: Color.RED, id: 'r-e2' },
    { type: PieceType.HORSE, color: Color.RED, id: 'r-h2' },
    { type: PieceType.CHARIOT, color: Color.RED, id: 'r-r2' },
  ],
];

export const PIECE_SYMBOLS: Record<Color, Record<PieceType, string>> = {
  [Color.RED]: {
    [PieceType.KING]: '帥',
    [PieceType.ADVISOR]: '仕',
    [PieceType.ELEPHANT]: '相',
    [PieceType.HORSE]: '傌',
    [PieceType.CHARIOT]: '俥',
    [PieceType.CANNON]: '炮',
    [PieceType.SOLDIER]: '兵',
  },
  [Color.BLACK]: {
    [PieceType.KING]: '將',
    [PieceType.ADVISOR]: '士',
    [PieceType.ELEPHANT]: '象',
    [PieceType.HORSE]: '馬',
    [PieceType.CHARIOT]: '車',
    [PieceType.CANNON]: '砲',
    [PieceType.SOLDIER]: '卒',
  }
};
