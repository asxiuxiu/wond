import type { Path } from 'canvaskit-wasm';
import type { IGraphicsAttrs, IGraphics } from './igraphics';
import type { IMouseEvent } from './ihost_event_manager';
import type { IWondPoint, ViewSpaceMeta } from './itypes';
import type { IWondCursor } from '../cursor_manager';
import type { IInternalAPI } from './iinternal_api';

export const WondControlPointType = {
  N_Resize: 'n_resize',
  S_Resize: 's_resize',
  E_Resize: 'e_resize',
  W_Resize: 'w_resize',
  NE_Resize: 'ne_resize',
  NW_Resize: 'nw_resize',
  SE_Resize: 'se_resize',
  SW_Resize: 'sw_resize',
  NW_Rotate: 'nw_rotate',
  NE_Rotate: 'ne_rotate',
  SE_Rotate: 'se_rotate',
  SW_Rotate: 'sw_rotate',
} as const;

export type WondControlPointType = (typeof WondControlPointType)[keyof typeof WondControlPointType];

export type WondControlPointShape = 'rect' | 'circle' | 'circle_with_point';

export interface IWondControlPoint<T extends IGraphicsAttrs> {
  type: WondControlPointType;
  visible: boolean;
  shape: WondControlPointShape;
  refGraphic: IGraphics<T>;
  getDrawPath(viewSpaceMeta: ViewSpaceMeta): Path; // return the path in paint space.
  detectPoint(viewSpaceMeta: ViewSpaceMeta, paintPoint: IWondPoint): boolean; // if the paint point is on the control point.
  getCursor(): IWondCursor;
  onDragStart(event: IMouseEvent, internalAPI: IInternalAPI): void;
  onDrag(event: IMouseEvent, internalAPI: IInternalAPI): Partial<T> | void;
  onDragEnd(event: IMouseEvent, internalAPI: IInternalAPI): Partial<T> | void;
}

export interface IControlPointManager {
  getControlPoints(): IWondControlPoint<IGraphicsAttrs>[];
  clear(): void;
}
