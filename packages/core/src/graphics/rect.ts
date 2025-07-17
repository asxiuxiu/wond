import { type Canvas, type CanvasKit, type Matrix3x3, type Paint } from 'canvaskit-wasm';
import { GraphicsType, WondGraphics } from './graphics';
import { WondBoundingArea } from '../geo/bounding_area';

export class WondRect extends WondGraphics {
  size: { x: number; y: number };
  type: GraphicsType = GraphicsType.Rectangle;

  constructor(attrs: Partial<Omit<WondRect, 'id' | 'type'>>) {
    super(attrs);
    this.size = attrs.size || { x: 0, y: 0 };
  }

  getBoundingArea(): WondBoundingArea {
    return new WondBoundingArea(
      this.transform.m02,
      this.transform.m02 + this.size.x,
      this.transform.m12,
      this.transform.m12 + this.size.y,
    );
  }

  private drawRect(canvasKit: CanvasKit, canvas: Canvas, paint: Paint) {
    canvas.save();
    const transformMatrix: Matrix3x3 = Float32Array.from([
      this.transform.m00,
      this.transform.m01,
      this.transform.m02,
      this.transform.m10,
      this.transform.m11,
      this.transform.m12,
      0,
      0,
      1,
    ]);
    canvas.concat(transformMatrix);
    const rr = canvasKit.RRectXY(canvasKit.LTRBRect(0, 0, this.size.x, this.size.y), 0, 0);
    canvas.drawRRect(rr, paint);

    canvas.restore();
  }

  public draw(canvasKit: CanvasKit, canvas: Canvas): void {
    const paint = new canvasKit.Paint();
    paint.setColor(canvasKit.Color4f(217 / 255, 217 / 255, 217 / 255, 1.0));
    paint.setStyle(canvasKit.PaintStyle.Fill);
    paint.setAntiAlias(true);

    this.drawRect(canvasKit, canvas, paint);
  }
}
