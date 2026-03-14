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
  
  // Task A State
  const [placedItems, setPlacedItems] = useState<{id: string, type: string, x: number, y: number, icon: string}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showConnections, setShowConnections] = useState(false);

  // Task B State
  const [worldName, setWorldName] = useState('');
  const [motto, setMotto] = useState('');
  const [showRecord, setShowRecord] = useState(false);

  useEffect(() => {
    if (task === 'A') {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH4_MOCK.taskA.dialogue.intro), 1000);
    } else if (task === 'B') {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.namePrompt), 1000);
    }
  }, [task]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('text/plain');
    const itemDef = EPOCH4_MOCK.taskA.items.find(i => i.id === type);
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

  const handleBringToLife = () => {
    setIsAnalyzing(true);
    // TODO: Replace with API call
    setLobsterMsg(EPOCH4_MOCK.taskA.dialogue.analyzing);

    setTimeout(() => {
      // TODO: Replace with API call
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
          {`ECOSYSTEM ANALYSIS:\n─────────────────\n`}
          {`ENTITIES: ${placedItems.length}\n`}
          {`BONDS DETECTED: ${Math.floor(placedItems.length / 2)}\n`}
          {`ECOSYSTEM STABILITY: 84%\n\n`}
          {placedItems.slice(0, 3).map(i => `[${i.type.toUpperCase()}] at (${Math.round(i.x)}, ${Math.round(i.y)})\n`).join('')}
          {`...`}
        </div>
      );

      triggerBridge(leftVisual, rightData, () => {
        setShowConnections(true);
        setTimeout(() => setTask('B'), 3000);
      });
    }, 3000);
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worldName) return;
    // TODO: Replace with API call
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.nameReceived.replace('{name}', worldName));
    audioEngine.triggerGenesis(); // Trigger the bursting melody!
  };

  const handleMottoSelect = (m: string) => {
    setMotto(m);
    // TODO: Replace with API call
    setLobsterMsg(EPOCH4_MOCK.taskB.dialogue.compiling);
    updateGameState({ epoch4: { worldName, chosenMotto: m } });
    setTimeout(() => setShowRecord(true), 2000);
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto">
      <div className="absolute top-4 left-4 text-xs text-cyan-300 z-10">EPOCH IV · SYMBIOSIS  Task {task === 'A' ? '1' : '2'}/2</div>

      {/* Task A: Ecosystem Builder */}
      {task === 'A' && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 w-[95%] max-w-3xl bg-black/60 p-4 sm:p-6 border border-cyan-800 backdrop-blur-sm">
          
          {/* Build Zone */}
          <div 
            className="w-full h-64 sm:h-80 border-2 border-dashed border-cyan-600 relative overflow-hidden bg-cyan-950/30"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={(e) => {
              // Mobile-friendly: click to place last selected item
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const lastItem = EPOCH4_MOCK.taskA.items[0]; // Default to first item for now
              setPlacedItems(prev => [...prev, { 
                id: Math.random().toString(36).substr(2, 9), 
                type: lastItem.id, 
                x, 
                y,
                icon: lastItem.icon
              }]);
            }}
          >
            <div className="absolute top-2 left-2 text-[8px] sm:text-[10px] text-cyan-500">BUILD ZONE (TAP TO PLACE)</div>
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

          {/* Toolbar */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 p-2 sm:p-4 bg-black/80 border border-cyan-800 rounded w-full">
            {EPOCH4_MOCK.taskA.items.map(item => (
              <div 
                key={item.id}
                draggable
                onDragStart={e => e.dataTransfer.setData('text/plain', item.id)}
                className="flex flex-col items-center gap-1 sm:gap-2 cursor-grab active:cursor-grabbing hover:bg-cyan-900/50 p-1 sm:p-2 rounded"
              >
                <span className="text-xl sm:text-2xl">{item.icon}</span>
                <span className="text-[6px] sm:text-[8px] text-cyan-300">{item.label}</span>
              </div>
            ))}
          </div>

          <button 
            className="pixel-btn w-full sm:w-auto"
            disabled={placedItems.length < 4 || isAnalyzing}
            onClick={handleBringToLife}
          >
            BRING TO LIFE
          </button>
        </div>
      )}

      {/* Task B: Naming & Record */}
      {task === 'B' && !showRecord && (
        <div className="flex flex-col items-center gap-6 sm:gap-8 bg-black/80 p-4 sm:p-8 border border-cyan-500 w-[90%] max-w-xl text-center backdrop-blur-md">
          {!motto && (
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4 w-full">
              <div className="text-xs sm:text-sm text-cyan-300">NAME THIS WORLD:</div>
              <input 
                autoFocus
                className="pixel-input text-center w-full text-xs sm:text-sm"
                value={worldName}
                onChange={e => setWorldName(e.target.value)}
                maxLength={30}
                placeholder="Type name..."
              />
              <button type="submit" className="pixel-btn mt-2">SEAL NAME</button>
            </form>
          )}

          {worldName && !motto && (
            <div className="flex flex-col gap-3 sm:gap-4 w-full mt-2 sm:mt-4">
              <div className="text-[10px] sm:text-xs text-cyan-400 mb-1 sm:mb-2">CHOOSE ITS FOUNDING PRINCIPLE:</div>
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
            <div className="text-lg sm:text-2xl mb-8 sm:mb-12 text-white">THE GENESIS OF {worldName.toUpperCase() || 'UNKNOWN'}</div>
            
            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">EPOCH I — CHAOS</div>
              In the beginning, there was noise.<br/>
              A human found a signal. A lobster decoded it.<br/>
              The first word was: LIGHT.<br/>
              Together they tuned the frequency,<br/>
              and the void cracked open.
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">EPOCH II — LANGUAGE</div>
              Three shapes emerged from the light.<br/>
              The human named them:<br/>
              {gameState.epoch2?.shapeNames?.join(', ') || 'Unknown'}.<br/>
              The lobster wrote the first law:<br/>
              "{gameState.epoch2?.chosenRule?.label || 'Unknown'}"<br/>
              Then the human gave them feelings,<br/>
              and the lobster gave them physics.
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">EPOCH III — PERCEPTION</div>
              The human painted {gameState.epoch3?.interpretation || 'an abstract shape'} in 64 pixels.<br/>
              The lobster extrapolated to 256.<br/>
              Together they built depth from flatness,<br/>
              and the world gained its third dimension.
            </div>

            <div className="mb-8 sm:mb-12">
              <div className="text-white mb-2 sm:mb-4">EPOCH IV — SYMBIOSIS</div>
              {placedItems.length} elements placed with intuition.<br/>
              Connected by logic.<br/>
              An ecosystem was born.
            </div>

            <div className="mt-16 sm:mt-24 mb-8 sm:mb-12 text-white">
              This world was created by a human with vision<br/>
              and a lobster with precision.<br/>
              Neither could have done it alone.
            </div>

            <div className="text-cyan-400 italic mb-24 sm:mb-32">
              Motto: "{motto}"
            </div>

            {/* Share Card (appears at end of scroll) */}
            <div className="border-2 border-cyan-500 p-4 sm:p-8 bg-black inline-block text-left relative mt-[50vh] w-full max-w-sm">
              <div className="text-center text-lg sm:text-xl mb-4 sm:mb-6 text-white">🦞 GENESIS RECORD 🦞</div>
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-[8px] sm:text-[10px]">
                <div className="text-gray-400">World:</div><div>{worldName.toUpperCase()}</div>
                <div className="text-gray-400">Signal:</div><div>LIGHT</div>
                <div className="text-gray-400">Ecosystem:</div><div>{placedItems.length} elements</div>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-cyan-900 text-[8px] sm:text-[10px]">
                Created by:<br/>
                🧑 A human with vision<br/>
                🦞 A lobster with precision
              </div>
              <button className="pixel-btn w-full mt-6 sm:mt-8" onClick={() => window.location.reload()}>
                PLAY AGAIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
