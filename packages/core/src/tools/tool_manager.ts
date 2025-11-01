import type { IWondInternalAPI } from '../editor';
import { MouseEventButton, type IMouseEvent } from '../types';
import { type ToolBase } from './tool_base';
import { ToolDrawRect } from './tool_draw_rect';
import { ToolHand } from './tool_hand';
import { ToolMove } from './tool_move';
import { WondToolType } from './types';

export class WondToolManager {
  private activeToolType: WondToolType;
  private activeTool: ToolBase; // the active tool is not always the same as the active tool type
  private readonly internalAPI: IWondInternalAPI;
  private tools: Record<WondToolType, ToolBase> = {
    [WondToolType.DrawRect]: new ToolDrawRect(),
    [WondToolType.Hand]: new ToolHand(),
    [WondToolType.Move]: new ToolMove(),
  };

  private lastMouseMoveEvent: IMouseEvent | null = null;

  constructor(internalAPI: IWondInternalAPI) {
    this.internalAPI = internalAPI;
    this.activeToolType = WondToolType.Move;
    this.activeTool = this.getToolByType(this.activeToolType);
  }

  private getToolByType(toolType: WondToolType): ToolBase {
    const tool = this.tools[toolType];
    if (!tool) {
      throw new Error(`Tool ${toolType} not found`);
    }
    return tool;
  }

  public getActiveToolType(): WondToolType {
    return this.activeToolType;
  }

  setActiveToolByType(toolType: WondToolType, emitEvent = true) {
    if (this.activeToolType === toolType && this.activeTool === this.getToolByType(toolType)) {
      return;
    }
    this.activeToolType = toolType;
    this.setActiveTool(this.getToolByType(toolType));
    if (emitEvent) {
      this.internalAPI.emitEvent('onActiveToolChange', toolType);
    }
  }

  setActiveTool(tool: ToolBase) {
    this.activeTool = tool;
    this.activeTool.onActive(this.lastMouseMoveEvent, this.internalAPI);
  }

  onStart = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    if (event.button === MouseEventButton.Middle) {
      this.setActiveTool(this.getToolByType(WondToolType.Hand));
    }

    this.activeTool.onStart(event, this.internalAPI);
  };

  onDrag = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }

    this.activeTool.onDrag(event, this.internalAPI);
  };

  onMove = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    this.activeTool.onMove(event, this.internalAPI);
    this.lastMouseMoveEvent = event;
  };

  onEnd = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    this.activeTool.onEnd(event, this.internalAPI);

    if (event.button === MouseEventButton.Middle) {
      this.setActiveToolByType(this.activeToolType, false);
    }
  };

  onContextMenu = (event: IMouseEvent) => {
    // TODO
  };
}
