import type { BinaryCell, TextCell, VisualCell, FullCell } from './types';
import { createEmptyGrid } from './gridUtils';

interface CanvasMapping {
  preSeededGrid: unknown[][];
  additionalPrompt: string;
  narration: string[];
}

export function mapCollectiblesToCanvas(epoch: number, gameState: Record<string, any>): CanvasMapping {
  switch (epoch) {
    case 1:
      return mapEpoch1(gameState);
    case 2:
      return mapEpoch2(gameState);
    case 3:
      return mapEpoch3(gameState);
    case 4:
      return mapEpoch4(gameState);
    default:
      return { preSeededGrid: [], additionalPrompt: '', narration: [] };
  }
}

function mapEpoch1(gameState: Record<string, any>): CanvasMapping {
  const bars = gameState.epoch1?.selectedBars || ['A', 'C'];

  const grid = createEmptyGrid<BinaryCell>(16, 14, null);

  return {
    preSeededGrid: grid,
    additionalPrompt: `The human found a signal pulse in the void and tuned frequencies ${bars.join('+')}. The grid has scattered binary fragments — raw chaos before language exists. Interpret the binary patterns as pure abstract forms. No text, no letters, no words — only pattern, rhythm, and contrast.`,
    narration: [
      "You found the signal and tuned the frequencies. Now let's shape the chaos.",
      "Place 1s and 0s — make patterns, make noise. No words yet, just raw binary.",
    ],
  };
}

function mapEpoch2(gameState: Record<string, any>): CanvasMapping {
  const names: string[] = gameState.epoch2?.shapeNames || ['CORAL', 'PEARL', 'TOWER'];
  const rule = gameState.epoch2?.chosenRule?.label || 'CYCLE';
  const emotions: Array<{ label: string; color: string }> = gameState.epoch2?.emotions || [];

  const grid = createEmptyGrid<TextCell>(20, 24, null);

  const emotionStr = emotions
    .map((e, i) => `${names[i] || 'shape'} = ${e.label} (${e.color})`)
    .join(', ');

  return {
    preSeededGrid: grid,
    additionalPrompt: `Shapes: ${names.join(', ')}. Rule: ${rule}. Emotions: ${emotionStr || 'unassigned'}. The shape names are pre-filled in the text grid. Weave these names and their relationships into your typographic interpretation.`,
    narration: [
      `${names.join(', ')} — your shapes have names, rules, and feelings now.`,
      "Arrange symbols around them. I'll translate your language into art.",
    ],
  };
}

function mapEpoch3(gameState: Record<string, any>): CanvasMapping {
  const interpretation = gameState.epoch3?.interpretation || 'abstract';
  const layers = gameState.epoch3?.layerAssignments || {};

  const grid = createEmptyGrid<VisualCell>(24, 16, null);

  const layerInfo = Object.entries(layers)
    .map(([id, depth]) => `${id}@layer${depth}`)
    .join(', ');

  return {
    preSeededGrid: grid,
    additionalPrompt: `Drew "${interpretation}" in pixels. Depths: ${layerInfo || 'unassigned'}. The grid has a seed cluster representing the interpretation. Expand on this visual theme with your own artistic additions.`,
    narration: [
      `Your "${interpretation}" painting gave this world its first colors.`,
      "Add more shapes, or let the lobster take it from here.",
    ],
  };
}

function mapEpoch4(gameState: Record<string, any>): CanvasMapping {
  const items: Array<{ type: string; icon: string }> = gameState.epoch4?.placedItems || [];
  const worldName = gameState.epoch4?.worldName || 'Unknown';
  const motto = gameState.epoch4?.chosenMotto || '';

  const grid = createEmptyGrid<FullCell>(24, 16, null);

  const itemList = items.map(i => i.type).join(', ');

  return {
    preSeededGrid: grid,
    additionalPrompt: `Ecosystem: ${itemList || 'empty'}. World: "${worldName}". Motto: "${motto}". The grid is pre-populated with ecosystem elements. This is the final epoch — make it extraordinary (惊艳). The ecosystem should feel alive, interconnected, and absolutely stunning.`,
    narration: [
      `"${worldName}" — your ecosystem awaits its final form.`,
      "The grid holds your creatures. Shape their world one last time.",
    ],
  };
}
