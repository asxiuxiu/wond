import type { IWondEdge } from '../interfaces';

export const calculateEdgeAngle = (edge: IWondEdge) => {
  const dx = edge.end.x - edge.start.x;
  const dy = edge.end.y - edge.start.y;
  return Math.atan2(dy, dx);
};

export const getEdgeVectors = (edge: IWondEdge) => {
  const dx = edge.end.x - edge.start.x;
  const dy = edge.end.y - edge.start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  const directionVector = {
    x: dx / length,
    y: dy / length,
  };

  const perpVector = {
    x: -dy / length,
    y: dx / length,
  };

  return { directionVector, perpVector, length };
};
