import CanvasKitInit, { type Canvas, type CanvasKit, type Surface } from 'canvaskit-wasm';
import { WondDocument } from './graphics/document';
import { ZERO_BOUNDING_AREA } from './constants';
import type { WondGraphics } from './graphics/graphics';
import type { WondBoundingArea } from './geo/bounding_area';
import type { WondCoordinateManager } from './coordinate_manager';

export class WondSceneGraph {
  private readonly rootNode: WondDocument;
  private readonly selectedNode: WondGraphics[] = [];
  private readonly coordinateManager: WondCoordinateManager;

  private canvasKit: CanvasKit | null = null;
  private paintSurface: Surface | null = null;
  private fontData: ArrayBuffer[] = [];

  private dirtyBoundingArea: WondBoundingArea | null = null;

  constructor(paintElement: HTMLCanvasElement, coordinateManager: WondCoordinateManager) {
    this.rootNode = new WondDocument({
      name: 'rootPage',
      visible: true,
      children: [],
    });
    this.coordinateManager = coordinateManager;

    this.initCanvasKit(paintElement);
  }

  private initCanvasKit(canvasElement: HTMLCanvasElement) {
    const initCanvasKit = CanvasKitInit();

    const initFont = fetch('https://storage.googleapis.com/skia-cdn/misc/Roboto-Regular.ttf').then((response) =>
      response.arrayBuffer(),
    );

    Promise.all([initCanvasKit, initFont]).then(([canvasKit, robotoData]) => {
      this.canvasKit = canvasKit;
      this.paintSurface = this.canvasKit.MakeWebGLCanvasSurface(canvasElement);
      this.fontData.push(robotoData);

      this.rafDraw();
    });
  }

  public getRootNode() {
    return this.rootNode;
  }

  public getSelections() {
    return [...this.selectedNode];
  }

  public addSelections(nodes: WondGraphics[]) {
    this.selectedNode.push(...nodes);
  }

  public clearSelection() {
    this.selectedNode.length = 0;
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

  private drawSelections(canvasKit: CanvasKit, canvas: Canvas) {
    let targetSelectionArea: WondBoundingArea | null = null;
    for (const child of this.selectedNode) {
      if (targetSelectionArea === null) {
        targetSelectionArea = child.getBoundingArea();
      } else {
        targetSelectionArea.union(child.getBoundingArea());
      }
    }
    if (targetSelectionArea !== null) {
      // draw the bounding box

      const selectionColor = canvasKit.Color4f(17 / 255, 152 / 255, 252 / 255, 1.0);

      const borderPaint = new canvasKit.Paint();
      borderPaint.setColor(selectionColor);
      borderPaint.setStyle(canvasKit.PaintStyle.Stroke);
      borderPaint.setAntiAlias(true);
      const rr = canvasKit.RRectXY(
        canvasKit.LTRBRect(
          targetSelectionArea.left - 0.5,
          targetSelectionArea.top - 0.5,
          targetSelectionArea.right + 0.5,
          targetSelectionArea.bottom + 0.5,
        ),
        0,
        0,
      );
      canvas.drawRRect(rr, borderPaint);

      const offset = 3.5;

      // draw the four corners
      const fillPaint = new canvasKit.Paint();
      fillPaint.setColor(canvasKit.Color4f(1, 1, 1, 1.0));
      fillPaint.setStyle(canvasKit.PaintStyle.Fill);
      fillPaint.setAntiAlias(true);
      // left-top corner
      const leftTopCorner = canvasKit.RRectXY(
        canvasKit.LTRBRect(
          targetSelectionArea.left - offset,
          targetSelectionArea.top - offset,
          targetSelectionArea.left + offset,
          targetSelectionArea.top + offset,
        ),
        0,
        0,
      );
      canvas.drawRRect(leftTopCorner, fillPaint);
      canvas.drawRRect(leftTopCorner, borderPaint);

      // right-top corner
      const rightTopCorner = canvasKit.RRectXY(
        canvasKit.LTRBRect(
          targetSelectionArea.right - offset,
          targetSelectionArea.top - offset,
          targetSelectionArea.right + offset,
          targetSelectionArea.top + offset,
        ),
        0,
        0,
      );
      canvas.drawRRect(rightTopCorner, fillPaint);
      canvas.drawRRect(rightTopCorner, borderPaint);

      // left-bottom corner
      const leftBottomCorner = canvasKit.RRectXY(
        canvasKit.LTRBRect(
          targetSelectionArea.left - offset,
          targetSelectionArea.bottom - offset,
          targetSelectionArea.left + offset,
          targetSelectionArea.bottom + offset,
        ),
        0,
        0,
      );
      canvas.drawRRect(leftBottomCorner, fillPaint);
      canvas.drawRRect(leftBottomCorner, borderPaint);

      // right-bottom corner
      const rightBottomCorner = canvasKit.RRectXY(
        canvasKit.LTRBRect(
          targetSelectionArea.right - offset,
          targetSelectionArea.bottom - offset,
          targetSelectionArea.right + offset,
          targetSelectionArea.bottom + offset,
        ),
        0,
        0,
      );
      canvas.drawRRect(rightBottomCorner, fillPaint);
      canvas.drawRRect(rightBottomCorner, borderPaint);

      // draw the size label

      const fontMgr = canvasKit.FontMgr.FromData(...this.fontData);
      if (fontMgr) {
        const paraStyle = new canvasKit.ParagraphStyle({
          textStyle: {
            color: canvasKit.WHITE,
            fontFamilies: ['Roboto'],
            fontSize: 12,
          },
          textAlign: canvasKit.TextAlign.Left,
        });
        const text = `${targetSelectionArea.getWidth()} x ${targetSelectionArea.getHeight()}`;
        const builder = canvasKit.ParagraphBuilder.Make(paraStyle, fontMgr);
        builder.addText(text);
        const paragraph = builder.build();
        paragraph.layout(150);

        const textWidth = paragraph.getMaxIntrinsicWidth();
        const textHeight = paragraph.getHeight();
        const textBottomOffset = 10;
        const textPadding = 3;

        const sizeLabelBgRect = canvasKit.RRectXY(
          canvasKit.LTRBRect(
            targetSelectionArea.left + targetSelectionArea.getWidth() / 2 - textWidth / 2 - textPadding,
            targetSelectionArea.bottom + textBottomOffset - textPadding,
            targetSelectionArea.left + targetSelectionArea.getWidth() / 2 + textWidth / 2 + textPadding,
            targetSelectionArea.bottom + textBottomOffset + textHeight + textPadding,
          ),
          3,
          3,
        );
        fillPaint.setColor(selectionColor);
        canvas.drawRRect(sizeLabelBgRect, fillPaint);

        canvas.drawParagraph(
          paragraph,
          targetSelectionArea.left + targetSelectionArea.getWidth() / 2 - textWidth / 2,
          targetSelectionArea.bottom + textBottomOffset,
        );
      }
    }
  }

  private rafDraw() {
    if (this.canvasKit && this.paintSurface && this.fontData.length > 0) {
      const drawFrame = (canvas: Canvas) => {
        canvas.save();
        const viewportMeta = this.coordinateManager.getViewSpaceMeta();
        canvas.scale(viewportMeta.zoom, viewportMeta.zoom);
        canvas.translate(viewportMeta.sceneScrollX, viewportMeta.sceneScrollY);

        this.rootNode.draw(this.canvasKit!, canvas);
        for (const child of this.rootNode.children) {
          child.draw(this.canvasKit!, canvas);
        }

        this.drawSelections(this.canvasKit!, canvas);

        canvas.restore();

        this.paintSurface?.requestAnimationFrame(drawFrame);
      };

      this.paintSurface.requestAnimationFrame(drawFrame);
    }

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
