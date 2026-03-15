import type { BinaryCell, TextCell, VisualCell, FullCell, Connection, GridMode } from './types';

export function createEmptyGrid<T>(width: number, height: number, fill: T): T[][] {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => fill)
  );
}

const COLOR_MAP: Record<string, string> = {
  '#FF0000': 'R', '#FF8800': 'O', '#FFFF00': 'Y',
  '#00CC00': 'G', '#0088FF': 'B', '#AA00FF': 'P',
};

const SHAPE_MAP: Record<string, string> = {
  circle: 'cir', square: 'sqr', triangle: 'tri',
  diamond: 'dia', star: 'str',
};

const ANIM_MAP: Record<string, string> = {
  pulse: 'pul', spin: 'spn', float: 'flt',
  shake: 'shk', glow: 'glw', fade: 'fde',
};

export function serializeGrid(
  mode: GridMode,
  grid: unknown[][],
  connections?: Connection[]
): string {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  let result = `Grid: ${cols}x${rows}\n`;

  switch (mode) {
    case 'binary': {
      const g = grid as BinaryCell[][];
      for (let r = 0; r < rows; r++) {
        let row = '';
        for (let c = 0; c < cols; c++) {
          const cell = g[r][c];
          row += cell === null ? '.' : cell.toString();
        }
        result += row + '\n';
      }
      break;
    }
    case 'text': {
      const g = grid as TextCell[][];
      for (let r = 0; r < rows; r++) {
        let row = '';
        for (let c = 0; c < cols; c++) {
          const cell = g[r][c];
          row += cell === null ? '.' : cell;
        }
        result += row + '\n';
      }
      break;
    }
    case 'visual': {
      const g = grid as VisualCell[][];
      for (let r = 0; r < rows; r++) {
        const cells: string[] = [];
        for (let c = 0; c < cols; c++) {
          const cell = g[r][c];
          if (!cell) {
            cells.push('...');
          } else {
            cells.push(`${COLOR_MAP[cell.color] || '?'}-${SHAPE_MAP[cell.shape] || '?'}`);
          }
        }
        result += cells.join(' ') + '\n';
      }
      break;
    }
    case 'full': {
      const g = grid as FullCell[][];
      for (let r = 0; r < rows; r++) {
        const cells: string[] = [];
        for (let c = 0; c < cols; c++) {
          const cell = g[r][c];
          if (!cell) {
            cells.push('.......');
          } else {
            cells.push(
              `${COLOR_MAP[cell.color] || '?'}-${SHAPE_MAP[cell.shape] || '?'}-${ANIM_MAP[cell.animation] || '?'}`
            );
          }
        }
        result += cells.join(' ') + '\n';
      }
      if (connections && connections.length > 0) {
        result += '\nConnections:\n';
        for (const conn of connections) {
          result += `[${conn.from[0]},${conn.from[1]}] -${conn.type}-> [${conn.to[0]},${conn.to[1]}]\n`;
        }
      }
      break;
    }
  }

  return result;
}

export function countFilledCells(grid: unknown[][]): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell !== null) count++;
    }
  }
  return count;
}
