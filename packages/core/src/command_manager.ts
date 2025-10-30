import { EventEmitter } from '@wond/common';
import { type WondOperation } from './operations/operation_base';
import { WondSceneGraph } from './scene_graph';
import type { IWondInternalAPI } from './editor';

interface WondCommandPhaseEvent {
  onOperationAdd(operations: WondOperation[]): void;
  complete(command: WondCommand): void;
}

/**
 * A command contains multiple operations, and it's atomic in history stack change.
 */
export class WondCommand {
  private operations: WondOperation[] = [];
  private eventEmitter = new EventEmitter<WondCommandPhaseEvent>();

  public getOperations() {
    return this.operations;
  }

  public execute = (sceneGraph: WondSceneGraph) => {
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      operation.execute(sceneGraph);
      sceneGraph.markDirtyArea(operation.getDirtyBoundingArea());
    }
  };

  public undo = (sceneGraph: WondSceneGraph) => {
    for (let i = this.operations.length - 1; i >= 0; i--) {
      const operation = this.operations[i];
      operation.undo(sceneGraph);
      sceneGraph.markDirtyArea(operation.getDirtyBoundingArea());
    }
  };

  complete = () => {
    this.eventEmitter.emit('complete', this);
    this.eventEmitter.clearAll();
  };

  addOperations = (operations: WondOperation[]) => {
    this.eventEmitter.emit('onOperationAdd', operations);
    this.operations.push(...operations);
  };

  setOperations = (operations: WondOperation[]) => {
    this.operations = operations;
  };

  on = (event: keyof WondCommandPhaseEvent, callback: WondCommandPhaseEvent[keyof WondCommandPhaseEvent]) => {
    this.eventEmitter.on(event, callback);
  };
}

export class WondCommandManager {
  private undoStack: WondCommand[] = [];
  private redoStack: WondCommand[] = [];

  private activeCommand: WondCommand | null = null;

  private readonly sceneGraph: WondSceneGraph;
  constructor(internalAPI: IWondInternalAPI) {
    this.sceneGraph = internalAPI.getSceneGraph();
  }

  public executeCommand = (command: WondCommand) => {
    if (this.activeCommand !== null) {
      console.warn('[CommandManager:executeCommand] the previous activeCommand is not complete.');
      this.activeCommand.complete();
    }

    this.activeCommand = command;
    this.activeCommand.on('onOperationAdd', (operations: WondOperation[]) => {
      operations.forEach((operation) => {
        operation.execute(this.sceneGraph);
      });
    });

    this.activeCommand.on('complete', (command: WondCommand) => {
      this.undoStack.push(command);
      this.redoStack = [];
      this.activeCommand = null;
    });
  };

  public undo = () => {
    const command = this.undoStack.pop();
    if (command) {
      command.undo(this.sceneGraph);
      this.redoStack.push(command);
    }
  };

  public redo = () => {
    const command = this.redoStack.pop();
    if (command) {
      command.execute(this.sceneGraph);
      this.undoStack.push(command);
    }
  };
}
