import { getUuid } from '@wond/common';
import { type Canvas, type CanvasKit, type Surface } from 'canvaskit-wasm';
import { type BoundingArea } from '../types';
import { ZERO_BOUNDING_AREA } from '../constants';
/**
 * | a | c | tx|
 * | b | d | ty|
 * | 0 | 0 | 1 |
 */
export interface I2dMatrix {
  a: number; // horizontal scale
  b: number; // horizontal skew
  c: number; // vertical skew
  d: number; // vertical scale
  e: number; // horizontal translation
  f: number; // vertical translation
}

export const GraphicsType = {
  Document: 'document',
  Graph: 'graph',
  Rectangle: 'rectangle',
  Vector: 'vector',
} as const;

export type GraphicsType = (typeof GraphicsType)[keyof typeof GraphicsType];

export class WondGraphics {
  id: string;
  type: GraphicsType = GraphicsType.Graph;
  name = '';
  transform: I2dMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  visible = true;
  children?: WondGraphics[];

  constructor(attrs: Partial<Omit<WondGraphics, 'id' | 'type'>>) {
    this.id = getUuid();
    Object.assign(this, attrs);
  }

  public getBoundingArea(): BoundingArea {
    return ZERO_BOUNDING_AREA;
  }

  public draw(canvasKit: CanvasKit, canvas: Canvas) { }
}
