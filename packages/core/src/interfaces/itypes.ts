import type { Canvas, CanvasKit, FontMgr, Paint } from 'canvaskit-wasm';

export interface IWondPoint {
  x: number;
  y: number;
}

export interface IWondEdge {
  start: IWondPoint;
  end: IWondPoint;
}

export interface IWondColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ViewSpaceMeta {
  viewportOffsetX: number;
  viewportOffsetY: number;
  sceneScrollX: number;
  sceneScrollY: number;
  zoom: number;
}

export interface WondGraphicDrawingContext {
  canvaskit: CanvasKit;
  canvas: Canvas;
  fontMgr: FontMgr;
  viewSpaceMeta: ViewSpaceMeta;
  cachePaintCollection: Map<string, Paint>;
}
