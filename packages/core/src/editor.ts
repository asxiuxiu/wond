import { WondCoordinateManager } from './coordinate_manager';
import { WondCommandManager } from './command_manager';
import { WondHostEventManager } from './host_event_manager';
import { WondSceneGraph } from './scene_graph';
import { WondToolManager } from './tools';

export interface WondEditorOptions {
  container: HTMLDivElement;
}

export class WondEditor {
  canvasRootElement: HTMLCanvasElement;

  hostEventManager: WondHostEventManager;
  sceneGraph: WondSceneGraph;
  commandManager: WondCommandManager;
  coordinateManager: WondCoordinateManager;
  toolManager: WondToolManager;
  constructor(options: WondEditorOptions) {
    // init canvas element
    const canvasWrapper = options.container;
    const boundingBox = canvasWrapper.getBoundingClientRect();
    const canvasElement = document.createElement('canvas');
    canvasElement.width = boundingBox.width;
    canvasElement.height = boundingBox.height;
    canvasWrapper.appendChild(canvasElement);
    this.canvasRootElement = canvasElement;

    this.coordinateManager = new WondCoordinateManager(canvasElement);

    this.hostEventManager = new WondHostEventManager(canvasElement);

    this.sceneGraph = new WondSceneGraph(canvasElement, this.coordinateManager);
    this.commandManager = new WondCommandManager(this.sceneGraph);
    this.toolManager = new WondToolManager(this);
    this.initBindings();
  }

  initBindings() {
    // hostEventManager => toolManager
    this.hostEventManager.on('start', this.toolManager.onStart);
    this.hostEventManager.on('move', this.toolManager.onMove);
    this.hostEventManager.on('end', this.toolManager.onEnd);
    this.hostEventManager.on('drag', this.toolManager.onDrag);
    this.hostEventManager.on('contextmenu', this.toolManager.onContextMenu);
  }
}
