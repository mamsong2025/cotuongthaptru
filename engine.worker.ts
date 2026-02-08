import { findBestMove, clearTranspositionTable } from './engine';
import { getFairyStockfishMove, initFairyStockfish } from './fairyStockfish';
import { Board, Color } from './types';

let useFairyStockfish = false;
let fairyStockfishReady = false;

// Initialize Fairy-Stockfish on worker startup
(async () => {
    try {
        console.log('[Worker] Initializing Fairy-Stockfish WASM...');
        fairyStockfishReady = await initFairyStockfish();
        if (fairyStockfishReady) {
            console.log('[Worker] ✅ Fairy-Stockfish ready! Using NNUE engine.');
            useFairyStockfish = true;
        } else {
            console.log('[Worker] ⚠️ Fairy-Stockfish not available, using fallback engine.');
        }
    } catch (error) {
        console.error('[Worker] Failed to initialize Fairy-Stockfish:', error);
        useFairyStockfish = false;
    }
})();

self.onmessage = async (e: MessageEvent) => {
    const { type, board, depth, isMaximizing, turn, useFairy } = e.data;

    if (type === 'findBestMove') {
        try {
            let bestMove;

            // Use Fairy-Stockfish if available and requested
            if (useFairy !== false && useFairyStockfish && fairyStockfishReady) {
                console.log('[Worker] Using Fairy-Stockfish NNUE engine');
                const color = turn || (isMaximizing ? Color.BLACK : Color.RED);

                // Tăng thời gian suy nghĩ: 1 giây cho mỗi depth, tối đa 15 giây
                const timeMs = Math.min(depth * 1000, 15000);

                // Tăng depth thực tế gửi cho engine (X2.5 lần tham số đầu vào)
                bestMove = await getFairyStockfishMove(board, color, depth * 2.5, timeMs);

                if (!bestMove) {
                    console.warn('[Worker] Fairy-Stockfish returned no move, falling back to original engine');
                    bestMove = findBestMove(board, depth, isMaximizing);
                }
            } else {
                console.log('[Worker] Using original engine');
                bestMove = findBestMove(board, depth, isMaximizing);
            }

            self.postMessage({ type: 'bestMove', move: bestMove });
        } catch (error) {
            console.error('[Worker] Error:', error);
            self.postMessage({ type: 'error', error: String(error) });
        }
    } else if (type === 'clear') {
        clearTranspositionTable();
    } else if (type === 'setEngine') {
        // Allow switching engines on the fly
        const { engine } = e.data;
        if (engine === 'fairy' && fairyStockfishReady) {
            useFairyStockfish = true;
            self.postMessage({ type: 'engineSet', engine: 'fairy' });
        } else {
            useFairyStockfish = false;
            self.postMessage({ type: 'engineSet', engine: 'original' });
        }
    } else if (type === 'getEngineStatus') {
        self.postMessage({
            type: 'engineStatus',
            fairyReady: fairyStockfishReady,
            currentEngine: useFairyStockfish ? 'fairy' : 'original'
        });
    }
};
