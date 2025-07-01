import { type IMouseEvent } from '../host_event_manager';
import type { IWondEditor } from '../types';

export interface IBaseTool {
  onStart: (event: IMouseEvent, editor: IWondEditor) => void;
  onDrag: (event: IMouseEvent, editor: IWondEditor) => void;
  onMove: (event: IMouseEvent, editor: IWondEditor) => void;
  onEnd: (event: IMouseEvent, editor: IWondEditor) => void;
}
