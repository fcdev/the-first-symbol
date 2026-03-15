import type { EpochConfig } from './types';

export const COLORS = ['#FF0000', '#FF8800', '#FFFF00', '#00CC00', '#0088FF', '#AA00FF'];
export const COLOR_NAMES = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Purple'];
export const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star'];
export const ANIMATIONS = ['pulse', 'spin', 'float', 'shake', 'glow', 'fade'];

export const TEXT_SYMBOLS = [
  '~', '@', '#', '$', '%', '&', '*', '+', '=',
  '>', '<', '^', '|', '/', '\\',
  '.', ':', ';', '!', '?',
];

export const epochConfigs: EpochConfig[] = [
  {
    epoch: 1,
    mode: 'binary',
    gridWidth: 16,
    gridHeight: 14,
    title: '纪元 1：混沌',
    subtitle: '虚空等待你的信号',
    introNarration: [
      "啊。你来了。我还以为我要独自整理零和一到永远。",
      "这里是虚空——除了原始的二进制什么都没有。你的画布是一片空无的网格。",
      "点击格子放置1和0。创造图案。制造噪音。创造...某些东西。",
      "你准备好了，我会解读你的混沌，将它渲染为存在。",
    ],
    renderConstraint: 'Black, white, and gray only. Minimal. Interpret binary patterns as abstract art with subtle CSS animations.',
  },
  {
    epoch: 2,
    mode: 'text',
    gridWidth: 20,
    gridHeight: 24,
    title: '纪元 2：语言',
    subtitle: '赋予意义以形状',
    introNarration: [
      "有意思。你从虚空中活了下来。大多数人连第一行零都过不了。",
      "现在你有了字母。符号。意义的基石。",
      "点击一个格子然后输入——文字、诗歌、废话、代码。任何能打动你的。",
      "我会读懂你字里行间的意思，创造出...意想不到的东西。",
    ],
    renderConstraint: 'Grayscale with one accent color. Typography-focused. Interpret spatial arrangements as meaningful.',
  },
  {
    epoch: 3,
    mode: 'visual',
    gridWidth: 24,
    gridHeight: 16,
    title: '纪元 3：感知',
    subtitle: '为沉默上色',
    introNarration: [
      "颜色。形状。现在有意思了。",
      "你有六种颜色和五种形状。用它们作画吧。",
      "构图很重要。重复有意义。留白也是一种选择。",
      "让我看看你闭上眼睛时看到了什么。",
    ],
    renderConstraint: 'Full color palette. Interpret composition, color relationships, and shapes as emotional landscape. Rich, immersive.',
    colors: COLORS,
    shapes: SHAPES,
  },
  {
    epoch: 4,
    mode: 'full',
    gridWidth: 24,
    gridHeight: 16,
    title: '纪元 4：共生',
    subtitle: '为你的世界注入生命',
    introNarration: [
      "就是这里了。最后的画布。你学到的一切、我们建造的一切——都汇聚于此。",
      "颜色、形状、还有动画。加上元素之间的连接。",
      "在格子之间画线来展示纽带、流动或冲突。",
      "让它活起来。让它呼吸。这是我们世界的心跳。",
    ],
    renderConstraint: 'Full color, full animation. Interpret as a living ecosystem. CSS animations, particle effects. Footer: "Co-created by a human and a lobster." Make it extraordinary. 惊艳 — this is the final epoch, the visual climax. Push every boundary.',
    colors: COLORS,
    shapes: SHAPES,
    animations: ANIMATIONS,
  },
];
