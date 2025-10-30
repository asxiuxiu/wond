import { WondCoordinateManager } from './coordinate_manager';
import { WondCommand, WondCommandManager } from './command_manager';
import { WondHostEventManager } from './host_event_manager';
import { WondSceneGraph } from './scene_graph';
import { WondToolManager, type WondToolType } from './tools';
import type { WondGraphics } from './graphics';
import { EventEmitter } from '@wond/common';
import { WondUpdateSelectionOperation } from './operations';
import { WondKeybindingManager } from './keybinding_manager';

export interface IWondEditorEvent {
  onLayoutDirty(): void;
  onActiveToolChange(toolType: WondToolType): void;
}

export interface IWondInternalAPI {
  getHostEventManager(): WondHostEventManager;
  getSceneGraph(): WondSceneGraph;
  getCommandManager(): WondCommandManager;
  getCoordinateManager(): WondCoordinateManager;
  getToolManager(): WondToolManager;
  getCanvasRootElement(): HTMLCanvasElement;
  emitEvent(event: keyof IWondEditorEvent, ...args: Parameters<IWondEditorEvent[keyof IWondEditorEvent]>): void;
}

export interface WondEditorOptions {
  container: HTMLDivElement;
}

const FACTORY_SYMBOL = Symbol('WondEditor.factory');

export class WondEditor {
  #canvasRootElement: HTMLCanvasElement;

  #hostEventManager: WondHostEventManager;
  #sceneGraph: WondSceneGraph;
  #commandManager: WondCommandManager;
  #coordinateManager: WondCoordinateManager;
  #toolManager: WondToolManager;
  #keybindingManager: WondKeybindingManager;

  private readonly eventEmitter = new EventEmitter<IWondEditorEvent>();

  #internalAPI: IWondInternalAPI;

  constructor(options: WondEditorOptions, factoryToken?: typeof FACTORY_SYMBOL) {
    if (factoryToken !== FACTORY_SYMBOL) {
      throw new Error('WondEditor cannot be instantiated directly. Please use initWondEditor() instead.');
    }

    // init canvas element
    const canvasWrapper = options.container;
    const boundingBox = canvasWrapper.getBoundingClientRect();
    const canvasElement = document.createElement('canvas');
    canvasElement.width = boundingBox.width;
    canvasElement.height = boundingBox.height;
    canvasWrapper.appendChild(canvasElement);
    this.#canvasRootElement = canvasElement;

    this.#internalAPI = {
      getHostEventManager: () => this.#hostEventManager,
      getSceneGraph: () => this.#sceneGraph,
      getCommandManager: () => this.#commandManager,
      getCoordinateManager: () => this.#coordinateManager,
      getToolManager: () => this.#toolManager,
      getCanvasRootElement: () => this.#canvasRootElement,
      emitEvent: (event, ...args) => this.eventEmitter.emit(event, ...args),
    };

    this.#hostEventManager = new WondHostEventManager(this.#internalAPI);
    this.#coordinateManager = new WondCoordinateManager(this.#internalAPI);
    this.#sceneGraph = new WondSceneGraph(this.#internalAPI);
    this.#commandManager = new WondCommandManager(this.#internalAPI);
    this.#toolManager = new WondToolManager(this.#internalAPI);
    this.#keybindingManager = new WondKeybindingManager(this.#internalAPI);
    this.bindHostEvents();
    this.bindKeybindings();
  }

  bindHostEvents() {
    // hostEventManager => toolManager
    this.#hostEventManager.on('start', this.#toolManager.onStart);
    this.#hostEventManager.on('move', this.#toolManager.onMove);
    this.#hostEventManager.on('end', this.#toolManager.onEnd);
    this.#hostEventManager.on('drag', this.#toolManager.onDrag);
    this.#hostEventManager.on('contextmenu', this.#toolManager.onContextMenu);
    this.#hostEventManager.on('wheel', (event) => {
      if (event.ctrlKey) {
        this.#coordinateManager.scaleByStep(event.deltaY! > 0 ? 1 : -1, { x: event.clientX, y: event.clientY });
      }
    });
  }

  bindKeybindings() {
    this.#keybindingManager.registerKeybinding({
      key: { keyCode: 'KeyZ', ctrlKey: true },
      action: () => this.#commandManager.undo(),
    });
    this.#keybindingManager.registerKeybinding({
      key: { keyCode: 'KeyY', ctrlKey: true },
      action: () => this.#commandManager.redo(),
    });
  }

  static _createInstance(options: WondEditorOptions): WondEditor {
    return new WondEditor(options, FACTORY_SYMBOL);
  }

  public getLayerTree(): WondGraphics {
    return this.#sceneGraph.getRootNode();
  }

  public isNodeSelected(nodeId: string): boolean {
    return this.#sceneGraph.getSelections().has(nodeId);
  }

  public isNodeHovered(nodeId: string): boolean {
    return this.#sceneGraph.getHoverNode() === nodeId;
  }

  public getActiveToolType(): WondToolType {
    return this.#toolManager.getActiveToolType();
  }

  public setActiveToolType(toolType: WondToolType) {
    this.#toolManager.setActiveToolType(toolType);
  }

  public setSelections(nodeIds: string[]) {
    const needSelectNodes = nodeIds.filter((nodeId) => !this.#sceneGraph.getSelections().has(nodeId));
    if (needSelectNodes.length === 0) {
      return;
    }

    const command = new WondCommand();
    this.#commandManager.executeCommand(command);
    command.addOperations([new WondUpdateSelectionOperation(new Set(nodeIds))]);
    command.complete();
  }

  public toggleSelection(nodeId: string) {
    const selections = new Set(this.#sceneGraph.getSelections());
    if (selections.has(nodeId)) {
      selections.delete(nodeId);
    } else {
      selections.add(nodeId);
    }
    const command = new WondCommand();
    this.#commandManager.executeCommand(command);
    command.addOperations([new WondUpdateSelectionOperation(selections)]);
    command.complete();
  }

  public setHoverNode(nodeId: string | null) {
    this.#sceneGraph.setHoverNode(nodeId);
  }

  public on(event: keyof IWondEditorEvent, callback: IWondEditorEvent[keyof IWondEditorEvent]) {
    this.eventEmitter.on(event, callback);
  }

  public off(event: keyof IWondEditorEvent, callback: IWondEditorEvent[keyof IWondEditorEvent]) {
    this.eventEmitter.off(event, callback);
  }

  public clear() {
    this.#hostEventManager.clear();
    this.#keybindingManager.clear();
  }
}
