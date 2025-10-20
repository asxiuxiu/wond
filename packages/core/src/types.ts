import type { Canvas, CanvasKit, FontMgr, Paint } from 'canvaskit-wasm';
import type { Matrix } from 'transformation-matrix';

declare global {
  interface QueryLocalFontsOptions {
    postscriptNames?: string[];
  }

  interface FontData {
    readonly family: string;
    readonly fullName: string;
    readonly postscriptName: string;
    readonly style: string;
    blob(): Promise<Blob>;
  }

  interface Window {
    canvaskit_context: {
      canvaskit: CanvasKit;
      fontMgr: FontMgr;
    };
    queryLocalFonts(options?: QueryLocalFontsOptions): Promise<FontData[]>;
  }
}

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

export interface IMouseEvent {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  clientX: number;
  clientY: number;
  deltaY?: number;
  button: number;
  nativeEvent: any;
}

export const MouseEventButton = {
  Left: 0,
  Middle: 1,
  Right: 2,
} as const;

export type MouseEventButton = (typeof MouseEventButton)[keyof typeof MouseEventButton];

export interface WondGraphicDrawingContext {
  canvaskit: CanvasKit;
  canvas: Canvas;
  fontMgr: FontMgr;
  canvasTransform: Matrix;
  overlayStrokePaint: Paint;
}
