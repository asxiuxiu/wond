import type { WondControlPointShape, IMouseEvent, IWondPoint, IInternalAPI } from '../../interfaces';
import { getResizeBaseDegree, getResizeControlPointNormalizedPos, screenCoordsToSceneCoords } from '../../utils';
import { ControlPointBase } from './control_point_base';
import type { IWondCursor } from '../../cursor_manager';
import { applyToPoint } from 'transformation-matrix';

export class CornerResizeControlPoint extends ControlPointBase {
  shape: WondControlPointShape = 'rect';
  visible: boolean = true;

  private startPoint: IWondPoint | null = null;

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
    this.startPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );
  }

  public onDrag(event: IMouseEvent, internalAPI: IInternalAPI) {
    if (!this.startPoint) return;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI) {
    return;
  }
}
