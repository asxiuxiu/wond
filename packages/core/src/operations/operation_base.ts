import { getUuid } from '@wond/common';
import type { IOperation, ISceneGraph } from '../interfaces';

export class WondOperation implements IOperation {
  readonly id: string = getUuid();

  execute = (sceneGraph: ISceneGraph): void => {
    throw new Error('Method not implemented.');
  };
  undo = (sceneGraph: ISceneGraph): void => {
    throw new Error('Method not implemented.');
  };
}
