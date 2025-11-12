import type {
  IGraphicsAttrs,
  WondControlPointType,
  IWondControlPoint,
  WondControlPointShape,
  IMouseEvent,
  IInternalAPI,
  IGraphics,
} from '../../interfaces';
import type { IWondCursor } from '../../cursor_manager';
import { getCanvasKitContext } from '../../context';
import type { Path } from 'canvaskit-wasm';

export class ControlPointBase<T extends IGraphicsAttrs = IGraphicsAttrs> implements IWondControlPoint<T> {
  refGraphic: IGraphics<T>;
  type: WondControlPointType;
  visible = false;
  shape: WondControlPointShape = 'circle';
  _cachePath: Path;

  constructor(graphics: IGraphics<T>, type: WondControlPointType) {
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

  public onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void {
    return;
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Partial<T> | void {
    return;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI): Partial<T> | void {
    return;
  }
}
