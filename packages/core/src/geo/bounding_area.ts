export class WondBoundingArea {
    left: number;
    right: number;
    top: number;
    bottom: number;

    constructor(left: number, right: number, top: number, bottom: number) {
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
    }

    union(area: WondBoundingArea) {
        this.left = Math.min(this.left, area.left);
        this.right = Math.max(this.right, area.right);
        this.top = Math.min(this.top, area.top);
        this.bottom = Math.max(this.bottom, area.bottom);
    }

    intersect(area: WondBoundingArea) {
        this.left = Math.max(this.left, area.left);
        this.right = Math.min(this.right, area.right);
        this.top = Math.max(this.top, area.top);
        this.bottom = Math.min(this.bottom, area.bottom);
    }

    contains(area: WondBoundingArea) {
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