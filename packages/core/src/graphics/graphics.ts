import { WondBoundingArea } from '../geo';
import { applyToPoints, type Matrix } from 'transformation-matrix';
import type { IWondPoint, WondGraphicDrawingContext } from '../types';
import { getUuid } from '@wond/common';
import { getCanvasKitContext } from '../context';
import type { BBox } from 'rbush';
import type { Path } from 'canvaskit-wasm';
import { CornerResizeControlPoint, WondControlPointType, type IWondControlPoint } from '../control_point_manager';

export const GraphicsType = {
  Document: 'document',
  Graph: 'graph',
  Rectangle: 'rectangle',
  Vector: 'vector',
};

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
  protected _controlPointsCache: Partial<Record<WondControlPointType, IWondControlPoint<WondGraphicsAttrs>>> = {};

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

  public getScenePath(): Path {
    return this._scenePath.copy();
  }

  public getControlPoints(): IWondControlPoint<WondGraphicsAttrs>[] {
    // create or update the resize control points.
    if (!this._controlPointsCache[WondControlPointType.NW_Resize]) {
      this._controlPointsCache[WondControlPointType.NW_Resize] = new CornerResizeControlPoint(
        this,
        WondControlPointType.NW_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.NE_Resize]) {
      this._controlPointsCache[WondControlPointType.NE_Resize] = new CornerResizeControlPoint(
        this,
        WondControlPointType.NE_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.SW_Resize]) {
      this._controlPointsCache[WondControlPointType.SW_Resize] = new CornerResizeControlPoint(
        this,
        WondControlPointType.SW_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.SE_Resize]) {
      this._controlPointsCache[WondControlPointType.SE_Resize] = new CornerResizeControlPoint(
        this,
        WondControlPointType.SE_Resize,
      );
    }

    return [
      WondControlPointType.NW_Resize,
      WondControlPointType.NE_Resize,
      WondControlPointType.SW_Resize,
      WondControlPointType.SE_Resize,
    ]
      .map((type) => this._controlPointsCache[type]!)
      .filter((point) => point !== undefined);
  }

  clearControlPoints() {}

  public containsPoint(point: IWondPoint): boolean {
    return this._scenePath.contains(point.x, point.y);
  }

  public getBoundingArea(): WondBoundingArea {
    return this._boundingArea;
  }

  protected generateScenePath() {}

  protected generateBoundingArea() {
    const points = applyToPoints(this.attrs.transform, [
      { x: 0, y: 0 },
      { x: this.attrs.size.x, y: 0 },
      { x: this.attrs.size.x, y: this.attrs.size.y },
      { x: 0, y: this.attrs.size.y },
    ]);
    const bounds = points.reduce<BBox>(
      (acc, point) => {
        return {
          minX: Math.min(acc.minX, point.x),
          minY: Math.min(acc.minY, point.y),
          maxX: Math.max(acc.maxX, point.x),
          maxY: Math.max(acc.maxY, point.y),
        };
      },
      { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
    );
    this._boundingArea.set(bounds.minX, bounds.maxX, bounds.minY, bounds.maxY);
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

    if (width === 0 && height === 0) {
      return '';
    }

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

  public drawOutline(context: WondGraphicDrawingContext, type: 'selection' | 'hover' = 'selection'): void {}
}
