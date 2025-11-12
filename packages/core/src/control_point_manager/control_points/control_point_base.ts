import type { WondGraphics, WondGraphicsAttrs } from '../../graphics';
import type { IWondControlPoint, WondControlPointShape, WondControlPointType } from '../types';
import type { IMouseEvent } from '../../types';
import type { IWondCursor } from '../../cursor_manager';
import type { IWondInternalAPI } from '../../editor';
import { getCanvasKitContext } from '../../context';
import type { Path } from 'canvaskit-wasm';

export class ControlPointBase<T extends WondGraphicsAttrs = WondGraphicsAttrs> implements IWondControlPoint<T> {
  refGraphic: WondGraphics<T>;
  type: WondControlPointType;
  visible = false;
  shape: WondControlPointShape = 'circle';
  _cachePath: Path;

  constructor(graphics: WondGraphics<T>, type: WondControlPointType) {
    this.refGraphic = graphics;
    this.type = type;
    const { canvaskit } = getCanvasKitContext();
    this._cachePath = new canvaskit.Path();
  }

  public getCachePath(): Path {
    this._cachePath.reset();
    return this._cachePath;
  }

  public getAnchorScenePos() {
    return { x: -1, y: -1 };
  }

  public getCursor(): IWondCursor {
    return 'default';
  }

  public onDragStart(event: IMouseEvent, internalAPI: IWondInternalAPI): void {
    return;
  }

  public onDrag(event: IMouseEvent, internalAPI: IWondInternalAPI): Partial<T> | void {
    return;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IWondInternalAPI): Partial<T> | void {
    return;
  }
}
