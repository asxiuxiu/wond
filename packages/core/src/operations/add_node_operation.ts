import { type WondGraphics } from '../graphics/graphics';
import { type WondOperation } from './operation_base';
import { WondDocument } from '../graphics/document';
import { WondSceneGraph } from '../scene_graph';
import { WondBoundingArea } from '../geo';

export class WondAddNodeOperation implements WondOperation {
  coordinates: number[];
  newNode: WondGraphics;

  constructor(coordinates: number[], newNode: WondGraphics) {
    if (coordinates.length === 0) {
      console.warn('[WondAddOperation:constructor] coordinates length is 0, this operation will be invalid');
    }
    this.coordinates = coordinates;
    this.newNode = newNode;
  }

  private getCoordinatesParentNode = (rootNode: WondDocument): WondGraphics | null => {
    let currentDepthNode: WondGraphics = rootNode;
    let i = 0;
    while (i < this.coordinates.length - 1) {
      if (Array.isArray(currentDepthNode.attrs.children)) {
        const newTargetDepthNode = currentDepthNode.attrs.children[this.coordinates[i]];
        if (newTargetDepthNode) {
          currentDepthNode = newTargetDepthNode;
          i++;
        } else {
          console.warn('[WondAddOperation:execute] newTargetDepthNode is undefined, this operation will be invalid');
          return null;
        }
      }
    }
    return currentDepthNode;
  };

  execute = (sceneGraph: WondSceneGraph) => {
    const targetCoordinatesParentNode = this.getCoordinatesParentNode(sceneGraph.getRootNode());
    if (!targetCoordinatesParentNode) {
      return;
    }

    if (Array.isArray(targetCoordinatesParentNode.attrs.children)) {
      targetCoordinatesParentNode.attrs.children.splice(this.coordinates[this.coordinates.length - 1], 0, this.newNode);
      targetCoordinatesParentNode.attrs = {
        ...targetCoordinatesParentNode.attrs,
        children: [...targetCoordinatesParentNode.attrs.children],
      };

      this.newNode.parentId = targetCoordinatesParentNode.attrs.id;
      sceneGraph.registerNode(this.newNode);
      sceneGraph.insertNodeIntoRTree(this.newNode);
    }
  };

  undo = (sceneGraph: WondSceneGraph) => {
    const targetCoordinatesParentNode = this.getCoordinatesParentNode(sceneGraph.getRootNode());
    if (!targetCoordinatesParentNode) {
      console.warn('[WondAddOperation:undo] targetCoordinatesParentNode is undefined, this operation will be invalid');
      return;
    }

    if (Array.isArray(targetCoordinatesParentNode.attrs.children)) {
      const newChildren = targetCoordinatesParentNode.attrs.children.filter((item) => item !== this.newNode);
      targetCoordinatesParentNode.attrs = { ...targetCoordinatesParentNode.attrs, children: newChildren };
    }

    sceneGraph.unregisterNode(this.newNode);
    sceneGraph.removeNodeFromRTree(this.newNode);
  };

  getDirtyBoundingArea(): WondBoundingArea {
    return this.newNode.getBoundingArea();
  }
}
