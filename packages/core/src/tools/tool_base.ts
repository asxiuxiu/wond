import type { IWondInternalAPI } from '../editor';
import { type IMouseEvent } from '../types';

export class ToolBase {
  onStart = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};
  onDrag = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};
  onMove = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};
  onEnd = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};
  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IWondInternalAPI) => {};
}
