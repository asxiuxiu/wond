import { WondGraphics } from './graphics';
import type { IGraphicsAttrs } from '../interfaces';
import { GraphicsType } from '../interfaces';
import { getMatrix3x3FromTransform } from '../utils';
import { getCanvasKitContext } from '../context';

export interface WondRectAttrs extends IGraphicsAttrs {
  radius?: number;
}

export class WondRect extends WondGraphics<WondRectAttrs> {
  type: GraphicsType = GraphicsType.Rectangle;

  constructor(attrs: Partial<Omit<WondRectAttrs, 'id' | 'type'>>) {
    super(attrs);
    this._attrs.type = this.type;
  }

  protected generateScenePath() {
    const { canvaskit } = getCanvasKitContext();
    this._scenePath.reset();
    this._scenePath.addRect(canvaskit.LTRBRect(0, 0, this.attrs.size.x, this.attrs.size.y));
    this._scenePath.transform(getMatrix3x3FromTransform(this.attrs.transform));
  }
}
