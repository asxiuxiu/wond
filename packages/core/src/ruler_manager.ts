import type { IInternalAPI, IRulerManager } from './interfaces';

const STEPS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
const RULER_SIZE = 20;

export class WondRulerManager implements IRulerManager {
  internalAPI: IInternalAPI;

  constructor(internalAPI: IInternalAPI) {
    this.internalAPI = internalAPI;
  }

  public getRulerStep() {
    const zoom = this.internalAPI.getCoordinateManager().getViewSpaceMeta().zoom;
    const step = 50 / zoom;
    for (let i = 0; i < STEPS.length; i++) {
      if (STEPS[i] >= step) {
        return STEPS[i];
      }
    }
    return STEPS[0];
  }

  public getRulerSize() {
    return RULER_SIZE;
  }
}
