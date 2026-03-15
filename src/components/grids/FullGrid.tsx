import type { FullCell } from '../../types';
import { ShapeIcon } from '../GridToolbar';

interface FullGridProps {
  grid: FullCell[][];
  onCellClick: (row: number, col: number) => void;
  onCellDrag: (row: number, col: number) => void;
}

export function FullGrid({ grid, onCellClick, onCellDrag }: FullGridProps) {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  return (
    <div
      className="grid-canvas"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: '1px',
        aspectRatio: `${cols} / ${rows}`,
      }}
    >
      {grid.map((row, r) =>
        row.map((cell, c) => (
          <div
            key={`${r}-${c}`}
            className={`grid-cell full-cell ${cell ? 'full-filled' : ''} ${
              cell?.animation ? `anim-${cell.animation}` : ''
            }`}
            onMouseDown={() => onCellClick(r, c)}
            onMouseEnter={(e) => {
              if (e.buttons === 1) onCellDrag(r, c);
            }}
          >
            {cell && (
              <ShapeIcon shape={cell.shape} color={cell.color} size={14} />
            )}
          </div>
        ))
      )}
    </div>
  );
}
