import { Component } from '@nova-engine/ecs';
import { AnimationMixer, AnimationAction, AnimationClip, AnimationUtils } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Subject } from '../events';

export class AnimatorComponent implements Component {
  static tag = 'AnimatorComponent'

  private _animationMixer: AnimationMixer;
  public get animationMixer() { return this._animationMixer; }

  private _animationClips: AnimationClip[];

  public configureAnimations(gltf: GLTF): void {
    this._animationMixer = new AnimationMixer(gltf.scene);
    this._animationClips = gltf.animations;
  }

  public clip(clipName: string): AnimationClip {
    return this._animationClips.find(clip => clip.name === clipName);
  }

  public clipAction(clip: AnimationClip): AnimationAction {
    return this._animationMixer.clipAction(clip);
  }

  public action(clipName: string): AnimationAction {
    var clip = this.clip(clipName);
    return this.clipAction(clip);
  }

  public subClip(sourceClip: AnimationClip, newClipName: string, from: number, to: number): AnimationClip {
    var subClip = AnimationUtils.subclip(sourceClip, newClipName, from, to);
    this._animationClips.push(subClip);
    return subClip;
  }
}
