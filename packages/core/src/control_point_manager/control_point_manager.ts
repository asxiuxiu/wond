import type { IWondInternalAPI } from '../editor';

export class WondControlPointManager {
  private readonly internalAPI: IWondInternalAPI;

  constructor(internalAPI: IWondInternalAPI) {
    this.internalAPI = internalAPI;
    this.internalAPI.on('onSelectionChange', this.collectControlPoints);
  }

  collectControlPoints = (selectedNodeSet: Set<string>) => {
    console.log('collectControlPoints', selectedNodeSet);
  };

  clear() {
    this.internalAPI.off('onSelectionChange', this.collectControlPoints);
  }
}
