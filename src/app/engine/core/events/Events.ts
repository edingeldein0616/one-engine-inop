class Subject {
  data: any;
}

interface Listener {
  receive(topic: string, subject: Subject);
}

let instance = null;

abstract class EventBus {

  /**
   * Ensures singleton instance of EventBus.
   */
  static get() : EventBus {
    if(!instance) {
      instance = new ConcreteEventBus();
    }
    return instance;
  }

  abstract subscribe(topic: string, listener: Listener): void;
  abstract unsubscribe(topic: string, listener: Listener): void;

  abstract publish(topic: string, subject: Subject): void;

  static build(): EventBus { return new ConcreteEventBus(); }
}

class ConcreteEventBus extends EventBus {

  listeners: {
    [key: string]: Listener[]
  } = {};

  public subscribe(topic: string, receiver: Listener): void {
    if(!this.listeners[topic]) {
      this.listeners[topic] = [];
    }

    this.listeners[topic].push(receiver);
  }

  public unsubscribe(topic: string, receiver: Listener): void {
    if(!this.listeners[topic]) {
      return;
    }

    this.listeners[topic] = this.listeners[topic].filter(item => item !== receiver);
  }

  public publish(topic: string, subject: Subject): void {
    const listener = this._getTopicListeners(topic);

    listener.forEach(listener => {
      listener.receive(topic, subject);
    });
  }

  private _getTopicListeners(topic: string): Listener[] {
    if(!this.listeners[topic]) {
      return [];
    }

    return this.listeners[topic];
  }

}

export {  Subject , Listener, EventBus };
