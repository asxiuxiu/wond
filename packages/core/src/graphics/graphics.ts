import { getUuid } from '@wond/common';
import { type Canvas, type CanvasKit } from 'canvaskit-wasm';
import { ZERO_BOUNDING_AREA } from '../constants';
import { WondBoundingArea } from '../geo/bounding_area';
/**
 * | a | c | tx|
 * | b | d | ty|
 * | 0 | 0 | 1 |
 */
export interface I2dMatrix {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
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
  transform: I2dMatrix = { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 };
  visible = true;
  children?: WondGraphics[];

  constructor(attrs: Partial<Omit<WondGraphics, 'id' | 'type'>>) {
    this.id = getUuid();
    Object.assign(this, attrs);
  }

  public getBoundingArea(): WondBoundingArea {
    return ZERO_BOUNDING_AREA;
  }

  public draw(canvasKit: CanvasKit, canvas: Canvas) {}
}
