import type { WondEditor } from './editor';
import { type IMouseEvent } from './host_event_manager';
import { type IBaseTool } from './tools/tool_base';
import { ToolDrawRect } from './tools/tool_draw_rect';

export class WondToolManager {
  private activeTool: IBaseTool | null = new ToolDrawRect();
  private editor: WondEditor;

  constructor(editor: WondEditor) {
    this.editor = editor;
  }

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
