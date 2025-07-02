import type { WondEditor } from '../editor';
import { type IMouseEvent } from '../host_event_manager';


export interface IBaseTool {
  onStart: (event: IMouseEvent, editor: WondEditor) => void;
  onDrag: (event: IMouseEvent, editor: WondEditor) => void;
  onMove: (event: IMouseEvent, editor: WondEditor) => void;
  onEnd: (event: IMouseEvent, editor: WondEditor) => void;
}
