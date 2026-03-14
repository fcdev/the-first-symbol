import React, { useState, useEffect } from 'react';
import { LobsterChat, BridgeOverlay, Background } from './components';
import { Epoch1 } from './epochs/Epoch1';
import { Epoch2 } from './epochs/Epoch2';
import { Epoch3 } from './epochs/Epoch3';
import { Epoch4 } from './epochs/Epoch4';
import { audioEngine } from './audio';

export default function App() {
  const [epoch, setEpoch] = useState(0); // 0 = Title, 1-4 = Epochs
  const [lobsterMsg, setLobsterMsg] = useState('');
  const [bridge, setBridge] = useState<{left: React.ReactNode, right: React.ReactNode, onComplete: () => void} | null>(null);
  const [gameState, setGameState] = useState({});
  const [isMuted, setIsMuted] = useState(audioEngine.getMuted());

  useEffect(() => {
    audioEngine.setEpoch(epoch);
  }, [epoch]);

  const updateGameState = (data: any) => {
    setGameState((prev: any) => {
      const newState = { ...prev };
      for (const key in data) {
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          newState[key] = { ...(prev[key] || {}), ...data[key] };
        } else {
          newState[key] = data[key];
        }
      }
      return newState;
    });
  };

  const triggerBridge = (left: React.ReactNode, right: React.ReactNode, onComplete: () => void) => {
    setBridge({ left, right, onComplete: () => { setBridge(null); onComplete(); }});
  };

  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleEpochComplete = (nextEpoch: number) => {
    if (epoch === 0) {
      audioEngine.init();
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setEpoch(nextEpoch);
      setTimeout(() => setIsTransitioning(false), 1000);
    }, 1000);
  };

  const toggleMute = () => {
    setIsMuted(audioEngine.toggleMute());
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden text-white bg-black">
      <Background epoch={epoch} />
      
      {epoch > 0 && (
        <button 
          onClick={toggleMute}
          className="absolute top-4 right-4 z-[150] pixel-btn !p-2 !text-xs"
          title="Toggle Audio"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {epoch === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 bg-black p-6" onClick={() => handleEpochComplete(1)}>
           <div className="text-center">
             <div className="text-[10px] sm:text-sm text-gray-400 mb-4 sm:mb-8 animate-[fade-in_2s_forwards]">In the beginning, there were only zeros and ones.</div>
             <div className="text-[10px] sm:text-sm text-gray-400 mb-8 sm:mb-16 opacity-0 animate-[fade-in_2s_forwards_2s]">A human opened their eyes. A lobster opened a terminal.</div>
             <div className="text-lg sm:text-xl text-white opacity-0 animate-[fade-in_2s_forwards_4s]">PRESS ANYWHERE TO CREATE A WORLD</div>
           </div>
        </div>
      )}

      {epoch === 1 && <Epoch1 setLobsterMsg={setLobsterMsg} triggerBridge={triggerBridge} onComplete={() => handleEpochComplete(2)} updateGameState={updateGameState} />}
      {epoch === 2 && <Epoch2 setLobsterMsg={setLobsterMsg} triggerBridge={triggerBridge} onComplete={() => handleEpochComplete(3)} updateGameState={updateGameState} />}
      {epoch === 3 && <Epoch3 setLobsterMsg={setLobsterMsg} triggerBridge={triggerBridge} onComplete={() => handleEpochComplete(4)} updateGameState={updateGameState} />}
      {epoch === 4 && <Epoch4 setLobsterMsg={setLobsterMsg} triggerBridge={triggerBridge} onComplete={() => {}} updateGameState={updateGameState} gameState={gameState} />}

      {epoch > 0 && <LobsterChat message={lobsterMsg} />}
      {bridge && <BridgeOverlay left={bridge.left} right={bridge.right} onComplete={bridge.onComplete} />}
      
      {isTransitioning && (
        <div className="absolute inset-0 z-[200] bg-white animate-[flash-white_2s_forwards] pointer-events-none" />
      )}
    </div>
  );
}
