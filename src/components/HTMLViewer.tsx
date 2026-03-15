import { useState } from 'react';

interface HTMLViewerProps {
  html: string;
  description: string;
  onRedraw: () => void;
  onNext: () => void;
  isLastEpoch: boolean;
}

export function HTMLViewer({ html, description, onRedraw, onNext, isLastEpoch }: HTMLViewerProps) {
  const [showSource, setShowSource] = useState(false);

  return (
    <div className="html-viewer">
      <div className="viewer-iframe-container">
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          title="Rendered creation"
          className="viewer-iframe"
        />
      </div>

      <div className="viewer-toolbar">
        <div className="viewer-description">
          <span className="text-green-400">🦞</span>{' '}
          <span className="text-[9px] text-gray-300">{description}</span>
        </div>
        <div className="viewer-actions">
          <button className="pixel-btn !text-[8px] !p-2" onClick={() => setShowSource(true)}>
            查看源码
          </button>
          <button className="pixel-btn !text-[8px] !p-2" onClick={onRedraw}>
            重画
          </button>
          <button className="pixel-btn !text-[8px] !p-2" onClick={onNext}>
            {isLastEpoch ? '查看画廊' : '下一纪元 →'}
          </button>
        </div>
      </div>

      {showSource && (
        <div className="source-modal" onClick={() => setShowSource(false)}>
          <div className="source-content" onClick={e => e.stopPropagation()}>
            <div className="source-header">
              <span className="text-xs text-green-400">生成的HTML源码</span>
              <button className="pixel-btn !text-[8px] !p-1" onClick={() => setShowSource(false)}>
                关闭
              </button>
            </div>
            <pre className="source-code">{html}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
