import type { Path } from 'canvaskit-wasm';
import type { IWondPoint, WondGraphicDrawingContext } from './itypes';
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

export interface IGraphicsAttrs {
  readonly id: string;
  type: GraphicsType;
  name: string;
  transform: Matrix;
  visible: boolean;
  locked: boolean;
  isAspectRatioLocked: boolean;
  size: { x: number; y: number };
  children?: IGraphics[];
}

export interface IGraphics<T extends IGraphicsAttrs = IGraphicsAttrs> {
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
