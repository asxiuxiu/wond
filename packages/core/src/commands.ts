import { SceneGraph } from './scene_graph';

export interface ISceneGraphCommand {
  execute(): void;
  undo(): void;
}
