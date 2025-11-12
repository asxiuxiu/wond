import type { IGraphicsAttrs, IGraphics, ISceneGraph } from '../interfaces';
import { WondOperation } from './operation_base';

export class WondUpdatePropertyOperation<ATTRS extends IGraphicsAttrs> extends WondOperation {
  targetNodeId: string;
  newProperty: Partial<ATTRS>;
  oldProperty: ATTRS;

  constructor(targetNode: IGraphics<ATTRS>, newProperty: Partial<ATTRS>) {
    super();
    this.targetNodeId = targetNode.attrs.id;
    this.newProperty = newProperty;
    this.oldProperty = { ...targetNode.attrs };
  }

  execute = (sceneGraph: ISceneGraph): void => {
    const node = sceneGraph.getNodeById(this.targetNodeId);
    if (!node) {
      console.warn('[WondUpdatePropertyOperation:execute] target node not found for nodeId', this.targetNodeId);
      return;
    }

    sceneGraph.updateNodeProperty(this.targetNodeId, this.newProperty);
  };

  undo = (sceneGraph: ISceneGraph): void => {
    const node = sceneGraph.getNodeById(this.targetNodeId);
    if (!node) {
      console.warn('[WondUpdatePropertyOperation:undo] target node not found for nodeId', this.targetNodeId);
      return;
    }

    sceneGraph.updateNodeProperty(this.targetNodeId, this.oldProperty);
  };
}
