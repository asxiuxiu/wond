import type { IInternalAPI, IMouseEvent, IToolManager, ITool } from '../interfaces';
import { MouseEventButton, WondToolType } from '../interfaces';
import { ToolDrawRect } from './tool_draw_rect';
import { ToolHand } from './tool_hand';
import { ToolMove } from './tool_move';

export class WondToolManager implements IToolManager {
  private activeToolType: WondToolType;
  private activeTool: ITool;
  private readonly internalAPI: IInternalAPI;
  private tools: Record<WondToolType, ITool> = {
    [WondToolType.DrawRect]: new ToolDrawRect(),
    [WondToolType.Hand]: new ToolHand(),
    [WondToolType.Move]: new ToolMove(),
  };

  private lastMouseMoveEvent: IMouseEvent | null = null;

  constructor(internalAPI: IInternalAPI) {
    this.internalAPI = internalAPI;
    this.activeToolType = WondToolType.Move;
    this.activeTool = this.getToolByType(this.activeToolType);
  }

  private getToolByType(toolType: WondToolType): ITool {
    const tool = this.tools[toolType];
    if (!tool) {
      throw new Error(`Tool ${toolType} not found`);
    }
    return tool;
  }

  public getActiveToolType(): WondToolType {
    return this.activeToolType;
  }

  setActiveToolByType(toolType: WondToolType, emitEvent = true): void {
    if (this.activeToolType === toolType && this.activeTool === this.getToolByType(toolType)) {
      return;
    }
    this.activeToolType = toolType;
    this.setActiveTool(this.getToolByType(toolType));
    if (emitEvent) {
      this.internalAPI.emitEvent('onActiveToolChange', toolType);
    }
  }

  setActiveTool(tool: ITool): void {
    this.activeTool = tool;
    this.activeTool.onActive(this.lastMouseMoveEvent, this.internalAPI);
  }

  onStart = (event: IMouseEvent): void => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    if (event.button === MouseEventButton.Middle) {
      this.setActiveTool(this.getToolByType(WondToolType.Hand));
    }

    this.activeTool.onStart(event, this.internalAPI);
  };

  onDrag = (event: IMouseEvent): void => {
    if (event.button === MouseEventButton.Right) {
      return;
    }

    this.activeTool.onDrag(event, this.internalAPI);
  };

  onMove = (event: IMouseEvent): void => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    this.activeTool.onMove(event, this.internalAPI);
    this.lastMouseMoveEvent = event;
  };

  onEnd = (event: IMouseEvent): void => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    this.activeTool.onEnd(event, this.internalAPI);

    if (event.button === MouseEventButton.Middle) {
      this.setActiveToolByType(this.activeToolType, false);
    }
  };

  onContextMenu = (event: IMouseEvent): void => {
    // TODO
  };
}
