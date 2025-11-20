import { applyToPoint, compose, rotate, translate, type Matrix } from 'transformation-matrix';
import { getCanvasKitContext } from '../../context';
import type { IWondCursor } from '../../cursor_manager/cursor_manager';
import type { IGraphicsAttrs, IInternalAPI, IMouseEvent, IWondPoint, ViewSpaceMeta } from '../../interfaces';
import {
  CONTROL_POINT_RADIUS,
  getCornerControlPointNormalizedPos,
  getMatrix3x3FromTransform,
  getControlPointBaseDegree,
  sceneCoordsToPaintCoords,
  screenCoordsToSceneCoords,
} from '../../utils';
import { ControlPointBase } from './control_point_base';
import { rad2deg } from '../../geo';

export class CornerRotateControlPoint extends ControlPointBase {
  visible: boolean = false;

  private originAttrs: Pick<IGraphicsAttrs, 'transform' | 'size'> | null = null;
  private draggingRotationAngle: number = 0;

  private getNormalizedPos() {
    return getCornerControlPointNormalizedPos(this.type);
  }

  protected getAnchorScenePos() {
    const normalizedPos = this.getNormalizedPos();

    const refGraphicsAttrs = this.getRefGraphicsAttrs();
    return applyToPoint(refGraphicsAttrs.transform, {
      x: refGraphicsAttrs.size.x * normalizedPos.x,
      y: refGraphicsAttrs.size.y * normalizedPos.y,
    });
  }

  public detectPoint(viewSpaceMeta: ViewSpaceMeta, point: IWondPoint): boolean {
    const radius = CONTROL_POINT_RADIUS + 8;

    const { canvaskit } = getCanvasKitContext();

    this._cachePath.reset();
    const refGraphicsAttrs = this.getRefGraphicsAttrs();

    // if contains in the graphic, return false.
    this._cachePath.addRect(canvaskit.LTRBRect(0, 0, refGraphicsAttrs.size.x, refGraphicsAttrs.size.y));
    this._cachePath.transform(getMatrix3x3FromTransform(refGraphicsAttrs.transform));
    if (this._cachePath.contains(point.x, point.y)) {
      return false;
    }

    this._cachePath.reset();
    const anchorScenePos = this.getAnchorScenePos();
    const anchorPaintPos = sceneCoordsToPaintCoords(anchorScenePos, viewSpaceMeta);
    this._cachePath.addRect(
      canvaskit.LTRBRect(
        anchorPaintPos.x - radius,
        anchorPaintPos.y - radius,
        anchorPaintPos.x + radius,
        anchorPaintPos.y + radius,
      ),
    );

    return this._cachePath.contains(point.x, point.y);
  }

  public getCursor(): IWondCursor {
    if (this.refGraphics.length === 0) {
      return { type: 'rotation', degree: 0 };
    } else if (this.refGraphics.length === 1) {
      const { rotation, flipX, flipY } = this.getRefGraphicsRotateAndFlip();
      const baseDegree = getControlPointBaseDegree(this.type, { flipX, flipY });
      return { type: 'rotation', degree: baseDegree + (flipX || flipY ? -1 : 1) * rotation };
    } else {
      return {
        type: 'rotation',
        degree: getControlPointBaseDegree(this.type, { flipX: false, flipY: false }) + this.draggingRotationAngle,
      };
    }
  }

  public onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void {
    this.originAttrs = this.getRefGraphicsAttrs();
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Matrix | null {
    if (!this.originAttrs) return null;
    const rotateCenterInLocalSpace = {
      x: this.originAttrs.size.x / 2,
      y: this.originAttrs.size.y / 2,
    };
    const rotateCenterInSceneSpace = applyToPoint(this.originAttrs.transform, rotateCenterInLocalSpace);

    const anchorNormalizedPos = this.getNormalizedPos();
    const anchorScenePos = applyToPoint(this.originAttrs.transform, {
      x: this.originAttrs.size.x * anchorNormalizedPos.x,
      y: this.originAttrs.size.y * anchorNormalizedPos.y,
    });

    const vec = {
      x: anchorScenePos.x - rotateCenterInSceneSpace.x,
      y: anchorScenePos.y - rotateCenterInSceneSpace.y,
    };

    const endSceneSpacePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    const endVec = {
      x: endSceneSpacePoint.x - rotateCenterInSceneSpace.x,
      y: endSceneSpacePoint.y - rotateCenterInSceneSpace.y,
    };

    const angleRad = Math.atan2(endVec.y, endVec.x) - Math.atan2(vec.y, vec.x);
    this.draggingRotationAngle = rad2deg(angleRad);

    const addedTransform = compose([
      translate(rotateCenterInSceneSpace.x, rotateCenterInSceneSpace.y),
      rotate(angleRad),
      translate(-rotateCenterInSceneSpace.x, -rotateCenterInSceneSpace.y),
    ]);

    return addedTransform;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI) {
    return null;
  }
}
