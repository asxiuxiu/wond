import type { IInternalAPI, ISetter, ISetterManager } from './interfaces';
import { PositionSetter } from './setters';

export class WondSetterManager implements ISetterManager {
  private setters: ISetter[] = [];
  private readonly internalAPI: IInternalAPI;

  constructor(internalAPI: IInternalAPI) {
    this.internalAPI = internalAPI;
    this.internalAPI.on('onSelectionChange', this.refreshSetters);
  }

  private refreshSetters = (selectedNodeSet: Set<string>) => {
    this.setters = [];
    if (selectedNodeSet.size === 0) {
      // try add ruler guides.
      // add document setter
    } else {
      // add nodes setters.
      const selectedNodes = Array.from(selectedNodeSet)
        .map((id) => this.internalAPI.getSceneGraph().getNodeById(id))
        .filter((node) => node !== undefined);
      this.setters.push(new PositionSetter(this.internalAPI, selectedNodes));
    }
  };

  public getSetters(): ISetter[] {
    return this.setters;
  }
}
