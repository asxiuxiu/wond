import {
  type IGraphicsAttrs,
  type IInternalAPI,
  type IWondControlPoint,
  type IControlPointManager,
  type IGraphics,
  WondControlPointType,
} from '../interfaces';
import { CornerResizeControlPoint, EdgeResizeControlPoint } from './control_points';

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
    if (this.controlPointSource.length === 0) {
      this.controlPoints = [];
    } else if (this.controlPointSource.length === 1) {
      this.controlPoints = this.controlPointSource[0].getControlPoints();
    } else if (this.controlPointSource.length > 1) {
      // calculate the the control points by bounding area.
      const N_Resize_CP = new EdgeResizeControlPoint([...this.controlPointSource], WondControlPointType.N_Resize);
      const S_Resize_CP = new EdgeResizeControlPoint([...this.controlPointSource], WondControlPointType.S_Resize);
      const E_Resize_CP = new EdgeResizeControlPoint([...this.controlPointSource], WondControlPointType.E_Resize);
      const W_Resize_CP = new EdgeResizeControlPoint([...this.controlPointSource], WondControlPointType.W_Resize);

      const NW_Resize_CP = new CornerResizeControlPoint([...this.controlPointSource], WondControlPointType.NW_Resize);
      const NE_Resize_CP = new CornerResizeControlPoint([...this.controlPointSource], WondControlPointType.NE_Resize);
      const SW_Resize_CP = new CornerResizeControlPoint([...this.controlPointSource], WondControlPointType.SW_Resize);
      const SE_Resize_CP = new CornerResizeControlPoint([...this.controlPointSource], WondControlPointType.SE_Resize);

      this.controlPoints = [
        N_Resize_CP,
        S_Resize_CP,
        E_Resize_CP,
        W_Resize_CP,
        NW_Resize_CP,
        NE_Resize_CP,
        SW_Resize_CP,
        SE_Resize_CP,
      ];
    }
  };

  clear() {
    this.internalAPI.off('onSelectionChange', this.refreshControlPoints);
  }

  public getControlPoints(): IWondControlPoint<IGraphicsAttrs>[] {
    return this.controlPoints;
  }
}
