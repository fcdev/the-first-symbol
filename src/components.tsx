import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- LOBSTER CHAT ---
export function LobsterChat({ message }: { message: string }) {
  const [displayed, setDisplayed] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!message) { setDisplayed(''); return; }
    setDisplayed('');
    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(message.slice(0, i + 1));
      i++;
      if (i >= message.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30); // Typewriter speed

    return () => clearInterval(interval);
  }, [message]);

  if (!displayed && !isTyping) return null;

  return (
    <div className="lobster-panel">
      <div className="text-2xl sm:text-4xl">🦞</div>
      <div className="flex-1 text-[9px] sm:text-xs leading-relaxed overflow-y-auto max-h-48">
        {displayed}
        {isTyping && <span className="animate-pulse">_</span>}
      </div>
    </div>
  );
}

// --- BRIDGE ANIMATION ---
export function BridgeOverlay({
  left,
  right,
  onComplete
}: {
  left: React.ReactNode,
  right: React.ReactNode,
  onComplete: () => void
}) {
  const [flashing, setFlashing] = useState(false);
  const completed = useRef(false);

  const safeComplete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const t1 = setTimeout(() => setFlashing(true), 2500);
    const t2 = setTimeout(safeComplete, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [safeComplete]);

  return (
    <div className="bridge-overlay cursor-pointer" onClick={safeComplete}>
      <div className="bridge-left bg-black relative">
        <div className="absolute top-4 left-4 text-xs text-gray-500">人类 [视觉]</div>
        {left}
      </div>
      <div className="bridge-right bg-black relative font-mono">
        <div className="absolute top-4 left-4 text-xs text-gray-500">龙虾 [数据]</div>
        {right}
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] text-gray-600 animate-pulse z-10 pointer-events-none">点击跳过</div>
      {flashing && <div className="flash" />}
    </div>
  );
}

// --- BACKGROUND CANVAS ---
export function Background({ epoch, phase }: { epoch: number; phase?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Pre-seed bubble positions for Epoch 4 (fractions of canvas size to survive resize)
    const bubbles = Array.from({ length: 50 }, () => ({
      fx: Math.random(),
      fy: Math.random(),
      r: Math.random() * 3 + 1,
    }));

    // Pre-build Epoch 4 gradient — rebuilt on resize, never inside draw()
    const makeGradient = () => {
      const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
      g.addColorStop(0, '#0a1628');
      g.addColorStop(1, '#000000');
      return g;
    };
    let oceanGradient = makeGradient();

    // Matrix rain for Epoch 1
    const columns = Math.floor(canvas.width / 20);
    const drops = Array(columns).fill(1);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      oceanGradient = makeGradient();
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      if (epoch === 1) {
        if (phase === 'canvas') {
          // Clean black background during canvas drawing phase
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#00ff41';
          ctx.font = '15px monospace';

          for (let i = 0; i < drops.length; i++) {
            const text = Math.random() > 0.5 ? '1' : '0';
            ctx.fillText(text, i * 20, drops[i] * 20);
            if (drops[i] * 20 > canvas.height && Math.random() > 0.975) {
              drops[i] = 0;
            }
            drops[i]++;
          }
        }
      } else if (epoch === 2) {
        ctx.fillStyle = '#0a0e27'; // Navy
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (epoch === 3) {
        // Grayscale transition handled by CSS filter on parent
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (epoch === 4) {
        // Deep ocean
        ctx.fillStyle = oceanGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw static bubbles (positions pre-seeded to avoid per-frame flickering)
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        bubbles.forEach(b => {
          ctx.beginPath();
          ctx.arc(b.fx * canvas.width, b.fy * canvas.height, b.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [epoch, phase]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
}
