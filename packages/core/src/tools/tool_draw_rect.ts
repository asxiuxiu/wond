import { WondEditor } from '../editor';
import { IBaseTool } from './tool_base';
import { WondCommand } from '../command_manager';
import { WondRect } from '../graphics/rect';
import { IMouseEvent } from '../host_event_manager';
import { IPoint } from '../types';
import { WondAddNodeOperation } from '../operations/add_node_operation';

export class ToolDrawRect implements IBaseTool {
  private startPoint: IPoint | null = null;
  private endPoint: IPoint | null = null;
  private command: WondCommand | null = null;

  onStart = (event: IMouseEvent, editor: WondEditor) => {
    this.startPoint = editor.coordinateManager.screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });
  };
  onDrag = (event: IMouseEvent, editor: WondEditor) => {
    if (!this.startPoint) return;
    this.endPoint = editor.coordinateManager.screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY });
    // calculate the rect by the bounding box. can be other shape

    if (!this.command) {
      this.command = new WondCommand();
      editor.commandManager.executeCommand(this.command);
    }
    const newRect = new WondRect({
      name: 'rect1',
      visible: true,
      size: { x: this.endPoint.x - this.startPoint.x, y: this.endPoint.y - this.startPoint.y },
      transform: { a: 1, b: 0, c: 0, d: 1, e: this.startPoint.x, f: this.startPoint.y },
    });
    const newAddRectOperation = new WondAddNodeOperation([0], newRect);
    this.command.setOperations([newAddRectOperation]);
  };
  onMove = (event: IMouseEvent, editor: WondEditor) => {
    // do nothing.
  };
  onEnd = (event: IMouseEvent, editor: WondEditor) => {
    if (this.command) {
      this.command.complete();
      this.command = null;
      console.log('command complete', editor.sceneGraph);
    }
  };
}
