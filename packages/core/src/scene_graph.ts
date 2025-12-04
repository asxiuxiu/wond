import { compareCoordinates, getReduceRatioByDistanceFromSegment, mergeSegments, throttle } from '@wond/common';
import { type Canvas, type Font, type Paint, type Surface } from 'canvaskit-wasm';
import RBush, { type BBox } from 'rbush';
import { applyToPoints } from 'transformation-matrix';
import { CACHE_PAINT_COLLECTION, DEFAULT_FONT_NAME, ZERO_BOUNDING_AREA } from './constants';
import { getCanvasKitContext } from './context';
import { getEdgeVectors, rad2deg } from './geo';
import { WondDocument } from './graphics/document';
import type {
  IInternalAPI,
  ISceneGraph,
  IGraphics,
  IBoundingArea,
  IWondEdge,
  IGraphicsAttrs,
  IWondPoint,
  WondGraphicDrawingContext,
  RulerTextProperty,
  ISelectionDraggingState,
} from './interfaces';
import {
  getGraphicsBoundingArea,
  measureText,
  sceneCoordsToPaintCoords,
  sceneLengthToPaintLength,
  scenePathToPaintPath,
  screenCoordsToPaintCoords,
  screenCoordsToSceneCoords,
} from './utils';

export class WondSceneGraph implements ISceneGraph {
  private readonly internalAPI: IInternalAPI;
  private readonly rootNode: WondDocument;

  private readonly nodesMap: Map<string, IGraphics> = new Map();
  private readonly rTree = new RBush<IGraphics>();

  // selections
  private readonly selectedNodeIds: Set<string> = new Set();
  private selectionRange: BBox | null = null;
  private selectionDraggingState: ISelectionDraggingState | null = null;

  // hover
  private hoverNode: string | null = null;

  private paintSurface: Surface | null = null;

  private dirtyBoundingArea: IBoundingArea | null = null;

  private cachePaintCollection: Map<string, Paint> = new Map();
  private cacheFontCollection: Map<string, Font> = new Map();

  constructor(internalAPI: IInternalAPI) {
    this.internalAPI = internalAPI;
    this.rootNode = new WondDocument({
      name: 'Page1',
    });
    this.registerNode(this.rootNode);

    this.initPaint(internalAPI.getCanvasRootElement());
  }

  private initPaint(canvasElement: HTMLCanvasElement) {
    const { canvaskit } = getCanvasKitContext();
    const paintSurface = canvaskit.MakeWebGLCanvasSurface(canvasElement);
    if (!paintSurface) {
      throw new Error('Failed to create paint surface');
    }
    this.paintSurface = paintSurface;
    this.initCacheFont();
    this.initCachePaint();
    this.rafDraw();
  }

  private initCacheFont() {
    const { fontMgr, canvaskit } = getCanvasKitContext();
    const rulerFont = new canvaskit.Font(fontMgr.matchFamilyStyle(DEFAULT_FONT_NAME, {}), 10);
    this.cacheFontCollection.set('rulerFont', rulerFont);

    const selectionLabelFont = new canvaskit.Font(fontMgr.matchFamilyStyle(DEFAULT_FONT_NAME, {}), 12);
    this.cacheFontCollection.set('selectionLabelFont', selectionLabelFont);
  }

  private initCachePaint() {
    const { canvaskit } = getCanvasKitContext();

    Object.entries(CACHE_PAINT_COLLECTION).forEach(([key, value]) => {
      const paint = new canvaskit.Paint();

      if (value.type === 'stroke') {
        paint.setStyle(canvaskit.PaintStyle.Stroke);
        paint.setStrokeWidth(value.strokeWidth || 1);
        if (value.dashInterval) {
          paint.setPathEffect(canvaskit.PathEffect.MakeDash(value.dashInterval, value.dashPhase || 0));
        }
      } else if (value.type === 'fill') {
        paint.setStyle(canvaskit.PaintStyle.Fill);
      }
      paint.setAntiAlias(true);
      paint.setColor(canvaskit.Color(value.color.r, value.color.g, value.color.b, value.color.a));
      this.cachePaintCollection.set(key, paint);
    });

    const cacheAlphaLayerPaint = new canvaskit.Paint();
    this.cachePaintCollection.set('alphaLayerPaint', cacheAlphaLayerPaint);
  }

  public getRootNode(): IGraphics {
    return this.rootNode;
  }

  public isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeIds.has(nodeId);
  }

  public getSelectionsCopy() {
    return new Set(this.selectedNodeIds);
  }

  public isSelectionContainsPoint(scenePoint: IWondPoint): boolean {
    const selectedNodeIds = Array.from(this.selectedNodeIds);
    if (selectedNodeIds.length === 0) {
      return false;
    }

    if (selectedNodeIds.length > 1) {
      const selectionsBoundingArea = getGraphicsBoundingArea(
        selectedNodeIds.map((nodeId) => this.getNodeById(nodeId)).filter((node) => node != undefined),
      );
      return selectionsBoundingArea != null && selectionsBoundingArea.containsPoint(scenePoint);
    } else {
      const selectedNodeId = selectedNodeIds[0];
      const selectedNode = this.getNodeById(selectedNodeId);
      if (selectedNode) {
        return selectedNode.containsPoint(scenePoint);
      }
      return false;
    }
  }

  public setSelectionDraggingState(state: ISelectionDraggingState | null) {
    this.selectionDraggingState = state;
  }

  setHoverNode(nodeId: string | null) {
    if (nodeId == this.hoverNode) {
      return;
    }
    this.hoverNode = nodeId;
    this.markLayerTreeDirty();
  }

  public setSelectionRange(range: BBox | null) {
    this.selectionRange = range;
  }

  public getHoverNode(): string | null {
    return this.hoverNode;
  }

  private markSelectionChange() {
    this.internalAPI.emitEvent('onSelectionChange', this.getSelectionsCopy());
  }

  public updateSelection(nodeSet: Set<string>) {
    let isDirty = false;
    for (const nodeId of nodeSet) {
      if (!this.selectedNodeIds.has(nodeId)) {
        this.selectedNodeIds.add(nodeId);
        isDirty = true;
      }
    }
    for (const nodeId of this.selectedNodeIds) {
      if (!nodeSet.has(nodeId)) {
        this.selectedNodeIds.delete(nodeId);
        isDirty = true;
      }
    }
    if (isDirty) {
      this.markSelectionChange();
      this.markLayerTreeDirty();
    }
  }

  public getNodeById(id: string): IGraphics | undefined {
    return this.nodesMap.get(id);
  }

  private registerNode(node: IGraphics): void {
    this.nodesMap.set(node.attrs.id, node);
  }

  private insertNodeIntoRTree(node: IGraphics): void {
    this.rTree.insert(node);
  }

  private removeNodeFromRTree(node: IGraphics): void {
    this.rTree.remove(node);
  }

  pickNodesAtRange(range: BBox): IGraphics[] {
    const boundingIntersectedNodes = this.rTree.search(range);

    const { canvaskit } = getCanvasKitContext();

    const selectionPath = new canvaskit.Path();
    selectionPath.addRect(canvaskit.LTRBRect(range.minX, range.minY, range.maxX, range.maxY));

    return boundingIntersectedNodes.filter((node) => {
      const intersectionPath = canvaskit.Path.MakeFromOp(
        node.getScenePath(),
        selectionPath,
        canvaskit.PathOp.Intersect,
      );
      return intersectionPath != null && intersectionPath.isEmpty() === false;
    });
  }

  pickNodeAtPoint(point: IWondPoint): IGraphics | null {
    const intersectedNodes = this.rTree
      .search({
        minX: point.x,
        minY: point.y,
        maxX: point.x,
        maxY: point.y,
      })
      .filter((node) => node.containsPoint(point));

    if (intersectedNodes.length === 0) {
      return null;
    }

    intersectedNodes.sort((a, b) =>
      compareCoordinates(this.getNodeCoordinate(a), this.getNodeCoordinate(b)) ? -1 : 1,
    );
    return intersectedNodes[0];
  }

  private getNodeCoordinate(node: IGraphics): number[] {
    const coordinate: number[] = [];

    while (node.parentId) {
      const parentNode = this.getNodeById(node.parentId);
      if (!parentNode || !Array.isArray(parentNode.attrs.children)) {
        break;
      }

      const nodePositionInParentChildren = parentNode.attrs.children.indexOf(node);
      coordinate.push(nodePositionInParentChildren);
      node = parentNode;
    }

    return coordinate;
  }

  private getNodeByCoordinates(coordinates: number[]): IGraphics | null {
    if (coordinates.length === 0) {
      return this.rootNode;
    }

    let currentDepthNode: IGraphics = this.rootNode;
    let i = 0;
    while (i < coordinates.length) {
      if (Array.isArray(currentDepthNode.attrs.children)) {
        const targetDepthNode = currentDepthNode.attrs.children[coordinates[i]];
        if (targetDepthNode) {
          currentDepthNode = targetDepthNode;
          i++;
        } else {
          console.warn('[WondSceneGraph:getNodeByCoordinates] targetDepthNode is undefined at coordinate index', i);
          return null;
        }
      } else {
        console.warn('[WondSceneGraph:getNodeByCoordinates] currentDepthNode does not have children array');
        return null;
      }
    }
    return currentDepthNode;
  }

  private unregisterNode(node: IGraphics): void {
    this.nodesMap.delete(node.attrs.id);
  }

  private markDirtyArea(area: IBoundingArea): void {
    if (area === ZERO_BOUNDING_AREA) {
      return;
    }
    if (!this.dirtyBoundingArea) {
      this.dirtyBoundingArea = area;
    } else {
      this.dirtyBoundingArea.union(area);
    }
  }

  private markLayerTreeDirty() {
    this.internalAPI.emitEvent('onLayoutDirty');
  }

  private throttleMarkLayerTreeDirty = throttle(() => this.markLayerTreeDirty(), 500, { trailing: true });

  public updateNodeProperty<ATTRS extends IGraphicsAttrs>(
    target: IGraphics<ATTRS> | string | number[],
    newProperty: Partial<ATTRS>,
  ): void {
    let node: IGraphics<ATTRS> | null | undefined = null;

    // Resolve node from different input types
    if (typeof target === 'string') {
      // target is nodeId
      node = this.getNodeById(target) as IGraphics<ATTRS> | undefined;
      if (!node) {
        console.warn('[WondSceneGraph:updateNodeProperty] node not found for nodeId', target);
        return;
      }
    } else if (Array.isArray(target)) {
      // target is coordinates
      node = this.getNodeByCoordinates(target) as IGraphics<ATTRS> | null;
      if (!node) {
        console.warn('[WondSceneGraph:updateNodeProperty] node not found at coordinates', target);
        return;
      }
    } else {
      // target is IGraphics object
      node = target;
    }

    const oldBoundingArea = node.getBoundingArea();

    // Remove from RTree before updating
    this.removeNodeFromRTree(node);

    // Update the node's attributes
    node.attrs = { ...node.attrs, ...newProperty };

    // Mark layer tree as dirty
    this.throttleMarkLayerTreeDirty();

    // Insert back into RTree with new bounding area
    this.insertNodeIntoRTree(node);

    // Calculate and mark dirty area (union of old and new bounding areas)
    const newBoundingArea = node.getBoundingArea();
    const dirtyArea = oldBoundingArea.union(newBoundingArea);

    this.markDirtyArea(dirtyArea);

    this.internalAPI.getSetterManager().onNodePropertyChange<ATTRS>(node.attrs.id, newProperty);
  }

  public addNodeByCoordinates(coordinates: number[], newNode: IGraphics): void {
    if (coordinates.length === 0) {
      console.warn('[WondSceneGraph:addNodeToParentByCoordinates] coordinates length is 0');
      return;
    }

    const parentCoordinates = coordinates.slice(0, -1);
    const index = coordinates[coordinates.length - 1];

    const parentNode = this.getNodeByCoordinates(parentCoordinates);
    if (!parentNode) {
      console.warn(
        '[WondSceneGraph:addNodeToParentByCoordinates] parentNode not found at coordinates',
        parentCoordinates,
      );
      return;
    }

    if (!Array.isArray(parentNode.attrs.children)) {
      return;
    }

    parentNode.attrs.children.splice(index, 0, newNode);
    parentNode.attrs = {
      ...parentNode.attrs,
      children: [...parentNode.attrs.children],
    };

    newNode.parentId = parentNode.attrs.id;

    this.registerNode(newNode);
    this.insertNodeIntoRTree(newNode);

    this.markLayerTreeDirty();

    this.markDirtyArea(newNode.getBoundingArea());
  }

  public removeNodeByCoordinates(childCoordinates: number[]): void {
    if (childCoordinates.length === 0) {
      console.warn('[WondSceneGraph:removeNodeFromParentByCoordinates] childCoordinates length is 0');
      return;
    }

    const parentCoordinates = childCoordinates.slice(0, -1);
    const childNode = this.getNodeByCoordinates(childCoordinates);

    if (!childNode) {
      console.warn(
        '[WondSceneGraph:removeNodeFromParentByCoordinates] childNode not found at coordinates',
        childCoordinates,
      );
      return;
    }

    const parentNode = this.getNodeByCoordinates(parentCoordinates);
    if (!parentNode) {
      console.warn(
        '[WondSceneGraph:removeNodeFromParentByCoordinates] parentNode not found at coordinates',
        parentCoordinates,
      );
      return;
    }

    if (!Array.isArray(parentNode.attrs.children)) {
      return;
    }

    const nodeBoundingArea = childNode.getBoundingArea();

    const newChildren = parentNode.attrs.children.filter((item) => item !== childNode);
    parentNode.attrs = { ...parentNode.attrs, children: newChildren };

    this.unregisterNode(childNode);
    this.removeNodeFromRTree(childNode);

    this.markLayerTreeDirty();

    this.markDirtyArea(nodeBoundingArea);
  }

  private drawSelections(context: WondGraphicDrawingContext) {
    if (this.selectionDraggingState !== null && this.selectionDraggingState.type === 'move') {
      return;
    }

    const selectedNodeIds = Array.from(this.selectedNodeIds);
    if (selectedNodeIds.length === 0) {
      return;
    }

    const { canvas, cachePaintCollection } = context;
    const { canvaskit } = getCanvasKitContext();

    const overlayStrokePaint = cachePaintCollection.get('overlayStrokePaint');
    const aspectRatioLockedPaint = cachePaintCollection.get('aspectRatioLockedPaint');
    if (!overlayStrokePaint || !aspectRatioLockedPaint) {
      return;
    }

    const selectedNodes = selectedNodeIds.map((id) => this.getNodeById(id)).filter((node) => node !== undefined);
    for (const child of selectedNodes) {
      child.drawOutline(context);
    }

    let edgePoints: IWondPoint[] = [];
    let sizeText = '';

    if (selectedNodeIds.length == 1) {
      const selectedNode = selectedNodes[0];

      // bounding Path
      const boundingRectPath = new canvaskit.Path();
      const path = scenePathToPaintPath(selectedNode.getScenePath(), context.viewSpaceMeta);
      boundingRectPath.addPath(path);
      canvas.drawPath(boundingRectPath, overlayStrokePaint);

      // aspect ratio locked Path
      if (
        this.selectionDraggingState !== null &&
        this.selectionDraggingState.type === 'resize' &&
        (this.selectionDraggingState.shiftKey || selectedNode.attrs.isAspectRatioLocked)
      ) {
        const aspectRatioLockedPath = new canvaskit.Path();
        const [startPoint, endPoint] = applyToPoints(selectedNode.attrs.transform, [
          { x: 0, y: 0 },
          { x: selectedNode.attrs.size.x, y: selectedNode.attrs.size.y },
        ]);
        aspectRatioLockedPath.moveTo(startPoint.x, startPoint.y);
        aspectRatioLockedPath.lineTo(endPoint.x, endPoint.y);
        scenePathToPaintPath(aspectRatioLockedPath, context.viewSpaceMeta);
        canvas.drawPath(aspectRatioLockedPath, aspectRatioLockedPaint);
      }

      edgePoints = applyToPoints(selectedNode.attrs.transform, [
        { x: 0, y: 0 },
        { x: selectedNode.attrs.size.x, y: 0 },
        { x: selectedNode.attrs.size.x, y: selectedNode.attrs.size.y },
        { x: 0, y: selectedNode.attrs.size.y },
      ]).map((point) => sceneCoordsToPaintCoords(point, context.viewSpaceMeta));

      sizeText = `${+selectedNode.attrs.size.x.toFixed(2)} x ${+selectedNode.attrs.size.y.toFixed(2)}`;
    } else {
      let targetSelectionArea: IBoundingArea | null = getGraphicsBoundingArea(selectedNodes);
      if (targetSelectionArea == null) {
        return;
      }

      // bounding Path
      const boundingRectPath = new canvaskit.Path();
      boundingRectPath.addRect(
        canvaskit.LTRBRect(
          targetSelectionArea.left,
          targetSelectionArea.top,
          targetSelectionArea.right,
          targetSelectionArea.bottom,
        ),
      );
      scenePathToPaintPath(boundingRectPath, context.viewSpaceMeta);
      canvas.drawPath(boundingRectPath, overlayStrokePaint);

      // aspect ratio locked Path
      if (this.selectionDraggingState !== null && this.selectionDraggingState.type === 'resize') {
        const aspectRatioLockedPath = new canvaskit.Path();
        if (this.selectionDraggingState.shiftKey) {
          aspectRatioLockedPath.moveTo(targetSelectionArea.left, targetSelectionArea.top);
          aspectRatioLockedPath.lineTo(targetSelectionArea.right, targetSelectionArea.bottom);
        } else {
          for (const graphic of selectedNodes) {
            if (graphic.attrs.isAspectRatioLocked) {
              const [startPoint, endPoint] = applyToPoints(graphic.attrs.transform, [
                { x: 0, y: 0 },
                { x: graphic.attrs.size.x, y: graphic.attrs.size.y },
              ]);
              aspectRatioLockedPath.moveTo(startPoint.x, startPoint.y);
              aspectRatioLockedPath.lineTo(endPoint.x, endPoint.y);
            }
          }
        }
        scenePathToPaintPath(aspectRatioLockedPath, context.viewSpaceMeta);
        canvas.drawPath(aspectRatioLockedPath, aspectRatioLockedPaint);
      }

      edgePoints = [
        { x: targetSelectionArea.left, y: targetSelectionArea.top },
        { x: targetSelectionArea.right, y: targetSelectionArea.top },
        { x: targetSelectionArea.right, y: targetSelectionArea.bottom },
        { x: targetSelectionArea.left, y: targetSelectionArea.bottom },
      ].map((point) => sceneCoordsToPaintCoords(point, context.viewSpaceMeta));

      sizeText = `${+targetSelectionArea.getWidth().toFixed(2)} x ${+targetSelectionArea.getHeight().toFixed(2)}`;
    }

    if (edgePoints.length === 0) {
      return;
    }

    const boundingEdges: IWondEdge[] = [];
    for (let i = 0; i < edgePoints.length; i++) {
      boundingEdges.push({
        start: edgePoints[i],
        end: edgePoints[(i + 1) % edgePoints.length],
      });
    }

    let targetEdge: IWondEdge | null = null;
    let maxY: number = -Infinity;

    for (const edge of boundingEdges) {
      const midY = (edge.start.y + edge.end.y) / 2;
      if (midY > maxY) {
        targetEdge = edge;
        maxY = midY;
      }
    }

    if (targetEdge === null) {
      return;
    }

    const { directionVector, perpVector } = getEdgeVectors(targetEdge);
    const midPoint = {
      x: (targetEdge.start.x + targetEdge.end.x) / 2,
      y: (targetEdge.start.y + targetEdge.end.y) / 2,
    };

    let angle = Math.atan2(directionVector.y, directionVector.x);
    if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
      angle += Math.PI;

      perpVector.x = -perpVector.x;
      perpVector.y = -perpVector.y;
    }

    const selectionLabelFont = this.cacheFontCollection.get('selectionLabelFont');
    const selectionLabelTextPaint = this.cachePaintCollection.get('selectionLabelTextPaint');
    if (!selectionLabelFont || !selectionLabelTextPaint) {
      return;
    }
    const textMetrics = measureText(sizeText, selectionLabelFont, selectionLabelTextPaint);

    const textWidth = textMetrics.width;
    const textHeight = textMetrics.height;
    const textBaseline = textMetrics.baseline;

    canvas.save();
    const textOffset = 10;
    const textPadding = 3;
    const labelCenter: IWondPoint = {
      x: midPoint.x + perpVector.x * (textOffset + textHeight / 2),
      y: midPoint.y + perpVector.y * (textOffset + textHeight / 2),
    };

    canvas.translate(labelCenter.x, labelCenter.y);
    canvas.rotate(rad2deg(angle), 0, 0);

    // draw the size text label
    const selectionLabelBgPaint = cachePaintCollection.get('selectionLabelBgPaint');
    if (!selectionLabelBgPaint) {
      return;
    }
    const paragraphBgRect = canvaskit.RRectXY(
      canvaskit.LTRBRect(
        -textWidth / 2 - textPadding,
        -textHeight / 2 - textPadding,
        textWidth / 2 + textPadding,
        textHeight / 2 + textPadding,
      ),
      3,
      3,
    );
    canvas.drawRRect(paragraphBgRect, selectionLabelBgPaint);

    canvas.drawText(
      sizeText,
      -textWidth / 2,
      textBaseline - textHeight / 2,
      selectionLabelTextPaint,
      selectionLabelFont,
    );
    canvas.restore();
  }

  private drawControlPoints(context: WondGraphicDrawingContext) {
    if (this.selectionDraggingState !== null && this.selectionDraggingState.type === 'move') {
      return;
    }

    const controlPoints = this.internalAPI.getControlPointManager().getControlPoints();
    if (controlPoints.length === 0) {
      return;
    }

    const { canvas, cachePaintCollection, viewSpaceMeta } = context;

    const controlPointOutlinePaint = cachePaintCollection.get('controlPointOutlinePaint');
    const controlPointFillPaint = cachePaintCollection.get('controlPointFillPaint');
    if (!controlPointOutlinePaint || !controlPointFillPaint) {
      return;
    }

    for (const controlPoint of controlPoints) {
      if (!controlPoint.visible) {
        continue;
      }

      const anchorPath = controlPoint.getDrawPath(viewSpaceMeta);
      if (anchorPath.isEmpty()) {
        continue;
      }

      canvas.drawPath(anchorPath, controlPointOutlinePaint);
      canvas.drawPath(anchorPath, controlPointFillPaint);
    }
  }

  private drawRuler(context: WondGraphicDrawingContext) {
    if (!this.internalAPI.getSettings().showRuler) {
      return;
    }

    const { canvas, cachePaintCollection, viewSpaceMeta } = context;
    const { canvaskit } = getCanvasKitContext();
    const rulerStep = this.internalAPI.getRulerManager().getRulerStep();
    const rulerPaintStep = sceneLengthToPaintLength(rulerStep, viewSpaceMeta);
    const rulerSize = this.internalAPI.getRulerManager().getRulerSize();
    const rulerBgPaint = cachePaintCollection.get('rulerBgPaint');
    const rulerTextPaint = cachePaintCollection.get('rulerTextPaint');
    const rulerTickPaint = cachePaintCollection.get('rulerTickPaint');
    const rulerFont = this.cacheFontCollection.get('rulerFont');
    const rulerTickLinePaint = cachePaintCollection.get('rulerTickLinePaint');
    const rulerSelectionBgPaint = cachePaintCollection.get('rulerSelectionBgPaint');
    const rulerSelectionTextPaint = cachePaintCollection.get('rulerSelectionTextPaint');
    const cacheAlphaLayerPaint = cachePaintCollection.get('alphaLayerPaint');
    if (
      !rulerBgPaint ||
      !rulerTextPaint ||
      !rulerFont ||
      !rulerTickPaint ||
      !rulerTickLinePaint ||
      !rulerSelectionBgPaint ||
      !rulerSelectionTextPaint ||
      !cacheAlphaLayerPaint
    ) {
      return;
    }

    const { left, top, right, bottom } = viewSpaceMeta.canvasBoundingBox;
    const NW_canvasScenePoint = screenCoordsToSceneCoords({ x: left, y: top }, viewSpaceMeta);
    const SE_canvasScenePoint = screenCoordsToSceneCoords({ x: right, y: bottom }, viewSpaceMeta);
    const NW_canvasPaintPoint = screenCoordsToPaintCoords({ x: left, y: top }, viewSpaceMeta);
    const SE_canvasPaintPoint = screenCoordsToPaintCoords({ x: right, y: bottom }, viewSpaceMeta);

    // draw the ruler bg
    const rulerBgPath = new canvaskit.Path();
    rulerBgPath.addRect(
      canvaskit.LTRBRect(
        NW_canvasPaintPoint.x,
        NW_canvasPaintPoint.y,
        NW_canvasPaintPoint.x + rulerSize,
        SE_canvasPaintPoint.y,
      ),
    );
    rulerBgPath.addRect(
      canvaskit.LTRBRect(
        NW_canvasPaintPoint.x,
        NW_canvasPaintPoint.y,
        SE_canvasPaintPoint.x,
        NW_canvasPaintPoint.y + rulerSize,
      ),
    );
    canvas.drawPath(rulerBgPath, rulerBgPaint);

    // selection effect in ruler.
    let horizontalSegments: Array<[number, number]> = [];
    let verticalSegments: Array<[number, number]> = [];
    const selectedNodes = Array.from(this.selectedNodeIds)
      .map((id) => this.getNodeById(id))
      .filter((node) => node !== undefined);
    if (selectedNodes.length !== 0) {
      selectedNodes.forEach((node) => {
        const boundingArea = node.getBoundingArea();
        horizontalSegments.push([boundingArea.left, boundingArea.right]);
        verticalSegments.push([boundingArea.top, boundingArea.bottom]);
      });

      horizontalSegments = mergeSegments(horizontalSegments);
      verticalSegments = mergeSegments(verticalSegments);
    }

    const segPointTextPropertyMap = new Map<number, RulerTextProperty>();

    const addSegPointToMap = (segPoint: number, isHorizontal: boolean) => {
      const text = (+segPoint.toFixed(3)).toString();
      const textMetrics = measureText(text, rulerFont, rulerSelectionTextPaint);
      let paintCoords = 0;
      if (isHorizontal) {
        paintCoords = sceneCoordsToPaintCoords({ x: segPoint, y: 0 }, viewSpaceMeta).x;
      } else {
        paintCoords = sceneCoordsToPaintCoords({ x: 0, y: segPoint }, viewSpaceMeta).y;
      }

      const segPointProperty = {
        text,
        paintCoords,
        ...textMetrics,
      };

      segPointTextPropertyMap.set(segPoint, segPointProperty);

      return segPointProperty;
    };

    if (horizontalSegments.length > 0 || verticalSegments.length > 0) {
      const rulerSelectionBgPath = new canvaskit.Path();
      for (const seg of horizontalSegments) {
        const segStartProperty = addSegPointToMap(seg[0], true);
        const segEndProperty = addSegPointToMap(seg[1], true);

        rulerSelectionBgPath.addRect(
          canvaskit.LTRBRect(
            segStartProperty.paintCoords,
            NW_canvasPaintPoint.y,
            Math.max(segEndProperty.paintCoords, segStartProperty.paintCoords + 1),
            NW_canvasPaintPoint.y + rulerSize,
          ),
        );
      }

      for (const seg of verticalSegments) {
        const segStartProperty = addSegPointToMap(seg[0], false);
        const segEndProperty = addSegPointToMap(seg[1], false);

        rulerSelectionBgPath.addRect(
          canvaskit.LTRBRect(
            NW_canvasPaintPoint.x,
            segStartProperty.paintCoords,
            NW_canvasPaintPoint.x + rulerSize,
            Math.max(segEndProperty.paintCoords, segStartProperty.paintCoords + 1),
          ),
        );
      }
      canvas.drawPath(rulerSelectionBgPath, rulerSelectionBgPaint);
    }

    const tickLength = 5;
    const tickTextOffset = 8;
    const selectionTextOffset = 4;
    const selectionAndTickTextReduceBeginOffset = rulerPaintStep * 1.5;
    const selectionAndTextReduceEndOffset = rulerPaintStep * 0.5;

    const calculatePaintOpacityBySelectionSeg = (
      tickCoords: number,
      coordsSelectionSegments: Array<[number, number]>,
      reduceBeginOffset: number,
      reduceEndOffset: number,
    ): number => {
      let paintOpacity = 1;
      for (const seg of coordsSelectionSegments) {
        const startTextProperty = segPointTextPropertyMap.get(seg[0]);
        if (startTextProperty) {
          const startLeft = startTextProperty.paintCoords - startTextProperty.width - selectionTextOffset;
          const startRight = startTextProperty.paintCoords;

          paintOpacity = Math.min(
            paintOpacity,
            getReduceRatioByDistanceFromSegment(
              tickCoords,
              [startLeft, startRight],
              reduceBeginOffset,
              reduceEndOffset,
            ),
          );
        }

        const endTextProperty = segPointTextPropertyMap.get(seg[1]);
        if (endTextProperty) {
          const endLeft = endTextProperty.paintCoords;
          const endRight = endTextProperty.paintCoords + endTextProperty.width + selectionTextOffset;

          paintOpacity = Math.min(
            paintOpacity,
            getReduceRatioByDistanceFromSegment(tickCoords, [endLeft, endRight], reduceBeginOffset, reduceEndOffset),
          );
        }
      }

      paintOpacity = Math.min(paintOpacity, getReduceRatioByDistanceFromSegment(tickCoords, [0, 0], rulerPaintStep, 0));

      return paintOpacity;
    };

    // horizontal ticks
    let startX = Math.ceil(NW_canvasScenePoint.x / rulerStep) * rulerStep;
    for (let x = startX; x < SE_canvasScenePoint.x + rulerStep; x += rulerStep) {
      const paintPoint = sceneCoordsToPaintCoords({ x, y: NW_canvasScenePoint.y }, viewSpaceMeta);

      const paintOpacity = calculatePaintOpacityBySelectionSeg(
        paintPoint.x,
        horizontalSegments,
        selectionAndTickTextReduceBeginOffset,
        selectionAndTextReduceEndOffset,
      );

      if (paintOpacity < 1) {
        cacheAlphaLayerPaint.setAlphaf(paintOpacity);
        canvas.saveLayer(cacheAlphaLayerPaint);
      }

      const tickPath = new canvaskit.Path();
      tickPath.moveTo(paintPoint.x, paintPoint.y + rulerSize);
      tickPath.lineTo(paintPoint.x, paintPoint.y + rulerSize - tickLength);
      canvas.drawPath(tickPath, rulerTickPaint);

      const text = x.toString();
      const textMetrics = measureText(text, rulerFont, rulerTextPaint);

      const textX = paintPoint.x - textMetrics.width / 2;
      const textY = paintPoint.y + rulerSize - tickTextOffset;

      canvas.drawText(text, textX, textY, rulerTextPaint, rulerFont);

      if (paintOpacity < 1) {
        canvas.restore();
      }
    }

    // vertical ticks
    let startY = Math.ceil(NW_canvasScenePoint.y / rulerStep) * rulerStep;
    for (let y = startY; y < SE_canvasScenePoint.y + rulerStep; y += rulerStep) {
      const paintPoint = sceneCoordsToPaintCoords({ x: NW_canvasScenePoint.x, y }, viewSpaceMeta);

      const paintOpacity = calculatePaintOpacityBySelectionSeg(
        paintPoint.y,
        verticalSegments,
        selectionAndTickTextReduceBeginOffset,
        selectionAndTextReduceEndOffset,
      );

      if (paintOpacity < 1) {
        cacheAlphaLayerPaint.setAlphaf(paintOpacity);
        canvas.saveLayer(cacheAlphaLayerPaint);
      }

      const tickPath = new canvaskit.Path();
      tickPath.moveTo(paintPoint.x + rulerSize, paintPoint.y);
      tickPath.lineTo(paintPoint.x + rulerSize - tickLength, paintPoint.y);
      canvas.drawPath(tickPath, rulerTickPaint);

      canvas.save();

      const text = y.toString();
      const textMetrics = measureText(text, rulerFont, rulerTextPaint);

      const textX = paintPoint.x + rulerSize - tickTextOffset;
      const textY = paintPoint.y + textMetrics.width / 2;

      canvas.rotate(-90, textX, textY);
      canvas.drawText(text, textX, textY, rulerTextPaint, rulerFont);
      canvas.restore();

      if (paintOpacity < 1) {
        canvas.restore();
      }
    }

    // draw selection tick text
    const selectionSelfReduceBeginOffset = rulerPaintStep;
    const selectionSelfReduceEndOffset = rulerPaintStep;
    for (let i = 0; i < horizontalSegments.length; i++) {
      const seg = horizontalSegments[i];
      const startTextProperty = segPointTextPropertyMap.get(seg[0]);
      if (startTextProperty) {
        const { text, paintCoords, ...textMetrics } = startTextProperty;
        const textX = paintCoords - textMetrics.width - selectionTextOffset;
        const textY = NW_canvasPaintPoint.y + rulerSize - tickTextOffset;
        const paintOpacity = calculatePaintOpacityBySelectionSeg(
          textX,
          horizontalSegments.slice(0, i),
          selectionSelfReduceBeginOffset,
          selectionSelfReduceEndOffset,
        );
        if (paintOpacity < 1) {
          cacheAlphaLayerPaint.setAlphaf(paintOpacity);
          canvas.saveLayer(cacheAlphaLayerPaint);
        }

        canvas.drawText(text, textX, textY, rulerSelectionTextPaint, rulerFont);

        if (paintOpacity < 1) {
          canvas.restore();
        }
      }

      const endTextProperty = segPointTextPropertyMap.get(seg[1]);
      if (endTextProperty) {
        const { text, paintCoords } = endTextProperty;
        const textX = paintCoords + selectionTextOffset;
        const textY = NW_canvasPaintPoint.y + rulerSize - tickTextOffset;
        const paintOpacity = calculatePaintOpacityBySelectionSeg(
          textX,
          horizontalSegments.slice(0, i),
          selectionSelfReduceBeginOffset,
          selectionSelfReduceEndOffset,
        );
        if (paintOpacity < 1) {
          cacheAlphaLayerPaint.setAlphaf(paintOpacity);
          canvas.saveLayer(cacheAlphaLayerPaint);
        }
        canvas.drawText(text, textX, textY, rulerSelectionTextPaint, rulerFont);
        if (paintOpacity < 1) {
          canvas.restore();
        }
      }
    }

    for (let i = 0; i < verticalSegments.length; i++) {
      const seg = verticalSegments[i];
      const startTextProperty = segPointTextPropertyMap.get(seg[0]);
      if (startTextProperty) {
        const { text, paintCoords, ...textMetrics } = startTextProperty;
        const startTextX = NW_canvasPaintPoint.x + rulerSize - tickTextOffset;
        const startTextY = paintCoords - selectionTextOffset;
        const paintOpacity = calculatePaintOpacityBySelectionSeg(
          startTextY - textMetrics.width,
          verticalSegments.slice(0, i),
          selectionSelfReduceBeginOffset,
          selectionSelfReduceEndOffset,
        );

        canvas.save();
        canvas.rotate(-90, startTextX, startTextY);
        if (paintOpacity < 1) {
          cacheAlphaLayerPaint.setAlphaf(paintOpacity);
          canvas.saveLayer(cacheAlphaLayerPaint);
        }

        canvas.drawText(text, startTextX, startTextY, rulerSelectionTextPaint, rulerFont);
        if (paintOpacity < 1) {
          canvas.restore();
        }
        canvas.restore();
      }

      const endTextProperty = segPointTextPropertyMap.get(seg[1]);
      if (endTextProperty) {
        const { text, paintCoords, ...textMetrics } = endTextProperty;
        const endTextX = NW_canvasPaintPoint.x + rulerSize - tickTextOffset;
        const endTextY = paintCoords + textMetrics.width + selectionTextOffset;
        const paintOpacity = calculatePaintOpacityBySelectionSeg(
          endTextY - textMetrics.width,
          verticalSegments.slice(0, i),
          selectionSelfReduceBeginOffset,
          selectionSelfReduceEndOffset,
        );

        canvas.save();
        canvas.rotate(-90, endTextX, endTextY);
        if (paintOpacity < 1) {
          cacheAlphaLayerPaint.setAlphaf(paintOpacity);
          canvas.saveLayer(cacheAlphaLayerPaint);
        }
        canvas.drawText(text, endTextX, endTextY, rulerSelectionTextPaint, rulerFont);
        if (paintOpacity < 1) {
          canvas.restore();
        }
        canvas.restore();
      }
    }

    // N-W corner mask
    const NW_maskPath = new canvaskit.Path();
    NW_maskPath.addRect(
      canvaskit.LTRBRect(
        NW_canvasPaintPoint.x,
        NW_canvasPaintPoint.y,
        NW_canvasPaintPoint.x + rulerSize,
        NW_canvasPaintPoint.y + rulerSize,
      ),
    );
    canvas.drawPath(NW_maskPath, rulerBgPaint);

    // ruler tick line
    const rulerTickLinePath = new canvaskit.Path();
    rulerTickLinePath.moveTo(NW_canvasPaintPoint.x, NW_canvasPaintPoint.y + rulerSize);
    rulerTickLinePath.lineTo(SE_canvasPaintPoint.x, NW_canvasPaintPoint.y + rulerSize);

    rulerTickLinePath.moveTo(NW_canvasPaintPoint.x + rulerSize, NW_canvasPaintPoint.y);
    rulerTickLinePath.lineTo(NW_canvasPaintPoint.x + rulerSize, SE_canvasPaintPoint.y);
    canvas.drawPath(rulerTickLinePath, rulerTickLinePaint);
  }

  private drawSceneGridLines(context: WondGraphicDrawingContext) {
    const { canvas, cachePaintCollection, viewSpaceMeta } = context;
    if (viewSpaceMeta.zoom < 8) {
      return;
    }
    const { canvaskit } = getCanvasKitContext();
    const sceneGridLinesPaint = cachePaintCollection.get('sceneGridLinesPaint');
    if (!sceneGridLinesPaint) {
      return;
    }

    const { left, top, right, bottom } = viewSpaceMeta.canvasBoundingBox;
    const NW_scene_point = screenCoordsToSceneCoords({ x: left, y: top }, viewSpaceMeta);
    const SE_scene_point = screenCoordsToSceneCoords({ x: right, y: bottom }, viewSpaceMeta);

    const startX = Math.ceil(NW_scene_point.x);
    const startY = Math.ceil(NW_scene_point.y);
    const endX = Math.floor(SE_scene_point.x);
    const endY = Math.floor(SE_scene_point.y);

    const linePath = new canvaskit.Path();

    for (let y = startY; y <= endY; y++) {
      const startPaintPoint = sceneCoordsToPaintCoords({ x: NW_scene_point.x, y }, viewSpaceMeta);
      const endPaintPoint = sceneCoordsToPaintCoords({ x: SE_scene_point.x, y }, viewSpaceMeta);
      linePath.moveTo(startPaintPoint.x, startPaintPoint.y);
      linePath.lineTo(endPaintPoint.x, endPaintPoint.y);
    }

    for (let x = startX; x <= endX; x++) {
      const startPaintPoint = sceneCoordsToPaintCoords({ x, y: NW_scene_point.y }, viewSpaceMeta);
      const endPaintPoint = sceneCoordsToPaintCoords({ x, y: SE_scene_point.y }, viewSpaceMeta);
      linePath.moveTo(startPaintPoint.x, startPaintPoint.y);
      linePath.lineTo(endPaintPoint.x, endPaintPoint.y);
    }

    canvas.drawPath(linePath, sceneGridLinesPaint);
  }

  private drawHover(context: WondGraphicDrawingContext) {
    if (this.selectionDraggingState !== null && this.selectionDraggingState.type === 'move') {
      return;
    }

    if (this.hoverNode === null) {
      return;
    }

    if (this.selectedNodeIds.has(this.hoverNode) && this.selectedNodeIds.size > 1) {
      return;
    }

    const hoverNode = this.getNodeById(this.hoverNode);
    if (hoverNode === undefined) {
      return;
    }
    hoverNode.drawOutline(context, 'hover');
  }

  private drawSelectionRange(context: WondGraphicDrawingContext) {
    if (this.selectionRange === null) {
      return;
    }
    const { canvas, cachePaintCollection } = context;
    const { canvaskit } = getCanvasKitContext();
    const selectionRangeOutlinePaint = cachePaintCollection.get('selectionRangeOutlinePaint');
    const selectionRangeFillPaint = cachePaintCollection.get('selectionRangeFillPaint');
    if (!selectionRangeOutlinePaint || !selectionRangeFillPaint) {
      return;
    }
    const path = new canvaskit.Path();
    path.addRect(
      canvaskit.LTRBRect(
        this.selectionRange.minX,
        this.selectionRange.minY,
        this.selectionRange.maxX,
        this.selectionRange.maxY,
      ),
    );

    scenePathToPaintPath(path, context.viewSpaceMeta);
    canvas.drawPath(path, selectionRangeOutlinePaint);
    canvas.drawPath(path, selectionRangeFillPaint);
  }

  private drawBackgroundLayer(context: WondGraphicDrawingContext) {
    this.rootNode.draw(context);
  }

  private drawContentLayer(context: WondGraphicDrawingContext) {
    for (const child of this.rootNode.attrs.children) {
      child.draw(context);
    }
  }

  private drawOverlayLayer(context: WondGraphicDrawingContext) {
    this.drawSceneGridLines(context);
    this.drawHover(context);
    this.drawSelectionRange(context);
    this.drawSelections(context);
    this.drawControlPoints(context);
    this.drawRuler(context);
  }

  private rafDraw() {
    const drawFrame = (canvas: Canvas) => {
      const viewSpaceMeta = this.internalAPI.getCoordinateManager().getViewSpaceMeta();

      const context: WondGraphicDrawingContext = {
        canvas,
        viewSpaceMeta,
        cachePaintCollection: this.cachePaintCollection,
      };
      canvas.save();
      canvas.scale(viewSpaceMeta.dpr, viewSpaceMeta.dpr);

      this.drawBackgroundLayer(context);

      this.drawContentLayer(context);

      this.drawOverlayLayer(context);

      canvas.restore();

      this.paintSurface?.requestAnimationFrame(drawFrame);
    };

    this.paintSurface?.requestAnimationFrame(drawFrame);

    // if (!this.dirtyBoundingArea) {
    //   // draw all the scene
    //   this.rootNode.draw(this.canvasKit, canvas);
    //   for (const child of this.rootNode.children) {
    //     child.draw(this.canvasKit, canvas);
    //   }

    //   this.dirtyBoundingArea = ZERO_BOUNDING_AREA;
    // } else {
    //   if (this.dirtyBoundingArea !== null && this.dirtyBoundingArea !== ZERO_BOUNDING_AREA) {
    //     // calculate the intersection of the dirty bounding area and the scene
    //     // draw the intersection
    //     // this.rootNode.draw(this.canvasKit, this.paintSurface);

    //     // clear the dirty bounding area
    //     this.dirtyBoundingArea = ZERO_BOUNDING_AREA;
    //   }
    // }
  }
}
