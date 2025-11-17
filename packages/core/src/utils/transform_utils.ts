import type { Matrix3x3 } from 'canvaskit-wasm';
import { type Matrix } from 'transformation-matrix';

/**
 * Convert transformation matrix to CanvasKit Matrix3x3 format
 */
export const getMatrix3x3FromTransform = (transform: Matrix): Matrix3x3 => {
  return Float32Array.from([transform.a, transform.c, transform.e, transform.b, transform.d, transform.f, 0, 0, 1]);
};

export const isAxisAlignedAfterTransform = (matrix: Matrix): boolean => {
  const { a, b, c, d } = matrix;
  const epsilon = Number.EPSILON;

  const isVector1AxisAligned =
    (Math.abs(b) < epsilon && Math.abs(a) > epsilon) || (Math.abs(a) < epsilon && Math.abs(b) > epsilon);

  const isVector2AxisAligned =
    (Math.abs(d) < epsilon && Math.abs(c) > epsilon) || (Math.abs(c) < epsilon && Math.abs(d) > epsilon);

  const dot = a * c + b * d;
  const isPerpendicular = Math.abs(dot) < epsilon;

  return isVector1AxisAligned && isVector2AxisAligned && isPerpendicular;
};
