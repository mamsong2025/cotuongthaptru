
import { findBestMove, clearTranspositionTable } from './engine';
import { Board } from './types';

self.onmessage = (e: MessageEvent) => {
    const { type, board, depth, isMaximizing } = e.data;

    if (type === 'findBestMove') {
        try {
            const bestMove = findBestMove(board, depth, isMaximizing);
            self.postMessage({ type: 'bestMove', move: bestMove });
        } catch (error) {
            console.error('Worker error:', error);
            self.postMessage({ type: 'error', error: String(error) });
        }
    } else if (type === 'clear') {
        clearTranspositionTable();
    }
};
