import { applyToPoint, compose, scale, translate, type Matrix } from 'transformation-matrix';
import type { IWondPoint, ViewSpaceMeta } from '../interfaces';
import { getMatrix3x3FromTransform } from './transform_utils';
import type { Path } from 'canvaskit-wasm';

/**
 * Convert screen coordinates to scene coordinates
 */
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

/**
 * Convert scene coordinates to screen coordinates
 */
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

/**
 * Convert screen coordinates to paint coordinates
 */
export const screenCoordsToPaintCoords = (screenPoint: IWondPoint, viewSpaceMeta: ViewSpaceMeta): IWondPoint => {
  return applyToPoint(translate(-viewSpaceMeta.viewportOffsetX, -viewSpaceMeta.viewportOffsetY), screenPoint);
};

/**
 * Convert scene coordinates to paint coordinates
 */
export const sceneCoordsToPaintCoords = (scenePoint: IWondPoint, viewSpaceMeta: ViewSpaceMeta): IWondPoint => {
  return applyToPoint(
    compose([scale(viewSpaceMeta.zoom), translate(viewSpaceMeta.sceneScrollX, viewSpaceMeta.sceneScrollY)]),
    scenePoint,
  );
};

/**
 * Convert scene length to screen length
 */
export const sceneLengthToScreenLength = (length: number, viewSpaceMeta: ViewSpaceMeta): number => {
  return length * viewSpaceMeta.zoom;
};

export const scenePathToPaintPath = (scenePath: Path, viewSpaceMeta: ViewSpaceMeta): Path => {
  const transform = compose([
    scale(viewSpaceMeta.zoom),
    translate(viewSpaceMeta.sceneScrollX, viewSpaceMeta.sceneScrollY),
  ]);
  return scenePath.transform(getMatrix3x3FromTransform(transform));
};

export const getTransformFromSceneToPaint = (viewSpaceMeta: ViewSpaceMeta): Matrix => {
  return compose([scale(viewSpaceMeta.zoom), translate(viewSpaceMeta.sceneScrollX, viewSpaceMeta.sceneScrollY)]);
};
