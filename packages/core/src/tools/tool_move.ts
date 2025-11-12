import { ToolBase } from './tool_base';
import type { IMouseEvent, IWondPoint, IInternalAPI, IGraphicsAttrs, ICommand, IWondControlPoint } from '../interfaces';
import type { BBox } from 'rbush';
import type { Matrix } from 'transformation-matrix';
import { WondUpdatePropertyOperation, WondUpdateSelectionOperation } from '../operations';
import { distance } from '../geo';
import {
  generateDetectShapePath,
  sceneCoordsToPaintCoords,
  sceneCoordsToScreenCoords,
  screenCoordsToPaintCoords,
  screenCoordsToSceneCoords,
  getMatrix3x3FromTransform,
} from '../utils';

export class ToolMove extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private command: ICommand | null = null;

  private isModifyingSelection = false;
  private modifyingNodeStartTransformMap: Map<string, Matrix> = new Map();

  private targetControlPoint: IWondControlPoint<IGraphicsAttrs> | null = null;

  private getCommand(internalAPI: IInternalAPI) {
    if (!this.command) {
      3;
      this.command = internalAPI.getCommandManager().createCommand();
      internalAPI.getCommandManager().executeCommand(this.command);
    }

    return this.command;
  }

  private tryPickControlPoint(
    paintPoint: IWondPoint,
    internalAPI: IInternalAPI,
  ): IWondControlPoint<IGraphicsAttrs> | null {
    const controlPoints = internalAPI.getControlPointManager().getControlPoints();
    for (let i = controlPoints.length - 1; i >= 0; i--) {
      const controlPoint = controlPoints[i];
      const anchorScenePos = controlPoint.getAnchorScenePos();
      const anchorPaintPos = sceneCoordsToPaintCoords(
        anchorScenePos,
        internalAPI.getCoordinateManager().getViewSpaceMeta(),
      );
      const detectionPath = controlPoint.getCachePath();
      generateDetectShapePath(detectionPath, controlPoint.shape, anchorPaintPos);
      detectionPath.transform(
        getMatrix3x3FromTransform({ ...controlPoint.refGraphic.attrs.transform, a: 1, d: 1, e: 0, f: 0 }),
      );
      if (detectionPath.contains(paintPoint.x, paintPoint.y)) {
        return controlPoint;
      }
    }

    return null;
  }

  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IInternalAPI) => {
    if (lastMouseMoveEvent === null) {
      internalAPI.getCursorManager().setCursor('default');
      return;
    }

    const lastMouseMovePaintPoint = screenCoordsToPaintCoords(
      { x: lastMouseMoveEvent.clientX, y: lastMouseMoveEvent.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    const targetControlPoint = this.tryPickControlPoint(lastMouseMovePaintPoint, internalAPI);
    if (targetControlPoint) {
      internalAPI.getCursorManager().setCursor(targetControlPoint.getCursor());
      return;
    }

    internalAPI.getCursorManager().setCursor('default');
  };

  onStart = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    this.startPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    const startPaintPoint = screenCoordsToPaintCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );
    const targetControlPoint = this.tryPickControlPoint(startPaintPoint, internalAPI);
    if (targetControlPoint) {
      // ready to process drag event for control point.
      this.targetControlPoint = targetControlPoint;
      this.targetControlPoint.onDragStart(event, internalAPI);
      return;
    }

    const currentSelectionBoundingArea = internalAPI.getSceneGraph().getSelectionsBoundingArea();
    const selectionNode = internalAPI.getSceneGraph().pickNodeAtPoint(this.startPoint);
    if (selectionNode) {
      this.isModifyingSelection = true;
      internalAPI.getSceneGraph().setHoverNode(selectionNode.attrs.id);

      if (!currentSelectionBoundingArea?.containsPoint(this.startPoint)) {
        // if current selection bounding area does not contain the start point, update the selection to the selected node.
        this.getCommand(internalAPI).addOperations([
          new WondUpdateSelectionOperation(new Set([selectionNode.attrs.id])),
        ]);
      }
    } else {
      if (currentSelectionBoundingArea?.containsPoint(this.startPoint)) {
        this.isModifyingSelection = true;
      } else {
        // if no selection node is picked, check if the start point is in the current selection bounding area.
        if (internalAPI.getSceneGraph().getSelectionsCopy().size > 0) {
          this.getCommand(internalAPI).addOperations([new WondUpdateSelectionOperation(new Set())]);
        }
      }
    }

    if (this.isModifyingSelection) {
      // cache the init transform of the selection nodes.
      const selectionNodes = Array.from(internalAPI.getSceneGraph().getSelectionsCopy())
        .map((nodeId) => internalAPI.getSceneGraph().getNodeById(nodeId))
        .filter((node) => node != undefined);
      selectionNodes.forEach((node) => {
        this.modifyingNodeStartTransformMap.set(node.attrs.id, { ...node.attrs.transform });
      });
    }
  };

  onMove = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    const hoverPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    // justify if the point hover the ControlPoint.
    const hoverPaintPoint = screenCoordsToPaintCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );
    const targetControlPoint = this.tryPickControlPoint(hoverPaintPoint, internalAPI);
    if (targetControlPoint) {
      internalAPI.getCursorManager().setCursor(targetControlPoint.getCursor());
      return;
    }

    internalAPI.getCursorManager().setCursor('default');

    // try hover the graphics.
    const hoverNode = internalAPI.getSceneGraph().pickNodeAtPoint(hoverPoint);
    if (hoverNode) {
      internalAPI.getSceneGraph().setHoverNode(hoverNode.attrs.id);
    } else {
      internalAPI.getSceneGraph().setHoverNode(null);
    }
  };

  onDrag = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    if (!this.startPoint) return;

    if (this.targetControlPoint) {
      // process drag event for control point.
      const updateProperty = this.targetControlPoint.onDrag(event, internalAPI);
      if (updateProperty) {
        this.getCommand(internalAPI).addOperations([
          new WondUpdatePropertyOperation(this.targetControlPoint.refGraphic, updateProperty),
        ]);
      }
      return;
    }

    const endPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    if (!this.isModifyingSelection) {
      // try to select nodes by range box.
      const selectionRange: BBox = {
        minX: Math.min(this.startPoint.x, endPoint.x),
        minY: Math.min(this.startPoint.y, endPoint.y),
        maxX: Math.max(this.startPoint.x, endPoint.x),
        maxY: Math.max(this.startPoint.y, endPoint.y),
      };
      internalAPI.getSceneGraph().setSelectionRange(selectionRange);

      const selectionsSet = internalAPI.getSceneGraph().getSelectionsCopy();
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
      // try to move selection nodes.
      const startScreenPoint = sceneCoordsToScreenCoords(
        this.startPoint,
        internalAPI.getCoordinateManager().getViewSpaceMeta(),
      );
      if (distance(startScreenPoint, { x: event.clientX, y: event.clientY }) < 3) {
        // block the drag when the start point is too close to the current point.
        return;
      }

      internalAPI.getSceneGraph().setIsSelectionMoveDragging(true);
      this.modifyingNodeStartTransformMap.forEach((startTransform, nodeId) => {
        const node = internalAPI.getSceneGraph().getNodeById(nodeId);
        if (node) {
          this.getCommand(internalAPI).addOperations([
            new WondUpdatePropertyOperation<IGraphicsAttrs>(node, {
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

  onEnd = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    this.isModifyingSelection = false;
    this.modifyingNodeStartTransformMap.clear();

    this.targetControlPoint?.onDragEnd(event, internalAPI);
    this.targetControlPoint = null;

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
