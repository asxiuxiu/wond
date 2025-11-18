import type { Path } from 'canvaskit-wasm';
import { getCanvasKitContext } from '../context';
import { type IWondPoint, type WondControlPointShape, WondControlPointType } from '../interfaces';

export const getCornerControlPointNormalizedPos = (type: WondControlPointType): IWondPoint => {
  switch (type) {
    case WondControlPointType.NW_Resize:
    case WondControlPointType.NW_Rotate:
      return { x: 0, y: 0 };
    case WondControlPointType.NE_Resize:
    case WondControlPointType.NE_Rotate:
      return { x: 1, y: 0 };
    case WondControlPointType.SW_Resize:
    case WondControlPointType.SW_Rotate:
      return { x: 0, y: 1 };
    case WondControlPointType.SE_Resize:
    case WondControlPointType.SE_Rotate:
      return { x: 1, y: 1 };
    default:
      return { x: -1, y: -1 };
  }
};

export const getEdgeResizeControlPointNormalizedPos = (type: WondControlPointType): [IWondPoint, IWondPoint] => {
  switch (type) {
    case WondControlPointType.N_Resize:
      return [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ];
    case WondControlPointType.S_Resize:
      return [
        { x: 0, y: 1 },
        { x: 1, y: 1 },
      ];
    case WondControlPointType.E_Resize:
      return [
        { x: 1, y: 0 },
        { x: 1, y: 1 },
      ];
    case WondControlPointType.W_Resize:
      return [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ];
    default:
      return [
        { x: -1, y: -1 },
        { x: -1, y: -1 },
      ];
  }
};

export const getResizeControlPointFixedType = (type: WondControlPointType): WondControlPointType | null => {
  switch (type) {
    case WondControlPointType.NW_Resize:
      return WondControlPointType.SE_Resize;
    case WondControlPointType.NE_Resize:
      return WondControlPointType.SW_Resize;
    case WondControlPointType.SW_Resize:
      return WondControlPointType.NE_Resize;
    case WondControlPointType.SE_Resize:
      return WondControlPointType.NW_Resize;
    case WondControlPointType.N_Resize:
      return WondControlPointType.S_Resize;
    case WondControlPointType.S_Resize:
      return WondControlPointType.N_Resize;
    case WondControlPointType.E_Resize:
      return WondControlPointType.W_Resize;
    case WondControlPointType.W_Resize:
      return WondControlPointType.E_Resize;
    default:
      return null;
  }
};

export const getControlPointBaseDegree = (type: WondControlPointType): number => {
  switch (type) {
    case WondControlPointType.NW_Resize:
    case WondControlPointType.NW_Rotate:
      return -45;
    case WondControlPointType.NE_Resize:
    case WondControlPointType.NE_Rotate:
      return 45;
    case WondControlPointType.SE_Resize:
    case WondControlPointType.SE_Rotate:
      return 135;
    case WondControlPointType.SW_Resize:
    case WondControlPointType.SW_Rotate:
      return 225;
    default:
      return 0;
  }
};

export const CONTROL_POINT_RADIUS = 3;

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
