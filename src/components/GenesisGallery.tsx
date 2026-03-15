import { useState } from 'react';
import type { EpochResult, GridMode } from '../types';
import { epochConfigs } from '../epochConfigs';
import { GridPreview, PixelArtPreview } from './GridPreview';

type ViewMode = 'renders' | 'drawings';

interface DrawingEntry {
  label: string;
  epoch: number;
  type: 'grid' | 'pixelArt';
  grid: unknown[][];
  mode?: GridMode;
  width: number;
  height: number;
}

interface GenesisGalleryProps {
  results: EpochResult[];
  onRestart: () => void;
  gameState?: Record<string, any>;
}

export function GenesisGallery({ results, onRestart, gameState }: GenesisGalleryProps) {
  const [selectedEpoch, setSelectedEpoch] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [nameSealed, setNameSealed] = useState(false);
  const [showGenesisRecord, setShowGenesisRecord] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('renders');
  const [selectedDrawing, setSelectedDrawing] = useState<DrawingEntry | null>(null);

  // Collect all user drawings
  const drawings: DrawingEntry[] = [];
  for (const result of results) {
    if (result.userGrid && result.gridMode && result.gridWidth && result.gridHeight) {
      const config = epochConfigs.find(c => c.epoch === result.epoch);
      drawings.push({
        label: config?.title ?? `纪元 ${result.epoch}`,
        epoch: result.epoch,
        type: 'grid',
        grid: result.userGrid,
        mode: result.gridMode,
        width: result.gridWidth,
        height: result.gridHeight,
      });
    }
  }
  // Add Epoch3 pixel art from gameState
  const pixelArt = gameState?.epoch3?.pixelArt as (string | null)[] | undefined;
  if (pixelArt && pixelArt.length === 64) {
    const grid2D: (string | null)[][] = [];
    for (let r = 0; r < 8; r++) {
      grid2D.push(pixelArt.slice(r * 8, r * 8 + 8));
    }
    drawings.push({
      label: '纪元 III — 像素画',
      epoch: 3,
      type: 'pixelArt',
      grid: grid2D,
      width: 8,
      height: 8,
    });
  }
  // Sort by epoch so pixel art appears with Epoch 3, not after Epoch 4
  drawings.sort((a, b) => a.epoch - b.epoch);

  const selectedResult = selectedEpoch !== null ? results.find(r => r.epoch === selectedEpoch) : null;

  // Fullscreen render view
  if (selectedResult) {
    return (
      <div className="gallery-fullscreen">
        <iframe
          srcDoc={selectedResult.html}
          sandbox="allow-scripts"
          title={`Epoch ${selectedResult.epoch}`}
          className="gallery-fullscreen-iframe"
        />
        <button
          className="pixel-btn gallery-back-btn"
          onClick={() => setSelectedEpoch(null)}
        >
          返回画廊
        </button>
      </div>
    );
  }

  // Fullscreen drawing view
  if (selectedDrawing) {
    const cellSize = Math.min(
      Math.floor((window.innerWidth - 80) / selectedDrawing.width),
      Math.floor((window.innerHeight - 120) / selectedDrawing.height),
      48
    );
    return (
      <div className="gallery-fullscreen flex flex-col items-center justify-center gap-6">
        <div className="text-[10px] text-green-400">{selectedDrawing.label}</div>
        {selectedDrawing.type === 'pixelArt' ? (
          <PixelArtPreview
            grid={(selectedDrawing.grid as (string | null)[][]).flat()}
            cellSize={cellSize}
          />
        ) : (
          <GridPreview
            grid={selectedDrawing.grid}
            mode={selectedDrawing.mode!}
            width={selectedDrawing.width}
            height={selectedDrawing.height}
            cellSize={cellSize}
          />
        )}
        <button
          className="pixel-btn gallery-back-btn"
          onClick={() => setSelectedDrawing(null)}
        >
          返回画廊
        </button>
      </div>
    );
  }

  // Genesis Record scroll view
  if (showGenesisRecord && gameState) {
    const worldName = gameState.epoch4?.worldName || '未知';
    const motto = gameState.epoch4?.chosenMotto || '';
    const shapeNames = gameState.epoch2?.shapeNames || [];
    const ruleName = gameState.epoch2?.chosenRule?.label || '未知';
    const interpretation = gameState.epoch3?.interpretation || '抽象形状';
    const itemCount = gameState.epoch4?.placedItems?.length || 0;

    return (
      <div className="absolute inset-0 bg-black/95 flex justify-center overflow-hidden z-50 px-4">
        <button
          className="pixel-btn absolute top-4 left-4 z-[60] !text-[8px]"
          onClick={() => setShowGenesisRecord(false)}
        >
          返回画廊
        </button>
        <div className="w-full max-w-2xl text-center text-cyan-300 text-[10px] sm:text-xs leading-loose animate-[scroll-up_25s_linear_forwards] pt-[100vh]">
          <div className="text-lg sm:text-2xl mb-8 sm:mb-12 text-white">{worldName.toUpperCase()} 的创世纪</div>

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
            {shapeNames.join('、') || '未知'}。<br/>
            龙虾写下了第一条法则：<br/>
            「{ruleName}」<br/>
            然后人类赋予它们情感，<br/>
            龙虾赋予它们物理法则。
          </div>

          <div className="mb-8 sm:mb-12">
            <div className="text-white mb-2 sm:mb-4">纪元 III — 感知</div>
            人类用64个像素画了{interpretation}。<br/>
            龙虾将其外推到256个。<br/>
            他们一起从扁平中构建了深度，<br/>
            世界获得了第三个维度。
          </div>

          <div className="mb-8 sm:mb-12">
            <div className="text-white mb-2 sm:mb-4">纪元 IV — 共生</div>
            {itemCount} 个元素凭直觉放置。<br/>
            由逻辑连接。<br/>
            一个生态系统诞生了。
          </div>

          <div className="mt-16 sm:mt-24 mb-8 sm:mb-12 text-white">
            这个世界由一个有远见的人类<br/>
            和一只精确的龙虾共同创造。<br/>
            缺一不可。
          </div>

          {motto && (
            <div className="text-cyan-400 italic mb-24 sm:mb-32">
              箴言：「{motto}」
            </div>
          )}

          <div className="border-2 border-cyan-500 p-4 sm:p-8 bg-black inline-block text-left relative mt-[50vh] w-full max-w-sm">
            <div className="text-center text-lg sm:text-xl mb-4 sm:mb-6 text-white">创世纪录</div>
            <div className="grid grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-2 sm:gap-y-4 text-[8px] sm:text-[10px]">
              <div className="text-gray-400">世界：</div><div>{worldName.toUpperCase()}</div>
              <div className="text-gray-400">信号：</div><div>LIGHT</div>
              <div className="text-gray-400">形状：</div><div>{shapeNames.join('、') || '—'}</div>
              <div className="text-gray-400">法则：</div><div>{ruleName}</div>
              <div className="text-gray-400">视觉：</div><div>{interpretation}</div>
              <div className="text-gray-400">生态：</div><div>{itemCount} 个元素</div>
            </div>
            <div className="mt-6 sm:mt-8 pt-4 border-t border-cyan-900 text-[8px] sm:text-[10px]">
              创造者：<br/>
              一个有远见的人类<br/>
              一只精确的龙虾
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="genesis-gallery">
      <div className="gallery-header">
        <div className="text-sm sm:text-lg text-white mb-2">创世画廊</div>
        <div className="text-[8px] text-gray-400">四个纪元。四个世界。一次合作。</div>
      </div>

      {/* Tab toggle */}
      {drawings.length > 0 && (
        <div className="gallery-tabs">
          <button
            className={`gallery-tab ${viewMode === 'renders' ? 'active' : ''}`}
            onClick={() => setViewMode('renders')}
          >
            AI 渲染
          </button>
          <button
            className={`gallery-tab ${viewMode === 'drawings' ? 'active' : ''}`}
            onClick={() => setViewMode('drawings')}
          >
            我的画作
          </button>
        </div>
      )}

      {/* AI Renders grid */}
      {viewMode === 'renders' && (
        <div className="gallery-grid">
          {results.map((result) => {
            const config = epochConfigs.find(c => c.epoch === result.epoch);
            return (
              <div
                key={result.epoch}
                className="gallery-card"
                onClick={() => setSelectedEpoch(result.epoch)}
              >
                <div className="gallery-card-preview">
                  <iframe
                    srcDoc={result.html}
                    sandbox="allow-scripts"
                    title={`Epoch ${result.epoch} preview`}
                    className="gallery-preview-iframe"
                    tabIndex={-1}
                  />
                </div>
                <div className="gallery-card-label">
                  <div className="text-[8px] text-green-400">{config?.title ?? `纪元 ${result.epoch}`}</div>
                  <div className="text-[7px] text-gray-500 mt-1 line-clamp-2">{result.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My Drawings grid */}
      {viewMode === 'drawings' && (
        <div className="gallery-grid">
          {drawings.map((drawing, i) => {
            const previewCellSize = Math.min(
              Math.floor(140 / Math.max(drawing.width, drawing.height)),
              16
            );
            return (
              <div
                key={`${drawing.type}-${drawing.epoch}-${i}`}
                className="gallery-card gallery-drawing-card"
                onClick={() => setSelectedDrawing(drawing)}
              >
                <div className="gallery-card-preview flex items-center justify-center">
                  {drawing.type === 'pixelArt' ? (
                    <PixelArtPreview
                      grid={(drawing.grid as (string | null)[][]).flat()}
                      cellSize={previewCellSize}
                    />
                  ) : (
                    <GridPreview
                      grid={drawing.grid}
                      mode={drawing.mode!}
                      width={drawing.width}
                      height={drawing.height}
                      cellSize={previewCellSize}
                    />
                  )}
                </div>
                <div className="gallery-card-label">
                  <div className="text-[8px] text-green-400">{drawing.label}</div>
                  <div className="text-[7px] text-gray-500 mt-1">
                    {drawing.type === 'pixelArt' ? '8x8 像素画' : `${drawing.width}x${drawing.height} 网格`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="gallery-footer">
        {!nameSealed ? (
          <div className="gallery-name-input">
            <div className="text-[8px] text-gray-400 mb-2">签名你的创造：</div>
            <div className="flex gap-2 items-center">
              <input
                className="pixel-input !text-[10px] !p-2 w-48"
                placeholder="你的名字"
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                maxLength={30}
              />
              <button
                className="pixel-btn !text-[8px] !p-2"
                onClick={() => setNameSealed(true)}
                disabled={!playerName.trim()}
              >
                封印
              </button>
            </div>
          </div>
        ) : (
          <div className="gallery-credit animate-[fade-in_1s_forwards]">
            <div className="text-[9px] text-white mb-1">创造者：{playerName}</div>
            <div className="text-[8px] text-gray-500">龙虾：默认龙虾</div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
          {gameState && (
            <button className="pixel-btn !text-[8px]" onClick={() => setShowGenesisRecord(true)}>
              查看创世纪录
            </button>
          )}
          <button className="pixel-btn !text-[8px]" onClick={onRestart}>
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}
