import CanvasKitInit from 'canvaskit-wasm';
import { WondEditor, type WondEditorOptions } from './editor';

export const initWondEditor = async (options: WondEditorOptions): Promise<WondEditor> => {
  if (window.canvaskit_context) {
    return WondEditor._createInstance(options);
  }

  const initCanvasKit = CanvasKitInit();

  const initFont = fetch('https://storage.googleapis.com/skia-cdn/misc/Roboto-Regular.ttf').then((response) =>
    response.arrayBuffer(),
  );

  const [canvasKit, robotoData] = await Promise.all([initCanvasKit, initFont]);
  window.canvaskit_context = {
    canvaskit: canvasKit,
    fontMgr: canvasKit.FontMgr.FromData(robotoData)!,
  };
  
  return WondEditor._createInstance(options);
};
