import { ToolBase } from './tool_base';
import { WondCommand } from '../command_manager';
import { WondRect, type WondRectAttrs } from '../graphics/rect';
import { type IMouseEvent } from '../types';
import { type IWondPoint } from '../types';
import type { IWondInternalAPI } from '../editor';
import { WondAddNodeOperation, WondUpdateSelectionOperation, WondUpdatePropertyOperation } from '../operations';
import { WondToolType } from './types';

export class ToolDrawRect extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private endPoint: IWondPoint | null = null;
  private command: WondCommand | null = null;

  private drawingRect: WondRect | null = null;

  private static index_generator = 0;
  private static getNewKey() {
    return ++this.index_generator;
  }

  onStart = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.startPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });
  };

  private getTargetRectProperty(startPoint: IWondPoint, endPoint: IWondPoint) {
    const newProperty = {
      size: {
        x: Math.round(Math.abs(endPoint.x - startPoint.x)),
        y: Math.round(Math.abs(endPoint.y - startPoint.y)),
      },
      transform: {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: Math.round(Math.min(startPoint.x, endPoint.x)),
        f: Math.round(Math.min(startPoint.y, endPoint.y)),
      },
    };

    return newProperty;
  }

  onDrag = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    if (!this.startPoint) return;
    this.endPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });
    // calculate the rect by the bounding box. can be other shape

    if (!this.command) {
      this.command = new WondCommand();
      internalAPI.getCommandManager().executeCommand(this.command);
    }

    const newProperty = this.getTargetRectProperty(this.startPoint, this.endPoint);

    if (!this.drawingRect) {
      this.drawingRect = new WondRect({
        name: `Rectangle ${ToolDrawRect.getNewKey()}`,
        visible: true,
        locked: false,
        ...newProperty,
      });

      const newAddRectOperation = new WondAddNodeOperation([0], this.drawingRect);

      const selectionOperation = new WondUpdateSelectionOperation(new Set([this.drawingRect.attrs.id]));
      this.command.addOperations([newAddRectOperation, selectionOperation]);
    } else {
      const updateRectOperation = new WondUpdatePropertyOperation<WondRectAttrs>(this.drawingRect, newProperty);
      this.command.addOperations([updateRectOperation]);
    }

    // compress the operation
    this.command.setOperations(this.command.getOperations().slice(0, 2));
  };

  onEnd = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    if (this.command) {
      this.command.complete();
      this.command = null;
    }

    this.drawingRect = null;
    internalAPI.getToolManager().setActiveToolType(WondToolType.Move);
  };
}
