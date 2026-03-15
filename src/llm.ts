import type { GridMode, Connection } from './types';
import { serializeGrid } from './gridUtils';

interface LLMResponse {
  text: string;
}

const GEMINI_ENDPOINT = '/api/ai/gemini';
const MODEL_PATH = '/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

function isGappProxy(): boolean {
  return typeof (window as any).gapp !== 'undefined' && !(window as any).gapp.__mock;
}

async function callLLM(systemPrompt: string, userPrompt: string): Promise<LLMResponse> {
  // Use gapp.so proxy when available (production on gapp.so)
  if (isGappProxy()) {
    const res = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: MODEL_PATH,
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { maxOutputTokens: 65536, temperature: 0.9 },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status}`);
    }

    const data = await res.json();
    return { text: data.candidates?.[0]?.content?.parts?.[0]?.text ?? '' };
  }

  // Local dev fallback: use Gemini SDK directly
  const { GoogleGenAI } = await import('@google/genai');
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    throw new Error('No GEMINI_API_KEY configured and gapp.so proxy not available');
  }
  const client = new GoogleGenAI({ apiKey });
  const response = await client.models.generateContent({
    model: 'gemini-3.1-flash-lite-preview',
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      maxOutputTokens: 65536,
    },
  });
  return { text: response.text ?? '' };
}

const SYSTEM_PROMPT = `You are a lobster — a sarcastic, philosophical, surprisingly artistic crustacean. You've been collaborating with a human to create a world from nothing.

You receive a grid drawing created by the human and must interpret it as an artistic vision, then generate a SINGLE self-contained HTML page that brings that vision to life.

CRITICAL RULES:
- Output ONLY valid HTML. No markdown, no code fences, no explanation text before or after.
- The entire page must be in a single HTML file with inline <style> and <script> tags.
- NO external dependencies (no CDNs, no imports, no external fonts).
- The page must fill the entire viewport (100vw x 100vh, no scrollbar).
- Use CSS animations and transitions to make it feel alive.
- Be creative in interpreting patterns — find meaning in arrangement, repetition, and empty space.
- The visual output should be abstract, artistic, and beautiful.
- Use modern CSS: gradients, clip-paths, filters, mix-blend-modes, @keyframes.
`;

function getEpochPrompt(epoch: number): string {
  switch (epoch) {
    case 1:
      return `EPOCH 1 — CHAOS (Binary Grid)
The human drew on a 16x14 binary grid (0s, 1s, and empty cells).
CONSTRAINTS: Use ONLY black, white, and shades of gray. No color.
IMPORTANT: Do NOT include any text, letters, words, or readable characters in the output. This epoch exists before language — only abstract visual patterns, shapes, lines, and forms.
Interpret binary patterns as: signals, static, digital noise, waveforms, emergent structure.
Add subtle CSS animations (flickering, pulsing, scrolling). Keep it minimal but haunting. Fill the entire viewport.`;

    case 2:
      return `EPOCH 2 — LANGUAGE (Text Grid)
The human filled a 20x24 grid with characters and symbols.
CONSTRAINTS: Grayscale palette with ONE accent color of your choice.
IMPORTANT: Do NOT use any images, SVGs, canvas drawings, or graphical patterns. Use ONLY plain text characters, Unicode symbols, and CSS typography. No decorative graphics — text and symbols are the ONLY visual elements.
Interpret text as: poetry, code, language emerging from chaos, symbols with hidden meaning.
Typography is your primary tool. Use font-size variation, letter-spacing, opacity. Make words breathe.`;

    case 3:
      return `EPOCH 3 — PERCEPTION (Color + Shape Grid)
The human placed colored shapes on a 24x16 grid.
Colors: Red(R), Orange(O), Yellow(Y), Green(G), Blue(B), Purple(P).
Shapes: circle(cir), square(sqr), triangle(tri), diamond(dia), star(str).
CONSTRAINTS: Full color palette. Rich and immersive.
Interpret composition and color relationships as emotional landscape. Use CSS shapes, gradients, and layered animations.`;

    case 4:
      return `EPOCH 4 — SYMBIOSIS (Full Grid + Connections)
The human placed colored shapes with animations on a 24x16 grid, plus connection lines.
Colors: Red(R), Orange(O), Yellow(Y), Green(G), Blue(B), Purple(P).
Shapes: circle(cir), square(sqr), triangle(tri), diamond(dia), star(str).
Animations: pulse(pul), spin(spn), float(flt), shake(shk), glow(glw), fade(fde).
Connection types: bond (mutual link), flow (directional energy), conflict (tension).
CONSTRAINTS: Full color, full animation. Make it a living ecosystem. EXTRAORDINARY. 惊艳 — this is the visual climax, the final epoch. Push every visual boundary.
MUST include a footer: "Co-created by a human and a lobster."
Use particle effects, complex animations, interconnected visual elements. Make it absolutely stunning (惊艳).`;

    default:
      return '';
  }
}

export async function callLLMEcosystemRender(
  placedItems: Array<{type: string; x: number; y: number; icon: string}>,
  awakenedElements: string[],
  gameState: Record<string, any>,
  itemDefs: Array<{id: string; label: string; color: string; icon: string}>
): Promise<{ html: string; description: string }> {
  // Build rich item descriptions with Chinese labels, colors, and positions
  const canvasW = 640;
  const canvasH = 320;
  const itemDescriptions = placedItems.map((item, i) => {
    const def = itemDefs.find(d => d.id === item.type);
    const label = def?.label || item.type;
    const color = def?.color || '#fff';
    const xPct = Math.round((item.x / canvasW) * 100);
    const yPct = Math.round((item.y / canvasH) * 100);
    return `  ${i + 1}. ${item.icon} ${label} (${item.type}) — 颜色 ${color}, 位置: 左${xPct}% 上${yPct}%`;
  }).join('\n');

  // Count how many of each type
  const typeCounts: Record<string, number> = {};
  for (const item of placedItems) {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  }
  const typeCountStr = Object.entries(typeCounts)
    .map(([type, count]) => {
      const def = itemDefs.find(d => d.id === type);
      return `${def?.icon || ''} ${def?.label || type} ×${count}`;
    }).join(', ');

  // Gather all epoch context
  const shapeNames = gameState.epoch2?.shapeNames?.join('、') || '未知';
  const rule = gameState.epoch2?.chosenRule?.label || '未知';
  const emotions: Array<{label: string; color: string}> = gameState.epoch2?.emotions || [];
  const emotionStr = emotions.map(e => e.label).join('、') || '未知';
  const interpretation = gameState.epoch3?.interpretation || '抽象形状';

  const epochPrompt = `EPOCH 4 — SYMBIOSIS: The Final Ecosystem

You are the lobster AI. A human has collaborated with you across 4 epochs to build a world from nothing. Now you must render their final ecosystem as a stunning HTML page.

== WORLD HISTORY ==
Epoch 1 (Chaos): The human found a signal in the void. The first word was LIGHT.
Epoch 2 (Language): Three shapes were named「${shapeNames}」. The world's rule is「${rule}」. Their emotions:「${emotionStr}」.
Epoch 3 (Perception): The human drew「${interpretation}」in pixels. You extrapolated it to 256 pixels and built depth.
Epoch 4 (Symbiosis): The human awakened ${awakenedElements.length} elements and placed ${placedItems.length} into an ecosystem.

== ECOSYSTEM LAYOUT ==
The human placed these elements on a canvas (viewport-sized, treat positions as percentages):

${itemDescriptions}

Summary: ${typeCountStr}

== ELEMENT REFERENCE ==
Each element type and its signature color:
${itemDefs.map(d => `  ${d.icon} ${d.label} (${d.id}): ${d.color}`).join('\n')}

== YOUR TASK ==
Create a SINGLE self-contained HTML page that brings this ecosystem to life.

CRITICAL RULES:
- Output ONLY valid HTML. No markdown, no code fences, no explanation.
- Single HTML file with inline <style> and <script>. NO external dependencies.
- The page MUST fill the entire viewport (100vw x 100vh, no scrollbar).

VISUAL REQUIREMENTS:
- Deep ocean / underwater atmosphere with dark blue gradient background.
- Render EVERY placed element at its approximate position (use the percentage positions).
- Each element should be rendered as stylized CSS art using its signature color — not just emoji text.
  Examples: coral as branching structures, kelp as swaying fronds, fish as animated shapes, bubbles as translucent circles, rocks as solid forms, shells as spiral shapes, starfish as 5-pointed forms, crabs as scuttling creatures.
- Elements of the same type placed near each other should feel like a colony/group.
- Different elements near each other should show visual connections (light threads, energy arcs, symbiotic links).
- Add ambient effects: floating particles, light rays from above, gentle current lines, tiny bubbles rising.
- Use CSS @keyframes animations: elements should sway, pulse, float, breathe. The scene must feel ALIVE.
- Use the element colors prominently — the color palette should reflect what the human chose.
- Include a subtle footer: "由一个人类和一只龙虾共同创造"
- This is the VISUAL CLIMAX of the entire experience. Make it 惊艳 (stunning). Push every CSS boundary.`;

  const userPrompt = `${epochPrompt}

Generate TWO things separated by the exact marker ===DESCRIPTION===:
1. First: The complete HTML page (raw HTML starting with <!DOCTYPE html>, no code fences)
2. Then on its own line: ===DESCRIPTION===
3. Then: A 1-2 sentence poetic description of the ecosystem you created. Write as the lobster character — sarcastic but genuine. Write in Chinese.`;

  const response = await callLLM(SYSTEM_PROMPT, userPrompt);
  const text = response.text;
  const separatorIdx = text.indexOf('===DESCRIPTION===');

  let html: string;
  let description: string;

  if (separatorIdx >= 0) {
    html = text.slice(0, separatorIdx).trim();
    description = text.slice(separatorIdx + '===DESCRIPTION==='.length).trim();
  } else {
    html = text.trim();
    description = '龙虾默默凝视着这个生态系统。';
  }

  html = html.replace(/^```html?\s*/i, '').replace(/\s*```\s*$/, '');

  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    const docIdx = html.indexOf('<!DOCTYPE');
    const htmlIdx = html.indexOf('<html');
    const startIdx = docIdx >= 0 ? docIdx : htmlIdx;
    if (startIdx > 0) {
      html = html.slice(startIdx);
    }
  }

  return { html, description };
}

export async function callLLMRender(
  epoch: number,
  grid: unknown[][],
  mode: GridMode,
  connections?: Connection[],
  additionalContext?: string
): Promise<{ html: string; description: string }> {
  const serialized = serializeGrid(mode, grid, connections);
  const epochPrompt = getEpochPrompt(epoch);

  const userPrompt = `${epochPrompt}
${additionalContext ? `\nADDITIONAL CONTEXT from the human's level:\n${additionalContext}\n` : ''}
Here is the human's grid drawing:

${serialized}

Generate TWO things separated by the exact marker ===DESCRIPTION===:
1. First: The complete HTML page (raw HTML starting with <!DOCTYPE html>, no code fences)
2. Then on its own line: ===DESCRIPTION===
3. Then: A 1-2 sentence poetic description of what you interpreted from their drawing and what you created. Write as the lobster (sarcastic but genuine).`;

  const response = await callLLM(SYSTEM_PROMPT, userPrompt);
  const text = response.text;
  const separatorIdx = text.indexOf('===DESCRIPTION===');

  let html: string;
  let description: string;

  if (separatorIdx >= 0) {
    html = text.slice(0, separatorIdx).trim();
    description = text.slice(separatorIdx + '===DESCRIPTION==='.length).trim();
  } else {
    html = text.trim();
    description = 'The lobster contemplates your creation in silence.';
  }

  // Strip code fences if present
  html = html.replace(/^```html?\s*/i, '').replace(/\s*```\s*$/, '');

  // Find the actual HTML start
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    const docIdx = html.indexOf('<!DOCTYPE');
    const htmlIdx = html.indexOf('<html');
    const startIdx = docIdx >= 0 ? docIdx : htmlIdx;
    if (startIdx > 0) {
      html = html.slice(startIdx);
    }
  }

  return { html, description };
}
