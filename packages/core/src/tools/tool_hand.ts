import { ToolBase } from './tool_base';
import type { IMouseEvent, ViewSpaceMeta, IWondPoint, IInternalAPI } from '../interfaces';
import { screenCoordsToSceneCoords } from '../utils';

export class ToolHand extends ToolBase {
  private startPoint: IWondPoint | null = null;
  private originalViewSpaceMeta: ViewSpaceMeta | null = null;

  onActive = (lastMouseMoveEvent: IMouseEvent | null, internalAPI: IInternalAPI) => {
    internalAPI.getCursorManager().setCursor('grab');
  };

  onStart = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    this.originalViewSpaceMeta = { ...internalAPI.getCoordinateManager().getViewSpaceMeta() };

    this.startPoint = screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY }, this.originalViewSpaceMeta);
  };
  onDrag = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    this.onDragScene(event, internalAPI);
  };

  onEnd = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    this.onDragScene(event, internalAPI);
  };

  private onDragScene = (event: IMouseEvent, internalAPI: IInternalAPI) => {
    if (!this.startPoint || !this.originalViewSpaceMeta) return;
    const endPoint = screenCoordsToSceneCoords({ x: event.clientX, y: event.clientY }, this.originalViewSpaceMeta);

    const delta = {
      x: endPoint.x - this.startPoint.x,
      y: endPoint.y - this.startPoint.y,
    };

    internalAPI.getCoordinateManager().updateViewSpaceMeta({
      sceneScrollX: this.originalViewSpaceMeta.sceneScrollX + delta.x,
      sceneScrollY: this.originalViewSpaceMeta.sceneScrollY + delta.y,
    });
  };
}
