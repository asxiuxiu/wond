import type { WondGraphics, WondGraphicsAttrs } from '../graphics';
import type { IWondInternalAPI } from '../editor';
import type { IWondControlPoint } from './types';

export class WondControlPointManager {
  private readonly internalAPI: IWondInternalAPI;
  private controlPointSource: WondGraphics[] = [];
  private controlPoints: IWondControlPoint<WondGraphicsAttrs>[] = [];

  constructor(internalAPI: IWondInternalAPI) {
    this.internalAPI = internalAPI;
    this.internalAPI.on('onSelectionChange', this.refreshControlPoints);
  }

  private refreshControlPoints = (selectedNodeSet: Set<string>) => {
    if (this.controlPointSource.length === 1) {
      this.controlPointSource[0].clearControlPoints();
    }
    this.controlPointSource = Array.from(selectedNodeSet)
      .map((id) => this.internalAPI.getSceneGraph().getNodeById(id))
      .filter((node) => node !== undefined);
    this.controlPoints = [];
  };

  clear() {
    this.internalAPI.off('onSelectionChange', this.refreshControlPoints);
  }

  public getControlPoints(): IWondControlPoint<WondGraphicsAttrs>[] {
    if (this.controlPointSource.length === 0) {
      this.controlPointSource = [];
    } else if (this.controlPointSource.length === 1) {
      this.controlPoints = this.controlPointSource[0].getControlPoints();
    } else if (this.controlPointSource.length > 1) {
      // calculate the the control points by bounding area.
    }

    return this.controlPoints;
  }
}
