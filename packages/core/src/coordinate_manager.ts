import type { IWondInternalAPI } from './editor';
import type { IWondPoint, ViewSpaceMeta } from './types';
import { applyToPoint, compose, scale, translate } from 'transformation-matrix';
import { getMatrix3x3FromTransform, screenCoordsToSceneCoords } from './utils';
import type { Path } from 'canvaskit-wasm';

export class WondCoordinateManager {
  private readonly canvasElement: HTMLCanvasElement;

  private viewSpaceMeta: ViewSpaceMeta = {
    viewportOffsetX: 0,
    viewportOffsetY: 0,
    sceneScrollX: 0,
    sceneScrollY: 0,
    zoom: 1,
  };

  constructor(internalAPI: IWondInternalAPI) {
    this.canvasElement = internalAPI.getCanvasRootElement();
    this.initViewportMeta();
  }

  private initViewportMeta() {
    const boundingBox = this.canvasElement.getBoundingClientRect();
    this.viewSpaceMeta.viewportOffsetX = boundingBox.left;
    this.viewSpaceMeta.viewportOffsetY = boundingBox.top;
  }

  public updateViewSpaceMeta(meta: Partial<ViewSpaceMeta>) {
    this.viewSpaceMeta = { ...this.viewSpaceMeta, ...meta };
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
