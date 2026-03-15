export type BinaryCell = null | 0 | 1;
export type TextCell = string | null;
export type VisualCell = { color: string; shape: string } | null;
export type FullCell = { color: string; shape: string; animation: string } | null;

export type GridMode = 'binary' | 'text' | 'visual' | 'full';

export interface Connection {
  from: [number, number];
  to: [number, number];
  type: 'bond' | 'flow' | 'conflict';
}

export interface EpochConfig {
  epoch: number;
  mode: GridMode;
  gridWidth: number;
  gridHeight: number;
  title: string;
  subtitle: string;
  introNarration: string[];
  renderConstraint: string;
  colors?: string[];
  shapes?: string[];
  animations?: string[];
}

export interface EpochResult {
  epoch: number;
  html: string;
  description: string;
  userGrid?: unknown[][];
  gridMode?: GridMode;
  gridWidth?: number;
  gridHeight?: number;
}
