import type {
  IEditor,
  IGraphics,
  IInternalAPI,
  IEditorEvent,
  IEditorOptions,
  IEditorSettings,
  ISetter,
  ISetterCollection,
} from './interfaces';
import { WondCoordinateManager } from './coordinate_manager';
import { WondCommandManager } from './command_manager';
import { WondHostEventManager } from './host_event_manager';
import { WondSceneGraph } from './scene_graph';
import { WondToolManager } from './tools';
import { WondToolType } from './interfaces';
import { EventEmitter } from '@wond/common';
import { WondUpdatePropertyOperation, WondUpdateSelectionOperation } from './operations';
import { WondKeybindingManager } from './keybinding_manager';
import { WondCursorManager } from './cursor_manager';
import { WondControlPointManager } from './control_point_manager';
import { WondRulerManager } from './ruler_manager';
import { WondSetterManager } from './setter_manager';

const FACTORY_SYMBOL = Symbol('WondEditor.factory');

export class WondEditor implements IEditor {
  #canvasRootElement: HTMLCanvasElement;
  #settings: IEditorSettings = {
    showRuler: true,
  };

  #hostEventManager: WondHostEventManager;
  #sceneGraph: WondSceneGraph;
  #commandManager: WondCommandManager;
  #coordinateManager: WondCoordinateManager;
  #toolManager: WondToolManager;
  #keybindingManager: WondKeybindingManager;
  #cursorManager: WondCursorManager;
  #controlPointManager: WondControlPointManager;
  #rulerManager: WondRulerManager;
  #setterManager: WondSetterManager;

  private readonly eventEmitter = new EventEmitter<IEditorEvent>();

  #internalAPI: IInternalAPI;

  constructor(options: IEditorOptions, factoryToken?: typeof FACTORY_SYMBOL) {
    if (factoryToken !== FACTORY_SYMBOL) {
      throw new Error('WondEditor cannot be instantiated directly. Please use initWondEditor() instead.');
    }

    // init canvas element
    const canvasWrapper = options.container;
    const boundingBox = canvasWrapper.getBoundingClientRect();
    const canvasElement = document.createElement('canvas');
    canvasElement.style.width = `${boundingBox.width}px`;
    canvasElement.style.height = `${boundingBox.height}px`;
    canvasWrapper.appendChild(canvasElement);
    this.#canvasRootElement = canvasElement;

    this.#internalAPI = {
      getSettings: () => this.#settings,
      getSetterManager: () => this.#setterManager,
      getHostEventManager: () => this.#hostEventManager,
      getSceneGraph: () => this.#sceneGraph,
      getCommandManager: () => this.#commandManager,
      getCoordinateManager: () => this.#coordinateManager,
      getToolManager: () => this.#toolManager,
      getCanvasRootElement: () => this.#canvasRootElement,
      getCursorManager: () => this.#cursorManager,
      getControlPointManager: () => this.#controlPointManager,
      getRulerManager: () => this.#rulerManager,
      emitEvent: (event, ...args) => this.eventEmitter.emit(event, ...args),
      on: (event, callback) => this.eventEmitter.on(event, callback),
      off: (event, callback) => this.eventEmitter.off(event, callback),
    };

    this.#hostEventManager = new WondHostEventManager(this.#internalAPI);
    this.#coordinateManager = new WondCoordinateManager(this.#internalAPI);
    this.#sceneGraph = new WondSceneGraph(this.#internalAPI);
    this.#commandManager = new WondCommandManager(this.#internalAPI);
    this.#toolManager = new WondToolManager(this.#internalAPI);
    this.#keybindingManager = new WondKeybindingManager(this.#internalAPI);
    this.#cursorManager = new WondCursorManager(this.#internalAPI);
    this.#controlPointManager = new WondControlPointManager(this.#internalAPI);
    this.#rulerManager = new WondRulerManager(this.#internalAPI);
    this.#setterManager = new WondSetterManager(this.#internalAPI); // must initialize after scene graph.
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
    this.#keybindingManager.registerKeybinding({
      key: { keyCode: 'KeyR', shiftKey: true },
      action: () => this.updateSettings('showRuler', !this.getSettings().showRuler),
    });
  }

  static _createInstance(options: IEditorOptions): WondEditor {
    return new WondEditor(options, FACTORY_SYMBOL);
  }

  public getSettings(): Readonly<IEditorSettings> {
    return this.#settings;
  }

  public updateSettings<T extends keyof IEditorSettings>(settingKey: T, value: IEditorSettings[T]) {
    this.#settings[settingKey] = value;
  }

  public getLayerTree(): IGraphics {
    return this.#sceneGraph.getRootNode();
  }

  public isNodeSelected(nodeId: string): boolean {
    return this.#sceneGraph.isNodeSelected(nodeId);
  }

  public isNodeHovered(nodeId: string): boolean {
    return this.#sceneGraph.getHoverNode() === nodeId;
  }

  public getActiveToolType(): WondToolType {
    return this.#toolManager.getActiveToolType();
  }

  public setActiveToolType(toolType: WondToolType) {
    this.#toolManager.setActiveToolByType(toolType);
  }

  public setSelections(nodeIds: string[]) {
    const nowSelections = this.#sceneGraph.getSelectionsCopy();
    const needSelectNodes = nodeIds.filter((nodeId) => !nowSelections.has(nodeId));
    if (needSelectNodes.length === 0) {
      return;
    }

    const command = this.#commandManager.createCommand();
    this.#commandManager.executeCommand(command);
    command.addOperations([new WondUpdateSelectionOperation(new Set(nodeIds))]);
    command.complete();
  }

  public toggleSelection(nodeId: string) {
    const selections = this.#sceneGraph.getSelectionsCopy();
    if (selections.has(nodeId)) {
      selections.delete(nodeId);
    } else {
      selections.add(nodeId);
    }
    const command = this.#commandManager.createCommand();
    this.#commandManager.executeCommand(command);
    command.addOperations([new WondUpdateSelectionOperation(selections)]);
    command.complete();
  }

  public setHoverNode(nodeId: string | null) {
    this.#sceneGraph.setHoverNode(nodeId);
  }

  public getSetterCollection(): ISetterCollection | null {
    return this.#setterManager.getSetterCollection();
  }

  public setNodeLocked(nodeId: string, locked: boolean): void {
    const node = this.#sceneGraph.getNodeById(nodeId);
    if (!node) return;
    if (node.attrs.locked == locked) return;
    const command = this.#commandManager.createCommand();
    this.#commandManager.executeCommand(command);
    command.addOperations([new WondUpdatePropertyOperation(node, { locked })]);
    command.complete();
  }

  public setNodeVisibility(nodeId: string, visible: boolean): void {
    const node = this.#sceneGraph.getNodeById(nodeId);
    if (!node) return;
    if (node.attrs.visible == visible) return;
    const command = this.#commandManager.createCommand();
    this.#commandManager.executeCommand(command);
    command.addOperations([new WondUpdatePropertyOperation(node, { visible })]);
    command.complete();
  }

  public getZoom(): number {
    return this.#coordinateManager.getViewSpaceMeta().zoom;
  }

  public setZoom(zoom: number): void {
    // TODO: implement this.
  }

  public on(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]) {
    this.eventEmitter.on(event, callback);
  }

  public off(event: keyof IEditorEvent, callback: IEditorEvent[keyof IEditorEvent]) {
    this.eventEmitter.off(event, callback);
  }

  public clear() {
    this.#hostEventManager.clear();
    this.#keybindingManager.clear();
  }
}
