import { getUuid } from '@wond/common';
import { ZERO_BOUNDING_AREA } from '../constants';
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

export class WondGraphics {
  id: string;
  type: GraphicsType = GraphicsType.Graph;
  name = '';
  transform: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  visible = true;
  size: { x: number; y: number } = { x: 0, y: 0 };
  children?: WondGraphics[];

  constructor(attrs: Partial<Omit<WondGraphics, 'id' | 'type'>>) {
    this.id = getUuid();
    Object.assign(this, attrs);
  }

  public getBoundingArea(): WondBoundingArea {
    return ZERO_BOUNDING_AREA;
  }

  public getSvgString() {
    return '';
  }

  public draw(context: WondGraphicDrawingContext) {}

  public drawOutline(context: WondGraphicDrawingContext) {}
}
