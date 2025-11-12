import type { IWondCursor } from '../cursor_manager/cursor_manager';

export interface ICursorManager {
  setCursor(cursor: IWondCursor): void;
}
