import type { BinaryCell } from '../../types';

interface BinaryGridProps {
  grid: BinaryCell[][];
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
}

export function BinaryGrid({ grid, onCellClick, onCellDrag }: BinaryGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="grid-canvas"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '0px',
        background: 'transparent',
        border: 'none',
      }}
      onMouseLeave={() => {}}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`grid-cell binary-cell ${
              cell === 1 ? 'binary-one' : cell === 0 ? 'binary-zero' : 'binary-null'
            }`}
            onMouseDown={() => onCellClick(r, c)}
            onMouseEnter={(e) => {
              if (e.buttons === 1) onCellDrag(r, c);
            }}
          >
            {cell !== null ? cell : ''}
          </div>
        ))
      )}
    </div>
  );
}
