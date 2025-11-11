import type { WondControlPointShape } from '../types';
import { getResizeBaseDegree, getResizeControlPointNormalizedPos } from '../utils';
import { ControlPointBase } from './control_point_base';
import type { IWondCursor } from '../../cursor_manager';
import type { IMouseEvent, IWondPoint } from '../../types';
import { applyToPoint, type Matrix } from 'transformation-matrix';
import type { IWondInternalAPI } from '../../editor';

export class CornerResizeControlPoint extends ControlPointBase {
  shape: WondControlPointShape = 'rect';
  visible: boolean = true;

  private originalTransform: Matrix | null = null;
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

  public onDragStart(event: IMouseEvent, internalAPI: IWondInternalAPI): void {
    this.originalTransform = { ...this.refGraphic.attrs.transform };
  }

  public onDrag(event: IMouseEvent, internalAPI: IWondInternalAPI) {
    if (!this.startPoint) return;
  }

  public onDragEnd(event: IMouseEvent, internalAPI: IWondInternalAPI) {
    return;
  }
}
