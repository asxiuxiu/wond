import type { IWondColor, WondGraphicDrawingContext } from '../types';
import { GraphicsType, WondGraphics } from './graphics';

export class WondDocument extends WondGraphics {
  type: GraphicsType = GraphicsType.Document;
  backgroundColor: IWondColor;
  children: WondGraphics[];

  constructor(attrs: Partial<Omit<WondDocument, 'id' | 'type'>>) {
    super(attrs);
    this.backgroundColor = attrs.backgroundColor || { r: 245, g: 245, b: 245, a: 1 };
    this.children = attrs.children || [];
  }

  public draw(context: WondGraphicDrawingContext): void {
    const { canvas, canvaskit: canvasKit } = context;
    canvas.clear(
      canvasKit.Color(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a),
    );
  }
}
