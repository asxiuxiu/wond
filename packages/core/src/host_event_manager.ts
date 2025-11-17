import { EventEmitter } from '@wond/common';
import type { IMouseEvent, IInternalAPI, IHostEventManager } from './interfaces';
import { MouseEventButton } from './interfaces';

interface IHostEvent {
  start(event: IMouseEvent): void;
  move(event: IMouseEvent): void;
  drag(event: IMouseEvent): void;
  end(event: IMouseEvent): void;
  contextmenu(event: IMouseEvent): void;
  wheel(event: IMouseEvent): void;
}

interface EmitEventOptions {
  hotkeyReTrigger?: boolean;
}

const LISTEN_HOTKEY_EVENT_KEYS = ['Shift', 'Control', 'Alt'];

export class WondHostEventManager implements IHostEventManager {
  private readonly hostElement: HTMLCanvasElement;
  private readonly eventEmitter = new EventEmitter<IHostEvent>();

  private cacheHotkeyReTriggerEvent: {
    eventType: keyof IHostEvent;
    eventData: IMouseEvent;
  } | null = null;

  private draggingState: {
    state: boolean;
    button: MouseEventButton | null;
  } = {
    state: false,
    button: null,
  };

  constructor(internalAPI: IInternalAPI) {
    this.hostElement = internalAPI.getCanvasRootElement();
    this.bindEvents();
  }

  private bindEvents() {
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('contextmenu', this.onContextMenu);
    document.addEventListener('wheel', this.onWheel, { passive: false });
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  clear() {
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('contextmenu', this.onContextMenu);
    document.removeEventListener('wheel', this.onWheel);
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('keyup', this.onKeyUp);
  }

  private onKeyDown = (event: KeyboardEvent) => {
    if (this.cacheHotkeyReTriggerEvent == null) {
      return;
    }
    if (LISTEN_HOTKEY_EVENT_KEYS.includes(event.key)) {
      this.emitEvent(
        this.cacheHotkeyReTriggerEvent.eventType,
        {
          hotkeyReTrigger: true,
        },
        {
          ...this.cacheHotkeyReTriggerEvent.eventData,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        },
      );
    }
  };

  private onKeyUp = (event: KeyboardEvent) => {
    if (this.cacheHotkeyReTriggerEvent == null) {
      return;
    }

    if (LISTEN_HOTKEY_EVENT_KEYS.includes(event.key)) {
      this.emitEvent(
        this.cacheHotkeyReTriggerEvent.eventType,
        {
          hotkeyReTrigger: true,
        },
        {
          ...this.cacheHotkeyReTriggerEvent.eventData,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          altKey: event.altKey,
        },
      );
    }
  };

  private onWheel = (event: WheelEvent) => {
    if (event.target !== this.hostElement) {
      return;
    }
    event.preventDefault();
    this.emitEvent('wheel', null, {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
      deltaY: event.deltaY,
      button: event.button,
      nativeEvent: event,
    });
  };

  private onContextMenu = (event: MouseEvent) => {
    if (event.target !== this.hostElement) {
      return;
    }
    event.preventDefault();
    this.emitEvent('contextmenu', null, {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button,
      nativeEvent: event,
    });
  };

  private onPointerDown = (event: PointerEvent) => {
    if (event.target !== this.hostElement) {
      return;
    }

    if (event.button === MouseEventButton.Right) {
      return;
    }

    event.preventDefault();

    this.draggingState.state = true;
    this.draggingState.button = event.button as MouseEventButton;
    this.emitEvent('start', null, {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button,
      nativeEvent: event,
    });
  };

  private onPointerMove = (event: PointerEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }

    event.preventDefault();

    if (!this.draggingState.state) {
      if (event.target !== this.hostElement) {
        return;
      }

      this.emitEvent('move', null, {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
        nativeEvent: event,
      });
    } else {
      this.emitEvent(
        'drag',
        {
          hotkeyReTrigger: true,
        },
        {
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          shiftKey: event.shiftKey,
          clientX: event.clientX,
          clientY: event.clientY,
          button: this.draggingState.button!,
          nativeEvent: event,
        },
      );
    }
  };

  private onPointerUp = (event: PointerEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    event.preventDefault();

    this.draggingState.state = false;
    this.draggingState.button = null;
    this.emitEvent('end', null, {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button,
      nativeEvent: event,
    });
  };

  private emitEvent(eventType: keyof IHostEvent, options: EmitEventOptions | null, eventData: IMouseEvent) {
    // cache last event data.
    this.eventEmitter.emit(eventType, eventData);
    if (options?.hotkeyReTrigger) {
      this.cacheHotkeyReTriggerEvent = {
        eventType,
        eventData,
      };
    } else {
      this.cacheHotkeyReTriggerEvent = null;
    }
  }

  on(event: keyof IHostEvent, callback: IHostEvent[keyof IHostEvent]) {
    this.eventEmitter.on(event, callback);
  }

  off(event: keyof IHostEvent, callback: IHostEvent[keyof IHostEvent]) {
    this.eventEmitter.off(event, callback);
  }
}
