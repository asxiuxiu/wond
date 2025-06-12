import { SceneGraph } from '@/scene_graph';

/**
 * Operation is an atomic operation
 */
export interface WondOperation {
  execute(sceneGraph: SceneGraph): void;
  undo(sceneGraph: SceneGraph): void;
}
