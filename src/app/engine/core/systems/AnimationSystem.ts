import { System, Engine } from '@nova-engine/ecs'
import { Listener, Subject } from '../events';

class AnimationSystem extends System implements Listener {



  update(engine: Engine, delta: number): void {
    throw new Error("Method not implemented.");
  }

  receive(topic: string, subject: Subject) {
    switch(topic) {
      case '':
        break;
    }
  }

}
