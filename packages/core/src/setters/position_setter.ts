import type { IGraphics } from 'packages/core/dist';
import type { IGraphicsAttrs, IInternalAPI, IPositionProperty, IPositionSetter, SetterType } from '../interfaces';
import { getGraphicsPositionProperty } from '../utils';

export class PositionSetter implements IPositionSetter {
  type: SetterType = 'position';
  title = 'Position';
  private _mixed: Set<keyof IPositionProperty> = new Set();
  private refGraphics: IGraphics<IGraphicsAttrs>[];
  private readonly internalAPI: IInternalAPI;

  get mixed(): ReadonlySet<keyof IPositionProperty> {
    return this._mixed;
  }

  x: number = 0;
  y: number = 0;
  rotation: number = 0;

  constructor(internalAPI: IInternalAPI, refGraphics: IGraphics<IGraphicsAttrs>[]) {
    this.internalAPI = internalAPI;
    this.refGraphics = refGraphics;
    if (this.refGraphics.length > 1) {
      this._mixed.add('x');
      this._mixed.add('y');
      this._mixed.add('rotation');
    }
    this.calculateProperty();
  }

  private calculateProperty() {
    if (this.refGraphics.length === 1) {
      const graphic = this.refGraphics[0];
      const { x, y, rotation } = getGraphicsPositionProperty(graphic);
      this.x = x;
      this.y = y;
      this.rotation = rotation;
    } else if (this.refGraphics.length > 1) {
      const positionProperties = this.refGraphics.map((g) => getGraphicsPositionProperty(g));
      const first = positionProperties[0];
      const allSameX = positionProperties.every((prop) => prop.x === first.x);
      const allSameY = positionProperties.every((prop) => prop.y === first.y);
      const allSameRotation = positionProperties.every((prop) => prop.rotation === first.rotation);

      if (allSameX) {
        this.x = first.x;
        this._mixed.delete('x');
      } else {
        this._mixed.add('x');
      }

      if (allSameY) {
        this.y = first.y;
        this._mixed.delete('y');
      } else {
        this._mixed.add('y');
      }

      if (allSameRotation) {
        this.rotation = first.rotation;
        this._mixed.delete('rotation');
      } else {
        this._mixed.add('rotation');
      }
    }
  }

  setX(x: number): void {}

  setY(y: number): void {}

  setRotation(rotation: number): void {}

  rotate90(): void {
    throw new Error('Method not implemented.');
  }

  flipHorizontal(): void {
    throw new Error('Method not implemented.');
  }

  flipVertical(): void {
    throw new Error('Method not implemented.');
  }
}
