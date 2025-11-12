import type {
  IHostEventManager,
  ISceneGraph,
  ICommandManager,
  ICoordinateManager,
  IToolManager,
  ICursorManager,
  IControlPointManager,
} from './index';
import type { WondToolType } from './itool';

export interface IEditorEvent {
  onLayoutDirty(): void;
  onActiveToolChange(toolType: WondToolType): void;
  onSelectionChange(selectedNodeSet: Set<string>): void;
}

export interface IInternalAPI {
  getHostEventManager(): IHostEventManager;
  getSceneGraph(): ISceneGraph;
  getCommandManager(): ICommandManager;
  getCoordinateManager(): ICoordinateManager;
  getToolManager(): IToolManager;
  getCanvasRootElement(): HTMLCanvasElement;
  getCursorManager(): ICursorManager;
  getControlPointManager(): IControlPointManager;
  emitEvent(event: keyof IEditorEvent, ...args: Parameters<IEditorEvent[keyof IEditorEvent]>): void;
  on(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
  off(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
}
