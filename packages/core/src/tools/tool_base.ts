import type { WondEditor } from '../editor';
import { type IMouseEvent } from '../types';

export class ToolBase {
  onStart = (event: IMouseEvent, editor: WondEditor) => {};
  onDrag = (event: IMouseEvent, editor: WondEditor) => {};
  onMove = (event: IMouseEvent, editor: WondEditor) => {};
  onEnd = (event: IMouseEvent, editor: WondEditor) => {};
}
