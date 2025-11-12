import type { Path } from 'canvaskit-wasm';
import { getCanvasKitContext } from '../context';
import { type IWondPoint, type WondControlPointShape, WondControlPointType } from '../interfaces';

/**
 * Get normalized position for resize control point based on type
 */
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

/**
 * Get base degree for resize control point based on type
 */
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

const CONTROL_POINT_RADIUS = 3;
const CONTROL_POINT_DETECT_THRESHOLD = 3;

/**
 * Generate shape path for control point
 */
export const generateShapePath = (path: Path, shape: WondControlPointShape, anchorPaintPos: IWondPoint) => {
  const { canvaskit } = getCanvasKitContext();
  switch (shape) {
    case 'rect':
      path.addRect(
        canvaskit.LTRBRect(
          anchorPaintPos.x - CONTROL_POINT_RADIUS,
          anchorPaintPos.y - CONTROL_POINT_RADIUS,
          anchorPaintPos.x + CONTROL_POINT_RADIUS,
          anchorPaintPos.y + CONTROL_POINT_RADIUS,
        ),
      );
      break;
  }
};

/**
 * Generate detection shape path for control point (with threshold)
 */
export const generateDetectShapePath = (path: Path, shape: WondControlPointShape, anchorPaintPos: IWondPoint) => {
  const radius = CONTROL_POINT_RADIUS + CONTROL_POINT_DETECT_THRESHOLD;

  const { canvaskit } = getCanvasKitContext();
  switch (shape) {
    case 'rect':
      path.addRect(
        canvaskit.LTRBRect(
          anchorPaintPos.x - radius,
          anchorPaintPos.y - radius,
          anchorPaintPos.x + radius,
          anchorPaintPos.y + radius,
        ),
      );
      break;
  }
};
