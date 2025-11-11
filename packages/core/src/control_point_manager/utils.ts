import type { Path } from 'canvaskit-wasm';
import type { IWondPoint } from '../types';
import { WondControlPointType, type WondControlPointShape } from './types';
import { getCanvasKitContext } from '../context';
import { CONTROL_POINT_DETECT_THRESHOLD, CONTROL_POINT_RADIUS } from './constants';

export const getResizeControlPointNormalizedPos = (type: WondControlPointType): IWondPoint => {
  switch (type) {
    case WondControlPointType.NW_Resize:
      return { x: 0, y: 0 };
    case WondControlPointType.NE_Resize:
      return { x: 1, y: 0 };
    case WondControlPointType.SW_Resize:
      return { x: 0, y: 1 };
    case WondControlPointType.SE_Resize:
      return { x: 1, y: 1 };
  }

  return { x: -1, y: -1 };
};

export const getResizeBaseDegree = (type: WondControlPointType): number => {
  switch (type) {
    case WondControlPointType.NW_Resize:
      return -45;
    case WondControlPointType.NE_Resize:
      return 45;
    case WondControlPointType.SW_Resize:
      return 45;
    case WondControlPointType.SE_Resize:
      return -45;
    default:
      return 0;
  }
};

export const generateShapePath = (path: Path, shape: WondControlPointShape, anchorPos: IWondPoint) => {
  if (anchorPos.x < 0 || anchorPos.y < 0) {
    return;
  }

  const { canvaskit } = getCanvasKitContext();
  switch (shape) {
    case 'rect':
      path.addRect(
        canvaskit.LTRBRect(
          anchorPos.x - CONTROL_POINT_RADIUS,
          anchorPos.y - CONTROL_POINT_RADIUS,
          anchorPos.x + CONTROL_POINT_RADIUS,
          anchorPos.y + CONTROL_POINT_RADIUS,
        ),
      );
      break;
  }
};

export const generateDetectShapePath = (path: Path, shape: WondControlPointShape, anchorPos: IWondPoint) => {
  if (anchorPos.x < 0 || anchorPos.y < 0) {
    return;
  }

  const radius = CONTROL_POINT_RADIUS + CONTROL_POINT_DETECT_THRESHOLD;

  const { canvaskit } = getCanvasKitContext();
  switch (shape) {
    case 'rect':
      path.addRect(
        canvaskit.LTRBRect(anchorPos.x - radius, anchorPos.y - radius, anchorPos.x + radius, anchorPos.y + radius),
      );
      break;
  }
};
