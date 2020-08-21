import { System, Engine, Entity, Family, FamilyBuilder } from '@nova-engine/ecs';
import { Listener, Subject, EventBus } from 'src/app/engine/core/events';
import { AnimatorComponent } from '../components/Animation';
import { ModelEntity } from '../entities';
import { AnimationAction, Clock } from 'three';

export class AnimationSystem extends System implements Listener {

  private _family: Family;
  private _clock: Clock = new Clock();

  public onAttach(engine: Engine) {
    super.onAttach(engine);

    this._family = new FamilyBuilder(engine).include(AnimatorComponent).build();

    EventBus.get().subscribe('animation', this);

  }

  public onDetach(engine: Engine) {

    EventBus.get().unsubscribe('animation', this);

  }

  update(engine: Engine, delta: number): void {

    this._family.entities.forEach(entity => {

      const ac = entity.getComponent(AnimatorComponent);
      if(ac.animationMixer) {
        ac.animationMixer.update(this._clock.getDelta());
      }

    });

  }

  receive(topic: string, subject: Subject) {

    const data = subject.data as AnimationData;
    if(!data) {
      throw Error(`Incorrect animation data: ${subject}`);
    }

    console.log(`Recieved animation event: ${data.clipName}`)

    this._family.entities.forEach(entity => {

      const ac = entity.getComponent(AnimatorComponent);
      const action = ac.action(data.clipName);
      action.play();

    });
  }

}



export class AnimationData {

  public readonly clipName: string;
  public actionCallback: (action: AnimationAction) => void;

  constructor(clipName: string, actionCallback: (action: AnimationAction) => void) {
    this.clipName = clipName;
    this.actionCallback = actionCallback;
  }

}
