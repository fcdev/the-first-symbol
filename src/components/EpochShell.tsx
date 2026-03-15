import { useState, useCallback, useEffect, useRef } from 'react';
import type { EpochConfig, EpochResult, Connection } from '../types';
import { createEmptyGrid } from '../gridUtils';
import { callLLMRender } from '../llm';
import { GridEditor } from './GridEditor';
import { RenderWaiting } from './RenderWaiting';
import { HTMLViewer } from './HTMLViewer';

type ShellPhase = 'intro' | 'draw' | 'waiting' | 'viewing';

interface EpochShellProps {
  config: EpochConfig;
  setLobsterMsg: (msg: string) => void;
  onComplete: (result: EpochResult) => void;
  isLastEpoch: boolean;
  preSeededGrid?: unknown[][];
  additionalPrompt?: string;
}

export function EpochShell({ config, setLobsterMsg, onComplete, isLastEpoch, preSeededGrid, additionalPrompt }: EpochShellProps) {
  const [phase, setPhase] = useState<ShellPhase>('intro');
  const [grid, setGrid] = useState<unknown[][]>(() =>
    preSeededGrid || createEmptyGrid(config.gridWidth, config.gridHeight, null)
  );
  const [connections, setConnections] = useState<Connection[]>([]);
  const [renderResult, setRenderResult] = useState<{ html: string; description: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [narrationIdx, setNarrationIdx] = useState(0);
  const narrationDone = narrationIdx >= config.introNarration.length;
  const geminiCalled = useRef(false);

  // Show intro narration one line at a time
  useEffect(() => {
    if (phase !== 'intro') return;
    if (narrationIdx < config.introNarration.length) {
      setLobsterMsg(config.introNarration[narrationIdx]);
    }
  }, [phase, narrationIdx, config.introNarration, setLobsterMsg]);

  const advanceNarration = useCallback(() => {
    if (narrationIdx < config.introNarration.length - 1) {
      setNarrationIdx(prev => prev + 1);
    } else {
      setNarrationIdx(config.introNarration.length);
    }
  }, [narrationIdx, config.introNarration.length]);

  const startDrawing = useCallback(() => {
    setPhase('draw');
    setLobsterMsg("我在看着呢。别紧张。（其实很紧张。）");
  }, [setLobsterMsg]);

  const handleSubmit = useCallback(async () => {
    if (geminiCalled.current) return;
    geminiCalled.current = true;
    setPhase('waiting');
    setError(null);
    setLobsterMsg('让我凝视一下你创造的东西... 每一次观看都是一次新的理解。');

    try {
      const result = await callLLMRender(config.epoch, grid, config.mode, connections, additionalPrompt);
      setRenderResult(result);
      setLobsterMsg('');  // Clear — HTMLViewer shows its own description
      setPhase('viewing');
    } catch (err) {
      console.error('LLM render failed:', err);
      setError(err instanceof Error ? err.message : '出了点问题');
      setLobsterMsg("嗯。虚空拒绝了我们的创造。再试一次？");
      geminiCalled.current = false;
    }
  }, [config.epoch, config.mode, grid, connections, setLobsterMsg]);

  const handleRedraw = useCallback(() => {
    geminiCalled.current = false;
    setPhase('draw');
    setRenderResult(null);
    setError(null);
    setLobsterMsg("行吧，再来一次。我等着。");
  }, [setLobsterMsg]);

  const handleNext = useCallback(() => {
    if (renderResult) {
      onComplete({
        epoch: config.epoch,
        html: renderResult.html,
        description: renderResult.description,
        userGrid: grid,
        gridMode: config.mode,
        gridWidth: config.gridWidth,
        gridHeight: config.gridHeight,
      });
    }
  }, [renderResult, onComplete, config.epoch, grid, config.mode, config.gridWidth, config.gridHeight]);

  const handleSkip = useCallback(() => {
    onComplete({
      epoch: config.epoch,
      html: '',
      description: 'Skipped',
      userGrid: grid,
      gridMode: config.mode,
      gridWidth: config.gridWidth,
      gridHeight: config.gridHeight,
    });
  }, [onComplete, config.epoch, grid, config.mode, config.gridWidth, config.gridHeight]);

  return (
    <div className="epoch-shell">
      {/* Epoch title bar */}
      <div className="epoch-header">
        <div className="text-[10px] sm:text-sm text-green-400">{config.title}</div>
        <div className="text-[8px] text-gray-500 mt-1">{config.subtitle}</div>
      </div>

      {/* INTRO PHASE */}
      {phase === 'intro' && (
        <div className="epoch-intro" onClick={!narrationDone ? advanceNarration : undefined}>
          <div className="intro-content">
            {!narrationDone && (
              <div className="text-[8px] text-gray-500 mt-4 animate-pulse">
                点击继续...
              </div>
            )}
            {narrationDone && (
              <button className="pixel-btn mt-6 animate-[fade-in_0.5s_forwards]" onClick={startDrawing}>
                开始绘画
              </button>
            )}
          </div>
        </div>
      )}

      {/* DRAW PHASE */}
      {phase === 'draw' && (
        <GridEditor
          config={config}
          grid={grid}
          setGrid={setGrid}
          connections={connections}
          setConnections={setConnections}
          onSubmit={handleSubmit}
          onSkip={handleSkip}
        />
      )}

      {/* WAITING PHASE */}
      {phase === 'waiting' && !error && (
        <RenderWaiting config={config} grid={grid} />
      )}

      {/* ERROR STATE */}
      {phase === 'waiting' && error && (
        <div className="epoch-error">
          <div className="text-[10px] text-red-400 mb-4">渲染失败</div>
          <div className="text-[8px] text-gray-400 mb-4 max-w-md text-center">{error}</div>
          <button className="pixel-btn" onClick={handleRedraw}>
            再试一次
          </button>
        </div>
      )}

      {/* VIEWING PHASE */}
      {phase === 'viewing' && renderResult && (
        <HTMLViewer
          html={renderResult.html}
          description={renderResult.description}
          onRedraw={handleRedraw}
          onNext={handleNext}
          isLastEpoch={isLastEpoch}
        />
      )}
    </div>
  );
}
