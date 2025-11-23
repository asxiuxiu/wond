import type { IGraphicsAttrs } from './igraphics';
import type { ISetter } from './isetter';

export interface ISetterCollection {
  name: string;
  setters: ISetter[];
}

export interface ISetterManager {
  getSetterCollection(): ISetterCollection | null;
  onNodePropertyChange<ATTRS extends IGraphicsAttrs>(nodeId: string, newProperty: Partial<ATTRS>): void;
}
