export interface IPoint {
  x: number;
  y: number;
}

export interface WondColor {
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
  button: number;
  nativeEvent: any;
}

export const MouseEventButton = {
  Left: 0,
  Middle: 1,
  Right: 2,
} as const;

export type MouseEventButton = (typeof MouseEventButton)[keyof typeof MouseEventButton];
