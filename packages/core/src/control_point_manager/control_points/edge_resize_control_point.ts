import type { IMouseEvent, IWondPoint, IInternalAPI, IGraphicsAttrs, ViewSpaceMeta } from '../../interfaces';
import {
  aspectRatioLockScale,
  getEdgeResizeControlPointNormalizedPos,
  getResizeControlPointFixedType,
  sceneCoordsToPaintCoords,
  screenCoordsToSceneCoords,
} from '../../utils';
import { ControlPointBase } from './control_point_base';
import type { IWondCursor } from '../../cursor_manager';
import { applyToPoint, compose, inverse, scale, translate, type Matrix } from 'transformation-matrix';

export class EdgeResizeControlPoint extends ControlPointBase {
  visible: boolean = false;

  private originAttrs: Pick<IGraphicsAttrs, 'transform' | 'size' | 'isAspectRatioLocked'> | null = null;

  protected getAnchorScenePos() {
    return { x: -1, y: -1 };
  }

  public detectPoint(viewSpaceMeta: ViewSpaceMeta, point: IWondPoint): boolean {
    const [startNormalizedPos, endNormalizedPos] = getEdgeResizeControlPointNormalizedPos(this.type);
    if (startNormalizedPos.x < 0 || startNormalizedPos.y < 0 || endNormalizedPos.x < 0 || endNormalizedPos.y < 0) {
      return false;
    }

    const refGraphicsAttrs = this.getRefGraphicsAttrs();
    const [startPaintSpacePoint, endPaintSpacePoint] = [startNormalizedPos, endNormalizedPos].map((pos) =>
      sceneCoordsToPaintCoords(
        applyToPoint(refGraphicsAttrs.transform, {
          x: pos.x * refGraphicsAttrs.size.x,
          y: pos.y * refGraphicsAttrs.size.y,
        }),
        viewSpaceMeta,
      ),
    );

    this._cachePath.reset();
    const dx = endPaintSpacePoint.x - startPaintSpacePoint.x;
    const dy = endPaintSpacePoint.y - startPaintSpacePoint.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) return false;

    const nx = -dy / len;
    const ny = dx / len;

    const OFFSET = 6;

    const p1 = {
      x: startPaintSpacePoint.x + nx * OFFSET,
      y: startPaintSpacePoint.y + ny * OFFSET,
    };
    const p2 = {
      x: endPaintSpacePoint.x + nx * OFFSET,
      y: endPaintSpacePoint.y + ny * OFFSET,
    };
    const p3 = {
      x: endPaintSpacePoint.x - nx * OFFSET,
      y: endPaintSpacePoint.y - ny * OFFSET,
    };
    const p4 = {
      x: startPaintSpacePoint.x - nx * OFFSET,
      y: startPaintSpacePoint.y - ny * OFFSET,
    };

    this._cachePath.moveTo(p1.x, p1.y);
    this._cachePath.lineTo(p2.x, p2.y);
    this._cachePath.lineTo(p3.x, p3.y);
    this._cachePath.lineTo(p4.x, p4.y);
    this._cachePath.close();

    return this._cachePath.contains(point.x, point.y);
  }

  public getCursor(): IWondCursor {
    const [startNormalizedPos, endNormalizedPos] = getEdgeResizeControlPointNormalizedPos(this.type);
    if (startNormalizedPos.x < 0 || startNormalizedPos.y < 0 || endNormalizedPos.x < 0 || endNormalizedPos.y < 0) {
      return { type: 'resize', degree: 0 };
    }

    const refGraphicsAttrs = this.getRefGraphicsAttrs();
    const [startSceneSpacePoint, endSceneSpacePoint] = [startNormalizedPos, endNormalizedPos].map((pos) =>
      applyToPoint(refGraphicsAttrs.transform, {
        x: pos.x * refGraphicsAttrs.size.x,
        y: pos.y * refGraphicsAttrs.size.y,
      }),
    );

    const dx = endSceneSpacePoint.x - startSceneSpacePoint.x;
    const dy = endSceneSpacePoint.y - startSceneSpacePoint.y;
    const degree = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { type: 'resize', degree };
  }

  public onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void {
    this.originAttrs = this.getRefGraphicsAttrs();
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Matrix | null {
    if (!this.originAttrs) return null;

    const [movingEdgeStartNormalizedPos, movingEdgeEndNormalizedPos] = getEdgeResizeControlPointNormalizedPos(
      this.type,
    );
    if (
      movingEdgeStartNormalizedPos.x < 0 ||
      movingEdgeStartNormalizedPos.y < 0 ||
      movingEdgeEndNormalizedPos.x < 0 ||
      movingEdgeEndNormalizedPos.y < 0
    ) {
      return null;
    }

    const [startAnchorLocalSpacePoint, endAnchorLocalSpacePoint] = [
      movingEdgeStartNormalizedPos,
      movingEdgeEndNormalizedPos,
    ].map((pos) => ({
      x: pos.x * this.originAttrs!.size.x,
      y: pos.y * this.originAttrs!.size.y,
    }));

    let endSceneSpacePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    const [startAnchorSceneSpacePoint, endAnchorSceneSpacePoint] = [
      startAnchorLocalSpacePoint,
      endAnchorLocalSpacePoint,
    ].map((pos) => applyToPoint(this.originAttrs!.transform, pos));

    const edgeVector = {
      x: endAnchorSceneSpacePoint.x - startAnchorSceneSpacePoint.x,
      y: endAnchorSceneSpacePoint.y - startAnchorSceneSpacePoint.y,
    };

    const edgeLength = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y);

    let normalVector = { x: 0, y: 0 };
    if (edgeLength !== 0) {
      normalVector = {
        x: -edgeVector.y / edgeLength,
        y: edgeVector.x / edgeLength,
      };
    }

    const epsilon = Number.EPSILON;
    if (Math.abs(normalVector.y) < epsilon) {
      endSceneSpacePoint = {
        x: Math.round(endSceneSpacePoint.x),
        y: endSceneSpacePoint.y,
      };
    } else if (Math.abs(normalVector.x) < epsilon) {
      endSceneSpacePoint = {
        x: endSceneSpacePoint.x,
        y: Math.round(endSceneSpacePoint.y),
      };
    }

    const endLocalSpacePoint = applyToPoint(inverse(this.originAttrs.transform), endSceneSpacePoint);

    const fixedEdgeResizeControlPointType = getResizeControlPointFixedType(this.type);
    if (!fixedEdgeResizeControlPointType) {
      return null;
    }
    const [fixedStartNormalizedPos, fixedEndNormalizedPos] = getEdgeResizeControlPointNormalizedPos(
      fixedEdgeResizeControlPointType,
    );
    const fixedEdgeMiddleNormalizedPos = {
      x: (fixedStartNormalizedPos.x + fixedEndNormalizedPos.x) / 2,
      y: (fixedStartNormalizedPos.y + fixedEndNormalizedPos.y) / 2,
    };
    const fixedEdgeMiddlePointInLocalSpace = {
      x: fixedEdgeMiddleNormalizedPos.x * this.originAttrs!.size.x,
      y: fixedEdgeMiddleNormalizedPos.y * this.originAttrs!.size.y,
    };

    const movingEdgeMiddleNormalizedPos = {
      x: (movingEdgeStartNormalizedPos.x + movingEdgeEndNormalizedPos.x) / 2,
      y: (movingEdgeStartNormalizedPos.y + movingEdgeEndNormalizedPos.y) / 2,
    };
    const movingEdgeMiddlePointInLocalSpace = {
      x: movingEdgeMiddleNormalizedPos.x * this.originAttrs!.size.x,
      y: movingEdgeMiddleNormalizedPos.y * this.originAttrs!.size.y,
    };

    const scaleDirection = {
      x: movingEdgeMiddlePointInLocalSpace.x - fixedEdgeMiddlePointInLocalSpace.x,
      y: movingEdgeMiddlePointInLocalSpace.y - fixedEdgeMiddlePointInLocalSpace.y,
    };

    const scaleDirectionLength = Math.sqrt(scaleDirection.x * scaleDirection.x + scaleDirection.y * scaleDirection.y);

    const vec = {
      x: endLocalSpacePoint.x - fixedEdgeMiddlePointInLocalSpace.x,
      y: endLocalSpacePoint.y - fixedEdgeMiddlePointInLocalSpace.y,
    };

    let scaleDirectionUnit = { x: 0, y: 0 };
    if (scaleDirectionLength !== 0) {
      scaleDirectionUnit = {
        x: scaleDirection.x / scaleDirectionLength,
        y: scaleDirection.y / scaleDirectionLength,
      };
    }

    const projection = vec.x * scaleDirectionUnit.x + vec.y * scaleDirectionUnit.y;

    const newScaleValue = projection / scaleDirectionLength;
    const sign = newScaleValue / Math.abs(newScaleValue);

    let newScale = {
      x: Math.abs(scaleDirectionUnit.x * newScaleValue),
      y: Math.abs(scaleDirectionUnit.y * newScaleValue),
    };

    if (event.shiftKey || this.originAttrs.isAspectRatioLocked) {
      newScale = aspectRatioLockScale(newScale);
    }

    internalAPI.getSceneGraph().setSelectionDraggingState({
      type: 'resize',
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });

    const newTransform = compose([
      this.originAttrs.transform,
      translate(fixedEdgeMiddlePointInLocalSpace.x, fixedEdgeMiddlePointInLocalSpace.y),
      scale(newScale.x * sign || 1, newScale.y * sign || 1),
      translate(-fixedEdgeMiddlePointInLocalSpace.x, -fixedEdgeMiddlePointInLocalSpace.y),
    ]);

    const addedTransform = compose([newTransform, inverse(this.originAttrs.transform)]);

    return addedTransform;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI) {
    internalAPI.getSceneGraph().setSelectionDraggingState(null);
    return null;
  }
}
