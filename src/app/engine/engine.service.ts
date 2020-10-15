import { Injectable, NgZone, ElementRef, OnDestroy } from '@angular/core';
import { ThreeEngine } from './ThreeEngine';
import { EntityFactory, CameraEntity, SceneEntity, ModelEntity } from './core/entities';
import { HideableComponent, RootComponent } from './core/components';
import { EventBus, Subject } from './core/events';
import { AnimatorComponent } from './core/components/Animation';
import { LoaderService } from '../services/loader.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Color } from 'three';
import { AerodynamicsModel } from '../utils/aerodynamics-model';
import { RaycastController } from '../utils/raycast-controller';
import { ThreeEngineEvent } from '../utils/custom-events';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {

  private _threeEngine: ThreeEngine;

  constructor(private ngZone: NgZone,
    private loaderService: LoaderService) {

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
    subject.data = this.loaderService.getAsset(environment.envmap);
    EventBus.get().publish(ThreeEngineEvent.ENVMAP, subject);
    EventBus.get().publish(ThreeEngineEvent.SKYBOX, null);

    this._animate();
  }

  public loadSeminole(assetName: string) {

    const gltf = this.loaderService.getAsset(assetName);

    const me = EntityFactory.build(ModelEntity);
    me.getComponent(RootComponent).obj = gltf.scene;

    const anim = me.getComponent(AnimatorComponent);
    anim.configureAnimations(gltf);
    const flapsClip = anim.clip('FlapsAction') //this._animationClips.find(clip => clip.name === 'FlapsAction');
    if(flapsClip) {
      anim.subClip(flapsClip, 'flapsTo0Action', 0, 1);
      anim.subClip(flapsClip, 'flapsTo10Action', 0, 50);
      anim.subClip(flapsClip, 'flapsTo25Action', 50, 100);
      anim.subClip(flapsClip, 'flapsTo40Action', 100, 150);
    }

    me.getComponent(HideableComponent).obj = gltf.scene;

    this._threeEngine.addEntity(me);
  }

  public loadStaticMarkings(assetName: string, aeroModel: AerodynamicsModel): GLTF {

    const gltf = this.loaderService.getAsset(assetName);

    aeroModel.unpackMarkings(gltf, new Color(0xFF0000), new Color(0x00FFFF));

    const me = EntityFactory.build(ModelEntity);
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);

    this._threeEngine.addEntity(me);
    return gltf;
  }

  public loadAttachedMarkings(assetName: string): GLTF {
    const gltf = this.loaderService.getAsset(assetName);

    const me = EntityFactory.build(ModelEntity);
    me.getComponent(RootComponent).obj = gltf.scene;
    const anim = me.getComponent(AnimatorComponent);
    anim.configureAnimations(gltf);
    const cgClip = anim.clip('cgAction'); //this._animationClips.find(clip => clip.name == 'cgAction');
    if(cgClip) {
      anim.subClip(cgClip, 'cg0Action', 0, 1);
      anim.subClip(cgClip, 'cg1Action', 0, 25);
      anim.subClip(cgClip, 'cg2Action', 25, 50);
      anim.subClip(cgClip, 'cg3Action', 50, 75);
      anim.subClip(cgClip, 'cg4Action', 75, 100);
    }

    this._threeEngine.addEntity(me);
    return gltf;
  }

  public getModelReference(assetName: string): GLTF {
    return this.loaderService.getAsset(assetName);
  }

  public hideObject(name: string, hide: boolean): void {
    const subject = new Subject();
    subject.data = { name: name, hide: hide};
    EventBus.get().publish(ThreeEngineEvent.HIDEOBJECT, subject);
  }

  public attachRaycaster(raycastController: RaycastController) {
    this._threeEngine.attachRaycaster(raycastController);
  }

  public detachRaycaster() {
    this._threeEngine.detachRaycaster();
  }

  public dispose() {
    this._threeEngine.disposeEngine();
    this._threeEngine = null;
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
