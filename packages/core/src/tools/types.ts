export const WondToolType = {
  Hand: 'hand',
  Move: 'move',
  DrawRect: 'draw_rect',
} as const;

export type WondToolType = (typeof WondToolType)[keyof typeof WondToolType];
