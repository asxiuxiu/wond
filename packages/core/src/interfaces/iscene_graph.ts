import type { BBox } from 'rbush';
import type { IGraphics, IGraphicsAttrs } from './igraphics';
import type { IBoundingArea } from './ibounding_area';
import type { IWondPoint, WondTextMetrics } from './itypes';

export interface ISceneGraph {
  getRootNode(): IGraphics;
  isNodeSelected(nodeId: string): boolean;
  getSelectionsCopy(): Set<string>;
  getSelectionsBoundingArea(): Readonly<IBoundingArea | null>;
  setIsSelectionMoveDragging(isSelectionMoveDragging: boolean): void;
  setSelectionRange(range: BBox | null): void;
  setHoverNode(nodeId: string | null): void;
  getHoverNode(): string | null;
  updateSelection(nodeSet: Set<string>): void;
  getNodeById(id: string): IGraphics | undefined;
  pickNodesAtRange(range: BBox): IGraphics[];
  pickNodeAtPoint(point: IWondPoint): IGraphics | null;

  updateNodeProperty<ATTRS extends IGraphicsAttrs>(
    target: IGraphics<ATTRS> | string | number[],
    newProperty: Partial<ATTRS>,
  ): void;
  addNodeByCoordinates(coordinates: number[], newNode: IGraphics): void;
  removeNodeByCoordinates(childCoordinates: number[]): void;
}

export interface RulerTextProperty extends WondTextMetrics {
  text: string;
  paintCoords: number;
}
