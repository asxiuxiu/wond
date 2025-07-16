import { type IBaseTool } from './tool_base';
import { type IMouseEvent } from '../types';
import { type IPoint } from '../types';
import type { WondEditor } from '../editor';
import type { ViewSpaceMeta } from '../coordinate_manager';

export class ToolHand implements IBaseTool {
  private startPoint: IPoint | null = null;
  private originalViewSpaceMeta: ViewSpaceMeta | null = null;

  onStart = (event: IMouseEvent, editor: WondEditor) => {
    this.originalViewSpaceMeta = { ...editor.coordinateManager.getViewSpaceMeta() };
    this.startPoint = editor.coordinateManager.screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      this.originalViewSpaceMeta,
    );
  };
  onDrag = (event: IMouseEvent, editor: WondEditor) => {
    this.onDragScene(event, editor);
  };

  onMove = (event: IMouseEvent, editor: WondEditor) => {
    // do nothing.
  };

  onEnd = (event: IMouseEvent, editor: WondEditor) => {
    this.onDragScene(event, editor);
  };

  private onDragScene = (event: IMouseEvent, editor: WondEditor) => {
    if (!this.startPoint) return;
    const endPoint = editor.coordinateManager.screenCoordsToSceneCoords(
      { x: event.clientX, y: event.clientY },
      this.originalViewSpaceMeta,
    );

    const delta = {
      x: endPoint.x - this.startPoint.x,
      y: endPoint.y - this.startPoint.y,
    };

    editor.coordinateManager.updateViewSpaceMeta({
      sceneScrollX: this.originalViewSpaceMeta!.sceneScrollX + delta.x,
      sceneScrollY: this.originalViewSpaceMeta!.sceneScrollY + delta.y,
    });
  };
}
