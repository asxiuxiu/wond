import { WondSceneGraph } from '../scene_graph';
import { WondBoundingArea } from '../geo';
import { getUuid } from '@wond/common';

/**
 * Operation is an atomic operation
 */
export class WondOperation {
  readonly id: string = getUuid();

  execute = (sceneGraph: WondSceneGraph): void => {
    throw new Error('Method not implemented.');
  };
  undo = (sceneGraph: WondSceneGraph): void => {
    throw new Error('Method not implemented.');
  };

  getDirtyBoundingArea = (): WondBoundingArea => {
    throw new Error('Method not implemented.');
  };
}
