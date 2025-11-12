import type { CanvasKit, FontMgr } from 'canvaskit-wasm';

declare global {
  interface QueryLocalFontsOptions {
    postscriptNames?: string[];
  }

  interface FontData {
    readonly family: string;
    readonly fullName: string;
    readonly postscriptName: string;
    readonly style: string;
    blob(): Promise<Blob>;
  }

  interface Window {
    canvaskit_context: {
      canvaskit: CanvasKit;
      fontMgr: FontMgr;
    };
    queryLocalFonts(options?: QueryLocalFontsOptions): Promise<FontData[]>;
  }
}
