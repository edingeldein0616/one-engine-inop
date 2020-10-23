import { System, Engine, Family, FamilyBuilder } from '@nova-engine/ecs';
import { Listener, Subject, EventBus } from 'src/app/engine/core/events';
import { AnimatorComponent } from '../components/Animation';
import { ModelEntity } from '../entities';
import { AnimationAction, Clock } from 'three';
import { ThreeEngineEvent } from 'src/app/utils/custom-events';

export class AnimationSystem extends System implements Listener {

  private _family: Family;
  private _clock: Clock = new Clock();

  private _animationQueue: AnimationData[] = [];

  public onAttach(engine: Engine) {
    super.onAttach(engine);

    this._family = new FamilyBuilder(engine).include(AnimatorComponent).build();

    EventBus.get().subscribe(ThreeEngineEvent.ANIMATION, this);

  }

  public onDetach(engine: Engine) {
    EventBus.get().unsubscribe(ThreeEngineEvent.ANIMATION, this);
  }

  update(engine: Engine, delta: number): void {

    const dt = this._clock.getDelta();

    this._family.entities.forEach(entity => {
      var me = entity as ModelEntity;
      const ac = me.getComponent(AnimatorComponent);

      this._animationQueue.forEach(ad => {
        if(ad.targetName === me.name) {
          const action = ac.action(ad.clipName);
          if(action) {
            ad.actionCallback(action, ad.args);
          }
        }
      });

      if(ac.animationMixer) {
        ac.animationMixer.update(dt);
      }

    });

    this._animationQueue = [];

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

  public readonly targetName: string
  public readonly clipName: string;
  public actionCallback: (action: AnimationAction, ...args: any[]) => void;
  public args: any[];

  constructor(targetName: string, clipName: string, actionCallback: (action: AnimationAction, ...args: any[]) => void, ...args: any[]) {
    this.targetName = targetName;
    this.clipName = clipName;
    this.actionCallback = actionCallback;
    this.args = args;
  }

}
