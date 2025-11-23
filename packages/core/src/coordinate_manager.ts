import type { IInternalAPI, IWondPoint, ViewSpaceMeta, ICoordinateManager } from './interfaces';
import { screenCoordsToSceneCoords } from './utils';

export class WondCoordinateManager implements ICoordinateManager {
  private readonly canvasElement: HTMLCanvasElement;
  private readonly internalAPI: IInternalAPI;
  private viewSpaceMeta: ViewSpaceMeta = {
    viewportOffsetX: 0,
    viewportOffsetY: 0,
    sceneScrollX: 0,
    sceneScrollY: 0,
    zoom: 1,
    dpr: 1,
    canvasBoundingBox: new DOMRect(0, 0, 0, 0),
  };

  constructor(internalAPI: IInternalAPI) {
    this.canvasElement = internalAPI.getCanvasRootElement();
    this.internalAPI = internalAPI;
    this.initViewportMeta();
  }

  private initViewportMeta() {
    const boundingBox = this.canvasElement.getBoundingClientRect();
    const windowDpr = window.devicePixelRatio || 1;
    const canvasWidth = boundingBox.width * windowDpr;
    const canvasHeight = boundingBox.height * windowDpr;
    this.canvasElement.width = canvasWidth;
    this.canvasElement.height = canvasHeight;

    this.viewSpaceMeta.canvasBoundingBox = boundingBox;
    this.viewSpaceMeta.viewportOffsetX = boundingBox.left;
    this.viewSpaceMeta.viewportOffsetY = boundingBox.top;
    this.viewSpaceMeta.dpr = windowDpr;
  }

  public updateViewSpaceMeta(meta: Partial<ViewSpaceMeta>) {
    this.viewSpaceMeta = { ...this.viewSpaceMeta, ...meta };
    this.internalAPI.emitEvent('onViewSpaceMetaChange');
  }

  public getViewSpaceMeta() {
    return this.viewSpaceMeta;
  }

  private deltaYToZoomRatio(deltaY: number) {
    const sign = -Math.sign(deltaY);
    const speed = 0.05;
    const factor = Math.pow(1 + speed, sign);
    return factor;
  }

  public scaleByStep(deltaY: number, basePoint: IWondPoint) {
    const newZoom = this.viewSpaceMeta.zoom * this.deltaYToZoomRatio(deltaY);
    this.scaleTo(newZoom, basePoint);
    8;
  }

  public scaleTo(newZoom: number, basePoint: IWondPoint) {
    const clampedZoom = Math.min(256, Math.max(0.015625, newZoom));

    const baseScenePoint = screenCoordsToSceneCoords(basePoint, this.viewSpaceMeta);

    const newSceneScrollX = (basePoint.x - this.viewSpaceMeta.viewportOffsetX) / clampedZoom - baseScenePoint.x;
    const newSceneScrollY = (basePoint.y - this.viewSpaceMeta.viewportOffsetY) / clampedZoom - baseScenePoint.y;

    this.updateViewSpaceMeta({
      zoom: clampedZoom,
      sceneScrollX: newSceneScrollX,
      sceneScrollY: newSceneScrollY,
    });
  }
}
