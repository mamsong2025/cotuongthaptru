/**
 * Fairy-Stockfish WASM Wrapper for Xiangqi
 * Provides UCI interface to communicate with the engine
 */

import { Board, Color, Move, Position } from './types';
import { BOARD_ROWS, BOARD_COLS } from './constants';

// Lazy load ffish module
let ffishModule: any = null;
let ffishInstance: any = null;

/**
 * Initialize Fairy-Stockfish WASM module
 */
export async function initFairyStockfish(): Promise<boolean> {
    try {
        if (ffishModule) return true;

        // Dynamic import to avoid bundling issues
        const ffish = await import('ffish-es6');
        ffishModule = await ffish.default();

        console.log('[FairyStockfish] Module loaded successfully');
        return true;
    } catch (error) {
        console.error('[FairyStockfish] Failed to load module:', error);
        return false;
    }
}

/**
 * Convert internal board to FEN notation for Xiangqi
 * Standard Xiangqi FEN piece notation:
 * K/k = King (General), A/a = Advisor, E/e = Elephant
 * H/h = Horse, R/r = Rook (Chariot), C/c = Cannon, P/p = Pawn (Soldier)
 */
export function boardToFEN(board: Board, turn: Color): string {
    const pieceMap: Record<string, string> = {
        'KING_RED': 'K',
        'ADVISOR_RED': 'A',
        'ELEPHANT_RED': 'E',
        'HORSE_RED': 'H',
        'CHARIOT_RED': 'R',
        'CANNON_RED': 'C',
        'SOLDIER_RED': 'P',
        'KING_BLACK': 'k',
        'ADVISOR_BLACK': 'a',
        'ELEPHANT_BLACK': 'e',
        'HORSE_BLACK': 'h',
        'CHARIOT_BLACK': 'r',
        'CANNON_BLACK': 'c',
        'SOLDIER_BLACK': 'p',
    };

    let fen = '';
    for (let r = 0; r < BOARD_ROWS; r++) {
        let emptyCount = 0;
        for (let c = 0; c < BOARD_COLS; c++) {
            const piece = board[r][c];
            if (!piece) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                const key = `${piece.type}_${piece.color}`;
                fen += pieceMap[key] || '?';
            }
        }
        if (emptyCount > 0) fen += emptyCount;
        if (r < BOARD_ROWS - 1) fen += '/';
    }

    // Add turn indicator (w = red, b = black in Xiangqi FEN)
    fen += turn === Color.RED ? ' w' : ' b';

    // Add move counters (simplified)
    fen += ' - - 0 1';

    return fen;
}

/**
 * Convert UCI move notation to internal Move format
 * UCI format: e.g., "e3e4" (from column e, row 3 to column e, row 4)
 */
export function uciToMove(uci: string): Move | null {
    if (!uci || uci.length < 4) return null;

    try {
        // UCI format: "a0b1" where a-i are columns (0-8), 0-9 are rows
        const fromCol = uci.charCodeAt(0) - 'a'.charCodeAt(0);
        const fromRow = parseInt(uci[1]);
        const toCol = uci.charCodeAt(2) - 'a'.charCodeAt(0);
        const toRow = parseInt(uci[3]);

        return {
            from: { r: fromRow, c: fromCol },
            to: { r: toRow, c: toCol }
        };
    } catch (error) {
        console.error('[FairyStockfish] Failed to parse UCI move:', uci, error);
        return null;
    }
}

/**
 * Convert internal Move to UCI notation
 */
export function moveToUCI(move: Move): string {
    const fromCol = String.fromCharCode('a'.charCodeAt(0) + move.from.c);
    const toCol = String.fromCharCode('a'.charCodeAt(0) + move.to.c);
    return `${fromCol}${move.from.r}${toCol}${move.to.r}`;
}

/**
 * Get best move from Fairy-Stockfish
 */
export async function getFairyStockfishMove(
    board: Board,
    turn: Color,
    depth: number = 10,
    timeMs: number = 3000
): Promise<Move | null> {
    try {
        if (!ffishModule) {
            const initialized = await initFairyStockfish();
            if (!initialized) {
                console.error('[FairyStockfish] Engine not initialized');
                return null;
            }
        }

        // Create new board instance for this position
        const fen = boardToFEN(board, turn);
        console.log('[FairyStockfish] Position FEN:', fen);

        // Create board with xiangqi variant
        const ffishBoard = new ffishModule.Board('xiangqi', fen);

        // Set search parameters
        const searchParams = {
            depth: depth,
            nodes: 0, // unlimited nodes
            time: timeMs,
        };

        console.log(`[FairyStockfish] Searching with depth=${depth}, time=${timeMs}ms`);

        // Get best move
        const uciMove = ffishBoard.bestMove(searchParams);

        if (!uciMove) {
            console.warn('[FairyStockfish] No move returned');
            return null;
        }

        console.log('[FairyStockfish] Best move (UCI):', uciMove);

        // Convert UCI to internal format
        const move = uciToMove(uciMove);

        // Clean up
        ffishBoard.delete();

        return move;
    } catch (error) {
        console.error('[FairyStockfish] Error getting move:', error);
        return null;
    }
}

/**
 * Evaluate current position
 */
export async function evaluatePosition(board: Board, turn: Color): Promise<number> {
    try {
        if (!ffishModule) {
            await initFairyStockfish();
        }

        const fen = boardToFEN(board, turn);
        const ffishBoard = new ffishModule.Board('xiangqi', fen);

        // Get evaluation (in centipawns)
        const eval_score = ffishBoard.evaluate();

        ffishBoard.delete();

        return eval_score;
    } catch (error) {
        console.error('[FairyStockfish] Error evaluating position:', error);
        return 0;
    }
}

/**
 * Check if Fairy-Stockfish is available
 */
export function isFairyStockfishAvailable(): boolean {
    return ffishModule !== null;
}
