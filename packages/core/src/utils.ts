import type { Matrix3x3, Path } from 'canvaskit-wasm';
import { applyToPoint, compose, scale, translate, type Matrix } from 'transformation-matrix';
import type { IWondPoint, ViewSpaceMeta } from './types';

export const getMatrix3x3FromTransform = (transform: Matrix): Matrix3x3 => {
  return Float32Array.from([transform.a, transform.c, transform.e, transform.b, transform.d, transform.f, 0, 0, 1]);
};

export const screenCoordsToSceneCoords = (screenPoint: IWondPoint, viewSpaceMeta: ViewSpaceMeta): IWondPoint => {
  return applyToPoint(
    compose([
      translate(-viewSpaceMeta.sceneScrollX, -viewSpaceMeta.sceneScrollY),
      scale(1 / viewSpaceMeta.zoom),
      translate(-viewSpaceMeta.viewportOffsetX, -viewSpaceMeta.viewportOffsetY),
    ]),
    screenPoint,
  );
};

export const sceneCoordsToScreenCoords = (scenePoint: IWondPoint, viewSpaceMeta: ViewSpaceMeta): IWondPoint => {
  return applyToPoint(
    compose([
      translate(viewSpaceMeta.viewportOffsetX, viewSpaceMeta.viewportOffsetY),
      scale(viewSpaceMeta.zoom),
      translate(viewSpaceMeta.sceneScrollX, viewSpaceMeta.sceneScrollY),
    ]),
    scenePoint,
  );
};

export const screenCoordsToPaintCoords = (screenPoint: IWondPoint, viewSpaceMeta: ViewSpaceMeta): IWondPoint => {
  return applyToPoint(translate(-viewSpaceMeta.viewportOffsetX, -viewSpaceMeta.viewportOffsetY), screenPoint);
};

export const sceneCoordsToPaintCoords = (scenePoint: IWondPoint, viewSpaceMeta: ViewSpaceMeta): IWondPoint => {
  return applyToPoint(
    compose([scale(viewSpaceMeta.zoom), translate(viewSpaceMeta.sceneScrollX, viewSpaceMeta.sceneScrollY)]),
    scenePoint,
  );
};

export const scenePathToPaintPath = (scenePath: Path, viewSpaceMeta: ViewSpaceMeta): Path => {
  const transform = compose([
    scale(viewSpaceMeta.zoom),
    translate(viewSpaceMeta.sceneScrollX, viewSpaceMeta.sceneScrollY),
  ]);
  return scenePath.transform(getMatrix3x3FromTransform(transform));
};

export const sceneLengthToScreenLength = (length: number, viewSpaceMeta: ViewSpaceMeta): number => {
  return length * viewSpaceMeta.zoom;
};
