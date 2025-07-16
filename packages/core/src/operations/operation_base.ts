import { WondSceneGraph } from '../scene_graph';
import { WondBoundingArea } from '../geo/bounding_area';

/**
 * Operation is an atomic operation
 */
export interface WondOperation {
  execute(sceneGraph: WondSceneGraph): void;
  undo(sceneGraph: WondSceneGraph): void;

  getDirtyBoundingArea(): WondBoundingArea;
}
