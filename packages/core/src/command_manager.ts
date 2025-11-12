import { EventEmitter } from '@wond/common';
import type { IInternalAPI, ICommandManager, ICommand, ICommandEvent, IOperation, ISceneGraph } from './interfaces';

export class WondCommand implements ICommand {
  private operations: IOperation[] = [];
  private eventEmitter = new EventEmitter<ICommandEvent>();

  public getOperations(): IOperation[] {
    return this.operations;
  }

  public execute = (sceneGraph: ISceneGraph): void => {
    for (let i = 0; i < this.operations.length; i++) {
      const operation = this.operations[i];
      operation.execute(sceneGraph);
      // Dirty area marking is now handled automatically by sceneGraph's high-level APIs
    }
  };

  public undo = (sceneGraph: ISceneGraph): void => {
    for (let i = this.operations.length - 1; i >= 0; i--) {
      const operation = this.operations[i];
      operation.undo(sceneGraph);
      // Dirty area marking is now handled automatically by sceneGraph's high-level APIs
    }
  };

  complete = (): void => {
    this.eventEmitter.emit('complete', this);
    this.eventEmitter.clearAll();
  };

  addOperations = (operations: IOperation[]): void => {
    this.eventEmitter.emit('onOperationAdd', operations);
    this.operations.push(...operations);
  };

  setOperations = (operations: IOperation[]): void => {
    this.operations = operations;
  };

  on<K extends keyof ICommandEvent>(event: K, callback: ICommandEvent[K]): void {
    this.eventEmitter.on(event, callback);
  }
}

export class WondCommandManager implements ICommandManager {
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];

  private activeCommand: ICommand | null = null;

  private readonly sceneGraph: ISceneGraph;
  constructor(internalAPI: IInternalAPI) {
    this.sceneGraph = internalAPI.getSceneGraph();
  }

  public executeCommand = (command: ICommand): void => {
    if (this.activeCommand !== null) {
      console.warn('[CommandManager:executeCommand] the previous activeCommand is not complete.');
      this.activeCommand.complete();
    }

    this.activeCommand = command;
    this.activeCommand.on('onOperationAdd', (operations) => {
      operations.forEach((operation) => {
        operation.execute(this.sceneGraph);
      });
    });

    this.activeCommand.on('complete', (command) => {
      this.undoStack.push(command);
      this.redoStack = [];
      this.activeCommand = null;
    });
  };

  public undo = (): void => {
    const command = this.undoStack.pop();
    if (command) {
      command.undo(this.sceneGraph);
      this.redoStack.push(command);
    }
  };

  public redo = (): void => {
    const command = this.redoStack.pop();
    if (command) {
      command.execute(this.sceneGraph);
      this.undoStack.push(command);
    }
  };

  public createCommand = (): ICommand => {
    return new WondCommand();
  };
}
