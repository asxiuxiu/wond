import type { IWondInternalAPI } from '../editor';
import { MouseEventButton, type IMouseEvent } from '../types';
import { type ToolBase } from './tool_base';
import { ToolDrawRect } from './tool_draw_rect';
import { ToolHand } from './tool_hand';
import { ToolMove } from './tool_move';
import { WondToolType } from './types';

export class WondToolManager {
  private activeToolType: WondToolType = WondToolType.Move;
  private readonly internalAPI: IWondInternalAPI;
  private tools: Record<WondToolType, ToolBase> = {
    [WondToolType.DrawRect]: new ToolDrawRect(),
    [WondToolType.Hand]: new ToolHand(),
    [WondToolType.Move]: new ToolMove(),
  };

  constructor(internalAPI: IWondInternalAPI) {
    this.internalAPI = internalAPI;
  }

  private getActiveTool(): ToolBase {
    return this.tools[this.activeToolType] || this.tools[WondToolType.Move];
  }

  private getToolByType(toolType: WondToolType): ToolBase | undefined {
    return this.tools[toolType];
  }

  public getActiveToolType(): WondToolType {
    return this.activeToolType;
  }

  setActiveToolType(toolType: WondToolType) {
    this.activeToolType = toolType;
    this.internalAPI.emitEvent('onActiveToolChange', toolType);
  }

  onStart = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    if (event.button === MouseEventButton.Middle) {
      const handTool = this.getToolByType(WondToolType.Hand);
      handTool?.onStart(event, this.internalAPI);
      return;
    }

    this.getActiveTool().onStart(event, this.internalAPI);
  };

  onDrag = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }

    if (event.button === MouseEventButton.Middle) {
      const handTool = this.getToolByType(WondToolType.Hand);
      handTool?.onDrag(event, this.internalAPI);
      return;
    }
    this.getActiveTool().onDrag(event, this.internalAPI);
  };

  onMove = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    this.getActiveTool().onMove(event, this.internalAPI);
  };

  onEnd = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    if (event.button === MouseEventButton.Middle) {
      const handTool = this.getToolByType(WondToolType.Hand);
      handTool?.onEnd(event, this.internalAPI);
      return;
    }
    this.getActiveTool().onEnd(event, this.internalAPI);
  };

  onContextMenu = (event: IMouseEvent) => {
    // TODO
  };
}
