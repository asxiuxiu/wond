import CanvasKitInit from 'canvaskit-wasm';
import { WondEditor, type WondEditorOptions } from './editor';

async function convertFontDataToArrayBuffers(fontDataArray: FontData[]) {
  try {
    const arrayBuffers = await Promise.all(
      fontDataArray.map(async (fontData) => {
        const blob = await fontData.blob();
        return await blob.arrayBuffer();
      }),
    );

    return arrayBuffers;
  } catch (error) {
    console.error('转换失败:', error);
    throw error;
  }
}

export const initWondEditor = async (options: WondEditorOptions): Promise<WondEditor> => {
  if (window.canvaskit_context) {
    return WondEditor._createInstance(options);
  }

  const initCanvasKit = CanvasKitInit();

  const initFont = window.queryLocalFonts();

  const [canvasKit, fontDatas] = await Promise.all([initCanvasKit, initFont]);

  const arrayBuffers = await convertFontDataToArrayBuffers(fontDatas);
  console.log(`成功转换 ${arrayBuffers.length} 个字体`);

  window.canvaskit_context = {
    canvaskit: canvasKit,
    fontMgr: canvasKit.FontMgr.FromData(...arrayBuffers)!,
  };

  return WondEditor._createInstance(options);
};
