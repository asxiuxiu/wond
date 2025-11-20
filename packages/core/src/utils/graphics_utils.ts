import { decomposeTSR } from 'transformation-matrix';
import type { IGraphics, IGraphicsAttrs } from '../interfaces';
import { rad2deg } from '../geo';

export const getGraphicsPositionProperty = (graphics: IGraphics<IGraphicsAttrs>) => {
  const transform = graphics.attrs.transform;
  const boundingArea = graphics.getBoundingArea();
  return {
    x: boundingArea.left,
    y: boundingArea.top,
    rotation: rad2deg(decomposeTSR(transform).rotation.angle),
  };
};
