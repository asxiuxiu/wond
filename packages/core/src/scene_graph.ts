import CanvasKitInit, { type Canvas, type CanvasKit, type Surface } from 'canvaskit-wasm';
import { WondDocument } from './graphics/document';
import type { BoundingArea } from './types';
import { ZERO_BOUNDING_AREA } from './constants';

export class SceneGraph {
  private readonly rootNode: WondDocument;
  private canvasKit: CanvasKit | null = null;
  private paintSurface: Surface | null = null;

  private dirtyBoundingArea: BoundingArea | null = null;

  constructor(paintElement: HTMLCanvasElement) {
    this.rootNode = new WondDocument({
      name: 'rootPage',
      visible: true,
      children: [],
    });
    this.initCanvasKit(paintElement);
  }

  private initCanvasKit(canvasElement: HTMLCanvasElement) {
    CanvasKitInit().then((canvasKit) => {
      this.canvasKit = canvasKit;
      this.paintSurface = this.canvasKit.MakeWebGLCanvasSurface(canvasElement);
      this.rafDraw();
    });
  }

  public getRootNode() {
    return this.rootNode;
  }

  public markDirtyArea(area: BoundingArea) {
    if (!this.dirtyBoundingArea) {
      this.dirtyBoundingArea = area;
    } else {
      this.dirtyBoundingArea = {
        left: Math.min(this.dirtyBoundingArea.left, area.left),
        right: Math.max(this.dirtyBoundingArea.right, area.right),
        top: Math.min(this.dirtyBoundingArea.top, area.top),
        bottom: Math.max(this.dirtyBoundingArea.bottom, area.bottom),
      };
    }
  }

  private rafDraw() {
    if (this.canvasKit && this.paintSurface) {

      const drawFrame = (canvas: Canvas) => {
        this.rootNode.draw(this.canvasKit!, canvas);
        for (const child of this.rootNode.children) {
          child.draw(this.canvasKit!, canvas);
        }

        this.paintSurface?.requestAnimationFrame(drawFrame);
      }

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
