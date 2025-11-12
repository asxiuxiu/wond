import { WondOperation } from './operation_base';
import type { ISceneGraph } from '../interfaces';

export class WondUpdateSelectionOperation extends WondOperation {
  targetSelectionNodeIds: Set<string> = new Set();
  originSelectionNodeIds: Set<string> = new Set();

  constructor(selectedNodes: Set<string>) {
    super();
    this.targetSelectionNodeIds = selectedNodes;
  }

  execute = (sceneGraph: ISceneGraph): void => {
    this.originSelectionNodeIds = sceneGraph.getSelectionsCopy();
    sceneGraph.updateSelection(this.targetSelectionNodeIds);
  };

  undo = (sceneGraph: ISceneGraph): void => {
    sceneGraph.updateSelection(this.originSelectionNodeIds);
  };
}
