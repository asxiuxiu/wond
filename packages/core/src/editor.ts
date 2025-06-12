import { viewSpaceManager } from './view_space_manager';
import { CommandManager } from './command_manager';
import { HostEventManager } from './host_event_manager';
import { SceneGraph } from './scene_graph';
import { ToolManager } from './tool_manager';

interface WondEditorOptions {
  container: HTMLElement;
}

export class WondEditor {
  canvasRootElement: HTMLCanvasElement;

  hostEventManager: HostEventManager;
  toolManager: ToolManager;
  sceneGraph: SceneGraph;
  commandManager: CommandManager;
  viewSpaceManager: viewSpaceManager;

  constructor(options: WondEditorOptions) {
    // init canvas element
    const canvasWrapper = options.container;
    const boundingBox = canvasWrapper.getBoundingClientRect();
    const canvasElement = document.createElement('canvas');
    canvasElement.width = boundingBox.width;
    canvasElement.height = boundingBox.height;
    canvasWrapper.appendChild(canvasElement);
    this.canvasRootElement = canvasElement;

    this.viewSpaceManager = new viewSpaceManager(canvasElement);

    this.hostEventManager = new HostEventManager(canvasElement);
    this.toolManager = new ToolManager();

    this.sceneGraph = new SceneGraph();
    this.commandManager = new CommandManager(this.sceneGraph);

    this.initBindings();
  }

  initBindings() {
    // hostEventManager => toolManager
    this.hostEventManager.on('start', this.toolManager.onStart);
    this.hostEventManager.on('move', this.toolManager.onMove);
    this.hostEventManager.on('end', this.toolManager.onEnd);
    this.hostEventManager.on('drag', this.toolManager.onDrag);
  }
}
