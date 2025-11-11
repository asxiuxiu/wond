import { type Canvas, type Paint, type Surface } from 'canvaskit-wasm';
import { WondDocument } from './graphics/document';
import { DEFAULT_OVERLAY_COLOR, DEFAULT_SELECTION_RANGE_FILL_COLOR, ZERO_BOUNDING_AREA } from './constants';
import { calculateEdgeAngle, getEdgeVectors, rad2deg, type WondBoundingArea } from './geo';
import type { IWondEdge, IWondPoint, WondGraphicDrawingContext } from './types';
import { applyToPoint, applyToPoints, compose, decomposeTSR, scale, translate } from 'transformation-matrix';
import { getMatrix3x3FromTransform, sceneCoordsToPaintCoords, scenePathToPaintPath } from './utils';
import { getCanvasKitContext } from './context';
import type { IWondInternalAPI } from './editor';
import type { WondGraphics } from './graphics';
import { compareCoordinates, throttle } from '@wond/common';
import RBush, { type BBox } from 'rbush';
import { CONTROL_POINT_RADIUS } from './control_point_manager/constants';

export class WondSceneGraph {
  private readonly internalAPI: IWondInternalAPI;
  private readonly rootNode: WondDocument;

  private readonly nodesMap: Map<string, WondGraphics> = new Map();
  private readonly rTree = new RBush<WondGraphics>();

  // selections
  private readonly selectedNodeIds: Set<string> = new Set();
  private selectionRange: BBox | null = null;
  private isSelectionMoveDragging: boolean = false;

  // hover
  private hoverNode: string | null = null;

  private paintSurface: Surface | null = null;

  private dirtyBoundingArea: WondBoundingArea | null = null;

  private cachePaintCollection: Map<string, Paint> = new Map();

  constructor(internalAPI: IWondInternalAPI) {
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
    this.initCachePaint();
    this.rafDraw();
  }

  private initCachePaint() {
    const { canvaskit } = getCanvasKitContext();

    const overlayStrokePaint = new canvaskit.Paint();
    overlayStrokePaint.setColor(
      canvaskit.Color4f(
        DEFAULT_OVERLAY_COLOR.r / 255,
        DEFAULT_OVERLAY_COLOR.g / 255,
        DEFAULT_OVERLAY_COLOR.b / 255,
        DEFAULT_OVERLAY_COLOR.a,
      ),
    );
    overlayStrokePaint.setStyle(canvaskit.PaintStyle.Stroke);
    overlayStrokePaint.setStrokeWidth(1);
    overlayStrokePaint.setAntiAlias(true);

    this.cachePaintCollection.set('overlayStrokePaint', overlayStrokePaint);

    const selectionRangeOutlinePaint = new canvaskit.Paint();
    selectionRangeOutlinePaint.setColor(
      canvaskit.Color4f(
        DEFAULT_OVERLAY_COLOR.r / 255,
        DEFAULT_OVERLAY_COLOR.g / 255,
        DEFAULT_OVERLAY_COLOR.b / 255,
        DEFAULT_OVERLAY_COLOR.a,
      ),
    );
    selectionRangeOutlinePaint.setStyle(canvaskit.PaintStyle.Stroke);
    selectionRangeOutlinePaint.setStrokeWidth(1);
    selectionRangeOutlinePaint.setAntiAlias(false);
    this.cachePaintCollection.set('selectionRangeOutlinePaint', selectionRangeOutlinePaint);

    const selectionRangeFillPaint = new canvaskit.Paint();
    selectionRangeFillPaint.setColor(
      canvaskit.Color4f(
        DEFAULT_SELECTION_RANGE_FILL_COLOR.r / 255,
        DEFAULT_SELECTION_RANGE_FILL_COLOR.g / 255,
        DEFAULT_SELECTION_RANGE_FILL_COLOR.b / 255,
        DEFAULT_SELECTION_RANGE_FILL_COLOR.a,
      ),
    );
    selectionRangeFillPaint.setStyle(canvaskit.PaintStyle.Fill);
    selectionRangeFillPaint.setAntiAlias(false);
    this.cachePaintCollection.set('selectionRangeFillPaint', selectionRangeFillPaint);

    const controlPointOutlinePaint = new canvaskit.Paint();
    controlPointOutlinePaint.setColor(
      canvaskit.Color4f(
        DEFAULT_OVERLAY_COLOR.r / 255,
        DEFAULT_OVERLAY_COLOR.g / 255,
        DEFAULT_OVERLAY_COLOR.b / 255,
        DEFAULT_OVERLAY_COLOR.a,
      ),
    );
    controlPointOutlinePaint.setStyle(canvaskit.PaintStyle.Stroke);
    controlPointOutlinePaint.setStrokeWidth(2);
    controlPointOutlinePaint.setAntiAlias(true);
    this.cachePaintCollection.set('controlPointOutlinePaint', controlPointOutlinePaint);

    const controlPointFillPaint = new canvaskit.Paint();
    controlPointFillPaint.setColor(canvaskit.Color4f(1, 1, 1, 1));
    controlPointFillPaint.setStyle(canvaskit.PaintStyle.Fill);
    controlPointFillPaint.setAntiAlias(true);
    this.cachePaintCollection.set('controlPointFillPaint', controlPointFillPaint);
  }

  public getRootNode() {
    return this.rootNode;
  }

  public isNodeSelected(nodeId: string): boolean {
    return this.selectedNodeIds.has(nodeId);
  }

  public getSelectionsCopy() {
    return new Set(this.selectedNodeIds);
  }

  public getSelectionsBoundingArea(): Readonly<WondBoundingArea | null> {
    const selectedNodeIds = Array.from(this.selectedNodeIds);
    if (selectedNodeIds.length === 0) {
      return null;
    }
    return selectedNodeIds.reduce<WondBoundingArea | null>((acc, nodeId) => {
      const node = this.getNodeById(nodeId);
      if (node) {
        const nodeBoundingArea = node.getBoundingArea();
        if (acc == null) {
          return nodeBoundingArea;
        } else {
          return acc.union(nodeBoundingArea);
        }
      }
      return acc;
    }, null);
  }

  public setIsSelectionMoveDragging(isSelectionMoveDragging: boolean) {
    this.isSelectionMoveDragging = isSelectionMoveDragging;
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

  public getNodeById(id: string) {
    return this.nodesMap.get(id);
  }

  public registerNode(node: WondGraphics) {
    this.nodesMap.set(node.attrs.id, node);
  }

  insertNodeIntoRTree(node: WondGraphics) {
    this.rTree.insert(node);
  }

  removeNodeFromRTree(node: WondGraphics) {
    this.rTree.remove(node);
  }

  pickNodesAtRange(range: BBox): WondGraphics[] {
    const boundingIntersectedNodes = this.rTree.search(range);
    const rangePoints = [
      { x: range.minX, y: range.minY },
      { x: range.maxX, y: range.minY },
      { x: range.maxX, y: range.maxY },
      { x: range.minX, y: range.maxY },
    ];

    return boundingIntersectedNodes.filter((node) => rangePoints.some((point) => node.containsPoint(point)));
  }

  pickNodeAtPoint(point: IWondPoint): WondGraphics | null {
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

  private getNodeCoordinate(node: WondGraphics): number[] {
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

  public unregisterNode(node: WondGraphics) {
    this.nodesMap.delete(node.attrs.id);
  }

  public markDirtyArea(area: WondBoundingArea) {
    if (area === ZERO_BOUNDING_AREA) {
      return;
    }
    if (!this.dirtyBoundingArea) {
      this.dirtyBoundingArea = area;
    } else {
      this.dirtyBoundingArea.union(area);
    }
  }

  public markLayerTreeDirty() {
    this.internalAPI.emitEvent('onLayoutDirty');
  }

  public throttleMarkLayerTreeDirty = throttle(() => this.markLayerTreeDirty(), 500, { trailing: true });

  private drawSelections(context: WondGraphicDrawingContext) {
    if (this.isSelectionMoveDragging) {
      return;
    }

    const selectedNodeIds = Array.from(this.selectedNodeIds);
    if (selectedNodeIds.length === 0) {
      return;
    }

    const { canvaskit, canvas, fontMgr, cachePaintCollection } = context;

    const overlayStrokePaint = cachePaintCollection.get('overlayStrokePaint');
    if (!overlayStrokePaint) {
      return;
    }

    const selectedNodes = selectedNodeIds.map((id) => this.getNodeById(id)).filter((node) => node !== undefined);
    for (const child of selectedNodes) {
      child.drawOutline(context);
    }

    const boundingRectPath = new canvaskit.Path();

    let edgePoints: IWondPoint[] = [];
    let sizeText = '';

    if (selectedNodeIds.length == 1) {
      const selectedNode = selectedNodes[0];

      const path = scenePathToPaintPath(selectedNode.getScenePath(), context.viewSpaceMeta);
      boundingRectPath.addPath(path);

      canvas.drawPath(boundingRectPath, overlayStrokePaint);

      edgePoints = applyToPoints(selectedNode.attrs.transform, [
        { x: 0, y: 0 },
        { x: selectedNode.attrs.size.x, y: 0 },
        { x: selectedNode.attrs.size.x, y: selectedNode.attrs.size.y },
        { x: 0, y: selectedNode.attrs.size.y },
      ]).map((point) => sceneCoordsToPaintCoords(point, context.viewSpaceMeta));

      sizeText = `${+selectedNode.attrs.size.x.toFixed(2)} x ${+selectedNode.attrs.size.y.toFixed(2)}`;
    } else {
      let targetSelectionArea: WondBoundingArea | null = null;
      for (const child of selectedNodes) {
        if (targetSelectionArea === null) {
          targetSelectionArea = child.getBoundingArea();
        } else {
          targetSelectionArea = targetSelectionArea.union(child.getBoundingArea());
        }
      }

      if (targetSelectionArea == null) {
        return;
      }
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

      edgePoints = [
        { x: targetSelectionArea.left, y: targetSelectionArea.top },
        { x: targetSelectionArea.right, y: targetSelectionArea.top },
        { x: targetSelectionArea.right, y: targetSelectionArea.bottom },
        { x: targetSelectionArea.left, y: targetSelectionArea.bottom },
      ].map((point) => sceneCoordsToPaintCoords(point, context.viewSpaceMeta));

      sizeText = `${targetSelectionArea.getWidth()} x ${targetSelectionArea.getHeight()}`;
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
    let minAngle: number = Infinity;
    let maxY: number = -Infinity;

    for (const edge of boundingEdges) {
      const midY = (edge.start.y + edge.end.y) / 2;

      const angle = Math.abs(calculateEdgeAngle(edge));
      const horizontalAngle = Math.min(angle, Math.PI - angle);
      if (horizontalAngle < minAngle || (horizontalAngle === minAngle && midY > maxY)) {
        targetEdge = edge;
        minAngle = horizontalAngle;
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

    const ParagraphStyle = new canvaskit.ParagraphStyle(
      new canvaskit.ParagraphStyle({
        textStyle: {
          color: canvaskit.WHITE,
          fontFamilies: ['Roboto'],
          fontSize: 12,
        },
        textAlign: canvaskit.TextAlign.Left,
      }),
    );

    const builder = canvaskit.ParagraphBuilder.Make(ParagraphStyle, fontMgr);
    builder.addText(sizeText);
    const paragraph = builder.build();
    paragraph.layout(150);

    const textWidth = paragraph.getMaxIntrinsicWidth();
    const textHeight = paragraph.getHeight();

    canvas.save();
    const textOffset = 10;
    const textPadding = 3;
    const labelCenter: IWondPoint = {
      x: midPoint.x + perpVector.x * (textOffset + textHeight / 2),
      y: midPoint.y + perpVector.y * (textOffset + textHeight / 2),
    };

    canvas.translate(labelCenter.x, labelCenter.y);
    canvas.rotate(rad2deg(angle), 0, 0);

    // draw the paragraph bg rect
    const fillPaint = new canvaskit.Paint();
    fillPaint.setColor(
      canvaskit.Color4f(
        DEFAULT_OVERLAY_COLOR.r / 255,
        DEFAULT_OVERLAY_COLOR.g / 255,
        DEFAULT_OVERLAY_COLOR.b / 255,
        DEFAULT_OVERLAY_COLOR.a,
      ),
    );
    fillPaint.setStyle(canvaskit.PaintStyle.Fill);
    fillPaint.setAntiAlias(true);
    const paragraphBgRect = canvaskit.RRectXY(
      canvaskit.LTRBRect(
        -textWidth / 2 - textPadding,
        -textPadding,
        textWidth / 2 + textPadding,
        textHeight + textPadding,
      ),
      3,
      3,
    );
    canvas.drawRRect(paragraphBgRect, fillPaint);

    // draw size paragraph
    canvas.drawParagraph(paragraph, -textWidth / 2, 0);
    canvas.restore();
  }

  private drawControlPoints(context: WondGraphicDrawingContext) {
    if (this.isSelectionMoveDragging) {
      return;
    }

    const controlPoints = this.internalAPI.getControlPointManager().getControlPoints();
    if (controlPoints.length === 0) {
      return;
    }

    const { canvas, cachePaintCollection, canvaskit, viewSpaceMeta } = context;

    const controlPointOutlinePaint = cachePaintCollection.get('controlPointOutlinePaint');
    const controlPointFillPaint = cachePaintCollection.get('controlPointFillPaint');
    if (!controlPointOutlinePaint || !controlPointFillPaint) {
      return;
    }

    for (const controlPoint of controlPoints) {
      if (!controlPoint.visible) {
        continue;
      }

      const anchorScenePos = controlPoint.getAnchorScenePos();
      const anchorPaintPos = sceneCoordsToPaintCoords(anchorScenePos, viewSpaceMeta);
      const anchorPath = new canvaskit.Path();
      anchorPath.addRect(
        canvaskit.LTRBRect(
          anchorPaintPos.x - CONTROL_POINT_RADIUS,
          anchorPaintPos.y - CONTROL_POINT_RADIUS,
          anchorPaintPos.x + CONTROL_POINT_RADIUS,
          anchorPaintPos.y + CONTROL_POINT_RADIUS,
        ),
      );

      // apply graphic's skewX and skewY
      anchorPath.transform(
        getMatrix3x3FromTransform({ ...controlPoint.refGraphic.attrs.transform, a: 1, d: 1, e: 0, f: 0 }),
      );

      canvas.drawPath(anchorPath, controlPointOutlinePaint);
      canvas.drawPath(anchorPath, controlPointFillPaint);
    }
  }

  private drawHover(context: WondGraphicDrawingContext) {
    if (this.isSelectionMoveDragging) {
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
    const { canvaskit, canvas, cachePaintCollection } = context;
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
    this.drawHover(context);
    this.drawSelectionRange(context);
    this.drawSelections(context);
    this.drawControlPoints(context);
  }

  private rafDraw() {
    const { canvaskit, fontMgr } = getCanvasKitContext();

    const drawFrame = (canvas: Canvas) => {
      const viewSpaceMeta = this.internalAPI.getCoordinateManager().getViewSpaceMeta();

      const context: WondGraphicDrawingContext = {
        canvaskit,
        canvas,
        fontMgr,
        viewSpaceMeta,
        cachePaintCollection: this.cachePaintCollection,
      };

      this.drawBackgroundLayer(context);

      this.drawContentLayer(context);

      this.drawOverlayLayer(context);

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
