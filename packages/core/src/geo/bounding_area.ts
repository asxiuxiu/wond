import type { IWondPoint, IBoundingArea } from '../interfaces';

export class WondBoundingArea implements IBoundingArea {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(left: number = 0, right: number = 0, top: number = 0, bottom: number = 0) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  set(left: number, right: number, top: number, bottom: number) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  union(area: IBoundingArea): IBoundingArea {
    const left = Math.min(this.left, area.left);
    const right = Math.max(this.right, area.right);
    const top = Math.min(this.top, area.top);
    const bottom = Math.max(this.bottom, area.bottom);
    return new WondBoundingArea(left, right, top, bottom);
  }

  intersect(area: IBoundingArea): IBoundingArea {
    const left = Math.max(this.left, area.left);
    const right = Math.min(this.right, area.right);
    const top = Math.max(this.top, area.top);
    const bottom = Math.min(this.bottom, area.bottom);
    return new WondBoundingArea(left, right, top, bottom);
  }

  containsPoint(point: IWondPoint) {
    return this.left <= point.x && this.right >= point.x && this.top <= point.y && this.bottom >= point.y;
  }

  contains(area: IBoundingArea): boolean {
    return this.left <= area.left && this.right >= area.right && this.top <= area.top && this.bottom >= area.bottom;
  }

  isEmpty() {
    return this.left >= this.right || this.top >= this.bottom;
  }

  getWidth() {
    return this.right - this.left;
  }

  getHeight() {
    return this.bottom - this.top;
  }

  getArea() {
    return (this.right - this.left) * (this.bottom - this.top);
  }

  getCenter() {
    return { x: (this.left + this.right) / 2, y: (this.top + this.bottom) / 2 };
  }
}
