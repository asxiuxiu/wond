import type { Path } from 'canvaskit-wasm';
import type { WondGraphics, WondGraphicsAttrs } from '../../graphics';
import type { IWondControlPoint, WondControlPointShape, WondControlPointType } from '../types';
import { getCanvasKitContext } from '../../context';
import { generateDetectShapePath, generateShapePath } from '../utils';
import type { IMouseEvent, IWondPoint } from '../../types';
import { getMatrix3x3FromTransform } from '../../utils';
import type { IWondCursor } from '../../cursor_manager';
import type { IWondInternalAPI } from '../../editor';

export class ControlPointBase<T extends WondGraphicsAttrs = WondGraphicsAttrs> implements IWondControlPoint<T> {
  refGraphic: WondGraphics<T>;
  type: WondControlPointType;
  visible = false;
  shape: WondControlPointShape = 'circle';

  constructor(graphics: WondGraphics<T>, type: WondControlPointType) {
    this.refGraphic = graphics;
    this.type = type;
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
