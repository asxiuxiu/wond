import type { ISceneGraph } from './iscene_graph';

export interface IOperation {
  readonly id: string;
  execute(sceneGraph: ISceneGraph): void;
  undo(sceneGraph: ISceneGraph): void;
}
