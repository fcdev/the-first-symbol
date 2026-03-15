import { useState, useCallback } from 'react';
import type { EpochConfig, BinaryCell, TextCell, VisualCell, FullCell, Connection } from '../types';
import { BinaryGrid } from './grids/BinaryGrid';
import { TextGrid } from './grids/TextGrid';
import { VisualGrid } from './grids/VisualGrid';
import { FullGrid } from './grids/FullGrid';
import { GridToolbar } from './GridToolbar';
import { ConnectionOverlay } from './ConnectionOverlay';
import { countFilledCells } from '../gridUtils';

interface GridEditorProps {
  config: EpochConfig;
  grid: unknown[][];
  setGrid: (g: unknown[][]) => void;
  connections: Connection[];
  setConnections: (c: Connection[]) => void;
  onSubmit: () => void;
  onSkip?: () => void;
}

export function GridEditor({ config, grid, setGrid, connections, setConnections, onSubmit, onSkip }: GridEditorProps) {
  const [selectedColor, setSelectedColor] = useState(config.colors?.[0] ?? '#FF0000');
  const [selectedShape, setSelectedShape] = useState(config.shapes?.[0] ?? 'circle');
  const [selectedAnimation, setSelectedAnimation] = useState(config.animations?.[0] ?? 'pulse');
  const [activeTool, setActiveTool] = useState('draw');
  const [connectionType, setConnectionType] = useState<Connection['type']>('bond');
  const [connectionStart, setConnectionStart] = useState<[number, number] | null>(null);
  const [activeTextCell, setActiveTextCell] = useState<[number, number] | null>(null);

  const filledCount = countFilledCells(grid);
  const totalCells = config.gridWidth * config.gridHeight;

  const updateCell = useCallback((row: number, col: number) => {
    const newGrid = grid.map(r => [...r]);

    switch (config.mode) {
      case 'binary': {
        if (activeTool === 'erase') {
          newGrid[row][col] = null;
        } else {
          const current = newGrid[row][col] as BinaryCell;
          newGrid[row][col] = current === null ? 1 : current === 1 ? 0 : null;
        }
        break;
      }
      case 'visual': {
        if (activeTool === 'erase') {
          newGrid[row][col] = null;
        } else if (activeTool === 'eyedropper') {
          const cell = grid[row][col] as VisualCell;
          if (cell) {
            setSelectedColor(cell.color);
            setSelectedShape(cell.shape);
          }
          setActiveTool('draw');
          return; // Don't update grid
        } else {
          newGrid[row][col] = { color: selectedColor, shape: selectedShape };
        }
        break;
      }
      case 'full': {
        if (activeTool === 'erase') {
          newGrid[row][col] = null;
        } else if (activeTool === 'eyedropper') {
          const cell = grid[row][col] as FullCell;
          if (cell) {
            setSelectedColor(cell.color);
            setSelectedShape(cell.shape);
            setSelectedAnimation(cell.animation);
          }
          setActiveTool('draw');
          return;
        } else if (activeTool === 'connect') {
          if (!connectionStart) {
            setConnectionStart([row, col]);
          } else {
            if (connectionStart[0] !== row || connectionStart[1] !== col) {
              if (connections.length < 10) {
                setConnections([...connections, {
                  from: connectionStart,
                  to: [row, col],
                  type: connectionType,
                }]);
              }
            }
            setConnectionStart(null);
          }
          return;
        } else {
          newGrid[row][col] = { color: selectedColor, shape: selectedShape, animation: selectedAnimation };
        }
        break;
      }
      default:
        break;
    }

    setGrid(newGrid);
  }, [grid, setGrid, config.mode, activeTool, selectedColor, selectedShape, selectedAnimation, connectionStart, connections, setConnections, connectionType]);

  const handleDrag = useCallback((row: number, col: number) => {
    if (config.mode === 'text' || activeTool === 'connect') return;

    // Compute desired value without copying grid
    let newValue: unknown;
    switch (config.mode) {
      case 'binary':
        newValue = activeTool === 'erase' ? null : 1;
        break;
      case 'visual':
        newValue = activeTool === 'erase' ? null : activeTool === 'draw' ? { color: selectedColor, shape: selectedShape } : undefined;
        break;
      case 'full':
        newValue = activeTool === 'erase' ? null : activeTool === 'draw' ? { color: selectedColor, shape: selectedShape, animation: selectedAnimation } : undefined;
        break;
    }
    if (newValue === undefined) return;

    // Skip if cell already matches (avoid unnecessary copy + re-render)
    const current = grid[row][col];
    if (newValue === null && current === null) return;
    if (config.mode === 'binary' && current === newValue) return;

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = newValue;
    setGrid(newGrid);
  }, [grid, setGrid, config.mode, activeTool, selectedColor, selectedShape, selectedAnimation]);

  const handleTextCellClick = useCallback((row: number, col: number) => {
    setActiveTextCell([row, col]);
  }, []);

  const handleTextCellInput = useCallback((row: number, col: number, char: string | null) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = char;
    setGrid(newGrid);
  }, [grid, setGrid]);

  const handleTextNavigate = useCallback((dr: number, dc: number) => {
    if (!activeTextCell) return;
    const [r, c] = activeTextCell;
    let newR = r + dr;
    let newC = c + dc;
    // Wrap columns
    if (newC >= config.gridWidth) { newC = 0; newR++; }
    if (newC < 0) { newC = config.gridWidth - 1; newR--; }
    // Clamp rows
    newR = Math.max(0, Math.min(config.gridHeight - 1, newR));
    setActiveTextCell([newR, newC]);
  }, [activeTextCell, config.gridWidth, config.gridHeight]);

  const handleSymbolInsert = useCallback((sym: string) => {
    if (!activeTextCell) return;
    handleTextCellInput(activeTextCell[0], activeTextCell[1], sym);
    handleTextNavigate(0, 1);
  }, [activeTextCell, handleTextCellInput, handleTextNavigate]);

  const handleClearAll = useCallback(() => {
    const newGrid = grid.map(r => r.map(() => null));
    setGrid(newGrid);
    setConnections([]);
    setConnectionStart(null);
  }, [grid, setGrid, setConnections]);

  const handleFillRandom = useCallback(() => {
    if (config.mode !== 'binary') return;
    const newGrid = grid.map(r => r.map(() => (Math.random() > 0.5 ? 1 : Math.random() > 0.5 ? 0 : null) as BinaryCell));
    setGrid(newGrid);
  }, [grid, setGrid, config.mode]);

  return (
    <div className="grid-editor">
      <GridToolbar
        mode={config.mode}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedShape={selectedShape}
        setSelectedShape={setSelectedShape}
        selectedAnimation={selectedAnimation}
        setSelectedAnimation={setSelectedAnimation}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        connectionType={connectionType}
        setConnectionType={setConnectionType}
        colors={config.colors}
        shapes={config.shapes}
        animations={config.animations}
        onFillRandom={config.mode === 'binary' ? handleFillRandom : undefined}
        onClearAll={handleClearAll}
        onSymbolInsert={config.mode === 'text' ? handleSymbolInsert : undefined}
      />

      <div className="grid-wrapper">
        {config.mode === 'binary' && (
          <BinaryGrid
            grid={grid as BinaryCell[][]}
            onCellClick={updateCell}
            onCellDrag={handleDrag}
          />
        )}
        {config.mode === 'text' && (
          <TextGrid
            grid={grid as TextCell[][]}
            activeCell={activeTextCell}
            onCellClick={handleTextCellClick}
            onCellInput={handleTextCellInput}
            onNavigate={handleTextNavigate}
          />
        )}
        {config.mode === 'visual' && (
          <VisualGrid
            grid={grid as VisualCell[][]}
            onCellClick={updateCell}
            onCellDrag={handleDrag}
          />
        )}
        {config.mode === 'full' && (
          <>
            <FullGrid
              grid={grid as FullCell[][]}
              onCellClick={updateCell}
              onCellDrag={handleDrag}
            />
            <ConnectionOverlay
              connections={connections}
              gridWidth={config.gridWidth}
              gridHeight={config.gridHeight}
              pendingStart={connectionStart}
            />
          </>
        )}
      </div>

      <div className="grid-footer">
        <span className="cell-count">
          {filledCount} / {totalCells} 格
          {config.mode === 'full' && ` | ${connections.length}/10 连接`}
        </span>
        <div className="grid-footer-buttons">
          <button
            className="pixel-btn submit-btn"
            onClick={onSubmit}
            disabled={filledCount === 0}
          >
            让龙虾渲染
          </button>
          {onSkip && (
            <button
              className="pixel-btn skip-btn"
              onClick={onSkip}
            >
              跳过
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
