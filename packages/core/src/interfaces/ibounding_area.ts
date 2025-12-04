import type { Matrix } from 'transformation-matrix';
import type { IWondPoint } from './itypes';

export interface IBoundingArea {
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly bottom: number;

  set(left: number, right: number, top: number, bottom: number): void;
  union(area: IBoundingArea): IBoundingArea;
  intersect(area: IBoundingArea): IBoundingArea;
  containsPoint(point: IWondPoint): boolean;
  contains(area: IBoundingArea): boolean;
  isEmpty(): boolean;
  getWidth(): number;
  getHeight(): number;
  getArea(): number;
  getCenter(): IWondPoint;
  transform(matrix: Matrix): IBoundingArea;
}
