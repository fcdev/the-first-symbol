import React, { useState, useEffect } from 'react';
import { EPOCH2_MOCK } from '../mockData';

export function Epoch2({ 
  setLobsterMsg, 
  triggerBridge, 
  onComplete,
  updateGameState
}: { 
  setLobsterMsg: (msg: string) => void,
  triggerBridge: (l: React.ReactNode, r: React.ReactNode, cb: () => void) => void,
  onComplete: () => void,
  updateGameState: (data: any) => void
}) {
  const [task, setTask] = useState<'A' | 'B'>('A');

  // Task A State
  const [names, setNames] = useState<Record<number, string>>({});
  const [rule, setRule] = useState<any>(null);

  // Task B State
  const [emotions, setEmotions] = useState<Record<number, any>>({});
  const [selectedEmotion, setSelectedEmotion] = useState<any>(null);

  useEffect(() => {
    if (task === 'A') {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH2_MOCK.taskA.dialogue.intro), 1000);
    } else if (task === 'B') {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH2_MOCK.taskB.dialogue.intro), 1000);
    }
  }, [task]);

  // Fire namesConfirmed dialogue once all 3 shapes are named
  useEffect(() => {
    if (task === 'A' && Object.keys(names).length === 3 && !rule) {
      setLobsterMsg(EPOCH2_MOCK.taskA.dialogue.namesConfirmed);
    }
  }, [names, task, rule]);

  const handleNameSelect = (shapeId: number, name: string) => {
    setNames(prev => ({ ...prev, [shapeId]: name }));
  };

  const handleRuleSelect = (r: any) => {
    setRule(r);
    // TODO: Replace with API call
    setLobsterMsg(EPOCH2_MOCK.taskA.dialogue.ruleChosen);
    
    updateGameState({ epoch2: { shapeNames: [names[1], names[2], names[3]], chosenRule: r } });

    const leftVisual = (
      <div className="flex gap-8 items-center justify-center w-full h-full">
        {EPOCH2_MOCK.taskA.shapes.map(s => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <ShapeGraphic type={s.type} color="#fff" />
            <div className="text-[10px]">{names[s.id]}</div>
          </div>
        ))}
      </div>
    );

    const rightData = (
      <div className="text-blue-300 font-mono text-xs whitespace-pre">
        {`逻辑图谱已编译:\n\n`}
        {`[${names[1]}] ---> [${names[2]}]\n`}
        {`   ^          |\n`}
        {`   |          v\n`}
        {`   ---- [${names[3]}]\n\n`}
        {`法则: ${r.label}`}
      </div>
    );

    triggerBridge(leftVisual, rightData, () => setTask('B'));
  };

  const handleDrop = (e: React.DragEvent, shapeId: number) => {
    e.preventDefault();
    const colorStr = e.dataTransfer.getData('text/plain');
    const emotion = EPOCH2_MOCK.taskB.emotions.find(em => em.color === colorStr);
    if (emotion) {
      setEmotions(prev => ({ ...prev, [shapeId]: emotion }));
    }
  };

  // Click-to-assign: click emotion → select it, click shape → assign
  const handleEmotionClick = (em: any) => {
    setSelectedEmotion(prev => prev?.color === em.color ? null : em);
  };

  const handleShapeClick = (shapeId: number) => {
    if (task !== 'B' || !selectedEmotion) return;
    setEmotions(prev => ({ ...prev, [shapeId]: selectedEmotion }));
    setSelectedEmotion(null);
  };

  const handleApplyEmotions = () => {
    // TODO: Replace with API call
    setLobsterMsg(EPOCH2_MOCK.taskB.dialogue.processing);
    
    setTimeout(() => {
      // TODO: Replace with API call
      setLobsterMsg(EPOCH2_MOCK.taskB.dialogue.success);
      updateGameState({ epoch2: { emotions: [emotions[1], emotions[2], emotions[3]] } });

      const leftVisual = (
        <div className="flex gap-12 items-center justify-center w-full h-full">
          {EPOCH2_MOCK.taskA.shapes.map(s => (
            <div key={s.id} className="relative">
              <ShapeGraphic 
                type={s.type} 
                color={emotions[s.id]?.color || '#fff'} 
                className={`animate-[pulse-glow_${emotions[s.id]?.pulseRate * 2 || 2}s_infinite]`}
              />
            </div>
          ))}
        </div>
      );

      const rightData = (
        <div className="text-blue-300 font-mono text-[10px] whitespace-pre">
          {`配置已生成:\n\n`}
          {EPOCH2_MOCK.taskA.shapes.map(s => (
            `${names[s.id]}.cfg:\n  temperament: ${emotions[s.id]?.param}\n  pulse_rate: ${emotions[s.id]?.pulseRate}\n  movement: ${emotions[s.id]?.movement}\n\n`
          )).join('')}
        </div>
      );

      triggerBridge(leftVisual, rightData, () => onComplete());
    }, 3000);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <div className="absolute top-4 left-4 text-xs text-blue-300 z-10">纪元 II · 语言  任务 {task === 'A' ? '1' : '2'}/2</div>
      
      {/* Shapes Display */}
      <div className="flex flex-wrap sm:flex-nowrap justify-center gap-8 sm:gap-16 mb-8 sm:mb-12 px-4">
        {EPOCH2_MOCK.taskA.shapes.map(s => (
          <div
            key={s.id}
            className={`flex flex-col items-center gap-4 ${task === 'B' && selectedEmotion ? 'cursor-pointer ring-1 ring-white/20 rounded' : ''}`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => task === 'B' && handleDrop(e, s.id)}
            onClick={() => handleShapeClick(s.id)}
          >
            <div className={`relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center transition-all duration-1000 ${task === 'B' && emotions[s.id] ? 'scale-110' : ''}`}>
              {task === 'B' && emotions[s.id] && (
                <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ backgroundColor: emotions[s.id].color }} />
              )}
              <ShapeGraphic type={s.type} color={emotions[s.id]?.color || '#fff'} />
            </div>
            
            {task === 'A' && !rule && (
              <div className="flex flex-col gap-2">
                {s.options.map(opt => (
                  <button 
                    key={opt}
                    className={`pixel-btn text-[8px] py-1 px-2 ${names[s.id] === opt ? 'bg-white text-black' : ''}`}
                    onClick={() => handleNameSelect(s.id, opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
            
            {(task === 'B' || rule) && (
              <div className="text-[10px] sm:text-xs text-blue-200">{names[s.id]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Task A Rules */}
      {task === 'A' && Object.keys(names).length === 3 && !rule && (
        <div className="flex flex-col gap-4 items-center bg-black/80 p-4 sm:p-6 border border-blue-500 w-[90%] max-w-2xl text-center">
          <div className="text-xs sm:text-sm text-blue-300 mb-2">选择一条世界法则：</div>
          {EPOCH2_MOCK.taskA.ruleTemplates.map(r => {
            const text = r.template
              .replace('{0}', names[1])
              .replace('{1}', names[2])
              .replace('{2}', names[3]);
            return (
              <button key={r.label} className="pixel-btn w-full text-left text-[8px] sm:text-[10px]" onClick={() => handleRuleSelect(r)}>
                <span className="text-blue-400 mr-2 sm:mr-4">[{r.label}]</span>
                {text}
              </button>
            );
          })}
        </div>
      )}

      {/* Task B Emotions */}
      {task === 'B' && (
        <div className="flex flex-col gap-4 sm:gap-6 items-center bg-black/80 p-4 sm:p-6 border border-blue-500 w-[90%] max-w-md">
          <div className="text-xs sm:text-sm text-blue-300 text-center">
            拖拽或点击情感，再点击形状来分配
          </div>
          {selectedEmotion && (
            <div className="text-[8px] text-yellow-300 animate-pulse">
              已选中：{selectedEmotion.label} — 点击上方形状来分配
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 w-full">
            {EPOCH2_MOCK.taskB.emotions.map(em => (
              <div
                key={em.label}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', em.color)}
                onClick={() => handleEmotionClick(em)}
                className={`flex items-center gap-2 cursor-pointer p-1 sm:p-2 border transition-colors ${
                  selectedEmotion?.color === em.color
                    ? 'border-white bg-white/10'
                    : 'border-gray-700 hover:border-white'
                }`}
              >
                <div className="w-4 h-4 sm:w-6 sm:h-6 shrink-0" style={{ backgroundColor: em.color }} />
                <span className="text-[8px] sm:text-[10px] truncate">{em.label}</span>
              </div>
            ))}
          </div>
          <button
            className="pixel-btn mt-2 sm:mt-4 w-full sm:w-auto"
            disabled={Object.keys(emotions).length !== 3}
            onClick={handleApplyEmotions}
          >
            赋予情感
          </button>
        </div>
      )}
    </div>
  );
}

function ShapeGraphic({ type, color, className = '' }: { type: string, color: string, className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={`w-full h-full ${className}`} style={{ stroke: color, fill: 'none', strokeWidth: 2, filter: `drop-shadow(0 0 5px ${color})` }}>
      {type === 'spiky' && <polygon points="50,10 65,40 95,50 65,60 50,90 35,60 5,50 35,40" />}
      {type === 'round' && <circle cx="50" cy="50" r="35" />}
      {type === 'tall' && <rect x="35" y="15" width="30" height="70" rx="15" />}
    </svg>
  );
}
