'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GridCell, DailyPuzzle, Player } from '@/types/game';
import { getDailyPuzzle } from '@/lib/dailyPuzzle';
import { satisfiesCriterion, getValidPlayers, getRarityScore } from '@/lib/gameLogic';
import { getAllPlayers, getPlayerImageUrl } from '@/lib/playerUtils';
import { useI18n } from '@/lib/i18n';
import GameGrid from '@/components/GameGrid';
import CellModal from '@/components/CellModal';
import Timer from '@/components/Timer';
import ResultsScreen from '@/components/ResultsScreen';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const GAME_DURATION = 180; // 3 minutes
const HINT_COST = 50;

const LINES: [number, number][][] = [
  [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]], // rows
  [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]], // columns
  [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],                      // diagonals
];

function makeEmptyCells(): GridCell[][] {
  return Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => ({ row, col, locked: false }))
  );
}

export default function Home() {
  const { t } = useI18n();

  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [cells, setCells] = useState<GridCell[][]>(makeEmptyCells());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [cellFeedback, setCellFeedback] = useState<boolean | undefined>(undefined);
  const [hintRevealedCells, setHintRevealedCells] = useState<Set<string>>(new Set());
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [lineCompletePrompt, setLineCompletePrompt] = useState(false);
  const announcedLinesRef = useRef<Set<number>>(new Set());

  const allPlayers = useMemo(() => getAllPlayers(), []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setSelectedCell(null);
    setLineCompletePrompt(false);
  }, []);

  useEffect(() => {
    setPuzzle(getDailyPuzzle());
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const correctCount = cells.flat().filter(c => c.correct).length;
    if (correctCount === 9) {
      setTimeout(handleGameOver, 800);
      return;
    }
    const newLine = LINES.findIndex(
      (line, idx) =>
        !announcedLinesRef.current.has(idx) &&
        line.every(([r, c]) => cells[r][c]?.correct)
    );
    if (newLine !== -1) {
      announcedLinesRef.current.add(newLine);
      setTimeout(() => setLineCompletePrompt(true), 900);
    }
  }, [cells, started, gameOver, handleGameOver]);

  const handleCellClick = (row: number, col: number) => {
    if (!started || gameOver) return;
    const cell = cells[row][col];
    if (cell.locked || cell.correct) return;
    setSelectedCell({ row, col });
    setCellFeedback(undefined);
  };

  const handleAnswer = useCallback(
    (player: Player) => {
      if (!puzzle || !selectedCell) return;
      const { row, col } = selectedCell;
      const rowCriterion = puzzle.rowCriteria[row];
      const colCriterion = puzzle.colCriteria[col];

      const correct =
        satisfiesCriterion(player, rowCriterion) &&
        satisfiesCriterion(player, colCriterion);

      setCellFeedback(correct);

      if (correct) {
        const validCount = getValidPlayers(allPlayers, rowCriterion, colCriterion).length;
        const points = getRarityScore(validCount);
        const imageUrl = getPlayerImageUrl(player);

        setCells(prev => {
          const next = prev.map(r => r.map(c => ({ ...c })));
          next[row][col] = {
            ...next[row][col],
            playerId: player.id,
            playerName: player.name,
            playerImageUrl: imageUrl,
            correct: true,
            locked: true,
          };
          return next;
        });
        setScore(prev => prev + points);

        setTimeout(() => {
          setSelectedCell(null);
          setCellFeedback(undefined);
        }, 800);
      } else {
        setTimeout(() => {
          setCellFeedback(undefined);
        }, 1200);
      }
    },
    [puzzle, selectedCell, allPlayers]
  );

  const handleRevealHint = useCallback(() => {
    if (!selectedCell) return;
    const key = `${selectedCell.row}-${selectedCell.col}`;
    setHintRevealedCells(prev => new Set(prev).add(key));
    setScore(prev => Math.max(0, prev - HINT_COST));
  }, [selectedCell]);

  const handleModalClose = useCallback(() => {
    setSelectedCell(null);
    setCellFeedback(undefined);
  }, []);

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-orange-400 text-xl animate-pulse">{t('loading')}</div>
      </div>
    );
  }

  const isModalOpen = selectedCell !== null;
  const modalRow = selectedCell?.row ?? 0;
  const modalCol = selectedCell?.col ?? 0;
  const modalCellKey = `${modalRow}-${modalCol}`;

  const modalValidPlayers = isModalOpen
    ? getValidPlayers(allPlayers, puzzle.rowCriteria[modalRow], puzzle.colCriteria[modalCol])
    : [];
  const modalValidCount = modalValidPlayers.length;
  const modalFirstLetter = modalValidPlayers[0]?.name[0] ?? '?';
  const modalHintRevealed = hintRevealedCells.has(modalCellKey);

  const correctCount = cells.flat().filter(c => c.correct).length;
  const finalScore = correctCount === 9 ? score + 200 : score;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏀</span>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Hoops<span className="text-orange-500">Box</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {started && !gameOver && timerEnabled && (
              <Timer timeLeft={GAME_DURATION} onExpire={handleGameOver} />
            )}
            <div className="text-sm text-gray-400">
              {t('score')}: <span className="text-orange-400 font-bold">{score}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <LanguageSwitcher />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6 max-w-2xl mx-auto w-full">
        {!started ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="text-6xl">🏀</div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{t('appName')}</h2>
              <p className="text-gray-400 text-lg">{t('subtitle')}</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 text-left max-w-sm w-full border border-gray-700">
              <h3 className="text-white font-semibold mb-3">{t('howToPlay')}</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>🏀 {t('rule1')}</li>
                <li>✅ {t('rule2')}</li>
                <li>⏱️ {t('rule3')}</li>
                <li>⭐ {t('rule4')}</li>
                <li>🎯 {t('rule5')}</li>
              </ul>
            </div>
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-400 hover:text-gray-300 transition-colors">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-orange-500"
              />
              {t('timerEnabled')}
            </label>
            <button
              onClick={() => setStarted(true)}
              className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20"
            >
              {t('startButton')}
            </button>
            <p className="text-gray-600 text-xs">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <GameGrid
              puzzle={puzzle}
              cells={cells}
              gameOver={gameOver}
              onCellClick={handleCellClick}
            />
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
              <span>{t('cellsCorrect', { count: correctCount })}</span>
              {gameOver && (
                <button
                  onClick={() => setGameOver(true)}
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  {t('viewResults')} →
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cell answer modal */}
      {isModalOpen && (
        <CellModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          rowCriterion={puzzle.rowCriteria[modalRow]}
          colCriterion={puzzle.colCriteria[modalCol]}
          onAnswer={handleAnswer}
          isCorrect={cellFeedback}
          validCount={modalValidCount}
          firstLetter={modalFirstLetter}
          hintRevealed={modalHintRevealed}
          onRevealHint={handleRevealHint}
        />
      )}

      {/* Line complete prompt */}
      {lineCompletePrompt && !gameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="text-4xl mb-3">🎯</div>
            <h2 className="text-xl font-bold text-white mb-2">{t('lineComplete')}</h2>
            <p className="text-gray-400 text-sm mb-6">{t('lineCompleteMsg')}</p>
            <div className="flex gap-3">
              <button
                onClick={handleGameOver}
                className="flex-1 bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold py-3 rounded-xl transition-all"
              >
                {t('finishGame')}
              </button>
              <button
                onClick={() => setLineCompletePrompt(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {t('keepPlaying')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results screen */}
      {gameOver && (
        <ResultsScreen
          score={finalScore}
          cells={cells}
          puzzle={puzzle}
          onClose={() => setGameOver(false)}
        />
      )}
    </div>
  );
}
