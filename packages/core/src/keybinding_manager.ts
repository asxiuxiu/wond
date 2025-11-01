import type { IWondInternalAPI } from './editor';

export interface IWondBindingHotkey {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  keyCode: string;
}

export interface IWondKeyBindingWhenContext {}

export interface IWondKeybinding {
  key: IWondBindingHotkey | IWondBindingHotkey[];
  when?: (context: IWondKeyBindingWhenContext) => boolean;
  action: (event: KeyboardEvent) => void;
}

export class WondKeybindingManager {
  // private readonly internalAPI: IWondInternalAPI;

  private readonly keybindingMap = new Map<number, IWondKeybinding>();
  private id = 0;

  constructor(internalAPI: IWondInternalAPI) {
    // this.internalAPI = internalAPI;
    this.bindEvent();
  }

  private generateId() {
    return this.id++;
  }

  registerKeybinding(keybinding: IWondKeybinding) {
    const id = this.generateId();
    this.keybindingMap.set(id, keybinding);
    return id;
  }

  unregisterKeybinding(id: number) {
    this.keybindingMap.delete(id);
  }

  private bindEvent() {
    document.addEventListener('keydown', this.handleAction);
  }

  private handleAction = (event: KeyboardEvent) => {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }
    let isMatch = false;

    const ctx: IWondKeyBindingWhenContext = {};

    for (const keyBinding of this.keybindingMap.values()) {
      if (!keyBinding.when || keyBinding.when(ctx)) {
        if (this.isKeyBindingMatch(keyBinding.key, event)) {
          isMatch = true;
        }
      }

      if (isMatch) {
        event.preventDefault();
        keyBinding.action(event);
        break;
      }
    }
  };

  private isKeyBindingMatch(key: IWondBindingHotkey | IWondBindingHotkey[], event: KeyboardEvent): boolean {
    if (Array.isArray(key)) {
      return key.some((k) => this.isKeyBindingMatch(k, event));
    }

    if (key.keyCode == '*') return true;

    const { ctrlKey = false, shiftKey = false, altKey = false, metaKey = false } = key;

    return (
      ctrlKey == event.ctrlKey &&
      shiftKey == event.shiftKey &&
      altKey == event.altKey &&
      metaKey == event.metaKey &&
      key.keyCode == event.code
    );
  }

  clear() {
    document.removeEventListener('keydown', this.handleAction);
  }
}
