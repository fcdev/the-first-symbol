import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { EPOCH3_MOCK } from '../mockData';

export function Epoch3({
  setLobsterMsg,
  triggerBridge,
  onComplete,
  updateGameState,
  gameState,
}: {
  setLobsterMsg: (msg: string) => void,
  triggerBridge: (l: React.ReactNode, r: React.ReactNode, cb: () => void) => void,
  onComplete: () => void,
  updateGameState: (data: any) => void,
  gameState?: Record<string, any>,
}) {
  const [task, setTask] = useState<'A' | 'B'>('A');

  // Task A State
  const [grid, setGrid] = useState<string[]>(Array(64).fill(null));
  const [activeColor, setActiveColor] = useState(EPOCH3_MOCK.taskA.palette[0]);
  const [timeLeft, setTimeLeft] = useState(EPOCH3_MOCK.taskA.timeLimit);
  const [isDrawing, setIsDrawing] = useState(false);
  const [interpretation, setInterpretation] = useState<any>(null);

  // Task B State
  const [layerAssignments, setLayerAssignments] = useState<Record<string, number>>({});
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [parallaxEnabled, setParallaxEnabled] = useState(false);

  // Ref to always have the latest grid in timer callbacks (avoids stale closure)
  const gridRef = useRef(grid);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  // Resolve shape names from previous epoch (replaces {{shape1Name}} placeholders)
  const shapeNames = gameState?.epoch2?.shapeNames as string[] | undefined;
  const elements = useMemo(() => EPOCH3_MOCK.taskB.elements.map(el => ({
    ...el,
    label: el.label
      .replace('{{shape1Name}}', shapeNames?.[0] || '形状一')
      .replace('{{shape2Name}}', shapeNames?.[1] || '形状二')
      .replace('{{shape3Name}}', shapeNames?.[2] || '形状三'),
  })), [shapeNames]);

  useEffect(() => {
    if (task === 'A') {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH3_MOCK.taskA.dialogue.intro), 1000);
    } else if (task === 'B') {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH3_MOCK.taskB.dialogue.intro), 1000);
    }
  }, [task]);

  // Timer: countdown only — no stale closures, no handleDoneDrawing inside updater
  useEffect(() => {
    if (task !== 'A' || interpretation) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 30) setLobsterMsg(EPOCH3_MOCK.taskA.dialogue.halfway);
        if (prev === 10) setLobsterMsg(EPOCH3_MOCK.taskA.dialogue.tenSec);
        return prev <= 1 ? 0 : prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [task, interpretation]);

  // Separate effect: handle timer expiry via timeLeft reaching 0
  const handleDoneDrawing = useCallback(() => {
    if (interpretation) return;
    const currentGrid = gridRef.current;
    const filled = currentGrid.filter(c => c !== null).length;
    let interp = EPOCH3_MOCK.taskA.interpretations[3]; // default: abstract
    if (filled > 0) {
      const counts = currentGrid.reduce((acc: Record<string, number>, c) => {
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {});
      const dominant = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
      if (dominant === '#2ECC71') interp = EPOCH3_MOCK.taskA.interpretations[0];
      else if (dominant === '#3498DB') interp = EPOCH3_MOCK.taskA.interpretations[1];
      else if (dominant === '#FF6B6B') interp = EPOCH3_MOCK.taskA.interpretations[2];
    }
    setInterpretation(interp);
    setLobsterMsg(interp.dialogue);
  }, [interpretation]);

  useEffect(() => {
    if (task === 'A' && timeLeft === 0 && !interpretation) {
      handleDoneDrawing();
    }
  }, [timeLeft, task, interpretation, handleDoneDrawing]);

  const handleCellClick = (index: number) => {
    if (interpretation) return;
    const nextColor = activeColor === 'ERASE' ? null : activeColor;
    if (grid[index] === nextColor) return;
    const newGrid = [...grid];
    newGrid[index] = nextColor;
    setGrid(newGrid);
  };

  const handleSkipToNext = () => {
    updateGameState({ epoch3: { interpretation: interpretation?.label || 'skipped', pixelArt: grid } });
    setTask('B');
  };

  const handleAcceptArt = () => {
    // TODO: Replace with API call
    setLobsterMsg(EPOCH3_MOCK.taskA.dialogue.accepted);
    updateGameState({ epoch3: { interpretation: interpretation.label, pixelArt: grid } });

    const leftVisual = (
      <div className="grid grid-cols-8 gap-1 w-48 h-48">
        {grid.map((c, i) => <div key={i} style={{ backgroundColor: c || '#111' }} />)}
      </div>
    );

    const rightData = (
      <div className="text-gray-400 font-mono text-[10px] whitespace-pre">
        {`正在扫描输入矩阵 (8x8)...\n`}
        {`像素密度: ${grid.filter(c => c).length}/64\n`}
        {`模式匹配: ${interpretation.label.toUpperCase()} (置信度 0.89)\n\n`}
        {`正在外推至 16x16...`}
      </div>
    );

    triggerBridge(leftVisual, rightData, () => setTask('B'));
  };

  const handleLayerDrop = (e: React.DragEvent, depth: number) => {
    e.preventDefault();
    const elId = e.dataTransfer.getData('text/plain');
    setLayerAssignments(prev => ({ ...prev, [elId]: depth }));
  };

  const handleBuildScene = () => {
    // TODO: Replace with API call
    setLobsterMsg(EPOCH3_MOCK.taskB.dialogue.compiled);
    
    setTimeout(() => {
      // TODO: Replace with API call
      setLobsterMsg(EPOCH3_MOCK.taskB.dialogue.success);
      updateGameState({ epoch3: { layerAssignments } });

      const leftVisual = (
        <div className="relative w-64 h-64 border border-gray-600 overflow-hidden">
          {Object.entries(layerAssignments).map(([id, depth]) => {
            const layer = EPOCH3_MOCK.taskB.layers.find(l => l.depth === depth)!;
            return (
              <div key={id} className="absolute inset-0 flex items-center justify-center transition-transform duration-1000"
                   style={{ transform: `scale(${layer.scale})`, opacity: layer.opacity }}>
                <div className="text-2xl">{elements.find(e => e.id === id)?.icon}</div>
              </div>
            );
          })}
        </div>
      );

      const rightData = (
        <div className="text-gray-400 font-mono text-[10px] whitespace-pre">
          {`正在编译场景图...\n\n`}
          {Object.entries(layerAssignments).map(([id, depth]) => {
            const layer = EPOCH3_MOCK.taskB.layers.find(l => l.depth === depth)!;
            return `层级 ${depth} (z:${5 - Number(depth)}): ${id}\n  视差: ${layer.parallax}x | 缩放: ${layer.scale}\n`;
          }).join('')}
          {`\n视差已启用: true`}
        </div>
      );

      triggerBridge(leftVisual, rightData, () => {
        setParallaxEnabled(true);
        setTimeout(onComplete, 3000);
      });
    }, 2000);
  };

  // Touch move: find which grid cell the finger is over and paint it
  const handleGridTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement | null;
    const indexStr = el?.dataset.cellIndex;
    if (indexStr !== undefined) {
      handleCellClick(parseInt(indexStr, 10));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!parallaxEnabled) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;
    setMousePos({ x, y });
  };

  return (
    <div 
      className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-2000 ${task === 'A' ? 'grayscale' : 'grayscale-0'}`}
      onMouseMove={handleMouseMove}
    >
      <div className="absolute top-4 left-4 text-xs text-gray-400 z-10">纪元 III · 感知  任务 {task === 'A' ? '1' : '2'}/2</div>

      {/* Task A: 8x8 Grid */}
      {task === 'A' && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 bg-black/80 p-4 sm:p-8 border border-gray-600 w-[95%] max-w-lg">
          <div className="text-lg sm:text-xl font-mono">{timeLeft}s</div>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 items-center">
            {/* Palette */}
            <div className="flex sm:flex-col gap-2">
              {EPOCH3_MOCK.taskA.palette.map(c => (
                <button key={c} className={`w-6 h-6 sm:w-8 sm:h-8 border-2 ${activeColor === c ? 'border-white' : 'border-transparent'}`}
                        style={{ backgroundColor: c }} onClick={() => setActiveColor(c)} />
              ))}
              <button className={`w-6 h-6 sm:w-8 sm:h-8 border-2 flex items-center justify-center ${activeColor === 'ERASE' ? 'border-white' : 'border-gray-600'}`}
                      onClick={() => setActiveColor('ERASE')}>✕</button>
            </div>

            {/* Grid */}
            <div
              className="grid grid-cols-8 gap-[1px] bg-gray-800 border-2 border-gray-600"
              style={{ touchAction: 'none' }}
              onMouseDown={() => setIsDrawing(true)}
              onMouseUp={() => setIsDrawing(false)}
              onMouseLeave={() => setIsDrawing(false)}
              onTouchStart={() => setIsDrawing(true)}
              onTouchEnd={() => setIsDrawing(false)}
              onTouchMove={handleGridTouchMove}
            >
              {grid.map((c, i) => (
                <div
                  key={i}
                  data-cell-index={i}
                  className="w-8 h-8 sm:w-10 sm:h-10 cursor-pointer"
                  style={{ backgroundColor: c || '#000' }}
                  onMouseDown={() => handleCellClick(i)}
                  onMouseEnter={() => isDrawing && handleCellClick(i)}
                  onTouchStart={(e) => { e.preventDefault(); handleCellClick(i); }}
                />
              ))}
            </div>
          </div>

          {!interpretation ? (
            <button className="pixel-btn w-full sm:w-auto" onClick={handleDoneDrawing}>完成绘画</button>
          ) : (
            <div className="flex gap-4 w-full sm:w-auto">
              <button className="pixel-btn flex-1 sm:flex-none" onClick={handleAcceptArt}>让龙虾渲染</button>
              <button className="pixel-btn flex-1 sm:flex-none" onClick={handleSkipToNext}>跳过</button>
            </div>
          )}
        </div>
      )}

      {/* Task B: Depth Mapping */}
      {task === 'B' && !parallaxEnabled && (
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 w-[95%] max-w-4xl bg-black/80 p-4 sm:p-8 border border-gray-600 overflow-y-auto max-h-[80vh]">
          {/* Elements */}
          <div className="flex flex-col gap-4 w-full sm:w-1/3">
            <div className="text-[10px] sm:text-xs text-gray-400">元素</div>
            <div className="grid grid-cols-3 sm:grid-cols-1 gap-2">
              {elements.map(el => (
                <div 
                  key={el.id}
                  draggable
                  onDragStart={e => e.dataTransfer.setData('text/plain', el.id)}
                  onClick={() => {
                    // Mobile-friendly: click to cycle through layers
                    const currentDepth = layerAssignments[el.id] || 0;
                    const nextDepth = currentDepth >= 5 ? 0 : currentDepth + 1;
                    if (nextDepth === 0) {
                      const newAssignments = { ...layerAssignments };
                      delete newAssignments[el.id];
                      setLayerAssignments(newAssignments);
                    } else {
                      setLayerAssignments(prev => ({ ...prev, [el.id]: nextDepth }));
                    }
                  }}
                  className={`p-2 sm:p-3 border border-gray-600 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 cursor-grab active:cursor-grabbing ${layerAssignments[el.id] ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-900 hover:border-white'}`}
                >
                  <span className="text-lg sm:text-xl">{el.icon}</span>
                  <span className="text-[8px] sm:text-[10px] text-center sm:text-left">{el.label}</span>
                  {layerAssignments[el.id] && <span className="sm:ml-auto text-[8px] text-blue-400">L{layerAssignments[el.id]}</span>}
                </div>
              ))}
            </div>
            <div className="text-[8px] text-gray-500 sm:hidden">点击分配层级</div>
          </div>

          {/* Layers */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="text-[10px] sm:text-xs text-gray-400">深度层级</div>
            {EPOCH3_MOCK.taskB.layers.map(layer => (
              <div 
                key={layer.depth}
                onDragOver={e => e.preventDefault()}
                onDrop={e => handleLayerDrop(e, layer.depth)}
                className="h-12 sm:h-16 border border-dashed border-gray-600 flex items-center px-2 sm:px-4 relative"
                style={{ backgroundColor: `rgba(255,255,255,${0.05 * (6-layer.depth)})` }}
              >
                <div className="absolute left-2 sm:left-4 text-[8px] sm:text-[10px] text-gray-500">L{layer.depth}</div>
                <div className="flex gap-2 sm:gap-4 ml-8 sm:ml-32 overflow-x-auto">
                  {Object.entries(layerAssignments).filter(([_, d]) => d === layer.depth).map(([id]) => {
                    const el = elements.find(e => e.id === id);
                    return <div key={id} className="text-xl sm:text-2xl shrink-0" style={{ transform: `scale(${layer.scale})`, opacity: layer.opacity }}>{el?.icon}</div>;
                  })}
                </div>
              </div>
            ))}
            
            <button 
              className="pixel-btn mt-4 w-full sm:w-auto sm:self-end"
              disabled={Object.keys(layerAssignments).length < 6}
              onClick={handleBuildScene}
            >
              构建场景
            </button>
          </div>
        </div>
      )}

      {/* Parallax Scene Preview */}
      {task === 'B' && parallaxEnabled && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Object.entries(layerAssignments).map(([id, depth]) => {
            const layer = EPOCH3_MOCK.taskB.layers.find(l => l.depth === depth)!;
            const el = elements.find(e => e.id === id);
            // Randomize initial positions for a nice spread
            const seed = id.charCodeAt(0);
            const top = 20 + (seed % 60) + '%';
            const left = 20 + ((seed * 7) % 60) + '%';
            
            return (
              <div 
                key={id} 
                className="absolute text-6xl transition-transform duration-75 ease-out"
                style={{ 
                  top, left,
                  opacity: layer.opacity,
                  transform: `scale(${layer.scale * 2}) translate(${mousePos.x * layer.parallax * -100}px, ${mousePos.y * layer.parallax * -100}px)`
                }}
              >
                {el?.icon}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
