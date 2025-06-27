import { CanvasKit, Surface } from 'canvaskit-wasm';
import { BoundingArea } from '../types';
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

  public draw(canvasKit: CanvasKit, surface: Surface): void {}
}
