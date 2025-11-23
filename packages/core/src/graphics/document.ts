import type { IWondColor, WondGraphicDrawingContext, IGraphicsAttrs, IGraphics, IBoundingArea } from '../interfaces';
import { WondGraphics } from './graphics';
import { ZERO_BOUNDING_AREA } from '../constants';
import { getCanvasKitContext } from '../context';

export interface WondDocumentAttrs extends IGraphicsAttrs {
  backgroundColor: IWondColor;
  children: IGraphics[];
}

export class WondDocument extends WondGraphics<WondDocumentAttrs> {
  constructor(attrs: Partial<Omit<WondDocumentAttrs, 'id' | 'type'>>) {
    super({
      locked: false,
      visible: true,
      name: 'rootPage',
      transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
      backgroundColor: { r: 255, g: 255, b: 255, a: 1 },
      children: [],
      isAspectRatioLocked: false,
      size: { x: -1, y: -1 },
      ...attrs,
    });
    this._attrs.type = this.type;
  }

  markScenePathDirty(newAttrs: Partial<WondDocumentAttrs>): boolean {
    return false;
  }

  public draw(context: WondGraphicDrawingContext): void {
    const { canvas } = context;
    const { canvaskit } = getCanvasKitContext();
    canvas.clear(
      canvaskit.Color(
        this.attrs.backgroundColor.r,
        this.attrs.backgroundColor.g,
        this.attrs.backgroundColor.b,
        this.attrs.backgroundColor.a,
      ),
    );
  }

  getBoundingArea(): IBoundingArea {
    return ZERO_BOUNDING_AREA;
  }

  getSvgString(): string {
    return '';
  }

  drawOutline(context: WondGraphicDrawingContext): void {}
}
