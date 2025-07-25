import { GraphicsType, WondGraphics } from './graphics';
import { WondBoundingArea } from '../geo';
import { applyToPoint } from 'transformation-matrix';
import type { WondGraphicDrawingContext } from '../types';
import { DEFAULT_FILL_COLOR } from '../constants';
import { getMatrix3x3FromTransform } from '../utils';
import { getCanvasKitContext } from '../context';
import type { CanvasKit } from 'canvaskit-wasm';

export class WondRect extends WondGraphics {
  type: GraphicsType = GraphicsType.Rectangle;

  private _cachePath = '';

  constructor(attrs: Partial<Omit<WondRect, 'id' | 'type'>>) {
    super(attrs);
  }

  getBoundingArea(): WondBoundingArea {
    const left_top = applyToPoint(this.transform, { x: 0, y: 0 });
    const right_top = applyToPoint(this.transform, { x: this.size.x, y: 0 });
    const left_bottom = applyToPoint(this.transform, { x: 0, y: this.size.y });
    const right_bottom = applyToPoint(this.transform, { x: this.size.x, y: this.size.y });
    return new WondBoundingArea(
      Math.min(left_top.x, right_top.x, left_bottom.x, right_bottom.x),
      Math.max(left_top.x, right_top.x, left_bottom.x, right_bottom.x),
      Math.min(left_top.y, right_top.y, left_bottom.y, right_bottom.y),
      Math.max(left_top.y, right_top.y, left_bottom.y, right_bottom.y),
    );
  }

  getSvgString() {
    if (this._cachePath) {
      return this._cachePath;
    }

    const { canvaskit } = getCanvasKitContext();
    this.getShapePath(canvaskit);
    return this._cachePath;
  }

  private getShapePath(canvaskit: CanvasKit) {
    const path = new canvaskit.Path();
    path.addRect(canvaskit.LTRBRect(0, 0, this.size.x, this.size.y));
    path.transform(getMatrix3x3FromTransform(this.transform));
    this._cachePath = path.toSVGString();
    return path;
  }

  private getPaintPath(context: WondGraphicDrawingContext) {
    const { canvasTransform, canvaskit } = context;
    const path = this.getShapePath(canvaskit);

    path.transform(getMatrix3x3FromTransform(canvasTransform));
    return path;
  }

  public draw(context: WondGraphicDrawingContext): void {
    const { canvas, canvaskit } = context;
    const paint = new canvaskit.Paint();
    paint.setColor(
      canvaskit.Color4f(
        DEFAULT_FILL_COLOR.r / 255,
        DEFAULT_FILL_COLOR.g / 255,
        DEFAULT_FILL_COLOR.b / 255,
        DEFAULT_FILL_COLOR.a,
      ),
    );
    paint.setStyle(canvaskit.PaintStyle.Fill);
    paint.setAntiAlias(true);

    const path = this.getPaintPath(context);
    canvas.drawPath(path, paint);
  }

  public drawOutline(context: WondGraphicDrawingContext) {
    const { canvas, overlayStrokePaint } = context;

    const path = this.getPaintPath(context);
    canvas.drawPath(path, overlayStrokePaint);
  }
}
