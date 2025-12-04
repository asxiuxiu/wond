import type { Path } from 'canvaskit-wasm';
import type { IWondPoint, WondGraphicDrawingContext, IWondColor } from './itypes';
import type { IWondControlPoint } from './index';
import type { IBoundingArea } from './ibounding_area';
import type { Matrix } from 'transformation-matrix';

export const GraphicsType = {
  Document: 'Document',
  Graph: 'Graph',
  Rectangle: 'Rectangle',
  Vector: 'Vector',
} as const;

export type GraphicsType = (typeof GraphicsType)[keyof typeof GraphicsType];

export interface IBaseAttrs {
  readonly id: string;
  type: GraphicsType;
  name: string;
}

export interface ITransformAttrs {
  transform: Matrix;
  size: { x: number; y: number };
  isAspectRatioLocked: boolean;
  locked: boolean;
}

export interface IVisibilityAttrs {
  visible: boolean;
  opacity: number;
}

export interface IChildrenAttrs {
  children: IGraphics[];
}

export type IGraphicsAttrs = IBaseAttrs & ITransformAttrs & IVisibilityAttrs & Partial<IChildrenAttrs>;

export interface IGraphics<T extends IBaseAttrs = IGraphicsAttrs> {
  get attrs(): Readonly<T>;
  set attrs(newAttrs: T);
  parentId?: string;

  getScenePath(): Path;
  getControlPoints(): IWondControlPoint<IGraphicsAttrs>[];
  clearControlPoints(): void;
  containsPoint(point: IWondPoint): boolean;
  getBoundingArea(): IBoundingArea;
  getSvgString(): string;
  draw(context: WondGraphicDrawingContext): void;
  drawOutline(context: WondGraphicDrawingContext, type?: 'selection' | 'hover'): void;
}
