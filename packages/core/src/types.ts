import type { CommandManager } from './command_manager';
import type { CoordinateManager } from './coordinate_manager';
import type { HostEventManager } from './host_event_manager';
import type { SceneGraph } from './scene_graph';
import type { ToolManager } from './tool_manager';

export interface IPoint {
  x: number;
  y: number;
}

export interface BoundingArea {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

export interface WondColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface IWondEditor {
  canvasRootElement: HTMLCanvasElement;
  hostEventManager: HostEventManager;
  toolManager: ToolManager;
  sceneGraph: SceneGraph;
  commandManager: CommandManager;
  coordinateManager: CoordinateManager;
}
