import type { Connection } from '../types';

interface ConnectionOverlayProps {
  connections: Connection[];
  gridWidth: number;
  gridHeight: number;
  pendingStart: [number, number] | null;
}

const CONNECTION_COLORS: Record<Connection['type'], string> = {
  bond: '#00ff41',
  flow: '#0088FF',
  conflict: '#FF0000',
};

export function ConnectionOverlay({
  connections,
  gridWidth,
  gridHeight,
  pendingStart,
}: ConnectionOverlayProps) {
  // Convert grid coordinates to percentage positions (center of cell)
  const toX = (col: number) => ((col + 0.5) / gridWidth) * 100;
  const toY = (row: number) => ((row + 0.5) / gridHeight) * 100;

  return (
    <svg
      className="connection-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <marker id="arrow-flow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#0088FF" />
        </marker>
        <marker id="arrow-conflict" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
          <polygon points="0 0, 6 2, 0 4" fill="#FF0000" />
        </marker>
      </defs>

      {connections.map((conn, i) => {
        const x1 = toX(conn.from[1]);
        const y1 = toY(conn.from[0]);
        const x2 = toX(conn.to[1]);
        const y2 = toY(conn.to[0]);
        const color = CONNECTION_COLORS[conn.type];
        const marker = conn.type === 'flow' ? 'url(#arrow-flow)' :
                       conn.type === 'conflict' ? 'url(#arrow-conflict)' : undefined;

        return (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={x2} y2={y2}
            stroke={color}
            strokeWidth={0.4}
            strokeDasharray={conn.type === 'conflict' ? '1,0.5' : undefined}
            markerEnd={marker}
            opacity={0.8}
          />
        );
      })}

      {/* Pending connection start indicator */}
      {pendingStart && (
        <circle
          cx={toX(pendingStart[1])}
          cy={toY(pendingStart[0])}
          r={1.5}
          fill="none"
          stroke="#fff"
          strokeWidth={0.3}
          className="animate-pulse"
        />
      )}
    </svg>
  );
}
