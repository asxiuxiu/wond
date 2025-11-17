import type {
  WondControlPointShape,
  IMouseEvent,
  IWondPoint,
  IInternalAPI,
  IGraphicsAttrs,
  ViewSpaceMeta,
} from '../../interfaces';
import {
  getResizeBaseDegree,
  getCornerResizeControlPointNormalizedPos,
  getResizeControlPointFixedType,
  screenCoordsToSceneCoords,
  CONTROL_POINT_RADIUS,
  sceneCoordsToPaintCoords,
  getMatrix3x3FromTransform,
  isAxisAlignedAfterTransform,
} from '../../utils';
import { ControlPointBase } from './control_point_base';
import type { IWondCursor } from '../../cursor_manager';
import { applyToPoint, compose, decomposeTSR, inverse, rotate, scale, translate } from 'transformation-matrix';
import { getCanvasKitContext } from '../../context';

export class CornerResizeControlPoint extends ControlPointBase {
  shape: WondControlPointShape = 'rect';
  visible: boolean = true;

  private originAttrs: IGraphicsAttrs | null = null;

  private getNormalizedPos() {
    return getCornerResizeControlPointNormalizedPos(this.type);
  }

  protected getAnchorScenePos() {
    const normalizedPos = this.getNormalizedPos();
    return applyToPoint(this.refGraphic.attrs.transform, {
      x: this.refGraphic.attrs.size.x * normalizedPos.x,
      y: this.refGraphic.attrs.size.y * normalizedPos.y,
    });
  }

  public detectPoint(viewSpaceMeta: ViewSpaceMeta, point: IWondPoint): boolean {
    const radius = CONTROL_POINT_RADIUS + 3;

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
    this._cachePath.transform(
      getMatrix3x3FromTransform({ ...this.refGraphic.attrs.transform, a: 1, d: 1, e: 0, f: 0 }),
    );

    return this._cachePath.contains(point.x, point.y);
  }

  public getCursor(): IWondCursor {
    return { type: 'resize', degree: getResizeBaseDegree(this.type) };
  }

  public onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void {
    this.originAttrs = { ...this.refGraphic.attrs };
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Partial<IGraphicsAttrs> | void {
    if (!this.originAttrs) return;
    let endSceneSpacePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    const isAxisAligned = isAxisAlignedAfterTransform(this.originAttrs.transform);
    if (!isAxisAligned) {
      endSceneSpacePoint = {
        x: Math.round(endSceneSpacePoint.x),
        y: Math.round(endSceneSpacePoint.y),
      };
    }

    const endLocalSpacePoint = applyToPoint(inverse(this.originAttrs.transform), {
      x: endSceneSpacePoint.x,
      y: endSceneSpacePoint.y,
    });

    const fixedControlPointType = getResizeControlPointFixedType(this.type);
    if (!fixedControlPointType) {
      return;
    }
    const fixedNormalizedPos = getCornerResizeControlPointNormalizedPos(fixedControlPointType);

    const fixedPointInLocalSpace = {
      x: this.originAttrs.size.x * fixedNormalizedPos.x || 0,
      y: this.originAttrs.size.y * fixedNormalizedPos.y || 0,
    };

    const movingNormalizedPos = this.getNormalizedPos();
    const movingPointInLocalSpace = {
      x: this.originAttrs.size.x * movingNormalizedPos.x,
      y: this.originAttrs.size.y * movingNormalizedPos.y,
    };

    const scaleLocalSpace = {
      x: (endLocalSpacePoint.x - fixedPointInLocalSpace.x) / (movingPointInLocalSpace.x - fixedPointInLocalSpace.x),
      y: (endLocalSpacePoint.y - fixedPointInLocalSpace.y) / (movingPointInLocalSpace.y - fixedPointInLocalSpace.y),
    };

    if (event.shiftKey) {
      const maxScale = Math.max(scaleLocalSpace.x, scaleLocalSpace.y);
      scaleLocalSpace.x = maxScale;
      scaleLocalSpace.y = maxScale;
    }

    const newTransform = compose([
      this.originAttrs.transform,
      translate(fixedPointInLocalSpace.x, fixedPointInLocalSpace.y),
      scale(scaleLocalSpace.x, scaleLocalSpace.y),
      translate(-fixedPointInLocalSpace.x, -fixedPointInLocalSpace.y),
    ]);

    const decomposedTransform = decomposeTSR(newTransform);

    const newSize = {
      x: this.originAttrs.size.x * decomposedTransform.scale.sx,
      y: this.originAttrs.size.y * decomposedTransform.scale.sy,
    };

    if (isAxisAligned) {
      newSize.x = Math.round(newSize.x);
      newSize.y = Math.round(newSize.y);
    }

    const noScaleTransform = compose([
      translate(decomposedTransform.translate.tx, decomposedTransform.translate.ty),
      rotate(decomposedTransform.rotation.angle),
    ]);

    return {
      transform: noScaleTransform,
      size: newSize,
    };
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI) {
    return;
  }
}
