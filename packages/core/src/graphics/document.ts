import type { WondColor } from '../types';
import { GraphicsType, WondGraphics } from './graphics';
import { Canvas, CanvasKit, Surface } from 'canvaskit-wasm';

export class WondDocument extends WondGraphics {
  type: GraphicsType = GraphicsType.Document;
  backgroundColor: WondColor;
  children: WondGraphics[];

  constructor(attrs: Partial<Omit<WondDocument, 'id' | 'type'>>) {
    super(attrs);
    this.backgroundColor = attrs.backgroundColor || { r: 200, g: 15, b: 255, a: 1 };
    this.children = attrs.children || [];
  }

  public draw(canvasKit: CanvasKit, surface: Surface): void {
    surface.drawOnce((canvas: Canvas) => {
      canvas.drawColor(
        canvasKit.Color(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a),
        canvasKit.BlendMode.Src,
      );
    });
  }
}
