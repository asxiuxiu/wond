import type { IGraphics } from './igraphics';
import type { IEditorEvent } from './iinternal_api';
import type { WondToolType } from './itool';

export interface IEditorOptions {
  container: HTMLDivElement;
}

export interface IEditor {
  getLayerTree(): IGraphics;
  isNodeSelected(nodeId: string): boolean;
  isNodeHovered(nodeId: string): boolean;
  getActiveToolType(): WondToolType;
  setActiveToolType(toolType: WondToolType): void;
  setSelections(nodeIds: string[]): void;
  toggleSelection(nodeId: string): void;
  setHoverNode(nodeId: string | null): void;
  on(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
  off(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]): void;
  clear(): void;
}
