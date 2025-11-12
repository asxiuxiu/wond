import './cursor.css';

import { isEqual } from '@wond/common';
import type { IInternalAPI } from '../interfaces';
import { normalizeDegree } from '../geo/angle';
import { getIconSvgDataUrl } from './util';
import type { ICursorManager } from '../interfaces';

export type IWondCursor =
  | 'default'
  | 'grab'
  | { type: 'resize'; degree: number }
  | { type: 'rotation'; degree: number }
  | 'crosshair';

export class WondCursorManager implements ICursorManager {
  private hostElement: HTMLCanvasElement;
  private cursor: IWondCursor | null = null;

  constructor(internalAPI: IInternalAPI) {
    this.hostElement = internalAPI.getCanvasRootElement();
    this.setCursor('default');
  }

  setCursor = (cursor: IWondCursor) => {
    cursor = this.normalizeCursor(cursor);
    if (isEqual(this.cursor, cursor)) {
      return;
    }

    this.cursor = cursor;

    const cursorClsPrefix = 'wond-cursor-';
    const canvasElement = this.hostElement;
    canvasElement.classList.forEach((cls) => {
      if (cls.startsWith(cursorClsPrefix)) {
        canvasElement.classList.remove(cls);
      }
    });
    canvasElement.style.cursor = '';

    if (typeof cursor === 'object' && (cursor.type == 'resize' || cursor.type == 'rotation')) {
      canvasElement.style.cursor = getIconSvgDataUrl(cursor.type, cursor.degree);
    } else if (typeof cursor === 'string') {
      canvasElement.classList.add(`${cursorClsPrefix}${cursor}`);
    } else {
      console.log('[WondCursorManager:setCursor] unknown cursor type', cursor);
    }
  };

  private normalizeCursor = (cursor: IWondCursor) => {
    if (typeof cursor === 'string') {
      return cursor;
    }

    if (cursor.type === 'resize') {
      cursor.degree = normalizeDegree(cursor.degree) % 180;
    }

    if (cursor.type === 'rotation') {
      cursor.degree = normalizeDegree(Math.round(cursor.degree));
    }

    return cursor;
  };
}
