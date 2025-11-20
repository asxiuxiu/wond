import type { ISetter } from './isetter';

export interface ISetterManager {
  getSetters(): ISetter[];
}
