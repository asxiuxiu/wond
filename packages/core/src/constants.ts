import { WondBoundingArea } from './geo';
import type { IWondColor } from './interfaces';

export const DEFAULT_FONT_NAME = 'Arial';
export const ZERO_BOUNDING_AREA = new WondBoundingArea(0, 0, 0, 0);

// default selection stroke
export const DEFAULT_OVERLAY_COLOR: IWondColor = { r: 13, g: 153, b: 255, a: 1 };

// default fill color(rect, ellipse, path, etc.)
export const DEFAULT_FILL_COLOR: IWondColor = { r: 217, g: 217, b: 217, a: 1 };

// range selection
export const DEFAULT_SELECTION_RANGE_FILL_COLOR: IWondColor = { r: 13, g: 153, b: 255, a: 0.1 };

// scene grid line
export const SCENE_GRID_LINE_COLOR: IWondColor = { r: 200, g: 200, b: 200, a: 1 };

// ruler
export const RULER_BG_COLOR: IWondColor = { r: 253, g: 253, b: 255, a: 1 };
export const RULER_TICK_COLOR: IWondColor = { r: 177, g: 177, b: 179, a: 1 };
export const RULER_TEXT_COLOR: IWondColor = { r: 200, g: 200, b: 202, a: 1 };
export const RULER_TICK_LINE_COLOR: IWondColor = { r: 228, g: 228, b: 230, a: 1 };
export const RULER_SELECTION_BG_COLOR: IWondColor = { r: 227, g: 242, b: 255, a: 1 };
export const RULER_SELECTION_TEXT_COLOR: IWondColor = { r: 42, g: 144, b: 234, a: 1 };

export interface CachePaintConfig {
  type: 'stroke' | 'fill';
  color: IWondColor;
  strokeWidth?: number;
}

export const CACHE_PAINT_COLLECTION: Record<string, CachePaintConfig> = {
  overlayStrokePaint: {
    type: 'stroke',
    color: DEFAULT_OVERLAY_COLOR,
    strokeWidth: 1,
  },

  // Range selection
  selectionRangeOutlinePaint: {
    type: 'stroke',
    color: DEFAULT_OVERLAY_COLOR,
    strokeWidth: 1,
  },
  selectionRangeFillPaint: {
    type: 'fill',
    color: DEFAULT_SELECTION_RANGE_FILL_COLOR,
  },

  // Selection label
  selectionLabelBgPaint: {
    type: 'fill',
    color: DEFAULT_OVERLAY_COLOR,
  },

  selectionLabelTextPaint: {
    type: 'fill',
    color: { r: 255, g: 255, b: 255, a: 1 },
  },

  // Control point
  controlPointOutlinePaint: {
    type: 'stroke',
    color: DEFAULT_OVERLAY_COLOR,
    strokeWidth: 2,
  },
  controlPointFillPaint: {
    type: 'fill',
    color: { r: 255, g: 255, b: 255, a: 1 },
  },

  // Scene grid lines
  sceneGridLinesPaint: {
    type: 'stroke',
    color: SCENE_GRID_LINE_COLOR,
    strokeWidth: 1,
  },

  // Ruler
  rulerBgPaint: {
    type: 'fill',
    color: RULER_BG_COLOR,
  },
  rulerTickPaint: {
    type: 'stroke',
    color: RULER_TICK_COLOR,
    strokeWidth: 1,
  },
  rulerTextPaint: {
    type: 'fill',
    color: RULER_TEXT_COLOR,
  },
  rulerTickLinePaint: {
    type: 'stroke',
    color: RULER_TICK_LINE_COLOR,
    strokeWidth: 1,
  },
  rulerSelectionBgPaint: {
    type: 'fill',
    color: RULER_SELECTION_BG_COLOR,
  },
  rulerSelectionTextPaint: {
    type: 'fill',
    color: RULER_SELECTION_TEXT_COLOR,
  },
};
