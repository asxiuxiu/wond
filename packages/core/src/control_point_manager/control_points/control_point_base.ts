import type {
  IGraphicsAttrs,
  WondControlPointType,
  IWondControlPoint,
  WondControlPointShape,
  IMouseEvent,
  IInternalAPI,
  IGraphics,
  ViewSpaceMeta,
  IWondPoint,
} from '../../interfaces';
import type { IWondCursor } from '../../cursor_manager';
import { getCanvasKitContext } from '../../context';
import type { Path } from 'canvaskit-wasm';
import { generateShapePath, getMatrix3x3FromTransform, sceneCoordsToPaintCoords } from '../../utils';

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

  public getDrawPath(viewSpaceMeta: ViewSpaceMeta): Path {
    this._cachePath.reset();
    const anchorScenePos = this.getAnchorScenePos();
    if (anchorScenePos.x < 0 || anchorScenePos.y < 0) {
      return this._cachePath;
    }

    const anchorPaintPos = sceneCoordsToPaintCoords(anchorScenePos, viewSpaceMeta);
    generateShapePath(this._cachePath, this.shape, anchorPaintPos);
    this._cachePath.transform(
      getMatrix3x3FromTransform({ ...this.refGraphic.attrs.transform, a: 1, d: 1, e: 0, f: 0 }),
    );

    return this._cachePath;
  }

  public detectPoint(viewSpaceMeta: ViewSpaceMeta, point: IWondPoint): boolean {
    return false;
  }

  protected getAnchorScenePos() {
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
