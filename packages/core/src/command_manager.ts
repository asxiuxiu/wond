import { EventEmitter } from '@wond/common';
import { WondDocument } from './graphics/document';
import { WondOperation } from './operations/operation_base';
import { SceneGraph } from './scene_graph';

interface WondCommandPhaseEvent {
  changeStart(command: WondCommand): void;
  changeEnd(command: WondCommand): void;
  complete(command: WondCommand): void;
}

/**
 * A command contains multiple operations, and it's atomic in history stack change.
 */
export class WondCommand {
  private operations: WondOperation[] = [];
  private eventEmitter = new EventEmitter<WondCommandPhaseEvent>();

  public execute = (sceneGraph: SceneGraph) => {
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      operation.execute(sceneGraph);
    }
  };

  public undo = (sceneGraph: SceneGraph) => {
    for (let i = this.operations.length - 1; i >= 0; i--) {
      const operation = this.operations[i];
      operation.undo(sceneGraph);
    }
  };

  complete = () => {
    this.eventEmitter.emit('complete', this);
    this.eventEmitter.clearAll();
  };

  setOperations = (operations: WondOperation[]) => {
    this.eventEmitter.emit('changeStart', this);
    this.operations = operations;
    this.eventEmitter.emit('changeEnd', this);
  };

  on = (
    event: keyof WondCommandPhaseEvent,
    callback: WondCommandPhaseEvent[keyof WondCommandPhaseEvent],
  ) => {
    this.eventEmitter.on(event, callback);
  };
}

export class CommandManager {
  private undoStack: WondCommand[] = [];
  private redoStack: WondCommand[] = [];

  private activeCommand: WondCommand | null = null;

  private sceneGraph: SceneGraph;
  constructor(sceneGraph: SceneGraph) {
    this.sceneGraph = sceneGraph;
  }

  public executeCommand = (command: WondCommand) => {
    if (this.activeCommand !== null) {
      console.warn(
        '[CommandManager:executeCommand] the previous activeCommand is not complete.',
      );
      this.activeCommand.complete();
    }

    this.activeCommand = command;
    this.activeCommand.on('complete', (command) => {
      this.undoStack.push(command);
      this.redoStack = [];
      this.activeCommand = null;
    });
    this.activeCommand.on('changeStart', (command) => {
      command.undo(this.sceneGraph);
    });
    this.activeCommand.on('changeEnd', (command) => {
      command.execute(this.sceneGraph);
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
