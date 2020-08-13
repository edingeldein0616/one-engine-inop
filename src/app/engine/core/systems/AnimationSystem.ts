import { System, Engine, Family, FamilyBuilder, EngineEntityListener, Entity } from '@nova-engine/ecs'
import { Listener, Subject, EventBus } from '../events';
import { AnimationManagerComponent } from '../components';

export class AnimationSystem extends System implements Listener, EngineEntityListener {

  private _family: Family;
  private _animationClipKeys: string[];

  public setClipKeys(clipKeys: string[]) {
    this._animationClipKeys = clipKeys;

    for(var i = 0; i < this._animationClipKeys.length; i++) {
      EventBus.get().subscribe(this._animationClipKeys[i], this);
    }

    console.log(this._animationClipKeys);
  }

  public removeClipKeys(clipKeys: string[]) {

    if (clipKeys == null || clipKeys.length < 1) {
      this._animationClipKeys = [];
      return;
    }

    const filteredKeys = this._animationClipKeys.filter(key => {
      for (const keySearch in clipKeys.values()) {
        if (key === keySearch) {
          return true;
        }
      }
      return false;
    });

    this._animationClipKeys = filteredKeys;

    for(var i = 0; i < this._animationClipKeys.length; i++) {
      EventBus.get().unsubscribe(this._animationClipKeys[i], this);
    }
  }

  onEntityAdded(entity: Entity): void {

    if (!entity.hasComponent(AnimationManagerComponent)) {
      return;
    }

    const amc = entity.getComponent(AnimationManagerComponent);
    this.setClipKeys(amc.clipNames());
  }

  onEntityRemoved(entity: Entity): void {

    if (!entity.hasComponent(AnimationManagerComponent)) {
      return;
    }

    const amc = entity.getComponent(AnimationManagerComponent);
    this.removeClipKeys(amc.clipNames());
  }

  public onAttach(engine: Engine) {
    super.onAttach(engine);

    // Builds a family of all entities that contain a AnimationManagerComponent.
    this._family = new FamilyBuilder(engine).include(AnimationManagerComponent).build();

    console.log('Animation system attached to engine', this, engine);
  }

  public update(engine: Engine, delta: number): void { }

  public receive(topic: string, subject: Subject) {
    this._family.entities.forEach(entity => {
      const amComp = entity.getComponent(AnimationManagerComponent);
      const action = amComp.action(topic);
      action.play();
    });
  }

}
