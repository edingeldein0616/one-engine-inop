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

    const flapsClip = this._animationClips.find(clip => clip.name === 'FlapsAction');
    if(flapsClip) {
      this.subClip(flapsClip, 'flapsTo0Action', 0, 1);
      this.subClip(flapsClip, 'flapsTo10Action', 0, 50);
      this.subClip(flapsClip, 'flapsTo25Action', 50, 100);
      this.subClip(flapsClip, 'flapsTo40Action', 100, 150);
    }

    const cgClip = this._animationClips.find(clip => clip.name == 'cgAction');
    if(cgClip) {
      this.subClip(cgClip, 'cg0Action', 0, 1);
      this.subClip(cgClip, 'cg1Action', 0, 25);
      this.subClip(cgClip, 'cg2Action', 25, 50);
      this.subClip(cgClip, 'cg3Action', 50, 75);
      this.subClip(cgClip, 'cg4Action', 75, 100);
    }

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
    return this.clipAction(clip);
  }

  public subClip(sourceClip: AnimationClip, newClipName: string, from: number, to: number): AnimationClip {
    var subClip = AnimationUtils.subclip(sourceClip, newClipName, from, to);
    this._animationClips.push(subClip);
    return subClip;
  }
}
