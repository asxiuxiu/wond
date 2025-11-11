import { GraphicsType, WondGraphics, type WondGraphicsAttrs } from './graphics';
import type { WondGraphicDrawingContext } from '../types';
import { DEFAULT_FILL_COLOR } from '../constants';
import { getMatrix3x3FromTransform, scenePathToPaintPath } from '../utils';
import { getCanvasKitContext } from '../context';

export interface WondRectAttrs extends WondGraphicsAttrs {
  radius?: number;
}

export class WondRect extends WondGraphics<WondRectAttrs> {
  type: GraphicsType = GraphicsType.Rectangle;

  protected generateScenePath() {
    const { canvaskit } = getCanvasKitContext();
    this._scenePath.reset();
    this._scenePath.addRect(canvaskit.LTRBRect(0, 0, this.attrs.size.x, this.attrs.size.y));
    this._scenePath.transform(getMatrix3x3FromTransform(this.attrs.transform));
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

    const path = scenePathToPaintPath(this._scenePath.copy(), context.viewSpaceMeta);
    canvas.drawPath(path, paint);
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
