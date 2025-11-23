import type {
  IGraphicsAttrs,
  IInternalAPI,
  ISetter,
  ISetterCollection,
  ISetterInternal,
  ISetterManager,
} from './interfaces';
import { PositionSetter } from './setters';

export class WondSetterManager implements ISetterManager {
  private setterCollection: ISetterCollection | null = null;
  private readonly internalAPI: IInternalAPI;

  constructor(internalAPI: IInternalAPI) {
    this.internalAPI = internalAPI;
    this.setDocumentSetterCollection();
    this.internalAPI.emitEvent('onSetterCollectionChange', this.setterCollection);
    this.internalAPI.on('onSelectionChange', this.refreshSetters);
  }

  private setDocumentSetterCollection = () => {
    this.setterCollection = {
      name: 'Page',
      setters: [],
    };
  };

  private setNodesSetterCollection = (selectedNodeSet: Set<string>) => {
    if (selectedNodeSet.size === 0) {
      return;
    }

    const selectedNodes = Array.from(selectedNodeSet)
      .map((id) => this.internalAPI.getSceneGraph().getNodeById(id))
      .filter((node) => node !== undefined);

    let name = '';
    if (selectedNodeSet.size === 1) {
      const graphic = selectedNodes[0];
      name = graphic.attrs.type;
    } else {
      name = `${selectedNodeSet.size} selected`;
    }

    const setters: ISetter[] = [];

    setters.push(new PositionSetter(this.internalAPI, selectedNodes));

    this.setterCollection = {
      name: name,
      setters,
    };
  };

  private refreshSetters = (selectedNodeSet: Set<string>) => {
    // this.setterCollection = [];
    if (selectedNodeSet.size === 0) {
      // try add ruler guides.
      // add document setter
      this.setDocumentSetterCollection();
    } else {
      this.setNodesSetterCollection(selectedNodeSet);
    }
    this.internalAPI.emitEvent('onSetterCollectionChange', this.setterCollection);
  };

  public getSetterCollection(): ISetterCollection | null {
    return this.setterCollection;
  }

  public onNodePropertyChange<ATTRS extends IGraphicsAttrs>(nodeId: string, newProperty: Partial<ATTRS>): void {
    if (this.setterCollection == null) {
      return;
    }

    this.setterCollection.setters.forEach((setter) => {
      (setter as ISetterInternal).onNodePropertyChange(nodeId, newProperty);
    });
  }
}
