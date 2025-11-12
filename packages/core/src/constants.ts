import { WondBoundingArea } from './geo';
import type { IWondColor } from './interfaces';

export const ZERO_BOUNDING_AREA = new WondBoundingArea(0, 0, 0, 0);
export const DEFAULT_OVERLAY_COLOR: IWondColor = { r: 13, g: 153, b: 255, a: 1 };
export const DEFAULT_FILL_COLOR: IWondColor = { r: 217, g: 217, b: 217, a: 1 };
export const DEFAULT_SELECTION_RANGE_FILL_COLOR: IWondColor = { r: 13, g: 153, b: 255, a: 0.1 };
