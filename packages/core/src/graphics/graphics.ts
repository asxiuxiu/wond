import { WondBoundingArea } from '../geo';
import type { Matrix } from 'transformation-matrix';
import type { WondGraphicDrawingContext } from '../types';

export const GraphicsType = {
  Document: 'document',
  Graph: 'graph',
  Rectangle: 'rectangle',
  Vector: 'vector',
} as const;

export type GraphicsType = (typeof GraphicsType)[keyof typeof GraphicsType];

export interface WondGraphicsAttrs {
  id: string;
  type: GraphicsType;
  name: string;
  transform: Matrix;
  visible: boolean;
  locked: boolean;
  size: { x: number; y: number };
  children?: WondGraphics[];
}

export interface WondGraphics<T extends WondGraphicsAttrs = WondGraphicsAttrs> {
  type: GraphicsType;
  attrs: T;
  parentId?: string;

  getBoundingArea(): WondBoundingArea;

  getSvgString(): string;

  draw(context: WondGraphicDrawingContext): void;

  drawOutline(context: WondGraphicDrawingContext): void;
}
