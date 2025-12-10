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
  IBoundingArea,
} from '../../interfaces';
import type { IWondCursor } from '../../cursor_manager';
import { getCanvasKitContext } from '../../context';
import type { Path } from 'canvaskit-wasm';
import {
  generateShapePath,
  getAnchorsBetweenChildAndParentBoundingArea,
  getGraphicsBoundingArea,
  getMatrix3x3FromTransform,
  sceneCoordsToPaintCoords,
} from '../../utils';
import { compose, decomposeTSR, translate, type Matrix } from 'transformation-matrix';
import { rad2deg } from '../../geo';

export class ControlPointBase<T extends IGraphicsAttrs = IGraphicsAttrs> implements IWondControlPoint<T> {
  refGraphics: IGraphics<T>[];
  type: WondControlPointType;
  visible = false;
  shape: WondControlPointShape = 'circle';
  _cachePath: Path;

  constructor(graphics: IGraphics<T>[], type: WondControlPointType) {
    this.refGraphics = graphics;
    this.type = type;
    const { canvaskit } = getCanvasKitContext();
    this._cachePath = new canvaskit.Path();
  }

  public getDrawPath(viewSpaceMeta: ViewSpaceMeta): Path {
    this._cachePath.reset();
    if (!this.visible) {
      return this._cachePath;
    }
    const anchorScenePos = this.getAnchorScenePos();

    const anchorPaintPos = sceneCoordsToPaintCoords(anchorScenePos, viewSpaceMeta);
    generateShapePath(this._cachePath, this.shape, anchorPaintPos);
    const refGraphicsAttrs = this.getRefGraphicsAttrs();
    this._cachePath.transform(
      getMatrix3x3FromTransform(
        compose([
          translate(anchorPaintPos.x, anchorPaintPos.y),
          { ...refGraphicsAttrs.transform, e: 0, f: 0 },
          translate(-anchorPaintPos.x, -anchorPaintPos.y),
        ]),
      ),
    );

    return this._cachePath;
  }

  protected getRefGraphicsAttrs(): Pick<T, 'transform' | 'size'> & { isAspectRatioLocked: boolean } {
    if (this.refGraphics.length === 0) {
      return {
        size: { x: 0, y: 0 },
        transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
        isAspectRatioLocked: false,
      };
    } else if (this.refGraphics.length === 1) {
      const graphics = this.refGraphics[0];
      return {
        size: { ...graphics.attrs.size },
        transform: { ...graphics.attrs.transform },
        isAspectRatioLocked: !!graphics.attrs.targetAspectRatio,
      };
    } else {
      let accBoundingArea: IBoundingArea | null = getGraphicsBoundingArea(this.refGraphics);

      if (accBoundingArea == null) {
        return {
          size: { x: 0, y: 0 },
          transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
          isAspectRatioLocked: false,
        };
      }

      // calculate the anchor count between graphics and the acc bounding area
      // if one graphics have two anchors, the aspect ratio is locked.
      let isAspectRatioLocked = false;
      for (const graphics of this.refGraphics) {
        const anchors = getAnchorsBetweenChildAndParentBoundingArea(graphics.getBoundingArea(), accBoundingArea);
        if (anchors.length >= 2 && !!graphics.attrs.targetAspectRatio) {
          isAspectRatioLocked = true;
          break;
        }
      }

      return {
        size: { x: accBoundingArea.getWidth(), y: accBoundingArea.getHeight() },
        transform: { a: 1, b: 0, c: 0, d: 1, e: accBoundingArea.left, f: accBoundingArea.top },
        isAspectRatioLocked: isAspectRatioLocked,
      };
    }
  }

  public detectPoint(viewSpaceMeta: ViewSpaceMeta, point: IWondPoint): boolean {
    return false;
  }

  protected getRefGraphicsRotateAndFlip() {
    if (this.refGraphics.length === 0 || this.refGraphics.length > 1)
      return { rotation: 0, flipX: false, flipY: false };
    const graphics = this.refGraphics[0];
    const transform = graphics.attrs.transform;
    const decomposedTransform = decomposeTSR(transform);
    return {
      rotation: rad2deg(decomposedTransform.rotation.angle),
      flipX: decomposedTransform.scale.sx < 0,
      flipY: decomposedTransform.scale.sy < 0,
    };
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

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Matrix | null {
    return null;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI): Matrix | null {
    return null;
  }
}
