import { type WondOperation } from './operation_base';
import { WondSceneGraph } from '../scene_graph';
import { ZERO_BOUNDING_AREA } from '../constants';
import { WondBoundingArea } from '../geo';

export class WondUpdateSelectionOperation implements WondOperation {
  targetSelectionNodeIds: Set<string> = new Set();
  originSelectionNodeIds: Set<string> = new Set();

  constructor(selectedNodes: Set<string>) {
    this.targetSelectionNodeIds = selectedNodes;
  }

  execute = (sceneGraph: WondSceneGraph) => {
    this.originSelectionNodeIds = new Set(sceneGraph.getSelections());
    for (const nodeId of this.targetSelectionNodeIds) {
      if (!this.originSelectionNodeIds.has(nodeId)) {
        sceneGraph.addSelection(nodeId);
      }
    }

    for (const nodeId of this.originSelectionNodeIds) {
      if (!this.targetSelectionNodeIds.has(nodeId)) {
        sceneGraph.deleteSelection(nodeId);
      }
    }
  };

  undo = (sceneGraph: WondSceneGraph) => {
    for (const nodeId of this.originSelectionNodeIds) {
      if (!this.targetSelectionNodeIds.has(nodeId)) {
        sceneGraph.addSelection(nodeId);
      }
    }

    for (const nodeId of this.targetSelectionNodeIds) {
      if (!this.originSelectionNodeIds.has(nodeId)) {
        sceneGraph.deleteSelection(nodeId);
      }
    }
  };

  getDirtyBoundingArea(): WondBoundingArea {
    return ZERO_BOUNDING_AREA;
  }
}
