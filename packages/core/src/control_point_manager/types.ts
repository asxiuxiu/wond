import type { IWondCursor } from '../cursor_manager';
import type { IWondPoint, WondGraphicDrawingContext } from '../types';

export const WondControlPointType = {
  PointResize: 'point_resize',
  EdgeResize: 'edge_resize',
  Rotation: 'rotation',
} as const;

export type WondControlPointType = (typeof WondControlPointType)[keyof typeof WondControlPointType];

export interface IWondControlPointGraphic {
  type: 'rect' | 'circle' | 'circle_with_point';
  draw(context: WondGraphicDrawingContext): void;
}

export interface IWondControlPoint {
  type: WondControlPointType;
  position: IWondPoint;
  getCursor(): IWondCursor;
  graphic: IWondControlPointGraphic;
}
