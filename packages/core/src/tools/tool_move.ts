import { ToolBase } from './tool_base';
import { type IMouseEvent } from '../types';
import type { IWondInternalAPI } from '../editor';

export class ToolMove extends ToolBase {
  onStart = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};
  onDrag = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};

  onMove = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    // do nothing.
  };

  onEnd = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {};
}
