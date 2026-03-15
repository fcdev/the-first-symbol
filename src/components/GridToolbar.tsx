import type { GridMode, Connection } from '../types';
import { TEXT_SYMBOLS } from '../epochConfigs';

const ANIMATION_LABELS: Record<string, string> = {
  pulse: '脉冲', spin: '旋转', float: '漂浮',
  shake: '震动', glow: '发光', fade: '渐变',
};

const CONNECTION_LABELS: Record<string, string> = {
  bond: '纽带', flow: '流动', conflict: '冲突',
};

const SHAPE_LABELS: Record<string, string> = {
  circle: '圆形', square: '方形', triangle: '三角',
  diamond: '菱形', star: '星形',
};

interface GridToolbarProps {
  mode: GridMode;
  selectedColor: string;
  setSelectedColor: (c: string) => void;
  selectedShape: string;
  setSelectedShape: (s: string) => void;
  selectedAnimation: string;
  setSelectedAnimation: (a: string) => void;
  activeTool: string;
  setActiveTool: (t: string) => void;
  connectionType: Connection['type'];
  setConnectionType: (t: Connection['type']) => void;
  colors?: string[];
  shapes?: string[];
  animations?: string[];
  onFillRandom?: () => void;
  onClearAll?: () => void;
  onSymbolInsert?: (sym: string) => void;
}

export function GridToolbar({
  mode,
  selectedColor,
  setSelectedColor,
  selectedShape,
  setSelectedShape,
  selectedAnimation,
  setSelectedAnimation,
  activeTool,
  setActiveTool,
  connectionType,
  setConnectionType,
  colors,
  shapes,
  animations,
  onFillRandom,
  onClearAll,
  onSymbolInsert,
}: GridToolbarProps) {
  return (
    <div className="grid-toolbar">
      {/* Tool buttons */}
      <div className="toolbar-section">
        <button
          className={`tool-btn ${activeTool === 'draw' ? 'tool-active' : ''}`}
          onClick={() => setActiveTool('draw')}
          title="绘制"
        >
          画
        </button>
        <button
          className={`tool-btn ${activeTool === 'erase' ? 'tool-active' : ''}`}
          onClick={() => setActiveTool('erase')}
          title="擦除"
        >
          擦
        </button>
        {onClearAll && (
          <button className="tool-btn" onClick={onClearAll} title="清空全部">
            清空
          </button>
        )}
        {mode === 'binary' && onFillRandom && (
          <button className="tool-btn" onClick={onFillRandom} title="随机填充">
            随机
          </button>
        )}
        {(mode === 'visual' || mode === 'full') && (
          <button
            className={`tool-btn ${activeTool === 'eyedropper' ? 'tool-active' : ''}`}
            onClick={() => setActiveTool('eyedropper')}
            title="取色"
          >
            取色
          </button>
        )}
        {mode === 'full' && (
          <button
            className={`tool-btn ${activeTool === 'connect' ? 'tool-active' : ''}`}
            onClick={() => setActiveTool('connect')}
            title="绘制连接"
          >
            连接
          </button>
        )}
      </div>

      {/* Color picker */}
      {colors && (mode === 'visual' || mode === 'full') && (
        <div className="toolbar-section">
          {colors.map((color) => (
            <button
              key={color}
              className={`color-swatch ${selectedColor === color ? 'swatch-active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            />
          ))}
        </div>
      )}

      {/* Shape selector */}
      {shapes && (mode === 'visual' || mode === 'full') && (
        <div className="toolbar-section">
          {shapes.map((shape) => (
            <button
              key={shape}
              className={`shape-btn ${selectedShape === shape ? 'shape-active' : ''}`}
              onClick={() => setSelectedShape(shape)}
              title={SHAPE_LABELS[shape] || shape}
            >
              <ShapeIcon shape={shape} color="#fff" size={12} />
            </button>
          ))}
        </div>
      )}

      {/* Animation selector */}
      {animations && mode === 'full' && (
        <div className="toolbar-section">
          {animations.map((anim) => (
            <button
              key={anim}
              className={`tool-btn tool-btn-sm ${selectedAnimation === anim ? 'tool-active' : ''}`}
              onClick={() => setSelectedAnimation(anim)}
            >
              {ANIMATION_LABELS[anim] || anim}
            </button>
          ))}
        </div>
      )}

      {/* Connection type selector */}
      {mode === 'full' && activeTool === 'connect' && (
        <div className="toolbar-section">
          {(['bond', 'flow', 'conflict'] as const).map((type) => (
            <button
              key={type}
              className={`tool-btn tool-btn-sm ${connectionType === type ? 'tool-active' : ''}`}
              onClick={() => setConnectionType(type)}
            >
              {CONNECTION_LABELS[type] || type}
            </button>
          ))}
        </div>
      )}

      {/* Symbol panel for text mode */}
      {mode === 'text' && onSymbolInsert && (
        <div className="toolbar-section toolbar-symbols">
          {TEXT_SYMBOLS.map((sym) => (
            <button
              key={sym}
              className="symbol-btn"
              onClick={() => onSymbolInsert(sym)}
            >
              {sym}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Reusable shape icon renderer
export function ShapeIcon({ shape, color, size }: { shape: string; color: string; size: number }) {
  const s = size;
  const half = s / 2;

  switch (shape) {
    case 'circle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill={color} />
        </svg>
      );
    case 'square':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <rect x={1} y={1} width={s - 2} height={s - 2} fill={color} />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},1 ${s - 1},${s - 1} 1,${s - 1}`} fill={color} />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={`${half},1 ${s - 1},${half} ${half},${s - 1} 1,${half}`} fill={color} />
        </svg>
      );
    case 'star': {
      const points: string[] = [];
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i * 72 - 90) * (Math.PI / 180);
        const innerAngle = ((i * 72 + 36) - 90) * (Math.PI / 180);
        const outerR = half - 1;
        const innerR = outerR * 0.4;
        points.push(`${half + outerR * Math.cos(outerAngle)},${half + outerR * Math.sin(outerAngle)}`);
        points.push(`${half + innerR * Math.cos(innerAngle)},${half + innerR * Math.sin(innerAngle)}`);
      }
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <polygon points={points.join(' ')} fill={color} />
        </svg>
      );
    }
    default:
      return (
        <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
          <circle cx={half} cy={half} r={half - 1} fill={color} />
        </svg>
      );
  }
}
