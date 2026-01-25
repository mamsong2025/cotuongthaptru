
export enum Color {
  RED = 'RED',
  BLACK = 'BLACK' // Representing the "Green/Blue" side in traditional terms, often called Black/Green
}

export enum PieceType {
  KING = 'KING',      // 帥 / 將
  ADVISOR = 'ADVISOR', // 仕 / 士
  ELEPHANT = 'ELEPHANT', // 相 / 象
  HORSE = 'HORSE',    // 傌 / 馬
  CHARIOT = 'CHARIOT', // 俥 / 車
  CANNON = 'CANNON',   // 炮 / 砲
  SOLDIER = 'SOLDIER'  // 兵 / 卒
}

export interface Piece {
  type: PieceType;
  color: Color;
  id: string;
}

export type Board = (Piece | null)[][];

export interface Position {
  r: number;
  c: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Piece;
}
