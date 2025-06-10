import { WondDocument } from './graphics/document';

export class SceneGraph {
  rootNode: WondDocument;

  constructor() {
    this.rootNode = new WondDocument({
      name: 'rootPage',
      visible: true,
      children: [],
    });
  }
}
