import { type IBaseTool } from './tool_base';
import { WondCommand } from '../command_manager';
import { WondRect } from '../graphics/rect';
import { type IMouseEvent } from '../types';
import { type IPoint } from '../types';
import type { WondEditor } from '../editor';
import { WondAddNodeOperation, WondUpdateSelectionOperation } from '../operations';

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
      size: { x: Math.abs(this.endPoint.x - this.startPoint.x), y: Math.abs(this.endPoint.y - this.startPoint.y) },
      transform: {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: Math.min(this.startPoint.x, this.endPoint.x),
        f: Math.min(this.startPoint.y, this.endPoint.y),
      },
    });
    const newAddRectOperation = new WondAddNodeOperation([0], newRect);

    const selectionOperation = new WondUpdateSelectionOperation([newRect]);

    this.command.setOperations([newAddRectOperation, selectionOperation]);
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
