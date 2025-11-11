import { ToolBase } from './tool_base';
import { WondRect, type WondRectAttrs } from '../graphics/rect';
import { type IMouseEvent } from '../types';
import { type IWondPoint } from '../types';
import type { IWondInternalAPI } from '../editor';
import { WondAddNodeOperation, WondUpdateSelectionOperation, WondUpdatePropertyOperation } from '../operations';
import { WondToolType } from './types';
import type { WondCommand } from '../command_manager';
import { screenCoordsToSceneCoords } from '../utils';

export class ToolDrawRect extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private endPoint: IWondPoint | null = null;
  private command: WondCommand | null = null;

  private drawingRect: WondRect | null = null;

  private static index_generator = 0;
  private static getNewKey() {
    return ++this.index_generator;
  }

  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IWondInternalAPI) => {
    internalAPI.getCursorManager().setCursor('crosshair');
  };

  onStart = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.startPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );
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
    this.endPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );
    // calculate the rect by the bounding box. can be other shape

    if (!this.command) {
      this.command = internalAPI.getCommandManager().createCommand();
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
    internalAPI.getToolManager().setActiveToolByType(WondToolType.Move);
  };
}
