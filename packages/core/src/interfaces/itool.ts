import type { IMouseEvent } from './ihost_event_manager';
import type { IInternalAPI } from './iinternal_api';

export const WondToolType = {
  Hand: 'hand',
  Move: 'move',
  DrawRect: 'draw_rect',
} as const;

export type WondToolType = (typeof WondToolType)[keyof typeof WondToolType];

export interface ITool {
  onStart(event: IMouseEvent, internalAPI: IInternalAPI): void;
  onMove(event: IMouseEvent, internalAPI: IInternalAPI): void;
  onEnd(event: IMouseEvent, internalAPI: IInternalAPI): void;
  onDrag(event: IMouseEvent, internalAPI: IInternalAPI): void;
  onActive(lastMouseMoveEvent: IMouseEvent | null, internalAPI: IInternalAPI): void;
}
