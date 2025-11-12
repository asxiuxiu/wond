import type { IWondPoint } from '../interfaces';

export const distance = (point1: IWondPoint, point2: IWondPoint) => {
  return Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
};
