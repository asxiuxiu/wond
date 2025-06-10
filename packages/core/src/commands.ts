import { WondDocument } from './graphics/document';
import { WondGraphics } from './graphics/graphics';

export class WondOperation {
  execute = (rootNode: WondDocument) => {};
  undo = (rootNode: WondDocument) => {};
}

export class WondAddOperation extends WondOperation {
  coordinates: number[];
  newNode: WondGraphics;

  constructor(coordinates: number[], newNode: WondGraphics) {
    super();
    if (coordinates.length === 0) {
      console.warn(
        '[WondAddOperation:constructor] coordinates length is 0, this operation will be invalid',
      );
    }
    this.coordinates = coordinates;
    this.newNode = newNode;
  }

  private getCoordinatesParentNode = (
    rootNode: WondDocument,
  ): WondGraphics | null => {
    let currentDepthNode = rootNode;
    let i = 0;
    while (i < this.coordinates.length - 1) {
      if (Array.isArray(currentDepthNode.children)) {
        const newTargetDepthNode =
          currentDepthNode.children[this.coordinates[i]];
        if (newTargetDepthNode) {
          currentDepthNode = newTargetDepthNode;
          i++;
        } else {
          console.warn(
            '[WondAddOperation:execute] newTargetDepthNode is undefined, this operation will be invalid',
          );
          return null;
        }
      }
    }
    return currentDepthNode;
  };

  execute = (rootNode: WondDocument) => {
    const targetCoordinatesParentNode = this.getCoordinatesParentNode(rootNode);
    if (!targetCoordinatesParentNode) {
      return;
    }

    if (Array.isArray(targetCoordinatesParentNode.children)) {
      targetCoordinatesParentNode.children.splice(
        this.coordinates[this.coordinates.length - 1],
        0,
        this.newNode,
      );
    }
  };

  undo = (rootNode: WondDocument) => {
    const targetCoordinatesParentNode = this.getCoordinatesParentNode(rootNode);
    if (!targetCoordinatesParentNode) {
      return;
    }

    if (Array.isArray(targetCoordinatesParentNode.children)) {
      targetCoordinatesParentNode.children =
        targetCoordinatesParentNode.children.filter(
          (item) => item !== this.newNode,
        );
    }
  };
}

export class WondCommand {
  public execute = () => {};
  public undo = () => {};
}
