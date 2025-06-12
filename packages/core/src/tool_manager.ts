import { IMouseEvent } from './host_event_manager';
import { IBaseTool } from './tools/tool_base';
import { ToolDrawRect } from './tools/tool_draw_rect';

export class ToolManager {
  private activeTool: IBaseTool | null = new ToolDrawRect();

  onStart = (event: IMouseEvent) => {
    this.activeTool?.onStart(event);
  };
  onDrag = (event: IMouseEvent) => {
    this.activeTool?.onDrag(event);
  };
  onMove = (event: IMouseEvent) => {
    this.activeTool?.onMove(event);
  };
  onEnd = (event: IMouseEvent) => {
    this.activeTool?.onEnd(event);
  };
}
