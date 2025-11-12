import type { WondControlPointShape, IMouseEvent, IWondPoint, IInternalAPI, IGraphicsAttrs } from '../../interfaces';
import {
  getResizeBaseDegree,
  getResizeControlPointNormalizedPos,
  getResizeControlPointFixedNormalizedPos,
  screenCoordsToSceneCoords,
} from '../../utils';
import { ControlPointBase } from './control_point_base';
import type { IWondCursor } from '../../cursor_manager';
import { applyToPoint, compose, decomposeTSR, inverse, rotate, scale, translate } from 'transformation-matrix';

export class CornerResizeControlPoint extends ControlPointBase {
  shape: WondControlPointShape = 'rect';
  visible: boolean = true;

  private startLocalSpacePoint: IWondPoint | null = null;
  private originAttrs: IGraphicsAttrs | null = null;

  private getNormalizedPos() {
    return getResizeControlPointNormalizedPos(this.type);
  }

  public getAnchorScenePos() {
    const normalizedPos = this.getNormalizedPos();
    return applyToPoint(this.refGraphic.attrs.transform, {
      x: this.refGraphic.attrs.size.x * normalizedPos.x,
      y: this.refGraphic.attrs.size.y * normalizedPos.y,
    });
  }

  public getCursor(): IWondCursor {
    return { type: 'resize', degree: getResizeBaseDegree(this.type) };
  }

  public onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void {
    this.originAttrs = { ...this.refGraphic.attrs };

    const startSceneSpacePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    this.startLocalSpacePoint = applyToPoint(inverse(this.originAttrs.transform), {
      x: Math.round(startSceneSpacePoint.x),
      y: Math.round(startSceneSpacePoint.y),
    });
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Partial<IGraphicsAttrs> | void {
    if (!this.startLocalSpacePoint || !this.originAttrs) return;
    const endSceneSpacePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    const endLocalSpacePoint = applyToPoint(inverse(this.originAttrs.transform), {
      x: Math.round(endSceneSpacePoint.x),
      y: Math.round(endSceneSpacePoint.y),
    });

    const deltaLocalSpace = {
      x: endLocalSpacePoint.x - this.startLocalSpacePoint.x,
      y: endLocalSpacePoint.y - this.startLocalSpacePoint.y,
    };

    const fixedNormalizedPos = getResizeControlPointFixedNormalizedPos(this.type);

    const fixedPointInLocalSpace = {
      x: this.originAttrs.size.x * fixedNormalizedPos.x,
      y: this.originAttrs.size.y * fixedNormalizedPos.y,
    };

    const movingNormalizedPos = this.getNormalizedPos();
    const movingPointInLocalSpace = {
      x: this.originAttrs.size.x * movingNormalizedPos.x,
      y: this.originAttrs.size.y * movingNormalizedPos.y,
    };

    const newMovingPointInLocalSpace = {
      x: movingPointInLocalSpace.x + deltaLocalSpace.x,
      y: movingPointInLocalSpace.y + deltaLocalSpace.y,
    };

    const scaleLocalSpace = {
      x:
        (newMovingPointInLocalSpace.x - fixedPointInLocalSpace.x) /
        (movingPointInLocalSpace.x - fixedPointInLocalSpace.x),
      y:
        (newMovingPointInLocalSpace.y - fixedPointInLocalSpace.y) /
        (movingPointInLocalSpace.y - fixedPointInLocalSpace.y),
    };

    const newTransform = compose([
      this.originAttrs.transform,
      translate(fixedPointInLocalSpace.x, fixedPointInLocalSpace.y),
      scale(scaleLocalSpace.x, scaleLocalSpace.y),
      translate(-fixedPointInLocalSpace.x, -fixedPointInLocalSpace.y),
    ]);

    const decomposedTransform = decomposeTSR(newTransform);

    const newSize = {
      x: Math.round(this.originAttrs.size.x * decomposedTransform.scale.sx * 100) / 100,
      y: Math.round(this.originAttrs.size.y * decomposedTransform.scale.sy * 100) / 100,
    };

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
