import { Injectable, NgZone, ElementRef, OnDestroy } from '@angular/core';
import { ThreeEngine } from './ThreeEngine';
import { EntityFactory, CameraEntity, SceneEntity, ModelEntity, DirectionalLightEntity, AmbientLightEntity } from './core/entities';
import { ResourceManager, AssetManager } from './core';
import { RootComponent } from './core/components';
import { AnimationMixer } from 'three';
import { EventBus, Subject, Listener } from './core/events';
import { Labels } from '../ui/controls/selector/selection-data';
import { AnimatorComponent } from './core/components/Animation';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {

  private _threeEngine: ThreeEngine;

  constructor(private ngZone: NgZone) {

  }

  ngOnDestroy(): void {
    throw new Error("Method not implemented.");
  }

  public initEngine(canvas: HTMLCanvasElement) : void {

    if(this._threeEngine) {
      return;
    }

    // Initialize engine with canvas, camera and scene entities
    this._threeEngine = new ThreeEngine(
      canvas,
      EntityFactory.build(CameraEntity),
      EntityFactory.build(SceneEntity));

    // Register hdri environment map
    const subject = new Subject();
    subject.data = AssetManager.get().texture('envmap');
    EventBus.get().publish('envmap', subject);
    EventBus.get().publish('skybox', null);

    this._animate();
  }

  public loadModel(filename: string) {

    const gltf = AssetManager.get().model(filename);

    const me = EntityFactory.build(ModelEntity);
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);

    this._threeEngine.addEntity(me);
  }

  public dispose() {
    this._threeEngine.disposeEngine();
    this._threeEngine = null;
    AssetManager.get().dispose();
  }

  private _animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if(this._threeEngine) {
        if(document.readyState != 'loading') {
          this._threeEngine.render();
        } else {
          window.addEventListener('DOMContentLoaded', () => {
            this._threeEngine.render();
          });
        }
      }
    });
  }

}
