import { IMouseEvent } from '@/host_event_manager';
import { IBaseTool } from './tool_base';
import { IPoint } from '@/types';

export class ToolDrawRect implements IBaseTool {
  private startPoint: IPoint | null = null;

  onStart = (event: IMouseEvent) => {
    console.log('onStart', event.clientX, event.clientY);
  };
  onDrag = (event: IMouseEvent) => {
    console.log('onDrag', event);
  };
  onMove = (event: IMouseEvent) => {
    // do nothing.
  };
  onEnd = (event: IMouseEvent) => {
    console.log('onEnd', event);
  };
}
