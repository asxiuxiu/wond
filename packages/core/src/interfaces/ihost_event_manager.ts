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

export interface IHostEventManager {
  on(event: 'start' | 'move' | 'drag' | 'end' | 'contextmenu' | 'wheel', callback: (event: IMouseEvent) => void): void;

  off(event: 'start' | 'move' | 'drag' | 'end' | 'contextmenu' | 'wheel', callback: (event: IMouseEvent) => void): void;

  clear(): void;
}
