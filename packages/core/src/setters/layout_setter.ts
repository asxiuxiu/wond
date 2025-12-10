import { EventEmitter, isEqual, floatEqual } from '@wond/common';
import type {
  ICommand,
  IGraphics,
  IGraphicsAttrs,
  IInternalAPI,
  ILayoutProperty,
  ILayoutSetter,
  ISetterEvent,
  ISetterInternal,
  SetterType,
} from '../interfaces';
import { WondUpdatePropertyOperation } from '../operations';

interface ILayoutSetterEvent extends ISetterEvent {}

export class LayoutSetter implements ILayoutSetter, ISetterInternal {
  private readonly eventEmitter = new EventEmitter<ILayoutSetterEvent>();
  type: SetterType = 'layout';
  title = 'Layout';
  private _mixed: Set<keyof ILayoutProperty> = new Set();
  private refGraphics: IGraphics<IGraphicsAttrs>[];
  private readonly internalAPI: IInternalAPI;
  private command: ICommand | null = null;

  constructor(internalAPI: IInternalAPI, refGraphics: IGraphics<IGraphicsAttrs>[]) {
    this.internalAPI = internalAPI;
    this.refGraphics = refGraphics;
    this.calculateProperty();
  }

  width: number = 0;
  height: number = 0;
  isAspectRatioLocked: boolean = false;

  get mixed(): ReadonlySet<keyof ILayoutProperty> {
    return this._mixed;
  }

  private getCommand(internalAPI: IInternalAPI) {
    if (!this.command) {
      3;
      this.command = internalAPI.getCommandManager().createCommand();
      internalAPI.getCommandManager().executeCommand(this.command);
    }

    return this.command;
  }

  setWidth(width: number): void {
    if (this.refGraphics.length === 0) return;
    for (const graphic of this.refGraphics) {
      const newSize = {
        x: width,
        y: graphic.attrs.size.y,
      };
      if (!!graphic.attrs.targetAspectRatio) {
        newSize.y = graphic.attrs.size.y * (width / graphic.attrs.size.x);
      }

      this.getCommand(this.internalAPI).addOperations([new WondUpdatePropertyOperation(graphic, { size: newSize })]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  setHeight(height: number): void {
    if (this.refGraphics.length === 0) return;
    for (const graphic of this.refGraphics) {
      const newSize = {
        x: graphic.attrs.size.x,
        y: height,
      };
      if (!!graphic.attrs.targetAspectRatio) {
        newSize.x = graphic.attrs.size.x * (height / graphic.attrs.size.y);
      }

      this.getCommand(this.internalAPI).addOperations([new WondUpdatePropertyOperation(graphic, { size: newSize })]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  setIsAspectRatioLocked(isAspectRatioLocked: boolean): void {
    if (this.refGraphics.length === 0) return;
    for (const graphic of this.refGraphics) {
      if (!!graphic.attrs.targetAspectRatio === isAspectRatioLocked) continue;
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, {
          targetAspectRatio: isAspectRatioLocked ? { x: graphic.attrs.size.x, y: graphic.attrs.size.y } : undefined,
        }),
      ]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  public onNodePropertyChange<ATTRS extends IGraphicsAttrs>(nodeId: string, newProperty: Partial<ATTRS>): void {
    if (this.refGraphics.some((g) => g.attrs.id === nodeId)) {
      if ('size' in newProperty || 'targetAspectRatio' in newProperty) {
        this.calculateProperty();
      }
    }
  }

  private calculateProperty() {
    if (this.refGraphics.length === 1) {
      const graphic = this.refGraphics[0];
      this.width = graphic.attrs.size.x;
      this.height = graphic.attrs.size.y;
      this.isAspectRatioLocked = !!graphic.attrs.targetAspectRatio;
    } else if (this.refGraphics.length > 1) {
      const properties = this.refGraphics.map((g) => ({
        width: g.attrs.size.x,
        height: g.attrs.size.y,
        isAspectRatioLocked: !!g.attrs.targetAspectRatio,
      }));
      const first = properties[0];
      const allSameWidth = properties.every((prop) => floatEqual(prop.width, first.width));
      const allSameHeight = properties.every((prop) => floatEqual(prop.height, first.height));
      const allSameIsAspectRatioLocked = properties.every((prop) =>
        isEqual(prop.isAspectRatioLocked, first.isAspectRatioLocked),
      );

      if (allSameWidth) {
        this.width = first.width;
        this._mixed.delete('width');
      } else {
        this._mixed.add('width');
      }

      if (allSameHeight) {
        this.height = first.height;
        this._mixed.delete('height');
      } else {
        this._mixed.add('height');
      }

      if (allSameIsAspectRatioLocked) {
        this.isAspectRatioLocked = first.isAspectRatioLocked;
        this._mixed.delete('isAspectRatioLocked');
      } else {
        this._mixed.add('isAspectRatioLocked');
      }
    }

    this.eventEmitter.emit('onDirty');
  }

  public on<T extends keyof ILayoutSetterEvent>(event: T, callback: ILayoutSetterEvent[T]): void {
    this.eventEmitter.on(event, callback);
  }

  public off<T extends keyof ILayoutSetterEvent>(event: T, callback: ILayoutSetterEvent[T]): void {
    this.eventEmitter.off(event, callback);
  }
}
