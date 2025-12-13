import { ToolBase } from './tool_base';
import { WondRect, type WondRectAttrs } from '../graphics';
import type { IMouseEvent, IWondPoint, IInternalAPI, ICommand, IGraphics } from '../interfaces';
import { WondToolType } from '../interfaces';
import { WondAddNodeOperation, WondUpdateSelectionOperation, WondUpdatePropertyOperation } from '../operations';
import { screenCoordsToSceneCoords } from '../utils';

export class ToolDrawRect extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private endPoint: IWondPoint | null = null;
  private command: ICommand | null = null;

  private drawingNode: IGraphics<WondRectAttrs> | null = null;

  private static index_generator = 0;
  private static getNewKey() {
    return ++this.index_generator;
  }

  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IInternalAPI) => {
    internalAPI.getCursorManager().setCursor('crosshair');
  };

  onStart = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    const startScenePoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );
    this.startPoint = {
      x: Math.round(startScenePoint.x),
      y: Math.round(startScenePoint.y),
    };
  };

  private getTargetRectProperty(
    startPoint: IWondPoint,
    endPoint: IWondPoint,
    meta: {
      shiftKey: boolean;
      altKey: boolean;
    },
  ) {
    let sizeX = Math.max(Math.round(Math.abs(endPoint.x - startPoint.x)), 1);
    let sizeY = Math.max(Math.round(Math.abs(endPoint.y - startPoint.y)), 1);
    if (meta.shiftKey) {
      const maxSize = Math.max(sizeX, sizeY);
      sizeX = maxSize;
      sizeY = maxSize;
    }

    const unitVector = {
      x: (endPoint.x - startPoint.x) / Math.abs(endPoint.x - startPoint.x),
      y: (endPoint.y - startPoint.y) / Math.abs(endPoint.y - startPoint.y),
    };

    const diagonalPoint = {
      x: startPoint.x + unitVector.x * sizeX,
      y: startPoint.y + unitVector.y * sizeY,
    };

    const newProperty = {
      size: {
        x: sizeX,
        y: sizeY,
      },
      transform: {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: Math.min(startPoint.x, diagonalPoint.x),
        f: Math.min(startPoint.y, diagonalPoint.y),
      },
    };

    return newProperty;
  }

  onDrag = (event: IMouseEvent, internalAPI: IInternalAPI) => {
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

    const newProperty = this.getTargetRectProperty(this.startPoint, this.endPoint, {
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });

    if (!this.drawingNode) {
      this.drawingNode = new WondRect({
        name: `Rectangle ${ToolDrawRect.getNewKey()}`,
        ...newProperty,
      });

      const newAddRectOperation = new WondAddNodeOperation([0], this.drawingNode);

      const selectionOperation = new WondUpdateSelectionOperation(new Set([this.drawingNode.attrs.id]));
      this.command.addOperations([newAddRectOperation, selectionOperation]);
    } else {
      const updateRectOperation = new WondUpdatePropertyOperation<WondRectAttrs>(this.drawingNode, newProperty);
      this.command.addOperations([updateRectOperation]);
    }

    internalAPI.getSceneGraph().setSelectionDraggingState({
      type: 'resize',
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    });

    // compress the operation
    this.command.setOperations(this.command.getOperations().slice(0, 2));
  };

  onEnd = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    if (this.command) {
      this.command.complete();
      this.command = null;
    }

    this.drawingNode = null;
    internalAPI.getToolManager().setActiveToolByType(WondToolType.Move);
    internalAPI.getSceneGraph().setSelectionDraggingState(null);
  };
}
