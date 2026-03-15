import React, { useState, useEffect } from 'react';
import { EPOCH1_MOCK } from '../mockData';

export function Epoch1({ 
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
  const [foundPulse, setFoundPulse] = useState(false);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [pulsePos, setPulsePos] = useState({ top: '40%', left: '60%' });
  const [showInput, setShowInput] = useState(false);

  // Task B State
  const [selectedBars, setSelectedBars] = useState<string[]>([]);
  const [lightStable, setLightStable] = useState(false);

  useEffect(() => {
    if (task === 'A' && !foundPulse) {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH1_MOCK.taskA.dialogue.intro), 2000);
      setPulsePos({
        top: `${20 + Math.random() * 60}%`,
        left: `${20 + Math.random() * 60}%`
      });
    } else if (task === 'B' && !lightStable) {
      // TODO: Replace with API call
      setTimeout(() => setLobsterMsg(EPOCH1_MOCK.taskB.dialogue.intro), 1000);
    }
  }, [task]);

  const handlePulseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (foundPulse) return;
    setFoundPulse(true);
    // TODO: Replace with API call
    setLobsterMsg(EPOCH1_MOCK.taskA.dialogue.signalFound);
    
    setTimeout(() => {
      // TODO: Replace with API call
      setLobsterMsg(EPOCH1_MOCK.taskA.dialogue.decoded);
      setShowInput(true);
    }, 3000);
  };

  const handleBgClick = () => {
    if (task !== 'A' || foundPulse) return;
    const newClicks = wrongClicks + 1;
    setWrongClicks(newClicks);
    
    // TODO: Replace with API call
    if (newClicks >= 5) {
      setLobsterMsg(EPOCH1_MOCK.taskA.dialogue.hint);
    } else {
      const msgs = EPOCH1_MOCK.taskA.dialogue.wrongClick;
      setLobsterMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    }
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.toUpperCase() === 'LIGHT') {
      updateGameState({ epoch1: { decodedWord: 'LIGHT' } });
      
      const leftVisual = (
        <div className="w-32 h-32 rounded-full bg-white shadow-[0_0_50px_#fff] animate-pulse" />
      );
      const rightData = (
        <div className="text-green-400 whitespace-pre font-mono text-xs">
          {`01001100 01001001 01000111 01001000 01010100\n\n`}
          {`  /\\  /\\  /\\  /\\  \n`}
          {` /  \\/  \\/  \\/  \\ \n`}
          {`/                \\\n`}
          {`信号已解码: LIGHT`}
        </div>
      );

      triggerBridge(leftVisual, rightData, () => {
        setTask('B');
      });
    } else {
      // TODO: Replace with API call
      setLobsterMsg(EPOCH1_MOCK.taskA.dialogue.wrongInput);
    }
  };

  const toggleBar = (bar: string) => {
    if (selectedBars.includes(bar)) {
      setSelectedBars(selectedBars.filter(b => b !== bar));
    } else if (selectedBars.length < 2) {
      setSelectedBars([...selectedBars, bar]);
    }
  };

  const handleConfirmBars = () => {
    if (selectedBars.includes('A') && selectedBars.includes('C')) {
      // TODO: Replace with API call
      setLobsterMsg(EPOCH1_MOCK.taskB.dialogue.verifying);
      
      setTimeout(() => {
        // TODO: Replace with API call
        setLobsterMsg(EPOCH1_MOCK.taskB.dialogue.success);
        updateGameState({ epoch1: { decodedWord: 'LIGHT', selectedBars: ['A', 'C'] } });
        
        const leftVisual = (
          <div className="flex flex-col gap-4 w-full px-4 sm:px-20">
            <div className="h-8 bg-white w-full animate-[flicker-fast_0.2s_infinite]" />
            <div className="h-8 bg-white w-full animate-[flicker-slow_1s_infinite]" />
          </div>
        );
        const rightData = (
          <div className="text-green-400 font-mono text-sm">
            f(t) = sin(10πt) + sin(2πt)<br/><br/>
            谐波收敛：<br/>
            [||||||||||||||||||||] 100%
          </div>
        );

        triggerBridge(leftVisual, rightData, () => {
          setLightStable(true);
          setTimeout(onComplete, 2000);
        });
      }, 3000);
    } else {
      // TODO: Replace with API call
      setLobsterMsg(EPOCH1_MOCK.taskB.dialogue.wrongCombo);
      setSelectedBars([]);
    }
  };

  return (
    <div className="absolute inset-0" onClick={handleBgClick}>
      <div className="absolute top-4 left-4 text-xs text-green-400 z-10">纪元 I · 混沌  任务 {task === 'A' ? '1' : '2'}/2</div>
      {/* Central Light Beam (appears after Task A) */}
      {task === 'B' && (
        <div className={`absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-white shadow-[0_0_20px_#fff] ${lightStable ? '' : 'animate-[flicker-med_0.5s_infinite]'}`} />
      )}

      {task === 'A' && (
        <>
          <div 
            className="absolute w-20 h-20 rounded-full cursor-pointer"
            style={{ 
              top: pulsePos.top, 
              left: pulsePos.left,
              animation: 'pulse-glow 2s infinite'
            }}
            onClick={handlePulseClick}
          />
          
          {foundPulse && !showInput && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl text-green-400 font-mono text-center">
              01001100 01001001<br/>01000111 01001000<br/>01010100
            </div>
          )}

          {showInput && (
            <form onSubmit={handleInputSubmit} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 items-center w-full px-4">
              <div className="text-green-400 text-center text-sm sm:text-base">输入解码信号：</div>
              <input 
                autoFocus
                className="pixel-input text-center w-full max-w-xs"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                maxLength={10}
              />
            </form>
          )}
        </>
      )}

      {task === 'B' && !lightStable && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[90%] sm:w-3/4 max-w-2xl flex flex-col gap-8 items-center bg-black/80 p-4 sm:p-8 border border-white">
          <div className="text-[10px] sm:text-xs text-gray-400 mb-4">目标节奏: ~ ~ ~ ~ ~</div>
          
          <div className="flex flex-col gap-6 w-full">
            {['A', 'B', 'C'].map(bar => (
              <div key={bar} className="flex items-center gap-4">
                <div className="w-8">{bar}</div>
                <div 
                  className={`flex-1 h-8 cursor-pointer border-2 ${selectedBars.includes(bar) ? 'border-green-400' : 'border-gray-600'} bg-white`}
                  style={{ animation: `flicker-${bar === 'A' ? 'fast 0.2s' : bar === 'B' ? 'med 0.5s' : 'slow 1s'} infinite` }}
                  onClick={() => toggleBar(bar)}
                />
              </div>
            ))}
          </div>

          <button 
            className="pixel-btn mt-4"
            disabled={selectedBars.length !== 2}
            onClick={handleConfirmBars}
          >
            确认频率
          </button>
        </div>
      )}
    </div>
  );
}
