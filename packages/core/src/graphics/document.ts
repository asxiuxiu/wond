import type {
  IWondColor,
  WondGraphicDrawingContext,
  IBaseAttrs,
  IChildrenAttrs,
  IGraphics,
  IBoundingArea,
  IWondControlPoint,
  IGraphicsAttrs,
} from '../interfaces';
import { GraphicsType } from '../interfaces';
import { ZERO_BOUNDING_AREA } from '../constants';
import { getCanvasKitContext } from '../context';
import { getUuid } from '@wond/common';
import type { Path } from 'canvaskit-wasm';
import type { IWondPoint } from '../interfaces';

export type WondDocumentAttrs = IBaseAttrs &
  IChildrenAttrs & {
    backgroundColor: IWondColor;
  };

export class WondDocument implements IGraphics<WondDocumentAttrs> {
  type: GraphicsType = GraphicsType.Document;
  protected _attrs: WondDocumentAttrs;
  parentId?: string;

  constructor(attrs: Partial<Omit<WondDocumentAttrs, 'id' | 'type'>>) {
    this._attrs = {
      id: getUuid(),
      type: this.type,
      name: attrs.name ?? 'rootPage',
      backgroundColor: attrs.backgroundColor ?? { r: 255, g: 255, b: 255, a: 1 },
      children: attrs.children ?? [],
    };
  }

  get attrs(): Readonly<WondDocumentAttrs> {
    return this._attrs;
  }

  set attrs(newAttrs: WondDocumentAttrs) {
    this._attrs = { ...this._attrs, ...newAttrs };
  }

  public draw(context: WondGraphicDrawingContext): void {
    const { canvas } = context;
    const { canvaskit } = getCanvasKitContext();
    canvas.clear(
      canvaskit.Color(
        this.attrs.backgroundColor.r,
        this.attrs.backgroundColor.g,
        this.attrs.backgroundColor.b,
        this.attrs.backgroundColor.a,
      ),
    );
  }

  getScenePath(): Path {
    const { canvaskit } = getCanvasKitContext();
    return new canvaskit.Path();
  }

  getControlPoints(): IWondControlPoint<IGraphicsAttrs>[] {
    return [];
  }

  clearControlPoints(): void {}

  containsPoint(_point: IWondPoint): boolean {
    return false;
  }

  getBoundingArea(): IBoundingArea {
    return ZERO_BOUNDING_AREA;
  }

  getSvgString(): string {
    return '';
  }

  drawOutline(_context: WondGraphicDrawingContext, _type?: 'selection' | 'hover'): void {}
}
