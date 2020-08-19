import { Engine, System, Entity } from '@nova-engine/ecs';
import { PerspectiveCamera } from 'three';
import { CameraEntity, SceneEntity } from './core/entities';
import { PerspectiveCameraComponent } from './core/components';
import { RenderingSystem } from './core/systems';

class ThreeEngine extends Engine {

  private _time: number;
  private _frameId: number;

  private _canvas: HTMLCanvasElement;
  private _camera: PerspectiveCamera;
  private _renderingSystem: any;

  private _registeredEntities: Entity[] = [];
  private _registeredSystems: System[] = [];

  constructor(canvas: HTMLCanvasElement, camera: CameraEntity, scene: SceneEntity) {
    super();
    this._canvas = canvas;
    // Set up camera entity
    this._camera = camera.getComponent(PerspectiveCameraComponent).camera;
    this._camera.position.z = 5;
    // Set up rendering system
    this._time = 0;
    this._initRenderingSystem();

    // Add scene and camera entities (scene needs to be added first... hacky, I know)
    this.addEntities(scene, camera);
  }

  private _initRenderingSystem(): void {

    // If rendering system exists, don't overwrite
    if(this._renderingSystem) {
      return;
    }

    // initialize rendering system with the canvas and camera dependencies, bind resize event listener
    this._renderingSystem = new RenderingSystem(this._canvas, this._camera);
    window.addEventListener('resize', event => { this._renderingSystem.resizeToContainer(); });
    // add rendering system to engine systems and add it to entity listener
    this.addSystem(this._renderingSystem);
    this.addEntityListener(this._renderingSystem);
    // run resize to container to fit the renderer to the canvas dimensions
    this._renderingSystem.resizeToContainer();
  }

  public addEntity(entity: Entity) {
    super.addEntity(entity);
    this._registeredEntities.push(entity);
    return this;
  }

  public addEntities(...entities: Entity[]) {
    entities.forEach(entity => this.addEntity(entity));
    return this;
  }

  public addSystem(system: System) {
    super.addSystem(system);
    this._registeredSystems.push(system);
    return this;
  }

  public addSystems(...systems: System[]) {
    systems.forEach(system => this.addSystem(system));
    return this;
  }

  public render() : void {
    this._frameId = requestAnimationFrame(() => {
      this.render();
    });

    var delta = Date.now() - this._time;
    this.update(delta);
    this._time = Date.now();
  }

  public disposeEngine() : void {
    this.removeSystems(...this._registeredSystems);
    this.removeEntities(...this._registeredEntities);
    this._registeredEntities = [];
    this._registeredSystems = [];
  }
}

export { ThreeEngine };
