import { WondOperation } from './operation_base';
import { WondSceneGraph } from '../scene_graph';
import { ZERO_BOUNDING_AREA } from '../constants';
import { WondBoundingArea } from '../geo';

export class WondUpdateSelectionOperation extends WondOperation {
  targetSelectionNodeIds: Set<string> = new Set();
  originSelectionNodeIds: Set<string> = new Set();

  constructor(selectedNodes: Set<string>) {
    super();
    this.targetSelectionNodeIds = selectedNodes;
  }

  execute = (sceneGraph: WondSceneGraph) => {
    this.originSelectionNodeIds = sceneGraph.getSelectionsCopy();
    sceneGraph.updateSelection(this.targetSelectionNodeIds);
  };

  undo = (sceneGraph: WondSceneGraph) => {
    sceneGraph.updateSelection(this.originSelectionNodeIds);
  };

  getDirtyBoundingArea = (): WondBoundingArea => {
    return ZERO_BOUNDING_AREA;
  };
}
