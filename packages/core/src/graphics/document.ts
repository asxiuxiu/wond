import { GraphicsAttrs, GraphicsType, WondGraphics } from './graphics';

type WondDocumentAttrs = GraphicsAttrs;

export class WondDocument extends WondGraphics<WondDocumentAttrs> {
  constructor(attrs: Omit<WondDocumentAttrs, 'id' | 'transform' | 'type'>) {
    super({
      ...attrs,
      type: GraphicsType.Document,
      transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    });
  }
}
