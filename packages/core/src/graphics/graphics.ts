import { WondBoundingArea } from '../geo';
import { applyToPoints } from 'transformation-matrix';
import type {
  IWondPoint,
  WondGraphicDrawingContext,
  IGraphics,
  IBoundingArea,
  IGraphicsAttrs,
  IWondControlPoint,
} from '../interfaces';
import { GraphicsType, WondControlPointType } from '../interfaces';
import { getUuid } from '@wond/common';
import { getCanvasKitContext } from '../context';
import type { BBox } from 'rbush';
import type { Path } from 'canvaskit-wasm';
import { CornerResizeControlPoint, CornerRotateControlPoint, EdgeResizeControlPoint } from '../control_point_manager';
import { scenePathToPaintPath } from '../utils';
import { DEFAULT_FILL_COLOR } from '../constants';

export class WondGraphics<T extends IGraphicsAttrs = IGraphicsAttrs> implements BBox, IGraphics<T> {
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
  protected _controlPointsCache: Partial<Record<WondControlPointType, IWondControlPoint<IGraphicsAttrs>>> = {};

  parentId?: string;

  constructor(attrs: Partial<Omit<T, 'id' | 'type'>>) {
    this._attrs = {
      type: this.type,
      size: { x: 0, y: 0 },
      transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      visible: true,
      locked: false,
      opacity: 1,
      ...attrs,
      id: getUuid(),
    } as T;
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
    this._attrs = newAttrs;
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

  public getControlPoints(): IWondControlPoint<IGraphicsAttrs>[] {
    // create or update the resize control points.
    if (this.attrs.locked) {
      return [];
    }

    if (!this._controlPointsCache[WondControlPointType.NW_Rotate]) {
      this._controlPointsCache[WondControlPointType.NW_Rotate] = new CornerRotateControlPoint(
        [this],
        WondControlPointType.NW_Rotate,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.NE_Rotate]) {
      this._controlPointsCache[WondControlPointType.NE_Rotate] = new CornerRotateControlPoint(
        [this],
        WondControlPointType.NE_Rotate,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.SW_Rotate]) {
      this._controlPointsCache[WondControlPointType.SW_Rotate] = new CornerRotateControlPoint(
        [this],
        WondControlPointType.SW_Rotate,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.SE_Rotate]) {
      this._controlPointsCache[WondControlPointType.SE_Rotate] = new CornerRotateControlPoint(
        [this],
        WondControlPointType.SE_Rotate,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.N_Resize]) {
      this._controlPointsCache[WondControlPointType.N_Resize] = new EdgeResizeControlPoint(
        [this],
        WondControlPointType.N_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.S_Resize]) {
      this._controlPointsCache[WondControlPointType.S_Resize] = new EdgeResizeControlPoint(
        [this],
        WondControlPointType.S_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.E_Resize]) {
      this._controlPointsCache[WondControlPointType.E_Resize] = new EdgeResizeControlPoint(
        [this],
        WondControlPointType.E_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.W_Resize]) {
      this._controlPointsCache[WondControlPointType.W_Resize] = new EdgeResizeControlPoint(
        [this],
        WondControlPointType.W_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.NW_Resize]) {
      this._controlPointsCache[WondControlPointType.NW_Resize] = new CornerResizeControlPoint(
        [this],
        WondControlPointType.NW_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.NE_Resize]) {
      this._controlPointsCache[WondControlPointType.NE_Resize] = new CornerResizeControlPoint(
        [this],
        WondControlPointType.NE_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.SW_Resize]) {
      this._controlPointsCache[WondControlPointType.SW_Resize] = new CornerResizeControlPoint(
        [this],
        WondControlPointType.SW_Resize,
      );
    }

    if (!this._controlPointsCache[WondControlPointType.SE_Resize]) {
      this._controlPointsCache[WondControlPointType.SE_Resize] = new CornerResizeControlPoint(
        [this],
        WondControlPointType.SE_Resize,
      );
    }

    return [
      WondControlPointType.NW_Rotate,
      WondControlPointType.NE_Rotate,
      WondControlPointType.SW_Rotate,
      WondControlPointType.SE_Rotate,
      WondControlPointType.N_Resize,
      WondControlPointType.S_Resize,
      WondControlPointType.E_Resize,
      WondControlPointType.W_Resize,
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

  public getBoundingArea(): IBoundingArea {
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

  public draw(context: WondGraphicDrawingContext): void {
    const { canvas, cachePaintCollection } = context;
    const { canvaskit } = getCanvasKitContext();

    const cacheAlphaLayerPaint = cachePaintCollection.get('alphaLayerPaint');
    if (!cacheAlphaLayerPaint) {
      return;
    }

    const paint = new canvaskit.Paint();
    paint.setColor(
      canvaskit.Color(DEFAULT_FILL_COLOR.r, DEFAULT_FILL_COLOR.g, DEFAULT_FILL_COLOR.b, DEFAULT_FILL_COLOR.a),
    );
    paint.setStyle(canvaskit.PaintStyle.Fill);
    paint.setAntiAlias(true);

    const path = scenePathToPaintPath(this._scenePath.copy(), context.viewSpaceMeta);

    if (this.attrs.opacity < 1) {
      cacheAlphaLayerPaint.setAlphaf(this.attrs.opacity);
      canvas.saveLayer(cacheAlphaLayerPaint);
    }

    canvas.drawPath(path, paint);

    if (this.attrs.opacity < 1) {
      canvas.restore();
    }
  }

  public drawOutline(context: WondGraphicDrawingContext, type: 'selection' | 'hover' = 'selection') {
    const { canvas, cachePaintCollection } = context;
    const overlayStrokePaint = cachePaintCollection.get('overlayStrokePaint');
    if (!overlayStrokePaint) {
      return;
    }

    if (type === 'hover') {
      overlayStrokePaint.setStrokeWidth(2);
    } else if (type === 'selection') {
      overlayStrokePaint.setStrokeWidth(1);
    }

    const path = scenePathToPaintPath(this._scenePath.copy(), context.viewSpaceMeta);
    canvas.drawPath(path, overlayStrokePaint);
  }
}
