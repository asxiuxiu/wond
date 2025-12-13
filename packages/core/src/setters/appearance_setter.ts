import { EventEmitter, isEqual, floatEqual } from '@wond/common';
import type {
  IAppearanceProperty,
  IAppearanceSetter,
  ICommand,
  IGraphics,
  IGraphicsAttrs,
  IInternalAPI,
  ISetterEvent,
  ISetterInternal,
  SetterType,
} from '../interfaces';
import { WondUpdatePropertyOperation } from '../operations';

interface IAppearanceSetterEvent extends ISetterEvent {}

export class AppearanceSetter implements IAppearanceSetter, ISetterInternal {
  private readonly eventEmitter = new EventEmitter<IAppearanceSetterEvent>();
  type: SetterType = 'appearance';
  title = 'Appearance';
  private _mixed: Set<keyof IAppearanceProperty> = new Set();
  private refGraphics: IGraphics<IGraphicsAttrs>[];
  private readonly internalAPI: IInternalAPI;
  private command: ICommand | null = null;

  constructor(internalAPI: IInternalAPI, refGraphics: IGraphics<IGraphicsAttrs>[]) {
    this.internalAPI = internalAPI;
    this.refGraphics = refGraphics;
    this.calculateProperty();
  }

  visible: boolean = true;
  opacity: number = 1;

  get mixed(): ReadonlySet<keyof IAppearanceProperty> {
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

  setVisible(visible: boolean): void {
    if (this.refGraphics.length === 0) return;
    for (const graphic of this.refGraphics) {
      if (graphic.attrs.visible === visible) continue;
      this.getCommand(this.internalAPI).addOperations([
        new WondUpdatePropertyOperation(graphic, {
          visible: visible,
        }),
      ]);
    }
    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  setOpacity(opacity: number): void {
    if (this.refGraphics.length === 0) return;
    for (const graphic of this.refGraphics) {
      if (graphic.attrs.opacity === opacity) continue;
      this.getCommand(this.internalAPI).addOperations([new WondUpdatePropertyOperation(graphic, { opacity: opacity })]);
    }

    this.getCommand(this.internalAPI).complete();
    this.command = null;
  }

  public onNodePropertyChange<ATTRS extends IGraphicsAttrs>(nodeId: string, newProperty: Partial<ATTRS>): void {
    if (this.refGraphics.some((g) => g.attrs.id === nodeId)) {
      if ('visible' in newProperty || 'opacity' in newProperty) {
        this.calculateProperty();
      }
    }
  }

  private calculateProperty() {
    if (this.refGraphics.length === 1) {
      const graphic = this.refGraphics[0];
      this.visible = graphic.attrs.visible;
      this.opacity = graphic.attrs.opacity;
    } else if (this.refGraphics.length > 1) {
      const properties = this.refGraphics.map((g) => ({
        visible: g.attrs.visible,
        opacity: g.attrs.opacity,
      }));
      const first = properties[0];
      const allSameVisible = properties.every((prop) => isEqual(prop.visible, first.visible));
      const allSameOpacity = properties.every((prop) => floatEqual(prop.opacity, first.opacity));

      if (allSameVisible) {
        this.visible = first.visible;
        this._mixed.delete('visible');
      } else {
        this._mixed.add('visible');
      }

      if (allSameOpacity) {
        this.opacity = first.opacity;
        this._mixed.delete('opacity');
      } else {
        this._mixed.add('opacity');
      }
    }

    this.eventEmitter.emit('onDirty');
  }

  public on<T extends keyof IAppearanceSetterEvent>(event: T, callback: IAppearanceSetterEvent[T]): void {
    this.eventEmitter.on(event, callback);
  }

  public off<T extends keyof IAppearanceSetterEvent>(event: T, callback: IAppearanceSetterEvent[T]): void {
    this.eventEmitter.off(event, callback);
  }
}
