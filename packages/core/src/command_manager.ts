import { WondCommand } from './commands';

export class CommandManager {
  private undoStack: WondCommand[] = [];
  private redoStack: WondCommand[] = [];

  public executeCommand = (command: WondCommand) => {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
  };

  public undo = () => {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  };

  public redo = () => {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
    }
  };
}
