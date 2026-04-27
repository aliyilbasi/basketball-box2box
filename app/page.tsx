'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { GridCell, DailyPuzzle, Player } from '@/types/game';
import { getRandomPuzzle } from '@/lib/dailyPuzzle';
import { satisfiesCriterion, getValidPlayers, getRarityScore } from '@/lib/gameLogic';
import { getAllPlayers, getPlayerImageUrl } from '@/lib/playerUtils';
import { useI18n } from '@/lib/i18n';
import GameGrid from '@/components/GameGrid';
import CellModal from '@/components/CellModal';
import Timer from '@/components/Timer';
import ResultsScreen from '@/components/ResultsScreen';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeToggle from '@/components/ThemeToggle';

const GAME_DURATION = 180;
const HINT_COST = 50;

const LINES: [number, number][][] = [
  [[0,0],[0,1],[0,2]], [[1,0],[1,1],[1,2]], [[2,0],[2,1],[2,2]],
  [[0,0],[1,0],[2,0]], [[0,1],[1,1],[2,1]], [[0,2],[1,2],[2,2]],
  [[0,0],[1,1],[2,2]], [[0,2],[1,1],[2,0]],
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
  const [timerPaused, setTimerPaused] = useState(false);
  const [lineCompletePrompt, setLineCompletePrompt] = useState(false);
  const announcedLinesRef = useRef<Set<number>>(new Set());

  const allPlayers = useMemo(() => getAllPlayers(), []);

  const handleGameOver = useCallback(() => {
    setGameOver(true);
    setSelectedCell(null);
    setLineCompletePrompt(false);
  }, []);

  const handleNewGame = useCallback(() => {
    setPuzzle(getRandomPuzzle());
    setCells(makeEmptyCells());
    setScore(0);
    setGameOver(false);
    setStarted(false);
    setSelectedCell(null);
    setCellFeedback(undefined);
    setHintRevealedCells(new Set());
    setTimerPaused(false);
    setLineCompletePrompt(false);
    announcedLinesRef.current = new Set();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setPuzzle(getRandomPuzzle()), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!started || gameOver) return;
    const correctCount = cells.flat().filter(c => c.correct).length;
    if (correctCount === 9) { setTimeout(handleGameOver, 800); return; }
    const newLine = LINES.findIndex(
      (line, idx) => !announcedLinesRef.current.has(idx) && line.every(([r, c]) => cells[r][c]?.correct)
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

  const handleAnswer = useCallback((player: Player) => {
    if (!puzzle || !selectedCell) return;
    const { row, col } = selectedCell;
    const rowCriterion = puzzle.rowCriteria[row];
    const colCriterion = puzzle.colCriteria[col];
    const correct = satisfiesCriterion(player, rowCriterion) && satisfiesCriterion(player, colCriterion);
    setCellFeedback(correct);
    if (correct) {
      const validCount = getValidPlayers(allPlayers, rowCriterion, colCriterion).length;
      const points = getRarityScore(validCount);
      const imageUrl = getPlayerImageUrl(player);
      setCells(prev => {
        const next = prev.map(r => r.map(c => ({ ...c })));
        next[row][col] = { ...next[row][col], playerId: player.id, playerName: player.name, playerImageUrl: imageUrl, correct: true, locked: true };
        return next;
      });
      setScore(prev => prev + points);
      setTimeout(() => { setSelectedCell(null); setCellFeedback(undefined); }, 800);
    } else {
      setTimeout(() => { setCellFeedback(undefined); }, 1200);
    }
  }, [puzzle, selectedCell, allPlayers]);

  const handleRevealHint = useCallback(() => {
    if (!selectedCell) return;
    setHintRevealedCells(prev => new Set(prev).add(`${selectedCell.row}-${selectedCell.col}`));
    setScore(prev => Math.max(0, prev - HINT_COST));
  }, [selectedCell]);

  const handleModalClose = useCallback(() => {
    setSelectedCell(null);
    setCellFeedback(undefined);
  }, []);

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-barlow-condensed)', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Loading…
        </span>
      </div>
    );
  }

  const isModalOpen = selectedCell !== null;
  const modalRow = selectedCell?.row ?? 0;
  const modalCol = selectedCell?.col ?? 0;
  const modalCellKey = `${modalRow}-${modalCol}`;
  const modalValidPlayers = isModalOpen ? getValidPlayers(allPlayers, puzzle.rowCriteria[modalRow], puzzle.colCriteria[modalCol]) : [];
  const modalValidCount = modalValidPlayers.length;
  const modalFirstLetter = modalValidPlayers[0]?.name[0] ?? '?';
  const modalHintRevealed = hintRevealedCells.has(modalCellKey);
  const correctCount = cells.flat().filter(c => c.correct).length;
  const finalScore = correctCount === 9 ? score + 200 : score;

  return (
    <div className="court-bg min-h-screen flex flex-col" style={{ background: 'var(--bg-base)', color: 'var(--text-hi)' }}>

      {/* ── Header ── */}
      <header style={{ borderBottom: '1px solid var(--border-dim)', background: 'var(--bg-surface)' }} className="px-4 py-3 relative z-10">
        <div className="max-w-2xl mx-auto w-full header-shell">

          {/* Logo */}
          <div className="header-brand">
            <span className="text-xl header-brand-mark">🏀</span>
            <h1 className="font-display header-brand-title" style={{ fontSize: '1.35rem', color: 'var(--text-hi)', letterSpacing: '0.05em' }}>
              HOOPS<span style={{ color: 'var(--accent)' }}>BOX</span>
            </h1>
          </div>

          {/* Right controls */}
          <div className="header-actions">
            {/* Timer */}
            {started && !gameOver && timerEnabled && (
              <div className="header-timer-group">
                <Timer timeLeft={GAME_DURATION} onExpire={handleGameOver} paused={timerPaused} />
                <button
                  onClick={() => setTimerPaused(p => !p)}
                  className="btn-icon"
                  aria-label={timerPaused ? t('resumeTimer') : t('pauseTimer')}
                  title={timerPaused ? t('resumeTimer') : t('pauseTimer')}
                >
                  {timerPaused ? '▶' : '⏸'}
                </button>
              </div>
            )}
            {started && !gameOver && (
              <button
                onClick={() => { setTimerEnabled(e => !e); setTimerPaused(false); }}
                className="btn-icon"
                aria-label={timerEnabled ? t('hideTimer') : t('showTimer')}
                title={timerEnabled ? t('hideTimer') : t('showTimer')}
              >
                {timerEnabled ? '🙈' : '⏱️'}
              </button>
            )}

            {/* Score */}
            {started && (
              <div className="score-badge header-score-badge flex items-center gap-1.5">
                <span>{t('score')}</span>
                <span className="score-badge-value">{score}</span>
              </div>
            )}

            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 gap-6 max-w-2xl mx-auto w-full relative z-10">

        {/* ── Start screen ── */}
        {!started ? (
          <div className="flex flex-col items-center gap-6 text-center w-full max-w-md">
            {/* Title */}
            <div className="flex flex-col items-center gap-1">
              <div className="font-display" style={{ fontSize: '3.5rem', lineHeight: 0.95, color: 'var(--text-hi)' }}>
                HOOPS<span style={{ color: 'var(--accent)' }}>BOX</span>
              </div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-lo)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '4px' }}>
                {t('subtitle')}
              </div>
            </div>

            {/* Rules card */}
            <div className="card w-full" style={{ padding: '20px 22px' }}>
              <div className="font-display" style={{ fontSize: '0.85rem', color: 'var(--text-lo)', marginBottom: '14px', letterSpacing: '0.1em' }}>
                {t('howToPlay')}
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '🏀', text: t('rule1') },
                  { icon: '✅', text: t('rule2') },
                  { icon: '⏱️', text: t('rule3') },
                  { icon: '⭐', text: t('rule4') },
                  { icon: '🎯', text: t('rule5') },
                ].map((r, i) => (
                  <div key={i} className="rule-item">
                    <span style={{ fontSize: '1rem', flexShrink: 0 }}>{r.icon}</span>
                    <span>{r.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timer toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none" style={{ fontSize: '0.875rem', color: 'var(--text-mid)' }}>
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={e => setTimerEnabled(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              {t('timerEnabled')}
            </label>

            {/* Start button */}
            <button onClick={() => setStarted(true)} className="btn-accent">
              {t('startButton')}
            </button>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-lo)' }}>
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

        ) : (
          /* ── Game screen ── */
          <div className="w-full flex flex-col gap-3">
            <GameGrid puzzle={puzzle} cells={cells} gameOver={gameOver} onCellClick={handleCellClick} />
            <div className="flex items-center justify-between px-1" style={{ fontSize: '0.8rem', color: 'var(--text-lo)' }}>
              <span>{t('cellsCorrect', { count: correctCount })}</span>
              {gameOver && (
                <button
                  onClick={() => setGameOver(true)}
                  style={{ color: 'var(--accent)', fontWeight: 600 }}
                  className="hover:underline transition-colors"
                >
                  {t('viewResults')} →
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Cell answer modal ── */}
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

      {/* ── Line complete prompt ── */}
      {lineCompletePrompt && !gameOver && (
        <div className="modal-backdrop">
          <div className="modal-panel" style={{ maxWidth: '360px', textAlign: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🎯</div>
            <div>
              <h2 className="font-display" style={{ fontSize: '1.6rem', color: 'var(--text-hi)', marginBottom: '6px' }}>
                {t('lineComplete')}
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)' }}>{t('lineCompleteMsg')}</p>
            </div>
            <div className="flex gap-3 w-full">
              <button onClick={handleGameOver} className="btn-accent" style={{ flex: 1 }}>{t('finishGame')}</button>
              <button onClick={() => setLineCompletePrompt(false)} className="btn-ghost" style={{ flex: 1 }}>{t('keepPlaying')}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {gameOver && (
        <ResultsScreen
          score={finalScore}
          cells={cells}
          puzzle={puzzle}
          onClose={() => setGameOver(false)}
          onNewGame={handleNewGame}
        />
      )}
    </div>
  );
}
