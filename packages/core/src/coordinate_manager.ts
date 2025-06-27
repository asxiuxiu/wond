import { IPoint } from './types';

interface ViewSpaceMeta {
  viewportOffsetX: number;
  viewportOffsetY: number;
  sceneScrollX: number;
  sceneScrollY: number;
  zoom: number;
}

export class CoordinateManager {
  private viewportMeta: ViewSpaceMeta = {
    viewportOffsetX: 0,
    viewportOffsetY: 0,
    sceneScrollX: 0,
    sceneScrollY: 0,
    zoom: 1,
  };

  constructor(private canvasElement: HTMLCanvasElement) {
    this.initViewportMeta();
  }

  private initViewportMeta() {
    const boundingBox = this.canvasElement.getBoundingClientRect();
    this.viewportMeta.viewportOffsetX = boundingBox.left;
    this.viewportMeta.viewportOffsetY = boundingBox.top;
  }

  public screenCoordsToSceneCoords(screenPoint: IPoint): IPoint {
    return {
      x: this.viewportMeta.sceneScrollX + (screenPoint.x - this.viewportMeta.viewportOffsetX) / this.viewportMeta.zoom,
      y: this.viewportMeta.sceneScrollY + (screenPoint.y - this.viewportMeta.viewportOffsetY) / this.viewportMeta.zoom,
    };
  }

  public sceneCoordsToScreenCoords(scenePoint: IPoint): IPoint {
    return {
      x: (scenePoint.x - this.viewportMeta.sceneScrollX) * this.viewportMeta.zoom + this.viewportMeta.viewportOffsetX,
      y: (scenePoint.y - this.viewportMeta.sceneScrollY) * this.viewportMeta.zoom + this.viewportMeta.viewportOffsetY,
    };
  }
}
