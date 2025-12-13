import { ToolBase } from './tool_base';
import type {
  IMouseEvent,
  IWondPoint,
  IInternalAPI,
  IGraphicsAttrs,
  ICommand,
  IWondControlPoint,
  IOperation,
  IBoundingArea,
} from '../interfaces';
import type { BBox } from 'rbush';
import { applyToPoint, applyToPoints, compose, inverse, scale } from 'transformation-matrix';
import { WondUpdatePropertyOperation, WondUpdateSelectionOperation } from '../operations';
import { distance } from '../geo';
import {
  generateBoundingArea,
  getAnchorsBetweenChildAndParentBoundingArea,
  getGraphicsBoundingArea,
  isAxisAlignedAfterTransform,
  sceneCoordsToScreenCoords,
  screenCoordsToPaintCoords,
  screenCoordsToSceneCoords,
} from '../utils';
import { floatEqual } from '@wond/common';

export class ToolMove extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private command: ICommand | null = null;

  private isMovingSelection = false;
  private modifyingNodeStartAttrsMap: Map<
    string,
    Pick<IGraphicsAttrs, 'transform' | 'size'> & {
      anchors: IWondPoint[];
    }
  > = new Map();
  private modifyingStartSelectionBoundingArea: IBoundingArea | null = null;

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
      if (controlPoint.detectPoint(internalAPI.getCoordinateManager().getViewSpaceMeta(), paintPoint)) {
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

  private recordModifyingNodeStartAttrs(internalAPI: IInternalAPI) {
    const selectionNodes = Array.from(internalAPI.getSceneGraph().getSelectionsCopy())
      .map((nodeId) => internalAPI.getSceneGraph().getNodeById(nodeId))
      .filter((node) => node != undefined);
    const selectionBoundingArea = getGraphicsBoundingArea(selectionNodes);
    if (selectionBoundingArea == null) {
      return;
    }
    this.modifyingStartSelectionBoundingArea = selectionBoundingArea;
    selectionNodes.forEach((node) => {
      this.modifyingNodeStartAttrsMap.set(node.attrs.id, {
        transform: { ...node.attrs.transform },
        size: { ...node.attrs.size },
        anchors: getAnchorsBetweenChildAndParentBoundingArea(node.getBoundingArea(), selectionBoundingArea),
      });
    });
  }

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
      this.recordModifyingNodeStartAttrs(internalAPI);
      this.targetControlPoint.onDragStart(event, internalAPI);
      return;
    }

    const isPointInSelection = internalAPI.getSceneGraph().canPickSelection(this.startPoint);
    const selectionNode = internalAPI.getSceneGraph().pickNodeAtPoint(this.startPoint);
    if (selectionNode) {
      this.isMovingSelection = true;
      internalAPI.getSceneGraph().setHoverNode(selectionNode.attrs.id);

      if (!isPointInSelection) {
        // if current selection bounding area does not contain the start point, update the selection to the selected node.
        this.getCommand(internalAPI).addOperations([
          new WondUpdateSelectionOperation(new Set([selectionNode.attrs.id])),
        ]);
      }
    } else {
      if (isPointInSelection) {
        this.isMovingSelection = true;
      } else {
        // if no selection node is picked, check if the start point is in the current selection bounding area.
        if (internalAPI.getSceneGraph().getSelectionsCopy().size > 0) {
          this.getCommand(internalAPI).addOperations([new WondUpdateSelectionOperation(new Set())]);
        }
      }
    }

    if (this.isMovingSelection) {
      // cache the init transform of the selection nodes.
      this.recordModifyingNodeStartAttrs(internalAPI);
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
      internalAPI.getSceneGraph().setHoverNode(null);
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
      if (!this.modifyingStartSelectionBoundingArea) return;
      // process drag event for control point.
      const addedTransform = this.targetControlPoint.onDrag(event, internalAPI);
      if (addedTransform) {
        const newOperations: IOperation[] = [];
        for (const graphics of this.targetControlPoint.refGraphics) {
          if (graphics.attrs.locked) continue;
          const startAttrs = this.modifyingNodeStartAttrsMap.get(graphics.attrs.id);
          if (startAttrs) {
            let newTransform = compose([addedTransform, startAttrs.transform]);

            if (!!graphics.attrs.targetAspectRatio && startAttrs.anchors.length < 2) {
              const oldBoundingArea = generateBoundingArea(startAttrs.size, startAttrs.transform);
              const currentBoundingArea = generateBoundingArea(startAttrs.size, newTransform);
              const currentScale = {
                x: currentBoundingArea.getWidth() / oldBoundingArea.getWidth(),
                y: currentBoundingArea.getHeight() / oldBoundingArea.getHeight(),
              };

              const maxScaleLimit = Math.sqrt(currentScale.x * currentScale.y);
              let scaleAnchor: IWondPoint = {
                x: currentBoundingArea.left + (currentBoundingArea.right - currentBoundingArea.left) / 2,
                y: currentBoundingArea.top + (currentBoundingArea.bottom - currentBoundingArea.top) / 2,
              };
              if (startAttrs.anchors.length === 1) {
                scaleAnchor = applyToPoint(addedTransform, startAttrs.anchors[0]);
              }

              const limitBoundingArea = this.modifyingStartSelectionBoundingArea.transform(addedTransform);
              let maxScaleX = Infinity;
              if (!floatEqual(scaleAnchor.x, currentBoundingArea.left)) {
                maxScaleX = Math.min(
                  maxScaleX,
                  (scaleAnchor.x - limitBoundingArea.left) / (scaleAnchor.x - currentBoundingArea.left),
                );
              }
              if (!floatEqual(scaleAnchor.x, currentBoundingArea.right)) {
                maxScaleX = Math.min(
                  maxScaleX,
                  (scaleAnchor.x - limitBoundingArea.right) / (scaleAnchor.x - currentBoundingArea.right),
                );
              }
              maxScaleX = Math.min(maxScaleX, maxScaleLimit / currentScale.x);

              let maxScaleY = Infinity;
              if (!floatEqual(scaleAnchor.y, currentBoundingArea.top)) {
                maxScaleY = Math.min(
                  maxScaleY,
                  (scaleAnchor.y - limitBoundingArea.top) / (scaleAnchor.y - currentBoundingArea.top),
                );
              }
              if (!floatEqual(scaleAnchor.y, currentBoundingArea.bottom)) {
                maxScaleY = Math.min(
                  maxScaleY,
                  (scaleAnchor.y - limitBoundingArea.bottom) / (scaleAnchor.y - currentBoundingArea.bottom),
                );
              }
              maxScaleY = Math.min(maxScaleY, maxScaleLimit / currentScale.y);

              const aspectRatioBoundingArea = generateBoundingArea(
                graphics.attrs.targetAspectRatio,
                startAttrs.transform,
              );
              const sceneSpaceAspectRatio = aspectRatioBoundingArea.getWidth() / aspectRatioBoundingArea.getHeight();

              let addedScale = {
                x: 1,
                y: 1,
              };

              let xBoundRelativeYScale =
                (maxScaleX * currentScale.x * oldBoundingArea.getWidth()) /
                (currentScale.y * oldBoundingArea.getHeight() * sceneSpaceAspectRatio);

              if (xBoundRelativeYScale <= maxScaleY) {
                addedScale = {
                  x: maxScaleX,
                  y: xBoundRelativeYScale,
                };
              } else {
                addedScale = {
                  x:
                    (maxScaleY * currentScale.y * oldBoundingArea.getHeight() * sceneSpaceAspectRatio) /
                    (currentScale.x * oldBoundingArea.getWidth()),
                  y: maxScaleY,
                };
              }

              const fixAddTransform = scale(addedScale.x, addedScale.y, scaleAnchor.x, scaleAnchor.y);
              newTransform = compose([fixAddTransform, newTransform]);
            }

            const [NW_Point, NE_Point, SW_Point] = applyToPoints(newTransform, [
              { x: 0, y: 0 },
              { x: startAttrs.size.x, y: 0 },
              { x: 0, y: startAttrs.size.y },
            ]);

            const newSize = {
              x: distance(NW_Point, NE_Point),
              y: distance(NW_Point, SW_Point),
            };

            const isAxisAligned = isAxisAlignedAfterTransform(newTransform);
            if (isAxisAligned) {
              newSize.x = Math.round(newSize.x);
              newSize.y = Math.round(newSize.y);
            }

            // N = N' * S^-1
            newTransform = compose([
              newTransform,
              inverse(scale(newSize.x / startAttrs.size.x, newSize.y / startAttrs.size.y)),
            ]);

            newOperations.push(
              new WondUpdatePropertyOperation<IGraphicsAttrs>(graphics, {
                transform: newTransform,
                size: newSize,
              }),
            );
          }
        }
        this.getCommand(internalAPI).addOperations(newOperations);
      }

      internalAPI.getCursorManager().setCursor(this.targetControlPoint.getCursor());
      return;
    }

    const endPoint = screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      internalAPI.getCoordinateManager().getViewSpaceMeta(),
    );

    if (!this.isMovingSelection) {
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

      internalAPI.getSceneGraph().setSelectionDraggingState({
        type: 'move',
        shiftKey: event.shiftKey,
        altKey: event.altKey,
      });

      for (const [nodeId, startAttrs] of this.modifyingNodeStartAttrsMap.entries()) {
        const node = internalAPI.getSceneGraph().getNodeById(nodeId);
        if (node) {
          const startTransform = startAttrs.transform;
          this.getCommand(internalAPI).addOperations([
            new WondUpdatePropertyOperation<IGraphicsAttrs>(node, {
              transform: {
                ...startTransform,
                e: Math.round(startTransform.e + (endPoint.x - this.startPoint.x)),
                f: Math.round(startTransform.f + (endPoint.y - this.startPoint.y)),
              },
            }),
          ]);
        }
      }
    }
  };

  onEnd = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    this.isMovingSelection = false;
    this.modifyingNodeStartAttrsMap.clear();
    this.modifyingStartSelectionBoundingArea = null;

    this.targetControlPoint?.onDragEnd(event, internalAPI);
    this.targetControlPoint = null;

    internalAPI.getSceneGraph().setSelectionDraggingState(null);

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
