import type { IInternalAPI, IMouseEvent, ITool } from '../interfaces';

export class ToolBase implements ITool {
  onStart = (event: IMouseEvent, internalAPI: IInternalAPI) => {};
  onDrag = (event: IMouseEvent, internalAPI: IInternalAPI) => {};
  onMove = (event: IMouseEvent, internalAPI: IInternalAPI) => {};
  onEnd = (event: IMouseEvent, internalAPI: IInternalAPI) => {};
  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IInternalAPI) => {};
}
