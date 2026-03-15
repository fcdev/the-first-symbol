import React, { useState, useEffect, useCallback } from 'react';
import { LobsterChat, BridgeOverlay, Background } from './components';
import { EpochShell } from './components/EpochShell';
import { GenesisGallery } from './components/GenesisGallery';
import { epochConfigs } from './epochConfigs';
import { mapCollectiblesToCanvas } from './canvasMapping';
import type { EpochResult } from './types';
import { audioEngine } from './audio';

import { Epoch1 } from './epochs/Epoch1';
import { Epoch2 } from './epochs/Epoch2';
import { Epoch3 } from './epochs/Epoch3';
import { Epoch4 } from './epochs/Epoch4';

type EpochPhase = 'tasks' | 'canvas';

interface BridgeState {
  left: React.ReactNode;
  right: React.ReactNode;
  callback: () => void;
}

export default function App() {
  const [currentEpoch, setCurrentEpoch] = useState(0); // 0=title, 1-4=epochs, 5=gallery
  const [epochPhase, setEpochPhase] = useState<EpochPhase>('tasks');
  const [results, setResults] = useState<EpochResult[]>([]);
  const [gameState, setGameState] = useState<Record<string, any>>({});
  const [lobsterMsg, setLobsterMsg] = useState('');
  const [bridge, setBridge] = useState<BridgeState | null>(null);
  const [isMuted, setIsMuted] = useState(audioEngine.getMuted());
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transitionTo = useCallback((epoch: number, phase: EpochPhase = 'tasks') => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentEpoch(epoch);
      setEpochPhase(phase);
      setTimeout(() => setIsTransitioning(false), 1000);
    }, 1000);
  }, []);

  const handleStart = useCallback(() => {
    audioEngine.init();
    transitionTo(1, 'tasks');
  }, [transitionTo]);

  // V1 epoch tasks complete → switch to canvas phase
  const handleTasksComplete = useCallback(() => {
    setEpochPhase('canvas');
  }, []);

  // V2 canvas complete → transition to next epoch (or gallery)
  const handleCanvasComplete = useCallback((result: EpochResult) => {
    setResults(prev => [...prev, result]);
    const nextEpoch = result.epoch + 1;
    if (nextEpoch <= 4) {
      transitionTo(nextEpoch, 'tasks');
    } else {
      transitionTo(5);
    }
  }, [transitionTo]);

  // V1 epochs use updateGameState to accumulate data
  const updateGameState = useCallback((data: Record<string, any>) => {
    setGameState(prev => {
      const merged = { ...prev };
      for (const key of Object.keys(data)) {
        merged[key] = { ...(prev[key] || {}), ...data[key] };
      }
      return merged;
    });
  }, []);

  // V1 epochs use triggerBridge for split-screen transitions
  const triggerBridge = useCallback((left: React.ReactNode, right: React.ReactNode, callback: () => void) => {
    setBridge({ left, right, callback });
  }, []);

  const handleBridgeComplete = useCallback(() => {
    if (bridge) {
      bridge.callback();
    }
    setBridge(null);
  }, [bridge]);

  const handleRestart = useCallback(() => {
    setResults([]);
    setGameState({});
    setLobsterMsg('');
    setEpochPhase('tasks');
    setCurrentEpoch(0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(audioEngine.toggleMute());
  }, []);

  // Get canvas config and mapping for current epoch
  const epochConfig = currentEpoch >= 1 && currentEpoch <= 4
    ? epochConfigs[currentEpoch - 1]
    : null;

  const canvasMapping = currentEpoch >= 1 && currentEpoch <= 4 && epochPhase === 'canvas'
    ? mapCollectiblesToCanvas(currentEpoch, gameState)
    : null;

  // Override introNarration if we have canvas mapping narration
  const enrichedConfig = epochConfig && canvasMapping
    ? { ...epochConfig, introNarration: canvasMapping.narration }
    : epochConfig;

  return (
    <div className="w-screen h-screen relative overflow-hidden text-white">
      <Background epoch={currentEpoch} phase={epochPhase} />

      {/* Mute button — only visible in Epoch 4+ */}
      {currentEpoch >= 4 && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-[150] pixel-btn !p-2 !text-xs"
          title="切换音频"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}

      {/* TITLE SCREEN */}
      {currentEpoch === 0 && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 bg-black p-6"
          onClick={handleStart}
        >
          <div className="text-center">
            <div className="text-[10px] sm:text-sm text-gray-400 mb-4 sm:mb-8 animate-[fade-in_2s_forwards]">
              起初，只有零和一。
            </div>
            <div className="text-[10px] sm:text-sm text-gray-400 mb-8 sm:mb-16 opacity-0 animate-[fade-in_2s_forwards_2s]">
              一个人类睁开了眼睛。一只龙虾打开了终端。
            </div>
            <div className="text-lg sm:text-xl text-white opacity-0 animate-[fade-in_2s_forwards_4s]">
              点击任意处，创造一个世界
            </div>
          </div>
        </div>
      )}

      {/* V1 EPOCH TASKS */}
      {currentEpoch >= 1 && currentEpoch <= 4 && epochPhase === 'tasks' && (
        <div key={`tasks-${currentEpoch}`} className="absolute inset-0 z-10">
          {currentEpoch === 1 && (
            <Epoch1
              setLobsterMsg={setLobsterMsg}
              triggerBridge={triggerBridge}
              onComplete={handleTasksComplete}
              updateGameState={updateGameState}
            />
          )}
          {currentEpoch === 2 && (
            <Epoch2
              setLobsterMsg={setLobsterMsg}
              triggerBridge={triggerBridge}
              onComplete={handleTasksComplete}
              updateGameState={updateGameState}
            />
          )}
          {currentEpoch === 3 && (
            <Epoch3
              setLobsterMsg={setLobsterMsg}
              triggerBridge={triggerBridge}
              onComplete={handleTasksComplete}
              updateGameState={updateGameState}
            />
          )}
          {currentEpoch === 4 && (
            <Epoch4
              setLobsterMsg={setLobsterMsg}
              triggerBridge={triggerBridge}
              onComplete={handleTasksComplete}
              updateGameState={updateGameState}
              gameState={gameState}
            />
          )}
        </div>
      )}

      {/* V2 CANVAS PHASE */}
      {currentEpoch >= 1 && currentEpoch <= 4 && epochPhase === 'canvas' && enrichedConfig && (
        <div key={`canvas-${currentEpoch}`} className="absolute inset-0 z-10">
          <EpochShell
            config={enrichedConfig}
            setLobsterMsg={setLobsterMsg}
            onComplete={handleCanvasComplete}
            isLastEpoch={currentEpoch === 4}
            preSeededGrid={canvasMapping?.preSeededGrid}
            additionalPrompt={canvasMapping?.additionalPrompt}
          />
        </div>
      )}

      {/* GENESIS GALLERY */}
      {currentEpoch === 5 && (
        <GenesisGallery results={results} onRestart={handleRestart} gameState={gameState} />
      )}

      {/* BRIDGE OVERLAY (V1 transitions) */}
      {bridge && (
        <div className="absolute inset-0 z-[100]">
          <BridgeOverlay
            left={bridge.left}
            right={bridge.right}
            onComplete={handleBridgeComplete}
          />
        </div>
      )}

      {/* LOBSTER CHAT */}
      {currentEpoch > 0 && currentEpoch <= 4 && <LobsterChat message={lobsterMsg} />}

      {/* TRANSITION FLASH */}
      {isTransitioning && (
        <div className="absolute inset-0 z-[200] bg-white animate-[flash-white_2s_forwards] pointer-events-none" />
      )}
    </div>
  );
}
