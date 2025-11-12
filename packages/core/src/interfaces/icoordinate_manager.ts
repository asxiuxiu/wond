import type { IWondPoint, ViewSpaceMeta } from './itypes';

export interface ICoordinateManager {
  updateViewSpaceMeta(meta: Partial<ViewSpaceMeta>): void;
  getViewSpaceMeta(): ViewSpaceMeta;
  scaleByStep(deltaY: number, basePoint: IWondPoint): void;
  scaleTo(newZoom: number, basePoint: IWondPoint): void;
}
