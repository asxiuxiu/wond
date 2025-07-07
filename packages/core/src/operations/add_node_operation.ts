import { WondGraphics } from '../graphics/graphics';
import { type WondOperation } from './operation_base';
import { WondDocument } from '../graphics/document';
import { SceneGraph } from '../scene_graph';
import { WondBoundingArea } from '../geo/bounding_area';

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
      if (Array.isArray(currentDepthNode.children)) {
        const newTargetDepthNode = currentDepthNode.children[this.coordinates[i]];
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

  execute = (sceneGraph: SceneGraph) => {
    const targetCoordinatesParentNode = this.getCoordinatesParentNode(sceneGraph.getRootNode());
    if (!targetCoordinatesParentNode) {
      return;
    }

    if (Array.isArray(targetCoordinatesParentNode.children)) {
      targetCoordinatesParentNode.children.splice(this.coordinates[this.coordinates.length - 1], 0, this.newNode);
    }
  };

  undo = (sceneGraph: SceneGraph) => {
    const targetCoordinatesParentNode = this.getCoordinatesParentNode(sceneGraph.getRootNode());
    if (!targetCoordinatesParentNode) {
      return;
    }

    if (Array.isArray(targetCoordinatesParentNode.children)) {
      targetCoordinatesParentNode.children = targetCoordinatesParentNode.children.filter(
        (item) => item !== this.newNode,
      );
    }
  };

  getDirtyBoundingArea(): WondBoundingArea {
    return this.newNode.getBoundingArea();
  }
}
