import type { IGraphicsAttrs, IInternalAPI, IWondControlPoint, IControlPointManager, IGraphics } from '../interfaces';

export class WondControlPointManager implements IControlPointManager {
  private readonly internalAPI: IInternalAPI;
  private controlPointSource: IGraphics[] = [];
  private controlPoints: IWondControlPoint<IGraphicsAttrs>[] = [];

  constructor(internalAPI: IInternalAPI) {
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

  public getControlPoints(): IWondControlPoint<IGraphicsAttrs>[] {
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
