import { Injectable, NgZone, ElementRef, OnDestroy } from '@angular/core';
import { ThreeEngine } from './ThreeEngine';
import { EntityFactory, CameraEntity, SceneEntity, ModelEntity } from './core/entities';
import { RootComponent } from './core/components';
import { EventBus, Subject } from './core/events';
import { AnimatorComponent } from './core/components/Animation';
import { LoaderService } from '../services/loader.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {

  private _threeEngine: ThreeEngine;
  private _loadingSubscription: Subscription;

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
    EventBus.get().publish(environment.envmap, subject);
    EventBus.get().publish(environment.skybox, null);

    this._animate();
  }

  public loadModel(assetName: string) {

    const gltf = this.loaderService.getAsset(assetName);

    const me = EntityFactory.build(ModelEntity);
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);

    this._threeEngine.addEntity(me);
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
