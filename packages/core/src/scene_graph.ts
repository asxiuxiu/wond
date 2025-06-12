import { WondDocument } from './graphics/document';

export class SceneGraph {
  private rootNode: WondDocument;

  constructor() {
    this.rootNode = new WondDocument({
      name: 'rootPage',
      visible: true,
      children: [],
    });
  }

  getRootNode() {
    return this.rootNode;
  }
}
