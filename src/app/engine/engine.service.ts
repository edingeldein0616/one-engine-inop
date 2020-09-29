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
    me.getComponent(AnimatorComponent).configureAnimations(gltf);
    me.getComponent(HideableComponent).obj = gltf.scene;

    this._threeEngine.addEntity(me);
  }

  public loadMarkings(assetName: string, aeroModel: AerodynamicsModel): GLTF {

    const gltf = this.loaderService.getAsset(assetName);

    aeroModel.unpackMarkings(gltf, new Color(0xFF0000));

    const me = EntityFactory.build(ModelEntity);
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);

    this._threeEngine.addEntity(me);
    return gltf;
  }

  public getModelReference(assetName: string): GLTF {
    return this.loaderService.getAsset(assetName);
  }

  public hideObject(name: string, hide: boolean): void {
    const subject = new Subject();
    subject.data = { name: name, hide: hide};
    EventBus.get().publish(ThreeEngineEvent.SKYBOX, subject);
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
