
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Color, Board as BoardType, Position, Move, PieceType } from './types';
import { INITIAL_BOARD } from './constants';
import { isValidMove, getLegalMoves, findBestMove, getPieceAt, clearTranspositionTable, isInCheck, isKingAlive } from './engine';
import Board from './components/Board';
import { getStrategicTalk, getIdleInsult, speakText, resetTalkHistory, setAIPersonality } from './geminiService';

const SOUNDS = {
  MOVE: '/audio/move.mp3',
  CAPTURE: '/audio/capture.mp3',
  WIN: '/audio/move.mp3', // Reuse move or find a win sound
  LOSS: '/audio/move.mp3', // Reuse move
  START: '/audio/move.mp3', // Reuse move
  BGM: '/audio/bgm.mp3'
};

// 10 giây mới nói 1 lần khi idle
const IDLE_LIMIT = 10000;

// Định nghĩa các tính cách AI
interface AIPersonality {
  name: string;
  depth: number;
  description: string;
  emoji: string;
}

const AI_PERSONALITIES: Record<string, AIPersonality> = {
  baby: {
    name: 'Bé Bi',
    depth: 2, // Giảm từ 3
    description: 'Đang học cờ',
    emoji: '👶',
  },
  student: {
    name: 'Tiểu Minh',
    depth: 3, // Giảm từ 5
    description: 'Học sinh giỏi',
    emoji: '🧒',
  },
  elder: {
    name: 'Ông Tư',
    depth: 4, // Giảm từ 7
    description: 'Cao thủ làng',
    emoji: '👴',
  },
  master: {
    name: 'Sư Phụ',
    depth: 4, // Giảm thêm để chạy mượt trên mobile
    description: 'Bậc thầy cờ tướng',
    emoji: '🧙',
  },
  demon: {
    name: 'Vua Cờ',
    depth: 5, // Giảm từ 6 -> Tránh lag cực nặng
    description: 'Siêu cao thủ',
    emoji: '🤖',
  },
  wise: {
    name: 'Nữ Hiền',
    depth: 5,
    description: 'Điềm tĩnh, nhẹ nhàng',
    emoji: '🧘‍♀️',
  },
  aggressive: {
    name: 'Nữ Mạnh Mẽ',
    depth: 5,
    description: 'Chủ động, tấn công',
    emoji: '🔥',
  },
  smart: {
    name: 'Nữ Thông Minh',
    depth: 5,
    description: 'Mưu lược, chiến thuật',
    emoji: '🧠',
  },
  tease: {
    name: 'Nữ Trêu Chọc',
    depth: 4,
    description: 'Cà khịa, trêu chọc',
    emoji: '😏',
  },
};

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(INITIAL_BOARD);
  const [turn, setTurn] = useState<Color>(Color.RED);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [lastMove, setLastMove] = useState<Move | null>(null);
  const [currentTalk, setCurrentTalk] = useState<{ text: string, mode: 'sweet' | 'toxic' }>({
    text: "Kính chào đại hiệp! Xin mời ngài khai cuộc!",
    mode: 'sweet'
  });
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showChat, setShowChat] = useState<boolean>(true);
  const [showOverlay, setShowOverlay] = useState<boolean>(true);
  const [aiKey, setAiKey] = useState<string>('elder');
  const [showMainMenu, setShowMainMenu] = useState<boolean>(true);
  const [showInGameMenu, setShowInGameMenu] = useState<boolean>(false);
  const [showAIListInMenu, setShowAIListInMenu] = useState<boolean>(false);
  const [menuPage, setMenuPage] = useState<'main' | 'selectAI'>('main');
  const [isBgmOn, setIsBgmOn] = useState<boolean>(true);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const talkOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const engineWorkerRef = useRef<Worker | null>(null);

  // Initialize Worker
  useEffect(() => {
    engineWorkerRef.current = new Worker(new URL('./engine.worker.ts', import.meta.url), { type: 'module' });

    return () => {
      engineWorkerRef.current?.terminate();
    };
  }, []);

  const currentAI = AI_PERSONALITIES[aiKey];

  const handleSelectAI = async (key: string) => {
    // Mobile Audio Resume
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume().catch(console.error);
    }

    setAiKey(key);
    setAIPersonality(key);
    setShowMainMenu(false);
    setShowInGameMenu(false);
    setShowAIListInMenu(false);
    resetGame();
    playSfx(SOUNDS.START);
  };



  const playWoodenSfx = (isCapture = false) => {
    if (isMuted || !audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    const knock = (timeOffset = 0, volume = 0.4, pitch = 220) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, ctx.currentTime + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, ctx.currentTime + timeOffset + 0.1);

      gain.gain.setValueAtTime(volume, ctx.currentTime + timeOffset);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime + timeOffset);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + timeOffset);
      osc.stop(ctx.currentTime + timeOffset + 0.12);
    };

    if (isCapture) {
      // Double knock for capture
      knock(0, 0.4, 200);
      knock(0.08, 0.3, 180);
    } else {
      // Single knock for move
      knock(0, 0.35, 220);
    }
  };

  const playSfx = (url: string) => {
    if (isMuted) return;

    // Intercept all board sounds to use the premium wooden synthesis
    if (url === SOUNDS.MOVE || url === SOUNDS.START) {
      playWoodenSfx(false);
      return;
    }
    if (url === SOUNDS.CAPTURE) {
      playWoodenSfx(true);
      return;
    }
    // For Win/Loss, we can do a special wooden sequence
    if (url === SOUNDS.WIN) {
      playWoodenSfx(false);
      setTimeout(() => playWoodenSfx(false), 150);
      setTimeout(() => playWoodenSfx(true), 300);
      return;
    }
    if (url === SOUNDS.LOSS) {
      playWoodenSfx(true);
      setTimeout(() => playWoodenSfx(false), 200);
      return;
    }

    const audio = new Audio(url);
    audio.volume = 0.4;
    audio.play().catch(() => { });
  };

  const triggerTalk = async (text: string, mode: 'sweet' | 'toxic') => {
    setCurrentTalk({ text, mode });
    setShowOverlay(true);

    // Hiển thị 8 giây theo animation (để người chơi kịp đọc)
    if (talkOverlayTimerRef.current) clearTimeout(talkOverlayTimerRef.current);
    talkOverlayTimerRef.current = setTimeout(() => {
      setShowOverlay(false);
      talkOverlayTimerRef.current = null;
    }, 8000);

    try {
      if (!isMuted && audioCtxRef.current && showChat) {
        await speakText(text, audioCtxRef.current, mode);
      }
    } catch (error) {
      console.error('[DEBUG] TTS error:', error);
    }
  };

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (turn === Color.RED && !gameOver) {
      idleTimerRef.current = setTimeout(async () => {
        try {
          const msg = await getIdleInsult();
          await triggerTalk(msg, 'sweet');
        } catch (error) {
          // Fallback message
          await triggerTalk("Đại hiệp ơi, còn đó không? Đến lượt ngài rồi!", 'sweet');
        }
        startIdleTimer(); // Restart timer
      }, IDLE_LIMIT);
    }
  }, [turn, gameOver, isMuted, showChat]);

  useEffect(() => {
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      } else if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => { });
      }

      // Initialize BGM if not already
      if (!bgmAudioRef.current) {
        bgmAudioRef.current = new Audio(SOUNDS.BGM);
        bgmAudioRef.current.loop = true;
        bgmAudioRef.current.volume = 0.2;
        if (isBgmOn && !isMuted) {
          bgmAudioRef.current.play().catch(console.error);
        }
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (bgmAudioRef.current) bgmAudioRef.current.pause();
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(() => { });
        }
      } else {
        if (isBgmOn && !isMuted && bgmAudioRef.current) {
          bgmAudioRef.current.play().catch(() => { });
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume().catch(() => { });
        }
      }
    };

    window.addEventListener('mousedown', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousedown', initAudio);
      window.removeEventListener('touchstart', initAudio);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isBgmOn, isMuted]);

  // Handle BGM changes
  useEffect(() => {
    if (bgmAudioRef.current) {
      if (isBgmOn && !isMuted) {
        bgmAudioRef.current.play().catch(() => { });
      } else {
        bgmAudioRef.current.pause();
      }
    }
  }, [isBgmOn, isMuted]);

  useEffect(() => {
    startIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (talkOverlayTimerRef.current) clearTimeout(talkOverlayTimerRef.current);
    };
  }, [startIdleTimer]);

  // Cập nhật tính cách AI khi thay đổi
  useEffect(() => {
    setAIPersonality(aiKey);
  }, [aiKey]);

  const triggerAiMove = useCallback(async (currentBoard: BoardType) => {
    if (isAiThinking || gameOver || !engineWorkerRef.current) return;

    setIsAiThinking(true);
    // Reset idle timer khi AI đang suy nghĩ
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    // Sử dụng Web Worker để tính toán nước đi
    engineWorkerRef.current.onmessage = async (e: MessageEvent) => {
      const { type, move: bestMove } = e.data;

      if (type === 'bestMove') {
        if (bestMove) {
          const newBoard = currentBoard.map(row => [...row]);
          const piece = newBoard[bestMove.from.r][bestMove.from.c];
          const captured = newBoard[bestMove.to.r][bestMove.to.c];

          newBoard[bestMove.to.r][bestMove.to.c] = piece;
          newBoard[bestMove.from.r][bestMove.from.c] = null;

          setBoard(newBoard);
          setLastMove(bestMove);
          setTurn(Color.RED);
          setIsAiThinking(false);

          playSfx(captured ? SOUNDS.CAPTURE : SOUNDS.MOVE);

          if (captured?.type === PieceType.KING) {
            setGameOver(`${currentAI.name} THẮNG! Ngươi thua rồi!`);
            playSfx(SOUNDS.LOSS);
            return;
          }

          const pieceNames: Record<PieceType, string> = {
            [PieceType.KING]: 'Tướng',
            [PieceType.ADVISOR]: 'Sĩ',
            [PieceType.ELEPHANT]: 'Tượng',
            [PieceType.HORSE]: 'Mã',
            [PieceType.CHARIOT]: 'Xe',
            [PieceType.CANNON]: 'Pháo',
            [PieceType.SOLDIER]: 'Tốt',
          };

          const isCheck = isInCheck(newBoard, Color.RED);
          const isCapture = !!captured;

          let context = "";
          let mode: 'sweet' | 'toxic' = 'toxic';

          if (isCheck) {
            context = "AI VỪA CHIẾU TƯỚNG! HÃY CHỬI MẠNH VÀO! DỌA NẠT ĐỐI THỦ!";
            if (isCapture) context += ` Kèm theo việc ăn mất quân ${pieceNames[captured.type].toUpperCase()} của nó!`;
          } else if (isCapture) {
            context = `AI VỪA ĂN ĐƯỢC QUÂN ${pieceNames[captured.type].toUpperCase()}! CHỬI NGU! CHÊ BAI KỸ NĂNG!`;
          } else {
            context = "AI vừa đi một nước thâm độc, đang giăng bẫy dụ địch.";
          }

          try {
            const talk = await getStrategicTalk(mode, context);
            await triggerTalk(talk, mode);
          } catch (error) {
            await triggerTalk("Haha! Ta đã tính trước nước này rồi!", mode);
          }

          startIdleTimer();
        } else {
          setGameOver("Ngươi thắng?! Chắc ta nương tay thôi!");
          playSfx(SOUNDS.WIN);
          setIsAiThinking(false);
        }
      }
    };

    engineWorkerRef.current.postMessage({
      type: 'findBestMove',
      board: currentBoard,
      depth: currentAI.depth,
      isMaximizing: true
    });
  }, [isMuted, currentAI, showChat, startIdleTimer, gameOver, isAiThinking]);

  const handleCellClick = async (pos: Position) => {
    if (gameOver || isAiThinking || turn !== Color.RED) return;

    const piece = getPieceAt(board, pos);
    if (piece && piece.color === Color.RED) {
      setSelectedPos(pos);
      return;
    }

    if (selectedPos) {
      const move: Move = { from: selectedPos, to: pos };
      // Kiểm tra nước đi có trong danh sách nước hợp lệ không (đã lọc chiếu tướng)
      const legalMoves = getLegalMoves(board, Color.RED);
      const isLegal = legalMoves.some(m =>
        m.from.r === move.from.r && m.from.c === move.from.c &&
        m.to.r === move.to.r && m.to.c === move.to.c
      );

      if (isLegal) {
        const newBoard = board.map(row => [...row]);
        const capturedByPlayer = newBoard[pos.r][pos.c];
        newBoard[pos.r][pos.c] = newBoard[selectedPos.r][selectedPos.c];
        newBoard[selectedPos.r][selectedPos.c] = null;

        setBoard(newBoard);
        setLastMove(move);
        setSelectedPos(null);
        setTurn(Color.BLACK);
        playSfx(capturedByPlayer ? SOUNDS.CAPTURE : SOUNDS.MOVE);

        // Kiểm tra ăn Tướng AI
        if (capturedByPlayer?.type === PieceType.KING) {
          setGameOver("🎉 Bạn thắng! Tướng AI đã bị ăn!");
          playSfx(SOUNDS.WIN);
          return;
        }

        triggerAiMove(newBoard);

        // Thoại AI sau khi người chơi đi
        const isCheck = isInCheck(newBoard, Color.BLACK);
        const isCapture = !!capturedByPlayer;

        let pMode: 'sweet' | 'toxic' = isCapture || isCheck ? 'toxic' : 'sweet';
        let pContext = isCheck ? "Người chơi vừa chiếu tướng AI! Hãy mỉa mau sự xấc xược này và dọa lật kèo!" :
          isCapture ? `Người chơi vừa ăn quân của AI. Hãy gắt gỏng, chửi nó là đồ ăn may!` :
            "Người chơi vừa đi một nước cờ bình thường. Hãy nói năng nhẹ nhàng, hỏi thăm hoặc nhận xét lịch sự.";

        try {
          const talk = await getStrategicTalk(pMode, pContext);
          await triggerTalk(talk, pMode);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSelectedPos(null);
      }
    }
  };

  const resetGame = () => {
    setBoard(INITIAL_BOARD);
    setTurn(Color.RED);
    setSelectedPos(null);
    setLastMove(null);
    setGameOver(null);
    setIsAiThinking(false);
    triggerTalk(`${currentAI.name} sẵn sàng! Mời ngài khai cuộc!`, 'sweet');
    setIsAiThinking(false);
    setShowOverlay(true);
    clearTranspositionTable();
    resetTalkHistory();
    playSfx(SOUNDS.START);
  };

  const handleAIChange = (key: string) => {
    setAiKey(key);
    resetTalkHistory();
    setCurrentTalk({
      text: `${AI_PERSONALITIES[key].name} xuất hiện! ${AI_PERSONALITIES[key].description}`,
      mode: 'sweet'
    });
    setShowOverlay(true);
  };

  if (showMainMenu) {
    // Sub-menu: Chọn đối thủ AI
    if (menuPage === 'selectAI') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 font-serif relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #efe3c6 0%, #d9c59a 100%)' }}
        >
          {/* Back Button */}
          <button
            onClick={() => setMenuPage('main')}
            className="absolute top-4 left-4 z-20 bg-white/50 hover:bg-white/80 text-[#2f4f3a] px-5 py-2 rounded-full border border-[#2f4f3a]/20 text-sm font-bold transition-all shadow-sm"
          >
            ← Trang chủ
          </button>

          {/* Container */}
          <div className="relative w-full max-w-sm z-10 p-8 rounded-3xl shadow-xl" style={{ background: '#f7efd8' }}>
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black uppercase tracking-widest" style={{ color: '#2f4f3a' }}>Chọn Đối Thủ</h2>
              <div className="w-12 h-1 bg-[#2f4f3a]/10 mx-auto mt-2 rounded-full" />
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {[
                { id: 'baby', title: 'Novice', sub: 'Mới tập chơi', label: '初學者' },
                { id: 'student', title: 'Apprentice', sub: 'Đang học nghề', label: '學徒' },
                { id: 'wise', title: 'Serene', sub: 'Nữ Hiền tinh anh', label: '賢者' },
                { id: 'aggressive', title: 'Warrior', sub: 'Nữ Mạnh Mẽ áp sát', label: '戰士' },
                { id: 'smart', title: 'Strategist', sub: 'Nữ Thông Minh mưu lược', label: '謀略' },
                { id: 'tease', title: 'Prankster', sub: 'Nữ Trêu Chọc cà khịa', label: '逗趣' },
                { id: 'elder', title: 'Amateur', sub: 'Thử thách cân bằng', label: '業餘' },
                { id: 'master', title: 'Professional', sub: 'Đối thủ kinh nghiệm', label: '專業' },
                { id: 'demon', title: 'Grandmaster', sub: 'Thử thách cực đại', label: '宗師' }
              ].map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => { playSfx(SOUNDS.MOVE); setMenuPage('main'); handleSelectAI(item.id); }}
                  className="w-full relative group overflow-hidden rounded-2xl py-4 px-5 border border-[#2f4f3a]/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
                  style={{
                    background: '#e8d9b0',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-xl shadow-inner">
                        {['📜', '⛑️', '🧘‍♀️', '🔥', '🧠', '😏', '🛡️', '⚔️', '👹'][idx]}
                      </div>
                      <div className="text-left">
                        <div className="font-bold tracking-wide" style={{ color: '#2f4f3a' }}>{item.title}</div>
                        <div className="text-[10px] uppercase font-bold opacity-40 ml-[1px]" style={{ color: '#2f4f3a' }}>{item.sub}</div>
                      </div>
                    </div>
                    <span className="text-xl font-black opacity-20" style={{ color: '#2f4f3a', fontFamily: "'Ma Shan Zheng', serif" }}>{item.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Main Menu - Cờ Tướng 01213
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #efe3c6 0%, #d9c59a 100%)' }}>

        {/* Subtle Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 rounded-full bg-green-900/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-sm rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-8 text-center relative z-10"
          style={{ background: '#f7efd8', border: '1px solid rgba(255,255,255,0.5)' }}>

          {/* LOGO */}
          <div className="mb-6 group">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
              style={{ background: '#e8d9b0' }}>
              <span className="text-4xl font-black" style={{ color: '#2f4f3a', fontFamily: "'Ma Shan Zheng', serif" }}>將</span>
            </div>
          </div>

          {/* TITLE & LOGO IMAGE */}
          <div className="flex flex-col items-center mb-2">
            <img
              src="/logo_co_tuong.png"
              alt="Cờ Tướng 01213"
              className="h-28 object-contain drop-shadow-md"
            />
            <h1 className="text-3xl font-bold tracking-tight mt-[-15px]"
              style={{ color: '#2f4f3a', fontFamily: 'Georgia, serif' }}>Cờ Tướng 01213</h1>
            <img
              src="/kinh_tang_lao_pa.png"
              alt="Kính tặng lão pa"
              className="h-10 md:h-12 object-contain mt-1"
            />
          </div>

          {/* STATS BAR */}
          <div className="flex justify-around text-[10px] font-bold uppercase tracking-widest mt-6 mb-8 py-2 border-y border-[#2f4f3a]/5"
            style={{ color: '#4a5f54' }}>
            <div className="flex items-center gap-1">👤 1 Người</div>
            <div className="flex items-center gap-1">🤖 AI</div>
            <div className="flex items-center gap-1">⚔️ Online</div>
          </div>

          {/* MENU BUTTONS */}
          <div className="space-y-4">
            <button
              onClick={() => { playSfx(SOUNDS.MOVE); setMenuPage('selectAI'); }}
              className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg transform transition-all active:scale-95 hover:translate-y-[-2px] hover:shadow-xl"
              style={{ background: 'linear-gradient(to bottom, #9ec4a8, #6e9c84)', color: '#ffffff' }}
            >
              Chơi nhanh
            </button>

            <button
              onClick={() => { playSfx(SOUNDS.MOVE); alert('Tính năng Chơi với bạn đang được phát triển!'); }}
              className="w-full py-4 rounded-2xl text-lg font-bold shadow-lg transform transition-all active:scale-95 hover:translate-y-[-2px] hover:shadow-xl"
              style={{ background: 'linear-gradient(to bottom, #f4d27a, #e3b74e)', color: '#4b3b12' }}
            >
              Chơi với bạn
            </button>

            <button
              onClick={() => { playSfx(SOUNDS.MOVE); alert('Cài đặt sẽ sớm ra mắt!'); }}
              className="w-full py-4 rounded-2xl text-lg font-bold transition-all active:scale-95 hover:bg-[#dfd0af]"
              style={{ background: '#e6dbc2', color: '#2f4f3a' }}
            >
              Cài đặt
            </button>
          </div>

          {/* FOOTER */}
          <div className="mt-8 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em]" style={{ color: '#6b6b6b' }}>
            © 2026 • Cờ Tướng 01213
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-4 px-2 font-sans overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #efe3c6 0%, #d9c59a 100%)',
      }}
    >
      {/* Header với tên AI tinh gọn */}
      <header className="mb-2 text-center z-20">
        <h1
          className="text-2xl md:text-3xl font-black uppercase flex items-center justify-center gap-2"
          style={{
            color: '#2f4f3a',
            textShadow: '0 1px 2px rgba(255,255,255,0.5)',
          }}
        >
          <span>{currentAI.emoji}</span>
          <span>{currentAI.name}</span>
        </h1>
        <p className="text-[#5c6f63] text-[10px] uppercase font-bold tracking-widest mt-1">
          {turn === Color.RED ? '⚔️ Lượt của bạn' : '🧠 AI đang tính...'}
        </p>

        {/* CHECK WARNING */}
        {isInCheck(board, Color.RED) && !gameOver && (
          <div className="mt-3 text-2xl md:text-4xl font-black text-yellow-400 animate-bounce uppercase tracking-tighter bg-red-600 px-6 py-2 rounded-full border-4 border-yellow-400 shadow-[0_0_30px_rgba(239,68,68,1)]">
            💀 CHIẾU TƯỚNG! 💀
          </div>
        )}
      </header>

      {/* Bàn cờ - Căn giữa chuẩn */}
      <div className="relative flex-1 flex items-center justify-center w-full my-2">
        <Board
          board={board}
          selectedPos={selectedPos}
          onCellClick={handleCellClick}
          lastMove={lastMove}
          legalMoves={selectedPos ? getLegalMoves(board, Color.RED).filter(m => m.from.r === selectedPos.r && m.from.c === selectedPos.c) : []}
          riverMessage={showOverlay && showChat ? currentTalk : null}
        />

        {isAiThinking && (
          <div className="absolute top-3 right-3 z-50">
            <div className="bg-black/80 px-2 py-1 border border-amber-500 flex items-center gap-2 rounded">
              <div className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[9px] font-bold text-amber-300">{currentAI.name} đang tính...</span>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[150] rounded-lg p-4 text-center">
            <h2 className="text-lg md:text-2xl font-black text-red-500 mb-4 uppercase">{gameOver}</h2>
            <button
              onClick={resetGame}
              className="bg-red-700 hover:bg-red-600 text-white font-bold py-2 px-6 text-sm border border-red-400 transition-all uppercase rounded"
            >
              PHỤC THÙ
            </button>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-3 flex items-center gap-2 flex-wrap justify-center relative z-10">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base transition-all ${isMuted
            ? 'border-gray-600 bg-gray-800 text-gray-500'
            : 'border-amber-500 bg-amber-900/30 text-amber-400'
            }`}
          title="Tắt/Mở âm thanh hiệu ứng"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>

        <button
          onClick={() => setIsBgmOn(!isBgmOn)}
          className={`w-9 h-9 rounded-lg border flex items-center justify-center text-base transition-all ${!isBgmOn || isMuted
            ? 'border-gray-600 bg-gray-800 text-gray-500'
            : 'border-blue-500 bg-blue-900/30 text-blue-400'
            }`}
          title="Tắt/Mở nhạc nền"
        >
          {isBgmOn && !isMuted ? '🎵' : '🔇'}
        </button>

        <button
          onClick={resetGame}
          className="h-9 px-4 bg-gradient-to-b from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white font-bold text-[10px] uppercase rounded-lg border border-red-500 transition-all shadow-lg"
        >
          🔄 Ván Mới
        </button>
      </div>

      {/* FOOTER CSS & MENU OVERLAY */}
      <style>{`
        .menu-btn {
          position: fixed;
          top: 16px;
          right: 16px;
          width: 44px;
          height: 44px;
          border-radius: 10px;
          border: none;
          background: rgba(0,0,0,0.6);
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .menu-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.25s ease;
        }

        .menu-overlay.show {
          opacity: 1;
          pointer-events: auto;
        }

        .menu-panel {
          width: 300px;
          background: #1c1c1c;
          border: 2px solid #c9a24d;
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          color: #fff;
          transform: scale(0.85);
          transition: transform 0.25s ease;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }

        .menu-overlay.show .menu-panel {
          transform: scale(1);
        }

        .menu-title {
          font-size: 22px;
          font-weight: bold;
          margin-bottom: 20px;
          letter-spacing: 2px;
          color: #d4af37;
        }

        .menu-item {
          width: 100%;
          padding: 14px;
          margin: 12px 0;
          font-size: 16px;
          font-weight: bold;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          color: #fff;
          transition: all 0.2s;
        }

        .menu-item:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-ai {
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          box-shadow: 0 4px 0 #1b5e20;
        }
        .btn-ai:active:not(:disabled) {
          transform: translateY(2px);
          box-shadow: none;
        }

        .btn-exit {
          background: linear-gradient(135deg, #e53935, #b71c1c);
          box-shadow: 0 4px 0 #7f0000;
        }
        .btn-exit:active {
          transform: translateY(2px);
          box-shadow: none;
        }

        .ai-list {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }

        .ai-list.show {
          max-height: 400px;
          margin-bottom: 15px;
        }

        .ai-option {
          background: #2a2a2a;
          border-radius: 10px;
          padding: 12px;
          margin: 8px 0;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
          border: 1px solid transparent;
        }

        .ai-option:hover {
          background: #3a3a3a;
          border-color: #d4af37;
        }
      `}</style>

      {/* Floating Menu Button */}
      {!gameOver && (
        <button className="menu-btn" onClick={() => { playSfx(SOUNDS.MOVE); setShowInGameMenu(true); }}>
          ☰
        </button>
      )}

      {/* In-Game Menu Overlay */}
      <div className={`menu-overlay ${showInGameMenu ? 'show' : ''}`} onClick={() => setShowInGameMenu(false)}>
        <div className="menu-panel" onClick={(e) => e.stopPropagation()}>
          <div className="menu-title">MENU</div>

          <button
            className="menu-item btn-ai"
            disabled={turn !== Color.RED || isAiThinking}
            onClick={() => setShowAIListInMenu(!showAIListInMenu)}
          >
            {turn === Color.RED && !isAiThinking ? "🤖 CHỌN AI" : "⏳ ĐANG LƯỢT AI"}
          </button>

          <div className={`ai-list ${showAIListInMenu ? 'show' : ''} overflow-y-auto pr-2`}>
            {Object.entries(AI_PERSONALITIES).map(([key, ai]) => (
              <div key={key} className="ai-option" onClick={() => handleSelectAI(key)}>
                {ai.emoji} {ai.name} – {ai.description}
              </div>
            ))}
          </div>

          <button className="menu-item btn-exit" onClick={() => {
            if (confirm("Thoát ván hiện tại?")) {
              setShowMainMenu(true);
              setShowInGameMenu(false);
            }
          }}>
            🚪 THOÁT GAME
          </button>

        </div>
      </div>

      {/* Footer */}
      <p className="mt-4 text-gray-500 text-[8px] uppercase tracking-widest text-center opacity-50 relative z-10">
        Cẩn thận lời dụ dỗ • Mỗi AI một tính cách
      </p>
    </div>
  );
};

export default App;
