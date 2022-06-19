import { EventEmitter } from 'events';
import { injectable } from 'inversify';

// from https://rjzaworski.com/2019/10/event-emitters-in-typescript

@injectable()
export class MyEmitter<T extends EventMap> implements Emitter<T> {
  private emitter = new EventEmitter();
  once<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.once(eventName, fn);
  }

  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.on(eventName, fn);
  }

  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>) {
    this.emitter.off(eventName, fn);
  }

  emit<K extends EventKey<T>>(eventName: K, params: T[K]) {
    this.emitter.emit(eventName, params);
  }
}

type EventMap = Record<string, unknown>;

type EventKey<T extends EventMap> = string & keyof T;
type EventReceiver<T> = (params: T) => void;

interface Emitter<T extends EventMap> {
  on<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  off<K extends EventKey<T>>(eventName: K, fn: EventReceiver<T[K]>): void;
  emit<K extends EventKey<T>>(eventName: K, params: T[K]): void;
}
