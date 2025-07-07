import { SceneGraph } from '../scene_graph';
import { WondBoundingArea } from '../geo/bounding_area';

/**
 * Operation is an atomic operation
 */
export interface WondOperation {
  execute(sceneGraph: SceneGraph): void;
  undo(sceneGraph: SceneGraph): void;

  getDirtyBoundingArea(): WondBoundingArea;
}
