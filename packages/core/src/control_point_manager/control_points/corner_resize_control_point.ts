import type {
  WondControlPointShape,
  IMouseEvent,
  IWondPoint,
  IInternalAPI,
  IGraphicsAttrs,
  ViewSpaceMeta,
} from '../../interfaces';
import {
  getControlPointBaseDegree,
  getCornerControlPointNormalizedPos,
  getResizeControlPointFixedType,
  screenCoordsToSceneCoords,
  CONTROL_POINT_RADIUS,
  sceneCoordsToPaintCoords,
  getMatrix3x3FromTransform,
  aspectRatioLockScale,
} from '../../utils';
import { ControlPointBase } from './control_point_base';
import type { IWondCursor } from '../../cursor_manager';
import { applyToPoint, compose, inverse, scale, translate, type Matrix } from 'transformation-matrix';
import { getCanvasKitContext } from '../../context';

export class CornerResizeControlPoint extends ControlPointBase {
  shape: WondControlPointShape = 'rect';
  visible: boolean = true;

  private originAttrs: (Pick<IGraphicsAttrs, 'transform' | 'size'> & { isAspectRatioLocked: boolean }) | null = null;

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
    const radius = CONTROL_POINT_RADIUS + 2;

    this._cachePath.reset();

    const anchorScenePos = this.getAnchorScenePos();
    const anchorPaintPos = sceneCoordsToPaintCoords(anchorScenePos, viewSpaceMeta);

    const { canvaskit } = getCanvasKitContext();
    this._cachePath.addRect(
      canvaskit.LTRBRect(
        anchorPaintPos.x - radius,
        anchorPaintPos.y - radius,
        anchorPaintPos.x + radius,
        anchorPaintPos.y + radius,
      ),
    );
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

    return this._cachePath.contains(point.x, point.y);
  }

  public getCursor(): IWondCursor {
    const { rotation, flipX, flipY } = this.getRefGraphicsRotateAndFlip();
    return {
      type: 'resize',
      degree: getControlPointBaseDegree(this.type, { flipX, flipY }) + (flipX || flipY ? -1 : 1) * rotation,
    };
  }

  public onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void {
    this.originAttrs = this.getRefGraphicsAttrs();
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Matrix | null {
    if (!this.originAttrs) return null;
    let endSceneSpacePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    endSceneSpacePoint = {
      x: Math.round(endSceneSpacePoint.x),
      y: Math.round(endSceneSpacePoint.y),
    };

    const endLocalSpacePoint = applyToPoint(inverse(this.originAttrs.transform), {
      x: endSceneSpacePoint.x,
      y: endSceneSpacePoint.y,
    });

    const fixedControlPointType = getResizeControlPointFixedType(this.type);
    if (!fixedControlPointType) {
      return null;
    }
    const fixedNormalizedPos = getCornerControlPointNormalizedPos(fixedControlPointType);

    const fixedPointInLocalSpace = {
      x: this.originAttrs.size.x * fixedNormalizedPos.x || 0,
      y: this.originAttrs.size.y * fixedNormalizedPos.y || 0,
    };

    const movingNormalizedPos = this.getNormalizedPos();
    const movingPointInLocalSpace = {
      x: this.originAttrs.size.x * movingNormalizedPos.x,
      y: this.originAttrs.size.y * movingNormalizedPos.y,
    };

    let scaleLocalSpace = {
      x: (endLocalSpacePoint.x - fixedPointInLocalSpace.x) / (movingPointInLocalSpace.x - fixedPointInLocalSpace.x),
      y: (endLocalSpacePoint.y - fixedPointInLocalSpace.y) / (movingPointInLocalSpace.y - fixedPointInLocalSpace.y),
    };

    if (event.shiftKey || this.originAttrs.isAspectRatioLocked) {
      scaleLocalSpace = aspectRatioLockScale(scaleLocalSpace);
    }

    internalAPI.getSceneGraph().setSelectionDraggingState({
      type: 'resize',
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });

    const newTransform = compose([
      this.originAttrs.transform,
      translate(fixedPointInLocalSpace.x, fixedPointInLocalSpace.y),
      scale(scaleLocalSpace.x, scaleLocalSpace.y),
      translate(-fixedPointInLocalSpace.x, -fixedPointInLocalSpace.y),
    ]);

    const addedTransform = compose([newTransform, inverse(this.originAttrs.transform)]);

    return addedTransform;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI) {
    internalAPI.getSceneGraph().setSelectionDraggingState(null);
    return null;
  }
}
