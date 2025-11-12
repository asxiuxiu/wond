import type { ICommand } from './icommand';

export interface ICommandManager {
  executeCommand(command: ICommand): void;
  undo(): void;
  redo(): void;
  createCommand(): ICommand;
}
