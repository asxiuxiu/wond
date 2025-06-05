import { EventEmitter } from './event_emitter';
export interface IMouseEvent {
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  clientX: number;
  clientY: number;
  nativeEvent: any;
}

interface IHostEvent {
  start(event: IMouseEvent): void;
  move(event: IMouseEvent): void;
  drag(event: IMouseEvent): void;
  end(event: IMouseEvent): void;
}

export class HostEventManager {
  private readonly hostElement: HTMLCanvasElement;
  private readonly eventEmitter = new EventEmitter<IHostEvent>();

  private isDragging = false;

  constructor(hostElement: HTMLCanvasElement) {
    this.hostElement = hostElement;
    this.bindEvents();
  }

  private bindEvents() {
    document.addEventListener('pointerdown', this.onPointerDown);
    document.addEventListener('pointermove', this.onPointerMove);
    document.addEventListener('pointerup', this.onPointerUp);
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.target !== this.hostElement) {
      return;
    }

    this.isDragging = true;

    this.eventEmitter.emit('start', {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
      nativeEvent: event,
    });
  };

  private onPointerMove = (event: PointerEvent) => {
    if (!this.isDragging) {
      this.eventEmitter.emit('move', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        clientX: event.clientX,
        clientY: event.clientY,
        nativeEvent: event,
      });
    } else {
      this.eventEmitter.emit('drag', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        clientX: event.clientX,
        clientY: event.clientY,
        nativeEvent: event,
      });
    }
  };

  private onPointerUp = (event: PointerEvent) => {
    this.isDragging = false;
    this.eventEmitter.emit('end', {
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      clientX: event.clientX,
      clientY: event.clientY,
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
