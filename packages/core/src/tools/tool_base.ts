import { IMouseEvent } from '@/host_event_manager';

export interface IBaseTool {
  onStart: (event: IMouseEvent) => void;
  onDrag: (event: IMouseEvent) => void;
  onMove: (event: IMouseEvent) => void;
  onEnd: (event: IMouseEvent) => void;
}
