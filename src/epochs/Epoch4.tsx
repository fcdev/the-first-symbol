import React, { useState, useEffect } from 'react';
import { EPOCH4_MOCK } from '../mockData';
import { audioEngine } from '../audio';

export function Epoch4({
  setLobsterMsg,
  triggerBridge,
  onComplete,
  updateGameState,
  gameState
}: {
  setLobsterMsg: (msg: string) => void,
  triggerBridge: (l: React.ReactNode, r: React.ReactNode, cb: () => void) => void,
  onComplete: () => void,
  updateGameState: (data: any) => void,
  gameState: any
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

  // Task B — Naming & Record state
  const [worldName, setWorldName] = useState('');
  const [motto, setMotto] = useState('');
  const [showRecord, setShowRecord] = useState(false);
  const [namingPhase, setNamingPhase] = useState(false);

  useEffect(() => {
    if (task === 'A') {
      setTimeout(() => setLobsterMsg(EPOCH4_MOCK.awakening.dialogue.intro), 1000);
    } else if (task === 'B') {
      setTimeout(() => setLobsterMsg(EPOCH4_MOCK.taskA.dialogue.intro), 1000);
    }
  }, [task]);

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

    // Update lobster dialogue based on count
    const count = newAwakened.size;
    const dialogueIndex = Math.min(count - 1, EPOCH4_MOCK.awakening.dialogue.awakened.length - 1);
    setLobsterMsg(EPOCH4_MOCK.awakening.dialogue.awakened[dialogueIndex]);

    // Show "ready" hint when threshold reached
    if (count === 4) {
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

    triggerBridge(leftVisual, rightData, () => {
      setTask('B');
    });
  };

  // === Task B: Ecosystem Builder handlers ===

  const awakenedItems = EPOCH4_MOCK.taskA.items.filter(i => awakenedElements.has(i.id));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const itemDef = awakenedItems.find(i => i.id === type);
    if (!itemDef) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPlacedItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x,
      y,
      icon: itemDef.icon
    }]);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!selectedTool) return;
    const itemDef = awakenedItems.find(i => i.id === selectedTool);
    if (!itemDef) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPlacedItems(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type: selectedTool,
      x,
      y,
      icon: itemDef.icon
    }]);
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
              const prev = placedItems[i-1];
              return <line key={`line-${i}`} x1={prev.x+16} y1={prev.y+16} x2={item.x+16} y2={item.y+16} stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4" />
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
          {placedItems.slice(0, 3).map(i => `[${i.type.toUpperCase()}] at (${Math.round(i.x)}, ${Math.round(i.y)})\n`).join('')}
          {`...`}
        </div>
      );

      triggerBridge(leftVisual, rightData, () => {
        setShowConnections(true);
        setNamingPhase(true);
        setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.namePrompt);
      });
    }, 3000);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldName) return;
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.nameReceived.replace('{name}', worldName));
    audioEngine.triggerGenesis();
  };

  const handleMottoSelect = (m: string) => {
    setMotto(m);
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.compiling);
    updateGameState({ epoch4: { worldName, chosenMotto: m } });
    setTimeout(() => setShowRecord(true), 2000);
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

          {/* 4x2 Element Grid */}
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

          {/* Progress & Action */}
          <div className="flex items-center justify-between w-full mt-2">
            <span className="text-[8px] sm:text-[10px] text-gray-400">
              {awakenedElements.size}/8 已唤醒 {awakenedElements.size >= 4 ? '✓' : `(至少4个)`}
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

      {/* Task B: Ecosystem Canvas (only awakened elements) + Naming */}
      {task === 'B' && !namingPhase && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-[95%] max-w-3xl bg-black/60 p-4 sm:p-6 border border-cyan-800 backdrop-blur-sm">

          {/* Build Zone */}
          <div
            className="w-full h-64 sm:h-80 border-2 border-dashed border-cyan-600 relative overflow-hidden bg-cyan-950/30"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={handleCanvasClick}
          >
            <div className="absolute top-2 left-2 text-[8px] sm:text-[10px] text-cyan-500">建造区域（点击放置）</div>
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
                  const prev = placedItems[i-1];
                  return <line key={`line-${i}`} x1={prev.x} y1={prev.y} x2={item.x} y2={item.y} stroke="rgba(0,255,255,0.3)" strokeWidth="1" />
                })}
              </svg>
            )}
          </div>

          {/* Toolbar — only awakened elements */}
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

          <button
            className="pixel-btn w-full sm:w-auto"
            disabled={placedItems.length < 4 || isAnalyzing}
            onClick={handleBringToLifeB}
          >
            注入生命
          </button>
        </div>
      )}

      {/* Task B: Naming & Motto */}
      {task === 'B' && namingPhase && !showRecord && (
        <div className="flex flex-col items-center gap-6 sm:gap-8 bg-black/80 p-4 sm:p-8 border border-cyan-500 w-[90%] max-w-xl text-center backdrop-blur-md">
          {!motto && (
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
              <button type="submit" className="pixel-btn mt-2">封印名字</button>
            </form>
          )}

          {worldName && !motto && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full mt-2 sm:mt-4">
              <div className="text-[10px] sm:text-xs text-cyan-400 mb-1 sm:mb-2">选择它的立国之本：</div>
              {EPOCH4_MOCK.taskB.mottoTemplates.map((m, i) => {
                const s1 = gameState.epoch2?.shapeNames?.[0] || 'CORAL';
                const s2 = gameState.epoch2?.shapeNames?.[1] || 'MOON';
                const s3 = gameState.epoch2?.shapeNames?.[2] || 'KELP';
                const e1 = gameState.epoch2?.emotions?.[0]?.label || 'Aggression';
                const e3 = gameState.epoch2?.emotions?.[2]?.label || 'Growth';
                const rType = gameState.epoch2?.chosenRule?.label || 'CYCLE';

                const text = m.replace('{shape3}', s3).replace('{shape1}', s1).replace('{shape2}', s2)
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

      {/* Genesis Record Scroll */}
      {showRecord && (
        <div className="absolute inset-0 bg-black/90 flex justify-center overflow-hidden z-50 px-4">
          <div className="w-full max-w-2xl text-center text-cyan-300 text-[10px] sm:text-xs leading-loose animate-[scroll-up_25s_linear_forwards] pt-[100vh]">
            <div className="text-lg sm:text-2xl mb-8 sm:mb-12 text-white">{worldName.toUpperCase() || '未知'} 的创世纪</div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">纪元 I — 混沌</div>
              起初，只有噪音。<br/>
              一个人类发现了信号。一只龙虾解码了它。<br/>
              第一个词是：LIGHT。<br/>
              他们一起调谐了频率，<br/>
              虚空裂开了。
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">纪元 II — 语言</div>
              三个形状从光中浮现。<br/>
              人类为它们命名：<br/>
              {gameState.epoch2?.shapeNames?.join('、') || '未知'}。<br/>
              龙虾写下了第一条法则：<br/>
              「{gameState.epoch2?.chosenRule?.label || '未知'}」<br/>
              然后人类赋予它们情感，<br/>
              龙虾赋予它们物理法则。
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">纪元 III — 感知</div>
              人类用64个像素画了{gameState.epoch3?.interpretation || '一个抽象形状'}。<br/>
              龙虾将其外推到256个。<br/>
              他们一起从扁平中构建了深度，<br/>
              世界获得了第三个维度。
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">纪元 IV — 共生</div>
              {awakenedElements.size} 个元素从沉默中苏醒。<br/>
              {placedItems.length} 个碎片凭直觉放置。<br/>
              由逻辑连接。<br/>
              一个生态系统诞生了。
            </div>

            <div className="mt-16 sm:mt-24 mb-8 sm:mb-12 text-white">
              这个世界由一个有远见的人类<br/>
              和一只精确的龙虾共同创造。<br/>
              缺一不可。
            </div>

            <div className="text-cyan-400 italic mb-24 sm:mb-32">
              箴言：「{motto}」
            </div>

            {/* Share Card */}
            <div className="border-2 border-cyan-500 p-4 sm:p-8 bg-black inline-block text-left relative mt-[50vh] w-full max-w-sm">
              <div className="text-center text-lg sm:text-xl mb-4 sm:mb-6 text-white">🦞 创世纪录 🦞</div>
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-[8px] sm:text-[10px]">
                <div className="text-gray-400">世界：</div><div>{worldName.toUpperCase()}</div>
                <div className="text-gray-400">信号：</div><div>LIGHT</div>
                <div className="text-gray-400">元素：</div><div>{awakenedElements.size} 已唤醒</div>
                <div className="text-gray-400">生态：</div><div>{placedItems.length} 已放置</div>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-cyan-900 text-[8px] sm:text-[10px]">
                创造者：<br/>
                🧑 一个有远见的人类<br/>
                🦞 一只精确的龙虾
              </div>
              <button className="pixel-btn w-full mt-6 sm:mt-8" onClick={() => onComplete()}>
                继续 →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
