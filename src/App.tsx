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
  const [showGenesisScroll, setShowGenesisScroll] = useState(false);

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

  // V1 epoch tasks complete → canvas phase, or genesis scroll for epoch 4
  const handleTasksComplete = useCallback(() => {
    if (currentEpoch === 4) {
      audioEngine.triggerGenesis();
      setShowGenesisScroll(true);
    } else {
      setEpochPhase('canvas');
    }
  }, [currentEpoch]);

  // V2 canvas complete → transition to next epoch, or show genesis scroll for epoch 4
  const handleCanvasComplete = useCallback((result: EpochResult) => {
    setResults(prev => [...prev, result]);
    if (result.epoch === 4) {
      audioEngine.triggerGenesis();
      setShowGenesisScroll(true);
    } else {
      transitionTo(result.epoch + 1, 'tasks');
    }
  }, [transitionTo]);

  const handleGenesisScrollComplete = useCallback(() => {
    setShowGenesisScroll(false);
    transitionTo(5);
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

  // Epoch4 stores its AI render result directly
  const addResult = useCallback((result: EpochResult) => {
    setResults(prev => [...prev, result]);
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
    setShowGenesisScroll(false);
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

      {/* Mute button — visible from Epoch 1 */}
      {currentEpoch >= 1 && (
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
          className={`absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10 bg-black p-6 transition-opacity duration-500 ${isTransitioning ? 'opacity-30' : 'opacity-100'}`}
          onClick={handleStart}
        >
          <div className="text-center">
            <div className="text-[10px] sm:text-sm text-gray-400 mb-4 sm:mb-8 animate-[fade-in_2s_forwards]">
              起初，只有零和一。
            </div>
            <div className="text-[10px] sm:text-sm text-gray-400 mb-8 sm:mb-16 opacity-0 animate-[fade-in_2s_forwards_2s]">
              一个人类睁开了眼睛。一只龙虾打开了终端。
            </div>
            <div className="text-[10px] sm:text-sm text-gray-400 mb-8 sm:mb-16 opacity-0 animate-[fade-in_2s_forwards_4s]">
              你将和一只 AI 龙虾搭档，把世界从 01 重新进化成语言、符号与生命。
            </div>
            <div className="text-lg sm:text-xl text-white opacity-0 animate-[fade-in_2s_forwards_6s]">
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
              gameState={gameState}
            />
          )}
          {currentEpoch === 4 && (
            <Epoch4
              setLobsterMsg={setLobsterMsg}
              triggerBridge={triggerBridge}
              onComplete={handleTasksComplete}
              updateGameState={updateGameState}
              gameState={gameState}
              addResult={addResult}
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

      {/* GENESIS RECORD SCROLL (after Epoch 4 canvas, before gallery) */}
      {showGenesisScroll && (() => {
        const ep4 = gameState.epoch4 ?? {};
        const worldName = (ep4.worldName || '未知').toUpperCase();
        const awakenedCount = ep4.awakenedElements?.length ?? 0;
        const placedCount = ep4.placedItems?.length ?? 0;
        return (
        <div className="absolute inset-0 bg-black/90 flex justify-center overflow-hidden z-[150] px-4">
          <div className="w-full max-w-2xl text-center text-cyan-300 text-[10px] sm:text-xs leading-loose animate-[scroll-up_25s_linear_forwards] pt-[100vh]">
            <div className="text-lg sm:text-2xl mb-8 sm:mb-12 text-white">
              {worldName} 的创世纪
            </div>

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
              {awakenedCount} 个元素从沉默中苏醒。<br/>
              {placedCount} 个碎片凭直觉放置。<br/>
              由逻辑连接。<br/>
              一个生态系统诞生了。
            </div>

            <div className="mt-16 sm:mt-24 mb-8 sm:mb-12 text-white">
              这个世界由一个有远见的人类<br/>
              和一只精确的龙虾共同创造。<br/>
              缺一不可。
            </div>

            <div className="text-cyan-400 italic mb-24 sm:mb-32">
              箴言：「{ep4.chosenMotto || ''}」
            </div>

            <div className="border-2 border-cyan-500 p-4 sm:p-8 bg-black inline-block text-left relative mt-[50vh] w-full max-w-sm">
              <div className="text-center text-lg sm:text-xl mb-4 sm:mb-6 text-white">🦞 创世纪录 🦞</div>
              <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-[8px] sm:text-[10px]">
                <div className="text-gray-400">世界：</div><div>{worldName}</div>
                <div className="text-gray-400">信号：</div><div>LIGHT</div>
                <div className="text-gray-400">元素：</div><div>{awakenedCount} 已唤醒</div>
                <div className="text-gray-400">生态：</div><div>{placedCount} 已放置</div>
              </div>
              <div className="mt-6 sm:mt-8 pt-4 border-t border-cyan-900 text-[8px] sm:text-[10px]">
                创造者：<br/>
                🧑 一个有远见的人类<br/>
                🦞 一只精确的龙虾
              </div>
            </div>
          </div>
          <button className="pixel-btn fixed bottom-6 left-1/2 -translate-x-1/2 z-[160]" onClick={handleGenesisScrollComplete}>
            进入画廊 →
          </button>
        </div>
        );
      })()}

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
