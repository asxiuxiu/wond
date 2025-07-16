import type { IPoint } from './types';

export interface ViewSpaceMeta {
  viewportOffsetX: number;
  viewportOffsetY: number;
  sceneScrollX: number;
  sceneScrollY: number;
  zoom: number;
}

export class WondCoordinateManager {
  private canvasElement: HTMLCanvasElement;

  private viewSpaceMeta: ViewSpaceMeta = {
    viewportOffsetX: 0,
    viewportOffsetY: 0,
    sceneScrollX: 0,
    sceneScrollY: 0,
    zoom: 1,
  };

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvasElement = canvasElement;
    this.initViewportMeta();
  }

  private initViewportMeta() {
    const boundingBox = this.canvasElement.getBoundingClientRect();
    this.viewSpaceMeta.viewportOffsetX = boundingBox.left;
    this.viewSpaceMeta.viewportOffsetY = boundingBox.top;
  }

  public screenCoordsToSceneCoords(screenPoint: IPoint, overrideViewSpaceMeta: ViewSpaceMeta | null = null): IPoint {
    const viewSpaceMeta = overrideViewSpaceMeta || this.viewSpaceMeta;
    return {
      x: (screenPoint.x - viewSpaceMeta.viewportOffsetX) / viewSpaceMeta.zoom - viewSpaceMeta.sceneScrollX,
      y: (screenPoint.y - viewSpaceMeta.viewportOffsetY) / viewSpaceMeta.zoom - viewSpaceMeta.sceneScrollY,
    };
  }

  public sceneCoordsToScreenCoords(scenePoint: IPoint, overrideViewSpaceMeta: ViewSpaceMeta | null = null): IPoint {
    const viewSpaceMeta = overrideViewSpaceMeta || this.viewSpaceMeta;
    return {
      x: (scenePoint.x + viewSpaceMeta.sceneScrollX) * viewSpaceMeta.zoom + viewSpaceMeta.viewportOffsetX,
      y: (scenePoint.y + viewSpaceMeta.sceneScrollY) * viewSpaceMeta.zoom + viewSpaceMeta.viewportOffsetY,
    };
  }

  public updateViewSpaceMeta(meta: Partial<ViewSpaceMeta>) {
    this.viewSpaceMeta = { ...this.viewSpaceMeta, ...meta };
  }

  public getViewSpaceMeta() {
    return this.viewSpaceMeta;
  }
}
