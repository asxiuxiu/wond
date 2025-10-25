import { ToolBase } from './tool_base';
import { type IMouseEvent } from '../types';
import { type IWondPoint } from '../types';
import type { IWondInternalAPI } from '../editor';
import type { ViewSpaceMeta } from '../coordinate_manager';

export class ToolHand extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private originalViewSpaceMeta: ViewSpaceMeta | null = null;

  onStart = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.originalViewSpaceMeta = { ...internalAPI.getCoordinateManager().getViewSpaceMeta() };
    this.startPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY }, this.originalViewSpaceMeta);
  };
  onDrag = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.onDragScene(event, internalAPI);
  };

  onEnd = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    this.onDragScene(event, internalAPI);
  };

  private onDragScene = (event: IMouseEvent, internalAPI: IWondInternalAPI) => {
    if (!this.startPoint) return;
    const endPoint = internalAPI
      .getCoordinateManager()
      .screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY }, this.originalViewSpaceMeta);

    const delta = {
      x: endPoint.x - this.startPoint.x,
      y: endPoint.y - this.startPoint.y,
    };

    internalAPI.getCoordinateManager().updateViewSpaceMeta({
      sceneScrollX: this.originalViewSpaceMeta!.sceneScrollX + delta.x,
      sceneScrollY: this.originalViewSpaceMeta!.sceneScrollY + delta.y,
    });
  };
}
