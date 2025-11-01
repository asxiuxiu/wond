import { ToolBase } from './tool_base';
import { type IMouseEvent, type IWondPoint } from '../types';
import type { IWondInternalAPI } from '../editor';
import { WondCommand } from '../command_manager';
import type { BBox } from 'rbush';
import type { Matrix } from 'transformation-matrix';
import type { WondGraphicsAttrs } from '../graphics/graphics';
import { WondUpdatePropertyOperation, WondUpdateSelectionOperation } from '../operations';
import { distance } from '../geo';

export class ToolMove extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private isModifyingSelection = false;
  private modifyingNodeStartTransformMap: Map<string, Matrix> = new Map();
  private command: WondCommand | null = null;

  private getCommand(internalAPI: IWondInternalAPI) {
    if (!this.command) {
      this.command = new WondCommand();
      internalAPI.getCommandManager().executeCommand(this.command);
    }

    return this.command;
  }

  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IWondInternalAPI) => {
    if (lastMouseMoveEvent === null) {
      internalAPI.getCursorManager().setCursor('default');
      return;
    }

    const lastMoveMoveScenePoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: lastMouseMoveEvent.clientX, y: lastMouseMoveEvent.clientY });

    // TODO: justify if the point hover the ControlPoint.
    internalAPI.getCursorManager().setCursor('default');
  };

  onStart = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.startPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });

    const currentSelectionBoundingArea = internalAPI.getSceneGraph().getSelectionsBoundingArea();
    const selectionNode = internalAPI.getSceneGraph().pickNodeAtPoint(this.startPoint);
    if (selectionNode) {
      this.isModifyingSelection = true;
      internalAPI.getSceneGraph().setHoverNode(selectionNode.attrs.id);
      if (!currentSelectionBoundingArea?.containsPoint(this.startPoint)) {
        this.getCommand(internalAPI).addOperations([
          new WondUpdateSelectionOperation(new Set([selectionNode.attrs.id])),
        ]);
      }
    } else {
      if (currentSelectionBoundingArea?.containsPoint(this.startPoint)) {
        this.isModifyingSelection = true;
      } else {
        if (internalAPI.getSceneGraph().getSelections().size > 0) {
          this.getCommand(internalAPI).addOperations([new WondUpdateSelectionOperation(new Set())]);
        }
      }
    }

    if (this.isModifyingSelection) {
      // cache the init transform of the selection nodes.
      const selectionNodes = Array.from(internalAPI.getSceneGraph().getSelections())
        .map((nodeId) => internalAPI.getSceneGraph().getNodeById(nodeId))
        .filter((node) => node != undefined);
      selectionNodes.forEach((node) => {
        this.modifyingNodeStartTransformMap.set(node.attrs.id, { ...node.attrs.transform });
      });
    }
  };

  onMove = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    const hoverPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });
    const hoverNode = internalAPI.getSceneGraph().pickNodeAtPoint(hoverPoint);
    if (hoverNode) {
      internalAPI.getSceneGraph().setHoverNode(hoverNode.attrs.id);
    } else {
      internalAPI.getSceneGraph().setHoverNode(null);
    }
  };

  onDrag = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    if (!this.startPoint) return;

    const startScreenPoint = internalAPI.getCoordinateManager().sceneCoordsToScreenCoords(this.startPoint);
    if (distance(startScreenPoint, { x: event.clientX, y: event.clientY }) < 3) {
      // block the drag when the start point is too close to the current point.
      return;
    }

    const endPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });

    if (!this.isModifyingSelection) {
      const selectionRange: BBox = {
        minX: Math.min(this.startPoint.x, endPoint.x),
        minY: Math.min(this.startPoint.y, endPoint.y),
        maxX: Math.max(this.startPoint.x, endPoint.x),
        maxY: Math.max(this.startPoint.y, endPoint.y),
      };
      internalAPI.getSceneGraph().setSelectionRange(selectionRange);

      const selectionsSet = internalAPI.getSceneGraph().getSelections();
      const selections = Array.from(selectionsSet);
      const pickNodes = internalAPI.getSceneGraph().pickNodesAtRange(selectionRange);
      const pickNodeIdsSet = new Set(pickNodes.map((node) => node.attrs.id));

      if (
        pickNodes.some((node) => !selectionsSet.has(node.attrs.id)) ||
        selections.some((nodeId) => !pickNodeIdsSet.has(nodeId))
      ) {
        this.getCommand(internalAPI).addOperations([new WondUpdateSelectionOperation(pickNodeIdsSet)]);
      }
    } else {
      // drag selection.
      internalAPI.getSceneGraph().setIsSelectionMoveDragging(true);
      this.modifyingNodeStartTransformMap.forEach((startTransform, nodeId) => {
        const node = internalAPI.getSceneGraph().getNodeById(nodeId);
        if (node) {
          this.getCommand(internalAPI).addOperations([
            new WondUpdatePropertyOperation<WondGraphicsAttrs>(node, {
              transform: {
                ...startTransform,
                e: Math.round(startTransform.e + (endPoint.x - this.startPoint!.x)),
                f: Math.round(startTransform.f + (endPoint.y - this.startPoint!.y)),
              },
            }),
          ]);
        }
      });
    }
  };

  onEnd = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.isModifyingSelection = false;
    this.modifyingNodeStartTransformMap.clear();
    internalAPI.getSceneGraph().setIsSelectionMoveDragging(false);

    if (!this.command || this.command.getOperations().length === 0) {
      if (this.startPoint) {
        const selectionNode = internalAPI.getSceneGraph().pickNodeAtPoint(this.startPoint);
        if (selectionNode) {
          this.getCommand(internalAPI).addOperations([
            new WondUpdateSelectionOperation(new Set([selectionNode.attrs.id])),
          ]);
        }
      }
    }

    if (this.command) {
      this.command.complete();
      this.command = null;
    }

    internalAPI.getSceneGraph().setSelectionRange(null);
  };
}
