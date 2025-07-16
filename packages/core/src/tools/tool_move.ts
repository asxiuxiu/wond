import { type IBaseTool } from './tool_base';
import { type IMouseEvent } from '../types';
import { type IPoint } from '../types';
import type { WondEditor } from '../editor';

export class ToolMove implements IBaseTool {
  onStart = (event: IMouseEvent, editor: WondEditor) => {};
  onDrag = (event: IMouseEvent, editor: WondEditor) => {};

  onMove = (event: IMouseEvent, editor: WondEditor) => {
    // do nothing.
  };

  onEnd = (event: IMouseEvent, editor: WondEditor) => {};
}
