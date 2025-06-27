import { IMouseEvent } from '../host_event_manager';
import { WondEditor } from '../editor';

export interface IBaseTool {
  onStart: (event: IMouseEvent, editor: WondEditor) => void;
  onDrag: (event: IMouseEvent, editor: WondEditor) => void;
  onMove: (event: IMouseEvent, editor: WondEditor) => void;
  onEnd: (event: IMouseEvent, editor: WondEditor) => void;
}
