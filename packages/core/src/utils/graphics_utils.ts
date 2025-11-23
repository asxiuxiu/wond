import { applyToPoints, decomposeTSR } from 'transformation-matrix';
import type { IBoundingArea, IGraphics, IGraphicsAttrs } from '../interfaces';
import { rad2deg, WondBoundingArea } from '../geo';

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
