import type { Canvas, Paint } from 'canvaskit-wasm';

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
  dpr: number;
  canvasBoundingBox: DOMRect;
}

export interface WondGraphicDrawingContext {
  canvas: Canvas;
  viewSpaceMeta: ViewSpaceMeta;
  cachePaintCollection: Map<string, Paint>;
}

export interface WondTextMetrics {
  width: number;
  height: number;
  baseline: number;
}

export interface ITransformFlips {
  flipX: boolean;
  flipY: boolean;
}