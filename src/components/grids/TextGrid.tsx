import { useEffect, useRef } from 'react';
import type { TextCell } from '../../types';

interface TextGridProps {
  grid: TextCell[][];
  activeCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  onCellInput: (row: number, col: number, char: string | null) => void;
  onNavigate: (dr: number, dc: number) => void;
}

export function TextGrid({ grid, activeCell, onCellClick, onCellInput, onNavigate }: TextGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCell) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') { e.preventDefault(); onNavigate(-1, 0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); onNavigate(1, 0); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); onNavigate(0, -1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onNavigate(0, 1); }
      else if (e.key === 'Backspace') {
        e.preventDefault();
        onCellInput(activeCell[0], activeCell[1], null);
        onNavigate(0, -1);
      } else if (e.key === 'Delete') {
        e.preventDefault();
        onCellInput(activeCell[0], activeCell[1], null);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        onNavigate(0, e.shiftKey ? -1 : 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onNavigate(1, 0);
      } else if (e.key.length === 1) {
        e.preventDefault();
        onCellInput(activeCell[0], activeCell[1], e.key);
        onNavigate(0, 1);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCell, onCellInput, onNavigate]);

  return (
    <div
      ref={containerRef}
      className="grid-canvas"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1px',
        aspectRatio: `${cols} / ${rows}`,
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const isActive = activeCell && activeCell[0] === r && activeCell[1] === c;
          return (
            <div
              key={`${r}-${c}`}
              className={`grid-cell text-cell ${isActive ? 'text-active' : ''} ${cell ? 'text-filled' : ''}`}
              onClick={() => onCellClick(r, c)}
            >
              {cell || ''}
              {isActive && !cell && <span className="text-cursor">_</span>}
            </div>
          );
        })
      )}
    </div>
  );
}
