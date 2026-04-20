'use client';

import { useState, useCallback, useEffect } from 'react';
import { GridCell, DailyPuzzle, Player } from '@/types/game';
import { getDailyPuzzle } from '@/lib/dailyPuzzle';
import { satisfiesCriterion, getValidPlayers, getRarityScore } from '@/lib/gameLogic';
import { getAllPlayers } from '@/lib/playerUtils';
import GameGrid from '@/components/GameGrid';
import CellModal from '@/components/CellModal';
import Timer from '@/components/Timer';
import ResultsScreen from '@/components/ResultsScreen';

const GAME_DURATION = 180; // 3 minutes

function makeEmptyCells(): GridCell[][] {
  return Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, col) => ({
      row,
      col,
      locked: false,
    }))
  );
}

export default function Home() {
  const [puzzle, setPuzzle] = useState<DailyPuzzle | null>(null);
  const [cells, setCells] = useState<GridCell[][]>(makeEmptyCells());
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [cellFeedback, setCellFeedback] = useState<boolean | undefined>(undefined);

  // Load daily puzzle on mount
  useEffect(() => {
    const p = getDailyPuzzle();
    setPuzzle(p);
  }, []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setSelectedCell(null);
  }, []);

  const handleStart = () => {
    setStarted(true);
  };

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
        // Calculate rarity score for this cell
        const allPlayers = getAllPlayers();
        const validCount = getValidPlayers(allPlayers, rowCriterion, colCriterion).length;
        const points = getRarityScore(validCount);

        setCells(prev => {
          const next = prev.map(r => r.map(c => ({ ...c })));
          next[row][col] = {
            ...next[row][col],
            playerId: player.id,
            playerName: player.name,
            correct: true,
            locked: true,
          };
          return next;
        });
        setScore(prev => prev + points);

        // Close modal after short delay
        setTimeout(() => {
          setSelectedCell(null);
          setCellFeedback(undefined);
        }, 800);
      } else {
        // Close modal after showing error
        setTimeout(() => {
          setCellFeedback(undefined);
        }, 1200);
      }
    },
    [puzzle, selectedCell]
  );

  const handleModalClose = useCallback(() => {
    setSelectedCell(null);
    setCellFeedback(undefined);
  }, []);

  const handleResultsClose = useCallback(() => {
    setGameOver(false);
  }, []);

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-orange-400 text-xl animate-pulse">Loading today&apos;s puzzle…</div>
      </div>
    );
  }

  const isModalOpen = selectedCell !== null;
  const modalRow = selectedCell?.row ?? 0;
  const modalCol = selectedCell?.col ?? 0;

  // Check immaculate grid
  const correctCount = cells.flat().filter(c => c.correct).length;
  const isImmaculate = correctCount === 9;
  const finalScore = isImmaculate ? score + 200 : score;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏀</span>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Hoops<span className="text-orange-500">Box</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {started && !gameOver && (
            <Timer timeLeft={timeLeft} onExpire={handleGameOver} />
          )}
          <div className="text-sm text-gray-400">
            Score: <span className="text-orange-400 font-bold">{score}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6 max-w-2xl mx-auto w-full">
        {!started ? (
          /* Start screen */
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="text-6xl">🏀</div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">HoopsBox</h2>
              <p className="text-gray-400 text-lg">Basketball Box2Box Daily Puzzle</p>
            </div>
            <div className="bg-gray-800 rounded-2xl p-6 text-left max-w-sm w-full border border-gray-700">
              <h3 className="text-white font-semibold mb-3">How to play</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>🏀 Fill the 3×3 grid by naming a basketball player</li>
                <li>✅ Each player must match <strong>both</strong> the row AND column criteria</li>
                <li>⏱️ You have <strong>3 minutes</strong> to complete the grid</li>
                <li>⭐ Rarer answers score more points</li>
                <li>🎯 Fill all 9 cells for the Immaculate Grid bonus!</li>
              </ul>
            </div>
            <button
              onClick={handleStart}
              className="bg-orange-500 hover:bg-orange-400 active:scale-95 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20"
            >
              Start Today&apos;s Puzzle
            </button>
            <p className="text-gray-600 text-xs">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        ) : (
          /* Game screen */
          <div className="w-full flex flex-col gap-4">
            <GameGrid
              puzzle={puzzle}
              cells={cells}
              gameOver={gameOver}
              onCellClick={handleCellClick}
            />

            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
              <span>{correctCount}/9 cells correct</span>
              {gameOver && (
                <button
                  onClick={() => setGameOver(true)}
                  className="text-orange-400 hover:text-orange-300 transition-colors"
                >
                  View results →
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Cell answer modal */}
      {isModalOpen && puzzle && (
        <CellModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          rowCriterion={puzzle.rowCriteria[modalRow]}
          colCriterion={puzzle.colCriteria[modalCol]}
          onAnswer={handleAnswer}
          isCorrect={cellFeedback}
        />
      )}

      {/* Results screen */}
      {gameOver && (
        <ResultsScreen
          score={finalScore}
          cells={cells}
          puzzle={puzzle}
          onClose={handleResultsClose}
        />
      )}
    </div>
  );
}
