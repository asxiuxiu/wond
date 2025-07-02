import { type Canvas, type CanvasKit, type Surface } from 'canvaskit-wasm';
import { type BoundingArea } from '../types';
import { GraphicsType, WondGraphics } from './graphics';

export class WondRect extends WondGraphics {
  size: { x: number; y: number };
  type: GraphicsType = GraphicsType.Rectangle;

  constructor(attrs: Partial<Omit<WondRect, 'id' | 'type'>>) {
    super(attrs);
    this.size = attrs.size || { x: 0, y: 0 };
  }

  getBoundingArea(): BoundingArea {
    return {
      left: this.transform.e,
      right: this.transform.e + this.size.x,
      top: this.transform.f,
      bottom: this.transform.f + this.size.y,
    };
  }

  public draw(canvasKit: CanvasKit, canvas: Canvas): void {
    const paint = new canvasKit.Paint();
    paint.setColor(canvasKit.Color4f(0.6, 0.6, 0.2, 1.0));
    paint.setStyle(canvasKit.PaintStyle.Fill);
    paint.setAntiAlias(true);
    const rr = canvasKit.RRectXY(canvasKit.LTRBRect(this.transform.e, this.transform.f, this.transform.e + this.size.x, this.transform.f + this.size.y), 0, 0);
    canvas.drawRRect(rr, paint);
  }
}
