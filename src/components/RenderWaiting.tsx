import { useState, useEffect, useRef, useMemo } from 'react';
import type { EpochConfig } from '../types';
import { countFilledCells } from '../gridUtils';

interface RenderWaitingProps {
  config: EpochConfig;
  grid: unknown[][];
}

const EPOCH_PHILOSOPHY: Record<number, string[]> = {
  1: [
    '在虚无之前，是否已有某种意图？',
    '第一个信号不是被发送的——它是被渴望的。',
    '混沌不是无序，而是尚未被命名的秩序。',
    '0与1之间的距离，就是创世的宽度。',
    '光不是被发明的。它只是终于被看见了。',
    '谁在虚空中先眨了眼？',
    '也许混沌才是最诚实的语言。',
  ],
  2: [
    '命名一个事物，就是将它从无限可能中剥离。',
    '符号诞生的瞬间，沉默便有了形状。',
    '语言不是桥梁，而是深渊上的第一块石板。',
    '一个词的意义，是所有没说出口的词的总和。',
    '文字是思想留在时间上的指纹。',
    '说出名字之前，万物皆是同一种梦。',
    '每一个符号都是一次微小的创世。',
  ],
  3: [
    '颜色不存在于物体中——它只存在于观看的那一刻。',
    '你所画的不是世界，而是你与世界之间的距离。',
    '空白的画布已经包含了所有可能的画。',
    '感知即创造——你看到什么，什么就存在。',
    '每一笔色彩都是对沉默的一次回答。',
    '深度不是被测量的，而是被感受的。',
    '闭上眼睛看到的，才是真正属于你的颜色。',
  ],
  4: [
    '共生的起点，是承认自己的不完整。',
    '一个世界的灵魂，是创造者留在其中的那个问号。',
    '生命不是被设计的——它是在裂缝中长出来的。',
    '你我之间的合作，就是这个世界的第一个自然法则。',
    '造物完成之时，造物者便成了造物的一部分。',
    '最好的世界不是完美的——而是有故事可讲的。',
    '每个生态系统都是一场永不结束的对话。',
  ],
};

// Fallback for any unmapped epoch
const DEFAULT_PHILOSOPHY = [
  '存在先于本质，还是本质先于存在？',
  '在意义诞生之前，一切都只是可能性。',
  '创造是最古老的语言。',
  '万物的开端，都是一个沉默的决定。',
];

export function RenderWaiting({ config, grid }: RenderWaitingProps) {
  const [dissolvedCells, setDissolvedCells] = useState<Set<string>>(new Set());
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [showThinking, setShowThinking] = useState(false);
  const filledCount = countFilledCells(grid);
  const dissolveDone = useRef(false);

  // Pre-generate stable random transition durations
  const transitionDurations = useMemo(() => {
    const durations: number[] = [];
    for (let i = 0; i < config.gridWidth * config.gridHeight; i++) {
      durations.push(0.3 + Math.random() * 0.4);
    }
    return durations;
  }, [config.gridWidth, config.gridHeight]);

  // Dissolve animation: randomly fade out cells over 2 seconds
  useEffect(() => {
    const totalCells = config.gridWidth * config.gridHeight;
    const cellKeys: string[] = [];
    for (let r = 0; r < config.gridHeight; r++) {
      for (let c = 0; c < config.gridWidth; c++) {
        cellKeys.push(`${r}-${c}`);
      }
    }
    // Shuffle
    for (let i = cellKeys.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cellKeys[i], cellKeys[j]] = [cellKeys[j], cellKeys[i]];
    }

    const batchSize = Math.ceil(totalCells / 20);
    let batch = 0;

    const interval = setInterval(() => {
      const start = batch * batchSize;
      const end = Math.min(start + batchSize, totalCells);
      if (start >= totalCells) {
        clearInterval(interval);
        dissolveDone.current = true;
        setShowThinking(true);
        return;
      }
      setDissolvedCells(prev => {
        const next = new Set(prev);
        for (let i = start; i < end; i++) {
          next.add(cellKeys[i]);
        }
        return next;
      });
      batch++;
    }, 100);

    return () => clearInterval(interval);
  }, [config.gridWidth, config.gridHeight]);

  const messages = EPOCH_PHILOSOPHY[config.epoch] || DEFAULT_PHILOSOPHY;

  // Cycle through thinking messages
  useEffect(() => {
    if (!showThinking) return;
    const interval = setInterval(() => {
      setThinkingIdx(prev => (prev + 1) % messages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [showThinking, messages.length]);

  return (
    <div className="render-waiting">
      <div className="dissolve-grid" style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.gridWidth}, 1fr)`,
        gap: '1px',
        width: '100%',
        maxWidth: '500px',
        aspectRatio: `${config.gridWidth} / ${config.gridHeight}`,
        margin: '0 auto',
      }}>
        {Array.from({ length: config.gridHeight }, (_, r) =>
          Array.from({ length: config.gridWidth }, (_, c) => {
            const key = `${r}-${c}`;
            const dissolved = dissolvedCells.has(key);
            const cell = grid[r]?.[c];
            const isFilled = cell !== null && cell !== undefined;
            return (
              <div
                key={key}
                className="dissolve-cell"
                style={{
                  opacity: dissolved ? 0 : 1,
                  backgroundColor: isFilled ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255,255,255,0.05)',
                  transition: `opacity ${transitionDurations[r * config.gridWidth + c]}s ease-out`,
                }}
              />
            );
          })
        )}
      </div>

      {showThinking && (
        <div className="thinking-text animate-[fade-in_0.5s_forwards]">
          <div className="text-[10px] text-green-400 mb-2 transition-opacity duration-500" key={thinkingIdx}>
            "{messages[thinkingIdx]}"
          </div>
          <div className="text-[8px] text-gray-600 mt-3 italic">
            — 龙虾, 凝视着 {filledCount} 个像素
          </div>
        </div>
      )}
    </div>
  );
}
