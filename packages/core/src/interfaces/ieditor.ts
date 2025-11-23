import type { IGraphics } from './igraphics';
import type { IEditorEvent } from './iinternal_api';
import type { ISetterCollection } from './isetter_manager';
import type { WondToolType } from './itool';

export interface IEditorOptions {
  container: HTMLDivElement;
}

export interface IEditorSettings {
  showRuler: boolean;
}

export interface IEditor {
  getSettings(): Readonly<IEditorSettings>;
  updateSettings<T extends keyof IEditorSettings>(settingKey: T, value: IEditorSettings[T]): void;
  getSetterCollection(): ISetterCollection | null;
  getLayerTree(): IGraphics;
  isNodeSelected(nodeId: string): boolean;
  isNodeHovered(nodeId: string): boolean;
  getActiveToolType(): WondToolType;
  setActiveToolType(toolType: WondToolType): void;
  setSelections(nodeIds: string[]): void;
  toggleSelection(nodeId: string): void;
  setHoverNode(nodeId: string | null): void;
  getZoom(): number;
  setZoom(zoom: number): void;
  on(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
  off(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
  clear(): void;
}
