import type { Path } from 'canvaskit-wasm';
import type { WondGraphics, WondGraphicsAttrs } from '../graphics/graphics';
import type { IMouseEvent, IWondPoint } from '../types';
import type { IWondCursor } from '../cursor_manager';
import type { IWondInternalAPI } from '../editor';

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

export interface IWondControlPoint<T extends WondGraphicsAttrs> {
  type: WondControlPointType;
  visible: boolean;
  shape: WondControlPointShape;
  refGraphic: WondGraphics<T>;
  getAnchorScenePos(): IWondPoint;
  getCachePath(): Path;
  getCursor(): IWondCursor;
  onDragStart(event: IMouseEvent, internalAPI: IWondInternalAPI): void;
  onDrag(event: IMouseEvent, internalAPI: IWondInternalAPI): Partial<T> | void;
  onDragEnd(event: IMouseEvent, internalAPI: IWondInternalAPI): Partial<T> | void;
}
