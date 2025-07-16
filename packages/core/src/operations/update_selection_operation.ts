import { WondGraphics } from '../graphics/graphics';
import { type WondOperation } from './operation_base';
import { WondSceneGraph } from '../scene_graph';
import { ZERO_BOUNDING_AREA } from '../constants';
import { WondBoundingArea } from '../geo/bounding_area';

export class WondUpdateSelectionOperation implements WondOperation {
  targetSelectionNodes: WondGraphics[] = [];
  originSelectionNodes: WondGraphics[] = [];

  constructor(selectedNodes: WondGraphics[]) {
    this.targetSelectionNodes = selectedNodes;
  }

  execute = (sceneGraph: WondSceneGraph) => {
    this.originSelectionNodes = sceneGraph.getSelections();
    sceneGraph.clearSelection();
    sceneGraph.addSelections(this.targetSelectionNodes);
  };

  undo = (sceneGraph: WondSceneGraph) => {
    sceneGraph.clearSelection();
    sceneGraph.addSelections(this.originSelectionNodes);
  };

  getDirtyBoundingArea(): WondBoundingArea {
    return ZERO_BOUNDING_AREA;
  }
}
