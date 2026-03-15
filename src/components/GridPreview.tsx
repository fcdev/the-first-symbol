import type { ReactNode } from 'react';
import type { GridMode, BinaryCell, TextCell, VisualCell, FullCell } from '../types';
import { ShapeIcon } from './GridToolbar';

interface GridPreviewProps {
  grid: unknown[][];
  mode: GridMode;
  width: number;
  height: number;
  cellSize?: number;
}

export function GridPreview({ grid, mode, width, height, cellSize = 16 }: GridPreviewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
        gap: '1px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {grid.map((row, r) =>
        (row as unknown[]).map((cell, c) => (
          <div
            key={`${r}-${c}`}
            style={{
              width: cellSize,
              height: cellSize,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.max(6, cellSize * 0.5),
            }}
            className={getCellClass(mode, cell)}
          >
            {renderCellContent(mode, cell, Math.max(6, cellSize * 0.6))}
          </div>
        ))
      )}
    </div>
  );
}

function getCellClass(mode: GridMode, cell: unknown): string {
  switch (mode) {
    case 'binary': {
      const v = cell as BinaryCell;
      if (v === null) return 'binary-null';
      return v === 1 ? 'binary-one' : 'binary-zero';
    }
    case 'text': {
      const v = cell as TextCell;
      return v ? 'text-cell text-filled' : 'text-cell';
    }
    case 'visual': {
      const v = cell as VisualCell;
      return v ? 'visual-cell visual-filled' : 'visual-cell';
    }
    case 'full': {
      const v = cell as FullCell;
      return v ? `full-cell full-filled ${v.animation ? `anim-${v.animation}` : ''}` : 'full-cell';
    }
  }
}

function renderCellContent(mode: GridMode, cell: unknown, size: number): ReactNode {
  switch (mode) {
    case 'binary': {
      const v = cell as BinaryCell;
      return v !== null ? String(v) : null;
    }
    case 'text': {
      const v = cell as TextCell;
      return v || null;
    }
    case 'visual': {
      const v = cell as VisualCell;
      return v ? <ShapeIcon shape={v.shape} color={v.color} size={size} /> : null;
    }
    case 'full': {
      const v = cell as FullCell;
      return v ? <ShapeIcon shape={v.shape} color={v.color} size={size} /> : null;
    }
  }
}

interface PixelArtPreviewProps {
  grid: (string | null)[];
  cellSize?: number;
}

export function PixelArtPreview({ grid, cellSize = 16 }: PixelArtPreviewProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${cellSize}px)`,
        gap: '1px',
        background: 'rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {grid.map((color, i) => (
        <div
          key={i}
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: color || '#000',
          }}
        />
      ))}
    </div>
  );
}
