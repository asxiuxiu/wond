import type { IWondInternalAPI } from '../editor';
import { MouseEventButton, type IMouseEvent } from '../types';
import { type ToolBase } from './tool_base';
import { ToolDrawRect } from './tool_draw_rect';
import { ToolHand } from './tool_hand';
import { ToolMove } from './tool_move';
import { WondToolType } from './types';

export class WondToolManager {
  private activeToolStack: ToolBase[] = [];
  private readonly internalAPI: IWondInternalAPI;
  private tools: Record<WondToolType, ToolBase> = {
    [WondToolType.DrawRect]: new ToolDrawRect(),
    [WondToolType.Hand]: new ToolHand(),
    [WondToolType.Move]: new ToolMove(),
  };

  constructor(internalAPI: IWondInternalAPI) {
    this.internalAPI = internalAPI;
  }

  getActiveTool(): ToolBase {
    if (this.activeToolStack.length > 0) {
      return this.activeToolStack[this.activeToolStack.length - 1];
    }
    // TODO: move tool
    return this.tools[WondToolType.DrawRect];
  }

  pushActiveTool(toolType: WondToolType) {
    this.activeToolStack.push(this.tools[toolType]);
  }

  popActiveTool(toolType: WondToolType) {
    if (this.activeToolStack[this.activeToolStack.length - 1] === this.tools[toolType]) {
      this.activeToolStack.pop();
    }
  }

  onStart = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    if (event.button === MouseEventButton.Middle) {
      this.pushActiveTool(WondToolType.Hand);
    }

    this.getActiveTool().onStart(event, this.internalAPI);
  };

  onDrag = (event: IMouseEvent) => {
    if (event.button === MouseEventButton.Right) {
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
      this.popActiveTool(WondToolType.Hand);
    }
    this.getActiveTool().onEnd(event, this.internalAPI);
  };

  onContextMenu = (event: IMouseEvent) => {
    // TODO
  };
}
