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

export class WondHostEventManager implements IHostEventManager {
  private readonly hostElement: HTMLCanvasElement;
  private readonly eventEmitter = new EventEmitter<IHostEvent>();

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
  }

  clear() {
    document.removeEventListener('pointerdown', this.onPointerDown);
    document.removeEventListener('pointermove', this.onPointerMove);
    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('contextmenu', this.onContextMenu);
    document.removeEventListener('wheel', this.onWheel);
  }

  private onWheel = (event: WheelEvent) => {
    if (event.target !== this.hostElement) {
      return;
    }
    event.preventDefault();
    this.eventEmitter.emit('wheel', {
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
    this.eventEmitter.emit('contextmenu', {
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
    this.eventEmitter.emit('start', {
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

      this.eventEmitter.emit('move', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button,
        nativeEvent: event,
      });
    } else {
      this.eventEmitter.emit('drag', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        clientX: event.clientX,
        clientY: event.clientY,
        button: this.draggingState.button!,
        nativeEvent: event,
      });
    }
  };

  private onPointerUp = (event: PointerEvent) => {
    if (event.button === MouseEventButton.Right) {
      return;
    }
    event.preventDefault();

    this.draggingState.state = false;
    this.draggingState.button = null;
    this.eventEmitter.emit('end', {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
      button: event.button,
      nativeEvent: event,
    });
  };

  on(event: keyof IHostEvent, callback: IHostEvent[keyof IHostEvent]) {
    this.eventEmitter.on(event, callback);
  }

  off(event: keyof IHostEvent, callback: IHostEvent[keyof IHostEvent]) {
    this.eventEmitter.off(event, callback);
  }
}
