import { ZERO_BOUNDING_AREA } from './../constants';
import { WondBoundingArea } from '../geo';
import { type Matrix } from 'transformation-matrix';
import type { WondGraphicDrawingContext } from '../types';
import { getUuid } from '@wond/common';
import { getCanvasKitContext } from '../context';
import type { BBox } from 'rbush';
import type { Path } from 'canvaskit-wasm';

export const GraphicsType = {
  Document: 'document',
  Graph: 'graph',
  Rectangle: 'rectangle',
  Vector: 'vector',
} as const;

export type GraphicsType = (typeof GraphicsType)[keyof typeof GraphicsType];

export interface WondGraphicsAttrs {
  readonly id: string;
  type: GraphicsType;
  name: string;
  transform: Matrix;
  visible: boolean;
  locked: boolean;
  size: { x: number; y: number };
  children?: WondGraphics[];
}

export class WondGraphics<T extends WondGraphicsAttrs = WondGraphicsAttrs> implements BBox {
  get minX(): number {
    return this._boundingArea.left;
  }

  get minY(): number {
    return this._boundingArea.top;
  }

  get maxX(): number {
    return this._boundingArea.right;
  }

  get maxY(): number {
    return this._boundingArea.bottom;
  }

  type: GraphicsType = GraphicsType.Graph;
  protected _attrs: T;
  protected _scenePath: Path;
  protected _boundingArea: WondBoundingArea = new WondBoundingArea();
  private _svgString = '';

  parentId?: string;

  constructor(attrs: Omit<T, 'id' | 'type'>) {
    this._attrs = { ...attrs, id: getUuid(), type: this.type } as T;
    const { canvaskit } = getCanvasKitContext();
    this._scenePath = new canvaskit.Path();
    this.generateScenePath();
    this.generateBoundingArea();
    this.generateSvgShapeString();
  }

  get attrs(): Readonly<T> {
    return this._attrs;
  }

  set attrs(newAttrs: T) {
    const willUpdateScenePath = this.willUpdateScenePath(newAttrs);
    this._attrs = { ...this._attrs, ...newAttrs };
    if (willUpdateScenePath) {
      this.generateScenePath();
      this.generateBoundingArea();
      this.generateSvgShapeString();
    }
  }

  protected willUpdateScenePath(newAttrs: Partial<T>): boolean {
    if (newAttrs.transform != this._attrs.transform) {
      return true;
    }

    if (newAttrs.size != this._attrs.size) {
      return true;
    }

    return false;
  }

  public getBoundingArea(): WondBoundingArea {
    return this._boundingArea;
  }

  protected generateScenePath() {}

  protected generateBoundingArea() {
    const bounds = this._scenePath.computeTightBounds();
    this._boundingArea.set(bounds[0], bounds[2], bounds[1], bounds[3]);
  }

  protected generateSvgShapeString() {
    if (!this._scenePath) {
      return '';
    }

    const path = this._scenePath.copy();

    const bounds = path.computeTightBounds();
    const minX = bounds[0];
    const minY = bounds[1];
    const maxX = bounds[2];
    const maxY = bounds[3];

    const width = maxX - minX;
    const height = maxY - minY;

    const targetSize = 10;
    const boundingSize = 9;
    const scale = boundingSize / Math.max(width, height);

    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    const offsetX = (targetSize - scaledWidth) / 2;
    const offsetY = (targetSize - scaledHeight) / 2;

    path.offset(-minX, -minY);
    path.transform([scale, 0, 0, 0, scale, 0, 0, 0, 1]);
    path.offset(offsetX, offsetY);

    this._svgString = path.toSVGString();
  }

  public getSvgString(): string {
    return this._svgString;
  }

  public draw(context: WondGraphicDrawingContext): void {}

  public drawOutline(context: WondGraphicDrawingContext): void {}
}
