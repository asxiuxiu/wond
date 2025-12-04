import { applyToPoints, decomposeTSR, type Matrix } from 'transformation-matrix';
import type { IBoundingArea, IGraphics, IGraphicsAttrs } from '../interfaces';
import { rad2deg, WondBoundingArea } from '../geo';
import { floatEqual } from '@wond/common';
import type { BBox } from 'rbush';

export const getGraphicsPositionProperty = (graphics: IGraphics<IGraphicsAttrs>) => {
  const transform = graphics.attrs.transform;
  const boundingArea = graphics.getBoundingArea();
  return {
    x: boundingArea.left,
    y: boundingArea.top,
    rotation: rad2deg(decomposeTSR(transform).rotation.angle),
  };
};

export const getGraphicsBoundingCenter = (graphics: IGraphics<IGraphicsAttrs>) => {
  const { size, transform } = graphics.attrs;
  const [NW_scenePoint, SE_scenePoint] = applyToPoints(transform, [
    { x: 0, y: 0 },
    { x: size.x, y: size.y },
  ]);

  return {
    x: NW_scenePoint.x + (SE_scenePoint.x - NW_scenePoint.x) / 2,
    y: NW_scenePoint.y + (SE_scenePoint.y - NW_scenePoint.y) / 2,
  };
};

export const getGraphicsBoundingArea = (graphics: IGraphics<IGraphicsAttrs>[]): IBoundingArea | null => {
  if (graphics.length === 0) {
    return null;
  }
  return graphics.reduce<IBoundingArea | null>((acc, graphic) => {
    if (acc == null) {
      return graphic.getBoundingArea();
    } else {
      return acc.union(graphic.getBoundingArea());
    }
  }, null);
};

export const generateBoundingArea = (size: { x: number; y: number }, transform: Matrix): IBoundingArea => {
  const points = applyToPoints(transform, [
    { x: 0, y: 0 },
    { x: size.x, y: 0 },
    { x: size.x, y: size.y },
    { x: 0, y: size.y },
  ]);
  const bounds = points.reduce(
    (acc, point) => {
      return {
        minX: Math.min(acc.minX, point.x),
        minY: Math.min(acc.minY, point.y),
        maxX: Math.max(acc.maxX, point.x),
        maxY: Math.max(acc.maxY, point.y),
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  );
  return new WondBoundingArea(bounds.minX, bounds.maxX, bounds.minY, bounds.maxY);
};

export const getAnchorsBetweenChildAndParentBoundingArea = (child: IBoundingArea, parent: IBoundingArea) => {
  const anchors = [];
  if (floatEqual(child.left, parent.left) && floatEqual(child.top, parent.top)) {
    anchors.push({ x: child.left, y: child.top });
  }

  if (floatEqual(child.right, parent.right) && floatEqual(child.top, parent.top)) {
    anchors.push({ x: child.right, y: child.top });
  }

  if (floatEqual(child.left, parent.left) && floatEqual(child.bottom, parent.bottom)) {
    anchors.push({ x: child.left, y: child.bottom });
  }

  if (floatEqual(child.right, parent.right) && floatEqual(child.bottom, parent.bottom)) {
    anchors.push({ x: child.right, y: child.bottom });
  }

  return anchors;
};
