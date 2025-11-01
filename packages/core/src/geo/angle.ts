export const rad2deg = (rad: number) => {
  return rad * (180 / Math.PI);
};

export const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

/**
 * normalize degree, make it in [0, 360)
 */
export const normalizeDegree = (degree: number): number => {
  degree = degree % 360;
  if (degree < 0) {
    degree += 360;
  }
  return degree;
};
