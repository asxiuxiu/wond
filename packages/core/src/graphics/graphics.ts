import { getUuid } from '@wond/common';
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

export enum GraphicsType {
  Document = 'document',
  Graph = 'graph',
  Rectangle = 'rectangle',
  Vector = 'vector',
}

export interface GraphicsAttrs {
  id: string;
  type: GraphicsType;
  name: string;
  size?: { x: number; y?: number };
  transform?: I2dMatrix;
  visible: boolean;
  children?: WondGraphics[];
}

export class WondGraphics<ATTRS extends GraphicsAttrs = GraphicsAttrs> {
  type = GraphicsType.Graph;
  attrs: ATTRS;
  children?: WondGraphics[] = [];

  constructor(attrs: Omit<Partial<ATTRS>, 'id'>) {
    this.attrs = { ...attrs } as ATTRS;
    this.attrs.id = getUuid();
  }
}
