import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { ThreeEngine } from './ThreeEngine';
import { EntityFactory, CameraEntity, SceneEntity, ModelEntity, DirectionalLightEntity, HemisphereLightEntity } from './core/entities';
import { HideableComponent, LightComponent, RootComponent } from './core/components';
import { EventBus, Subject } from './core/events';
import { AnimatorComponent, MaterialAnimationComponent } from './core/components/Animation';
import { LoaderService } from '../services/loader.service';
import { environment } from 'src/environments/environment';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Color, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { AerodynamicsModel } from '../utils/aerodynamics-model';
import { RaycastController } from '../utils/raycast-controller';
import { ThreeEngineEvent } from '../utils/custom-events';
import { Direct } from 'protractor/built/driverProviders';

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
    dirLight.getComponent(LightComponent).light.intensity = 2;
    dirLight.getComponent(RootComponent).obj.translateX(7);
    dirLight.getComponent(RootComponent).obj.translateY(7);

    const directLight = EntityFactory.build(HemisphereLightEntity);
    directLight.getComponent(LightComponent).light.intensity = 5;

    this._threeEngine.addEntities(dirLight, directLight);

    this._animate();
  }

  public loadSeminole(assetName: string) {

    const gltf = this.loaderService.getAsset(assetName);

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

    if(aeroModel) {
      aeroModel.unpackMarkings(gltf, new Color(AerodynamicsModel.undPrimary), new Color(0xFFFFFF));
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
    const anim = me.getComponent(AnimatorComponent);
    anim.configureAnimations(gltf);
    const cgClip = anim.clip('cgAction');
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
