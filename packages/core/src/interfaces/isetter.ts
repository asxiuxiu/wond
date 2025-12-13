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

// position setter
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

// Layout setter
export interface ILayoutProperty {
  width: number;
  height: number;
  isAspectRatioLocked: boolean;
}

export interface ILayoutSetter extends ISetter, PropertyAccessors<ILayoutProperty> {}

// Appearance setter
export interface IAppearanceProperty {
  visible: boolean;
  opacity: number;
}

export interface IAppearanceSetter extends ISetter, PropertyAccessors<IAppearanceProperty> {}
