import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Color, Mesh, MeshStandardMaterial } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

import { ThreeEngine } from './ThreeEngine';
import { EventBus, Subject } from './core/events';
import { HideableComponent, LightComponent, RootComponent } from './core/components';
import { AnimatorComponent, MaterialAnimationComponent } from './core/components/Animation';
import { EntityFactory, CameraEntity, SceneEntity, ModelEntity, DirectionalLightEntity, HemisphereLightEntity } from './core/entities';

import { environment } from 'src/environments/environment';
import { LoaderService } from 'src/app/services/loader.service';
import { AerodynamicsModel, RaycastController, ThreeEngineEvent, ModelPainter } from 'src/app/utils';

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

    const dirLight = EntityFactory.build(DirectionalLightEntity);
    dirLight.getComponent(LightComponent).light.color = new Color(0xFFFFFF);
    dirLight.getComponent(LightComponent).light.intensity = 3;
    dirLight.getComponent(LightComponent).obj.position.set(0.5, 0, 0.866) // ~60 degrees

    const hemiLight = EntityFactory.build(HemisphereLightEntity);
    hemiLight.getComponent(LightComponent).light.intensity = 1;

    this._threeEngine.addEntities(dirLight, hemiLight);

    this._animate();
  }

  public loadSeminole(assetName: string) {

    const gltf = this.loaderService.getAsset(assetName);
    console.log(gltf);

    ModelPainter.updateTextureEncoding(gltf);

    const me = EntityFactory.build(ModelEntity);
    me.name = environment.seminole;
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

  public loadMarkings(assetName: string, aeroModel?: AerodynamicsModel): GLTF {

    const gltf = this.loaderService.getAsset(assetName);
    console.log(gltf);

    if(aeroModel) {
      aeroModel.createScales(gltf);
    }

    const me = EntityFactory.build(ModelEntity);
    me.name = assetName;
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);
    me.getComponent(HideableComponent).obj = gltf.scene;

    this._threeEngine.addEntity(me);
    return gltf;
  }

  public loadAnimatedMarkings(assetName: string) {
    const gltf = this.loaderService.getAsset(assetName);

    const me = EntityFactory.build(ModelEntity);
    me.name = assetName;
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);
  }

  public loadAttachedMarkings(assetName: string): GLTF {
    const gltf = this.loaderService.getAsset(assetName);

    const me = EntityFactory.build(ModelEntity);
    me.name = assetName;
    me.getComponent(RootComponent).obj = gltf.scene;
    me.getComponent(AnimatorComponent).configureAnimations(gltf);

    this._threeEngine.addEntity(me);
    return gltf;
  }

  public loadWindPlane(assetName: string) {
    const gltf = this.loaderService.getAsset(assetName);

    const me = EntityFactory.build(ModelEntity);
    me.name = assetName;
    const rc = me.getComponent(RootComponent)
    rc.obj = gltf.scene;
    const ac = me.getComponent(AnimatorComponent);
    ac.configureAnimations(gltf);

    const disk = rc.find(rc.obj, 'windplane-disk') as Mesh;
    const mac = me.putComponent(MaterialAnimationComponent);

    const material = disk.material as MeshStandardMaterial;
    (disk as any).material.mapOffset = material.map.offset;
    mac.mesh = disk;
    mac.createVectorClip('windplane-action', 1,'.material.mapOffset', [0, 1], [0, 0, 0, 1]);;

    this._threeEngine.addEntity(me);
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
