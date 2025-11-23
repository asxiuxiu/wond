import type { ICommandManager } from './icommand_manager';
import type { IControlPointManager } from './icontrol_point_manager';
import type { ICoordinateManager } from './icoordinate_manager';
import type { ICursorManager } from './icursor_manager';
import type { IHostEventManager } from './ihost_event_manager';
import type { IRulerManager } from './iruler_manager';
import type { ISceneGraph } from './iscene_graph';
import type { WondToolType } from './itool';
import type { IToolManager } from './itool_manager';
import type { IEditorSettings } from './ieditor';
import type { ISetterCollection, ISetterManager } from './isetter_manager';

export interface IEditorEvent {
  onLayoutDirty(): void;
  onActiveToolChange(toolType: WondToolType): void;
  onSelectionChange(selectedNodeSet: Set<string>): void;
  onSetterCollectionChange(setterCollection: ISetterCollection | null): void;
  onViewSpaceMetaChange(): void;
}

export interface IInternalAPI {
  getSettings(): Readonly<IEditorSettings>;
  getSetterManager(): ISetterManager;
  getHostEventManager(): IHostEventManager;
  getSceneGraph(): ISceneGraph;
  getCommandManager(): ICommandManager;
  getCoordinateManager(): ICoordinateManager;
  getToolManager(): IToolManager;
  getCanvasRootElement(): HTMLCanvasElement;
  getCursorManager(): ICursorManager;
  getControlPointManager(): IControlPointManager;
  getRulerManager(): IRulerManager;
  emitEvent(event: keyof IEditorEvent, ...args: Parameters<IEditorEvent[keyof IEditorEvent]>): void;
  on(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
  off(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
}
