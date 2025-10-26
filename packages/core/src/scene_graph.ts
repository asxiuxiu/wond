import { type Canvas, type Surface } from 'canvaskit-wasm';
import { WondDocument } from './graphics/document';
import { DEFAULT_OVERLAY_COLOR as DEFAULT_OVERLAY_COLOR, ZERO_BOUNDING_AREA } from './constants';
import { calculateEdgeAngle, getEdgeVectors, rad2deg, type WondBoundingArea } from './geo';
import type { IWondEdge, IWondPoint, WondGraphicDrawingContext } from './types';
import { applyToPoints, compose, scale, translate } from 'transformation-matrix';
import { getMatrix3x3FromTransform } from './utils';
import { getCanvasKitContext } from './context';
import type { IWondInternalAPI } from './editor';
import type { WondGraphics } from './graphics';
import { throttle } from '@wond/common';
import RBush from 'rbush';

export class WondSceneGraph {
  private readonly internalAPI: IWondInternalAPI;
  private readonly rootNode: WondDocument;
  private readonly selectedNodeIds: Set<string> = new Set();
  private readonly nodesMap: Map<string, WondGraphics> = new Map();
  private readonly rTree = new RBush<WondGraphics>();

  private paintSurface: Surface | null = null;

  private dirtyBoundingArea: WondBoundingArea | null = null;

  constructor(internalAPI: IWondInternalAPI) {
    this.internalAPI = internalAPI;
    this.rootNode = new WondDocument({
      name: 'Page1',
    });

    this.initPaint(internalAPI.getCanvasRootElement());
  }

  private initPaint(canvasElement: HTMLCanvasElement) {
    const { canvaskit } = getCanvasKitContext();
    const paintSurface = canvaskit.MakeWebGLCanvasSurface(canvasElement);
    if (!paintSurface) {
      throw new Error('Failed to create paint surface');
    }
    this.paintSurface = paintSurface;
    this.rafDraw();
  }

  public getRootNode() {
    return this.rootNode;
  }

  public getSelections() {
    return new Set(this.selectedNodeIds);
  }

  public addSelection(nodeId: string) {
    this.selectedNodeIds.add(nodeId);
    this.markLayerTreeDirty();
  }

  public deleteSelection(nodeId: string) {
    this.selectedNodeIds.delete(nodeId);
    this.markLayerTreeDirty();
  }

  public clearSelection() {
    this.selectedNodeIds.clear();
    this.markLayerTreeDirty();
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

  pickNodesAtPoint(point: IWondPoint): WondGraphics[] {
    return this.rTree.search({
      minX: point.x,
      minY: point.y,
      maxX: point.x,
      maxY: point.y,
    });
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
    const selectedNodeIds = Array.from(this.selectedNodeIds);
    if (selectedNodeIds.length === 0) {
      return;
    }

    const selectedNodes = selectedNodeIds.map((id) => this.getNodeById(id)).filter((node) => node !== undefined);

    const { canvaskit, canvas, fontMgr, canvasTransform, overlayStrokePaint } = context;

    for (const child of selectedNodes) {
      child.drawOutline(context);
    }

    const boundingRectPath = new canvaskit.Path();

    let edgePoints: IWondPoint[] = [];
    let sizeText = '';

    if (selectedNodeIds.length == 1) {
      const selectedNode = selectedNodes[0];

      const transform = compose([canvasTransform, selectedNode.attrs.transform]);

      boundingRectPath.addRect(canvaskit.LTRBRect(0, 0, selectedNode.attrs.size.x, selectedNode.attrs.size.y));
      boundingRectPath.transform(getMatrix3x3FromTransform(transform));
      canvas.drawPath(boundingRectPath, overlayStrokePaint);

      edgePoints = applyToPoints(transform, [
        { x: 0, y: 0 },
        { x: selectedNode.attrs.size.x, y: 0 },
        { x: selectedNode.attrs.size.x, y: selectedNode.attrs.size.y },
        { x: 0, y: selectedNode.attrs.size.y },
      ]);

      sizeText = `${+selectedNode.attrs.size.x.toFixed(2)} x ${+selectedNode.attrs.size.y.toFixed(2)}`;
    } else {
      let targetSelectionArea: WondBoundingArea | null = null;
      for (const child of selectedNodes) {
        if (targetSelectionArea === null) {
          targetSelectionArea = child.getBoundingArea();
        } else {
          targetSelectionArea.union(child.getBoundingArea());
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
      boundingRectPath.transform(getMatrix3x3FromTransform(canvasTransform));
      canvas.drawPath(boundingRectPath, overlayStrokePaint);

      edgePoints = applyToPoints(canvasTransform, [
        { x: targetSelectionArea.left, y: targetSelectionArea.top },
        { x: targetSelectionArea.right, y: targetSelectionArea.top },
        { x: targetSelectionArea.right, y: targetSelectionArea.bottom },
        { x: targetSelectionArea.left, y: targetSelectionArea.bottom },
      ]);

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

  private drawBackgroundLayer(context: WondGraphicDrawingContext) {
    this.rootNode.draw(context);
  }

  private drawContentLayer(context: WondGraphicDrawingContext) {
    for (const child of this.rootNode.attrs.children) {
      child.draw(context);
    }
  }

  private drawOverlayLayer(context: WondGraphicDrawingContext) {
    this.drawSelections(context);
  }

  private rafDraw() {
    const { canvaskit, fontMgr } = getCanvasKitContext();

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

    const drawFrame = (canvas: Canvas) => {
      const viewportMeta = this.internalAPI.getCoordinateManager().getViewSpaceMeta();
      const canvasTransform = compose([
        scale(viewportMeta.zoom),
        translate(viewportMeta.sceneScrollX, viewportMeta.sceneScrollY),
      ]);

      const context: WondGraphicDrawingContext = {
        canvaskit,
        canvas,
        fontMgr,
        canvasTransform,
        overlayStrokePaint,
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
