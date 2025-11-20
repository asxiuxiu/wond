export type SetterType = 'position' | 'layout' | 'appearance' | 'fill';

export interface ISetter {
  type: SetterType;
  title: string;
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
