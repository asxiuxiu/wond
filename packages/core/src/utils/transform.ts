import type { Matrix3x3 } from 'canvaskit-wasm';
import { type Matrix } from 'transformation-matrix';

/**
 * Convert transformation matrix to CanvasKit Matrix3x3 format
 */
export const getMatrix3x3FromTransform = (transform: Matrix): Matrix3x3 => {
  return Float32Array.from([transform.a, transform.c, transform.e, transform.b, transform.d, transform.f, 0, 0, 1]);
};
