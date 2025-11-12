import type { ITool, WondToolType } from './itool';
import type { IMouseEvent } from './ihost_event_manager';

export interface IToolManager {
  getActiveToolType(): WondToolType;
  setActiveToolByType(toolType: WondToolType, emitEvent?: boolean): void;
  setActiveTool(tool: ITool): void;
  onStart(event: IMouseEvent): void;
  onDrag(event: IMouseEvent): void;
  onMove(event: IMouseEvent): void;
  onEnd(event: IMouseEvent): void;
  onContextMenu(event: IMouseEvent): void;
}
