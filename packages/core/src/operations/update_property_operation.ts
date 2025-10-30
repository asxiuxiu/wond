import { type WondGraphics, type WondGraphicsAttrs } from '../graphics/graphics';
import { WondOperation } from './operation_base';
import { WondSceneGraph } from '../scene_graph';
import { WondBoundingArea } from '../geo';
import { ZERO_BOUNDING_AREA } from '../constants';

export class WondUpdatePropertyOperation<ATTRS extends WondGraphicsAttrs> extends WondOperation {
  targetNode: WondGraphics<ATTRS>;
  newProperty: Partial<ATTRS>;
  oldProperty: ATTRS;

  newPropertyBoundingArea: WondBoundingArea | null = null;
  oldPropertyBoundingArea: WondBoundingArea | null = null;

  constructor(targetNode: WondGraphics<ATTRS>, newProperty: Partial<ATTRS>) {
    super();
    this.targetNode = targetNode;
    this.newProperty = newProperty;
    this.oldProperty = { ...targetNode.attrs };
    this.oldPropertyBoundingArea = targetNode.getBoundingArea();
  }

  execute = (sceneGraph: WondSceneGraph) => {
    sceneGraph.removeNodeFromRTree(this.targetNode);
    this.targetNode.attrs = { ...this.targetNode.attrs, ...this.newProperty };
    this.newPropertyBoundingArea = this.targetNode.getBoundingArea();
    sceneGraph.throttleMarkLayerTreeDirty();

    sceneGraph.insertNodeIntoRTree(this.targetNode);
  };

  undo = (sceneGraph: WondSceneGraph) => {
    sceneGraph.removeNodeFromRTree(this.targetNode);
    this.targetNode.attrs = { ...this.oldProperty };
    sceneGraph.throttleMarkLayerTreeDirty();

    sceneGraph.insertNodeIntoRTree(this.targetNode);
  };

  getDirtyBoundingArea = (): WondBoundingArea => {
    if (this.newPropertyBoundingArea && this.oldPropertyBoundingArea) {
      return this.newPropertyBoundingArea.union(this.oldPropertyBoundingArea);
    }
    return ZERO_BOUNDING_AREA;
  };
}
