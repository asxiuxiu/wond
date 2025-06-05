export class EventEmitter<T extends Record<symbol | string, any>> {

    private eventListenerMap: Map<keyof T, T[keyof T][]> = new Map();

    on<K extends keyof T>(event: K, callback: T[K]) {
        const listeners = this.eventListenerMap.get(event) || [];
        listeners.push(callback);
        this.eventListenerMap.set(event, listeners);
    }

    emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>) {
        const listeners = this.eventListenerMap.get(event) || [];
        listeners.forEach(listener => {
            listener(...args);
        });
    }

    off<K extends keyof T>(event: K, callback: T[K]) {
        const listeners = this.eventListenerMap.get(event) || [];
        const newListeners = listeners.filter(listener => listener !== callback);
        this.eventListenerMap.set(event, newListeners);
    }

    clear(event: keyof T) {
        this.eventListenerMap.delete(event);
    }
}