import type { IGraphicsAttrs } from './igraphics';

export type SetterType = 'position' | 'layout' | 'appearance' | 'fill';

export interface ISetterEvent {
  onDirty(): void;
}

export interface ISetter {
  type: SetterType;
  title: string;
  on<T extends keyof ISetterEvent>(event: T, callback: ISetterEvent[T]): void;
  off<T extends keyof ISetterEvent>(event: T, callback: ISetterEvent[T]): void;
}

export interface ISetterInternal extends ISetter {
  onNodePropertyChange<ATTRS extends IGraphicsAttrs>(nodeId: string, newProperty: Partial<ATTRS>): void;
}

type PropertyAccessors<T> = {
  readonly [K in keyof T]: T[K];
} & {
  [K in keyof T as `set${Capitalize<string & K>}`]: (value: T[K]) => void;
} & {
  mixed: ReadonlySet<keyof T>;
};

export interface IPositionProperty {
  x: number;
  y: number;
  rotation: number;
}

export interface IPositionSetter extends ISetter, PropertyAccessors<IPositionProperty> {
  rotate90(): void;
  flipHorizontal(): void;
  flipVertical(): void;
}
