import { System, Engine, Entity, Family, FamilyBuilder } from '@nova-engine/ecs';
import { Listener, Subject, EventBus } from 'src/app/engine/core/events';
import { AnimatorComponent } from '../components/Animation';
import { ModelEntity } from '../entities';
import { AnimationAction, Clock } from 'three';

export class AnimationSystem extends System implements Listener {

  private _family: Family;
  private _clock: Clock = new Clock();

  private _animationQueue: AnimationData[] = [];

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

      while(this._animationQueue.length > 0) {
        const ad = this._animationQueue.shift();
        const action  = ac.action(ad.clipName);
        ad.actionCallback(action, ad.args);
      }

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

    this._animationQueue.push(data);
  }

}

export class AnimationData {

  public readonly clipName: string;
  public actionCallback: (action: AnimationAction, ...args: any[]) => void;
  public args: any[];

  constructor(clipName: string, actionCallback: (action: AnimationAction, ...args: any[]) => void, ...args: any[]) {
    this.clipName = clipName;
    this.actionCallback = actionCallback;
    this.args = args;
  }

}
