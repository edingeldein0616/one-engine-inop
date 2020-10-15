import { Component } from '@nova-engine/ecs';
import { AnimationMixer, AnimationAction, AnimationClip, AnimationUtils } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class AnimatorComponent implements Component {
  static tag = 'AnimatorComponent'

  private _animationMixer: AnimationMixer;
  public get animationMixer() { return this._animationMixer; }

  private _animationClips: AnimationClip[];
  private _animationActions: Map<string, AnimationAction>;

  public configureAnimations(gltf: GLTF): void {
    this._animationMixer = new AnimationMixer(gltf.scene);
    this._animationClips = gltf.animations;
    this._animationActions = new Map<string, AnimationAction>();

    for(let clip of this._animationClips) {
      const action = this._animationMixer.clipAction(clip);
      this._animationActions.set(clip.name, action);
    }
  }

  public clip(clipName: string): AnimationClip {
    return this._animationClips.find(clip => clip.name === clipName);
  }

  public clipAction(clip: AnimationClip): AnimationAction {
    if(this._animationActions.has(clip.name)) {
      return this._animationActions.get(clip.name);
    }
    return this._animationMixer.clipAction(clip);
  }

  public action(clipName: string): AnimationAction {
    var clip = this.clip(clipName);

    var action: AnimationAction;
    try {
      action = this.clipAction(clip);
    } catch (ex) {}
    return action;
  }

  public subClip(sourceClip: AnimationClip, newClipName: string, from: number, to: number): AnimationClip {
    var subClip = AnimationUtils.subclip(sourceClip, newClipName, from, to);
    this._animationClips.push(subClip);
    const action = this._animationMixer.clipAction(subClip);
    this._animationActions.set(subClip.name, action);
    return subClip;
  }
}
