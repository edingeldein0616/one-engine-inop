import { Component } from '@nova-engine/ecs';
import { AnimationMixer, AnimationClip, AnimationAction, Vector3 } from 'three';

class AnimationComponent implements Component {
  static tag = 'AnimationComponent';
  public angularVelocity: Vector3;
}

class AnimationManagerComponent implements Component {

  /**
   * Underlying AnimationMixer to wrap.
   */
  private _mixer: AnimationMixer;
  public get mixer(): AnimationMixer {
    return this._mixer;
  }
  public set mixer(v: AnimationMixer) {
    if(!this._mixer) {
      this._mixer = v;
    }
  }

  /**
   * Group of animation clips of a model.
   */
  private _clips: { [key: string]: AnimationClip };
  public registerClip(clip: AnimationClip): void {
    if(!this._clips) {
      this._clips = {};
    }
    this._clips[clip.name] = clip;
  }
  public registerClips(clips: AnimationClip[]): void {
    clips.forEach(clip => {
      this.registerClip(clip);
    });
  }

  /**
   * Retrives a saved clip.
   * @param name Name of the clip to retrieve.
   * @returns clip The clip matching the name parameter.
   */
  public clip(name: string): AnimationClip {
    if(!this._clips[name]) {
      throw new Error(`No clip with name ${name} registered in component.`);
    }

    return this._clips[name];
  }

  /**
   * Retrives an action from the mixer.
   * @param name Name of the clip that contains the action.
   * @returns action The action in the mixer matching the clip.
   */
  public action(name: string): AnimationAction {
    const clip = this.clip(name);
    return this._mixer.clipAction(clip);
  }

}

export { AnimationComponent, AnimationManagerComponent }
