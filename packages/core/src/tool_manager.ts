import { WondEditor } from './editor';
import { IMouseEvent } from './host_event_manager';
import { IBaseTool } from './tools/tool_base';
import { ToolDrawRect } from './tools/tool_draw_rect';

export class ToolManager {
  private activeTool: IBaseTool | null = new ToolDrawRect();

  constructor(private editor: WondEditor) {}

  onStart = (event: IMouseEvent) => {
    this.activeTool?.onStart(event, this.editor);
  };
  onDrag = (event: IMouseEvent) => {
    this.activeTool?.onDrag(event, this.editor);
  };
  onMove = (event: IMouseEvent) => {
    this.activeTool?.onMove(event, this.editor);
  };
  onEnd = (event: IMouseEvent) => {
    this.activeTool?.onEnd(event, this.editor);
  };
}
