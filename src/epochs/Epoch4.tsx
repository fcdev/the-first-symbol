import React, { useState, useEffect, useRef } from 'react';
import { EPOCH4_MOCK } from '../mockData';
import { audioEngine } from '../audio';
import { callLLMEcosystemRender } from '../llm';
import type { EpochResult } from '../types';

export function Epoch4({
  setLobsterMsg,
  triggerBridge,
  onComplete,
  updateGameState,
  gameState,
  addResult,
}: {
  setLobsterMsg: (msg: string) => void,
  triggerBridge: (l: React.ReactNode, r: React.ReactNode, cb: () => void) => void,
  onComplete: () => void,
  updateGameState: (data: any) => void,
  gameState: any,
  addResult: (result: EpochResult) => void,
}) {
  const [task, setTask] = useState<'A' | 'B'>('A');

  // Task A — Awakening state
  const [awakenedElements, setAwakenedElements] = useState<Set<string>>(new Set());
  const [previewingElement, setPreviewingElement] = useState<string | null>(null);

  // Task B — Ecosystem Builder state
  const [placedItems, setPlacedItems] = useState<{id: string, type: string, x: number, y: number, icon: string}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConnections, setShowConnections] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  // AI Render state
  const [renderPhase, setRenderPhase] = useState<'idle' | 'waiting' | 'viewing'>('idle');
  const [renderResult, setRenderResult] = useState<{html: string; description: string} | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const renderCalled = useRef(false);

  // Naming state
  const [worldName, setWorldName] = useState('');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [motto, setMotto] = useState('');
  const [namingPhase, setNamingPhase] = useState(false);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;
    if (task === 'A') {
      id = setTimeout(() => setLobsterMsg(EPOCH4_MOCK.awakening.dialogue.intro), 1000);
    } else if (task === 'B' && renderPhase === 'idle' && !namingPhase) {
      id = setTimeout(() => setLobsterMsg(EPOCH4_MOCK.taskA.dialogue.intro), 1000);
    }
    return () => clearTimeout(id);
  }, [task, setLobsterMsg, renderPhase, namingPhase]);

  // === Task A: Awakening handlers ===

  const handlePreview = (elementId: string) => {
    if (awakenedElements.has(elementId)) return;
    setPreviewingElement(elementId);
    audioEngine.previewLayer(elementId);
    setLobsterMsg(EPOCH4_MOCK.awakening.dialogue.preview);
  };

  const handleAwaken = (elementId: string) => {
    if (awakenedElements.has(elementId)) return;

    const newAwakened = new Set(awakenedElements);
    newAwakened.add(elementId);
    setAwakenedElements(newAwakened);
    setPreviewingElement(null);

    audioEngine.awakenLayer(elementId);

    const count = newAwakened.size;
    const dialogueIndex = Math.min(count - 1, EPOCH4_MOCK.awakening.dialogue.awakened.length - 1);
    setLobsterMsg(EPOCH4_MOCK.awakening.dialogue.awakened[dialogueIndex]);

    if (count >= 4) {
      setTimeout(() => setLobsterMsg(EPOCH4_MOCK.awakening.dialogue.ready), 2500);
    }
  };

  const handleBringToLifeA = () => {
    const awakenedIds: string[] = Array.from(awakenedElements);
    updateGameState({ epoch4: { awakenedElements: awakenedIds } });

    const leftVisual = (
      <div className="flex flex-wrap items-center justify-center gap-4 p-8">
        {awakenedIds.map(id => {
          const item = EPOCH4_MOCK.awakening.items.find(i => i.id === id);
          return item ? (
            <div key={id} className="text-4xl element-awakened p-3 rounded-lg">
              {item.icon}
            </div>
          ) : null;
        })}
      </div>
    );

    const rightData = (
      <div className="text-cyan-300 font-mono text-[10px] whitespace-pre">
        {`唤醒报告:\n─────────────────\n`}
        {`已唤醒元素: ${awakenedIds.length}/8\n`}
        {`音频层级: ${awakenedIds.length}\n`}
        {`低音: 激活\n\n`}
        {awakenedIds.map(id => `[${id.toUpperCase()}] ♪ 层级激活\n`).join('')}
      </div>
    );

    triggerBridge(leftVisual, rightData, () => setTask('B'));
  };

  // === Task B: Ecosystem Builder handlers ===

  const awakenedItems = EPOCH4_MOCK.taskA.items.filter(i => awakenedElements.has(i.id));

  const addPlacedItem = (type: string, x: number, y: number) => {
    const itemDef = awakenedItems.find(i => i.id === type);
    if (!itemDef) return;
    setPlacedItems(prev => [...prev, {
      id: Math.random().toString(36).substring(2, 11),
      type, x, y,
      icon: itemDef.icon,
    }]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    addPlacedItem(e.dataTransfer.getData('text/plain'), e.clientX - rect.left, e.clientY - rect.top);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedTool) return;
    const rect = e.currentTarget.getBoundingClientRect();
    addPlacedItem(selectedTool, e.clientX - rect.left, e.clientY - rect.top);
  };

  const startEcosystemRender = async () => {
    if (renderCalled.current) return;
    renderCalled.current = true;
    setRenderPhase('waiting');
    setRenderError(null);
    setLobsterMsg('让我凝视一下这个生态系统... 每个位置都有它的理由。');

    try {
      const awakenedIds: string[] = Array.from(awakenedElements);
      const result = await callLLMEcosystemRender(placedItems, awakenedIds, gameState, EPOCH4_MOCK.awakening.items);
      setRenderResult(result);
      setRenderPhase('viewing');
      setLobsterMsg(result.description);

      addResult({
        epoch: 4,
        html: result.html,
        description: result.description,
      });
    } catch (err) {
      console.error('Ecosystem render failed:', err);
      setRenderError(err instanceof Error ? err.message : '出了点问题');
      setLobsterMsg('嗯。生态系统拒绝了我的解读。再试一次？');
      renderCalled.current = false;
    }
  };

  const handleRetryRender = () => {
    renderCalled.current = false;
    setRenderError(null);
    startEcosystemRender();
  };

  const handleBringToLifeB = () => {
    setIsAnalyzing(true);
    setLobsterMsg(EPOCH4_MOCK.taskA.dialogue.analyzing);

    setTimeout(() => {
      setLobsterMsg(EPOCH4_MOCK.taskA.dialogue.complete);
      updateGameState({ epoch4: { placedItems } });

      const leftVisual = (
        <div className="relative w-full h-full">
          {placedItems.map(item => (
            <div key={item.id} className="absolute text-2xl animate-bounce" style={{ left: item.x, top: item.y }}>
              {item.icon}
            </div>
          ))}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {placedItems.map((item, i) => {
              if (i === 0) return null;
              const prev = placedItems[i - 1];
              return <line key={`line-${i}`} x1={prev.x + 16} y1={prev.y + 16} x2={item.x + 16} y2={item.y + 16} stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4" />;
            })}
          </svg>
        </div>
      );

      const rightData = (
        <div className="text-cyan-300 font-mono text-[10px] whitespace-pre">
          {`生态分析:\n─────────────────\n`}
          {`实体数量: ${placedItems.length}\n`}
          {`检测到纽带: ${Math.floor(placedItems.length / 2)}\n`}
          {`生态稳定性: 84%\n\n`}
          {placedItems.slice(0, 3).map(i => `[${i.type.toUpperCase()}] 位于 (${Math.round(i.x)}, ${Math.round(i.y)})\n`).join('')}
          {`...`}
        </div>
      );

      triggerBridge(leftVisual, rightData, () => {
        setShowConnections(true);
        startEcosystemRender();
      });
    }, 3000);
  };

  const handleContinueToNaming = () => {
    setRenderPhase('idle');
    setNamingPhase(true);
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.namePrompt);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldName.trim()) return;
    setNameConfirmed(true);
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.nameReceived.replace('{name}', worldName));
  };

  const handleMottoSelect = (m: string) => {
    setMotto(m);
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.compiling);
    updateGameState({ epoch4: { worldName, chosenMotto: m } });
    setTimeout(() => onComplete(), 2000);
  };

  const getElementState = (elementId: string) => {
    if (awakenedElements.has(elementId)) return 'element-awakened';
    if (previewingElement === elementId) return 'element-previewing';
    return 'element-dormant';
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
      <div className="absolute top-4 left-4 text-xs text-cyan-300 z-10">
        纪元 IV · 共生  任务 {task === 'A' ? '1' : '2'}/2
      </div>

      {/* Task A: Awaken Life Elements */}
      {task === 'A' && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-[95%] max-w-2xl bg-black/60 p-4 sm:p-6 border border-cyan-800 backdrop-blur-sm">
          <div className="text-xs sm:text-sm text-cyan-300 text-center mb-2">唤醒元素</div>

          <div className="grid grid-cols-4 gap-3 sm:gap-4 w-full">
            {EPOCH4_MOCK.awakening.items.map(item => {
              const state = getElementState(item.id);
              const isAwakened = awakenedElements.has(item.id);
              const isPreviewing = previewingElement === item.id;

              return (
                <div
                  key={item.id}
                  className={`flex flex-col items-center gap-2 p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${state} ${
                    isAwakened
                      ? 'border-cyan-400 bg-cyan-950/40'
                      : isPreviewing
                        ? 'border-white bg-white/10'
                        : 'border-gray-700 bg-black/40 hover:border-gray-500'
                  }`}
                  onClick={() => !isAwakened && handlePreview(item.id)}
                >
                  <span className="text-2xl sm:text-3xl">{item.icon}</span>
                  <span className="text-[6px] sm:text-[8px] text-center" style={{ color: isAwakened ? item.color : '#666' }}>
                    {item.label}
                  </span>

                  {isPreviewing && !isAwakened && (
                    <button
                      className="pixel-btn !text-[7px] !px-2 !py-1 mt-1"
                      onClick={(e) => { e.stopPropagation(); handleAwaken(item.id); }}
                    >
                      唤醒
                    </button>
                  )}

                  {isAwakened && (
                    <span className="text-[7px] text-cyan-400">♪ 已苏醒</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-[8px] sm:text-[10px] text-gray-400">
              {awakenedElements.size}/8 已唤醒 {awakenedElements.size >= 4 ? '✓' : '(至少4个)'}
            </span>
            <button
              className="pixel-btn"
              disabled={awakenedElements.size < 4}
              onClick={handleBringToLifeA}
            >
              注入生命
            </button>
          </div>
        </div>
      )}

      {/* Task B: Ecosystem Canvas */}
      {task === 'B' && renderPhase === 'idle' && !namingPhase && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-[95%] max-w-3xl bg-black/60 p-4 sm:p-6 border border-cyan-800 backdrop-blur-sm">

          <div
            className="w-full h-64 sm:h-80 border-2 border-dashed border-cyan-600 relative overflow-hidden bg-cyan-950/30"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={handleCanvasClick}
          >
            <div className="absolute top-2 left-2 text-[8px] sm:text-[10px] text-cyan-500">建造区域（点击放置）</div>
            <div className="absolute top-2 right-2 text-[7px] text-cyan-700">再次点击元素可移除</div>
            {placedItems.map(item => (
              <div
                key={item.id}
                className="absolute text-2xl sm:text-3xl cursor-pointer hover:scale-110 transition-transform"
                style={{ left: item.x - 16, top: item.y - 16 }}
                onClick={(e) => { e.stopPropagation(); setPlacedItems(prev => prev.filter(i => i.id !== item.id)); }}
              >
                {item.icon}
              </div>
            ))}
            {showConnections && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {placedItems.map((item, i) => {
                  if (i === 0) return null;
                  const prev = placedItems[i - 1];
                  return <line key={`line-${i}`} x1={prev.x} y1={prev.y} x2={item.x} y2={item.y} stroke="rgba(0,255,255,0.3)" strokeWidth="1" />;
                })}
              </svg>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 p-2 sm:p-4 bg-black/80 border border-cyan-800 rounded w-full">
            {awakenedItems.map(item => (
              <div
                key={item.id}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
                onClick={() => setSelectedTool(selectedTool === item.id ? null : item.id)}
                className={`flex flex-col items-center gap-1 sm:gap-2 cursor-grab active:cursor-grabbing p-1 sm:p-2 rounded transition-all ${
                  selectedTool === item.id ? 'bg-cyan-700/60 ring-1 ring-cyan-400' : 'hover:bg-cyan-900/50'
                }`}
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <span className="text-[6px] sm:text-[8px] text-cyan-300">{item.label}</span>
              </div>
            ))}
          </div>

          {isAnalyzing && (
            <div className="text-[9px] text-cyan-400 animate-pulse text-center">
              正在分析生态联系...
            </div>
          )}
          <button
            className="pixel-btn w-full sm:w-auto"
            disabled={placedItems.length < 4 || isAnalyzing}
            onClick={handleBringToLifeB}
          >
            {isAnalyzing ? '分析中...' : '注入生命'}
          </button>
        </div>
      )}

      {/* AI Render: Waiting */}
      {task === 'B' && renderPhase === 'waiting' && !renderError && (
        <div className="flex flex-col items-center gap-6 bg-black/80 p-8 sm:p-12 border border-cyan-800 backdrop-blur-md w-[90%] max-w-lg text-center">
          <div className="text-4xl animate-pulse">🦞</div>
          <div className="text-[10px] sm:text-xs text-cyan-300 animate-pulse">
            正在渲染生态系统...
          </div>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Render: Error */}
      {task === 'B' && renderPhase === 'waiting' && renderError && (
        <div className="flex flex-col items-center gap-4 bg-black/80 p-8 border border-red-800 backdrop-blur-md w-[90%] max-w-lg text-center">
          <div className="text-[10px] text-red-400">渲染失败</div>
          <div className="text-[8px] text-gray-400 max-w-md">{renderError}</div>
          <button className="pixel-btn" onClick={handleRetryRender}>
            再试一次
          </button>
        </div>
      )}

      {/* AI Render: Viewing */}
      {task === 'B' && renderPhase === 'viewing' && renderResult && (
        <div className="absolute inset-0 flex flex-col">
          <iframe
            srcDoc={renderResult.html}
            sandbox="allow-scripts"
            title="生态系统渲染"
            className="flex-1 w-full border-0"
          />
          <div className="flex flex-col items-center gap-3 p-4 bg-black/90 border-t border-cyan-800">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">🦞</span>
              <span className="text-[9px] sm:text-xs text-gray-300">{renderResult.description}</span>
            </div>
            <button className="pixel-btn" onClick={handleContinueToNaming}>
              为这个世界命名 →
            </button>
          </div>
        </div>
      )}

      {/* Naming & Motto */}
      {task === 'B' && namingPhase && !motto && (
        <div className="flex flex-col items-center gap-6 sm:gap-8 bg-black/80 p-4 sm:p-8 border border-cyan-500 w-[90%] max-w-xl text-center backdrop-blur-md">
          {!nameConfirmed && (
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4 w-full">
              <div className="text-xs sm:text-sm text-cyan-300">为这个世界命名：</div>
              <input
                autoFocus
                className="pixel-input text-center w-full text-xs sm:text-sm"
                value={worldName}
                onChange={e => setWorldName(e.target.value)}
                maxLength={30}
                placeholder="输入名字..."
              />
              <button type="submit" className="pixel-btn mt-2" disabled={!worldName.trim()}>封印名字</button>
            </form>
          )}

          {nameConfirmed && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full mt-2 sm:mt-4">
              <div className="text-[10px] sm:text-xs text-cyan-400 mb-1 sm:mb-2">选择它的立国之本：</div>
              {EPOCH4_MOCK.taskB.mottoTemplates.map((m, i) => {
                const s1 = gameState.epoch2?.shapeNames?.[0] || '珊瑚';
                const s2 = gameState.epoch2?.shapeNames?.[1] || '月亮';
                const s3 = gameState.epoch2?.shapeNames?.[2] || '海藻';
                const e1 = gameState.epoch2?.emotions?.[0]?.label || '攻击性';
                const e3 = gameState.epoch2?.emotions?.[2]?.label || '成长';
                const rType = gameState.epoch2?.chosenRule?.label || '循环';

                const text = m
                  .replace('{shape3}', s3).replace('{shape1}', s1).replace('{shape2}', s2)
                  .replace('{emotion1}', e1).replace('{emotion3}', e3)
                  .replace('{ruleType}', rType);

                return (
                  <button key={i} className="pixel-btn text-[8px] sm:text-[9px] text-left leading-relaxed py-2" onClick={() => handleMottoSelect(text)}>
                    "{text}"
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
