import { WondOperation } from './operation_base';
import type { ISceneGraph, IGraphics } from '../interfaces';

export class WondAddNodeOperation extends WondOperation {
  coordinates: number[];
  newNode: IGraphics;

  constructor(coordinates: number[], newNode: IGraphics) {
    super();
    if (coordinates.length === 0) {
      console.warn('[WondAddOperation:constructor] coordinates length is 0, this operation will be invalid');
    }
    this.coordinates = coordinates;
    this.newNode = newNode;
  }

  execute = (sceneGraph: ISceneGraph): void => {
    sceneGraph.addNodeByCoordinates(this.coordinates, this.newNode);
  };

  undo = (sceneGraph: ISceneGraph): void => {
    sceneGraph.removeNodeByCoordinates(this.coordinates);
  };
}
