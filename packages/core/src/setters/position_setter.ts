import type { IGraphics } from 'packages/core/dist';
import type {
  ICommand,
  IGraphicsAttrs,
  IInternalAPI,
  IPositionProperty,
  IPositionSetter,
  ISetterEvent,
  ISetterInternal,
  SetterType,
} from '../interfaces';
import { getGraphicsBoundingArea, getGraphicsBoundingCenter, getGraphicsPositionProperty } from '../utils';
import { EventEmitter, floatEqual } from '@wond/common';
import { compose, flipX, flipY, rotateDEG, translate } from 'transformation-matrix';
import { WondUpdatePropertyOperation } from '../operations';

interface IPositionSetterEvent extends ISetterEvent {}

export class PositionSetter implements IPositionSetter, ISetterInternal {
  private readonly eventEmitter = new EventEmitter<IPositionSetterEvent>();
  type: SetterType = 'position';
  title = 'Position';
  private _mixed: Set<keyof IPositionProperty> = new Set();
  private refGraphics: IGraphics<IGraphicsAttrs>[];
  private readonly internalAPI: IInternalAPI;
  private command: ICommand | null = null;

  get mixed(): ReadonlySet<keyof IPositionProperty> {
    return this._mixed;
  }

  x: number = 0;
  y: number = 0;
  rotation: number = 0;

  constructor(internalAPI: IInternalAPI, refGraphics: IGraphics<IGraphicsAttrs>[]) {
    this.internalAPI = internalAPI;
    this.refGraphics = refGraphics;
    this.calculateProperty();
  }

  private getCommand(internalAPI: IInternalAPI) {
    if (!this.command) {
      3;
      this.command = internalAPI.getCommandManager().createCommand();
      internalAPI.getCommandManager().executeCommand(this.command);
    }

    return this.command;
  }

  public on<T extends keyof IPositionSetterEvent>(event: T, callback: IPositionSetterEvent[T]): void {
    this.eventEmitter.on(event, callback);
  }

  public off<T extends keyof IPositionSetterEvent>(event: T, callback: IPositionSetterEvent[T]): void {
    this.eventEmitter.off(event, callback);
  }

  public onNodePropertyChange<ATTRS extends IGraphicsAttrs>(nodeId: string, newProperty: Partial<ATTRS>): void {
    if (this.refGraphics.some((g) => g.attrs.id === nodeId)) {
      if ('size' in newProperty || 'transform' in newProperty) {
        this.calculateProperty();
      }
    }
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
      const allSameX = positionProperties.every((prop) => floatEqual(prop.x, first.x));
      const allSameY = positionProperties.every((prop) => floatEqual(prop.y, first.y));
      const allSameRotation = positionProperties.every((prop) => floatEqual(prop.rotation, first.rotation));

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

    this.eventEmitter.emit('onDirty');
  }

  setX(x: number): void {
    if (this.refGraphics.length === 0) {
      return;
    }
    if (this.refGraphics.length === 1) {
      const graphic = this.refGraphics[0];
      const originX = this.x;
      const newTransform = compose([translate(x - originX, 0), graphic.attrs.transform]);
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
      ]);
      this.getCommand(this.internalAPI).complete();
      this.command = null;
    } else {
      for (const graphic of this.refGraphics) {
        const { x: originX } = getGraphicsPositionProperty(graphic);
        const newTransform = compose([translate(x - originX, 0), graphic.attrs.transform]);
        this.getCommand(this.internalAPI).addOperations([
          new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
        ]);
      }
      this.getCommand(this.internalAPI).complete();
      this.command = null;
    }
  }

  setY(y: number): void {
    if (this.refGraphics.length === 0) {
      return;
    }
    if (this.refGraphics.length === 1) {
      const graphic = this.refGraphics[0];
      const originY = this.y;
      const newTransform = compose([translate(0, y - originY), graphic.attrs.transform]);
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
      ]);
      this.getCommand(this.internalAPI).complete();
      this.command = null;
    } else {
      for (const graphic of this.refGraphics) {
        const { y: originY } = getGraphicsPositionProperty(graphic);
        const newTransform = compose([translate(0, y - originY), graphic.attrs.transform]);
        this.getCommand(this.internalAPI).addOperations([
          new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
        ]);
      }
      this.getCommand(this.internalAPI).complete();
      this.command = null;
    }
  }

  setRotation(rotation: number): void {
    if (this.refGraphics.length === 0) {
      return;
    }
    if (this.refGraphics.length === 1) {
      const graphic = this.refGraphics[0];
      const originRotationDeg = this.rotation;
      const originBoundingCenter = getGraphicsBoundingCenter(graphic);
      const newTransform = compose([
        translate(originBoundingCenter.x, originBoundingCenter.y),
        rotateDEG(rotation - originRotationDeg),
        translate(-originBoundingCenter.x, -originBoundingCenter.y),
        graphic.attrs.transform,
      ]);
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
      ]);
      this.getCommand(this.internalAPI).complete();
      this.command = null;
    } else {
      for (const graphic of this.refGraphics) {
        const { rotation: originRotationDeg } = getGraphicsPositionProperty(graphic);
        const originBoundingCenter = getGraphicsBoundingCenter(graphic);
        const newTransform = compose([
          translate(originBoundingCenter.x, originBoundingCenter.y),
          rotateDEG(rotation - originRotationDeg),
          translate(-originBoundingCenter.x, -originBoundingCenter.y),
          graphic.attrs.transform,
        ]);
        this.getCommand(this.internalAPI).addOperations([
          new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
        ]);
      }
      this.getCommand(this.internalAPI).complete();
      this.command = null;
    }
  }

  rotate90(): void {
    if (this.refGraphics.length === 0) {
      return;
    }
    const graphicsBoundingArea = getGraphicsBoundingArea(this.refGraphics);
    if (!graphicsBoundingArea) return;

    const centerX = (graphicsBoundingArea.left + graphicsBoundingArea.right) / 2;
    const centerY = (graphicsBoundingArea.top + graphicsBoundingArea.bottom) / 2;

    for (const graphic of this.refGraphics) {
      const newTransform = compose([
        translate(centerX, centerY),
        rotateDEG(90),
        translate(-centerX, -centerY),
        graphic.attrs.transform,
      ]);
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
      ]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  flipHorizontal(): void {
    if (this.refGraphics.length === 0) return;

    const graphicsBoundingArea = getGraphicsBoundingArea(this.refGraphics);
    if (!graphicsBoundingArea) return;
    const centerX = (graphicsBoundingArea.left + graphicsBoundingArea.right) / 2;
    const centerY = (graphicsBoundingArea.top + graphicsBoundingArea.bottom) / 2;
    for (const graphic of this.refGraphics) {
      const newTransform = compose([
        translate(centerX, centerY),
        flipY(),
        translate(-centerX, -centerY),
        graphic.attrs.transform,
      ]);
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
      ]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  flipVertical(): void {
    if (this.refGraphics.length === 0) return;

    const graphicsBoundingArea = getGraphicsBoundingArea(this.refGraphics);
    if (!graphicsBoundingArea) return;
    const centerX = (graphicsBoundingArea.left + graphicsBoundingArea.right) / 2;
    const centerY = (graphicsBoundingArea.top + graphicsBoundingArea.bottom) / 2;
    for (const graphic of this.refGraphics) {
      const newTransform = compose([
        translate(centerX, centerY),
        flipX(),
        translate(-centerX, -centerY),
        graphic.attrs.transform,
      ]);
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, { transform: newTransform }),
      ]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }
}
