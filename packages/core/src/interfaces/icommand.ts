import type { IOperation } from './ioperation';
import type { ISceneGraph } from './iscene_graph';

export interface ICommand {
  getOperations(): IOperation[];
  execute(sceneGraph: ISceneGraph): void;
  undo(sceneGraph: ISceneGraph): void;
  complete(): void;
  addOperations(operations: IOperation[]): void;
  setOperations(operations: IOperation[]): void;
  on<K extends keyof ICommandEvent>(event: K, callback: ICommandEvent[K]): void;
}

export type ICommandEvent = {
  onOperationAdd(operations: IOperation[]): void;
  complete(command: ICommand): void;
};
