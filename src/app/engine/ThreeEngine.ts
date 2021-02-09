import { Engine, System, Entity } from '@nova-engine/ecs';
import { PerspectiveCamera } from 'three';
import { CameraEntity, SceneEntity } from './core/entities';
import { PerspectiveCameraComponent } from './core/components';
import { RenderingSystem, AnimationSystem } from './core/systems';
import { RaycastController } from '../utils/raycast-controller';

/**
 * Wrapper class for the nova-engine/ecs library. Handled directly by the front end EngineService.
 * Provides access to necessicary Three.js elements and handles their translation into necessicary
 * engine Entities, Components and Systems.
 * 
 * Contains the main engine tick function.
 */
class ThreeEngine extends Engine {

  /** Time since engine startup. */
  protected _time: number;
  protected _frameId: number;
  protected _paused: boolean;
  public isPaused() { return this._paused; }

  /** HTML Canvas to render to */
  protected _canvas: HTMLCanvasElement;
  /** Camera for the Three.js Renderer */
  protected _camera: PerspectiveCamera;
  /** Handles Three.js rendering functionality of the engine */
  protected _renderingSystem: any;
  /** Handles Three.js animation functionality of the engine */
  protected _animationSystem: any;

  /** All current entities of the engine */
  protected _registeredEntities: Entity[] = [];
  /** All current systems of the engine */
  protected _registeredSystems: System[] = [];

  constructor(canvas: HTMLCanvasElement, camera: CameraEntity, scene: SceneEntity) {
    super();
    this._canvas = canvas;
    // Set up camera entity
    this._camera = camera.getComponent(PerspectiveCameraComponent).camera;
    this._camera.position.z = this._camera.position.x = this._camera.position.y = 22;
    // Set up rendering system
    this._time = 0;
    this._initRenderingSystem();

    this._animationSystem = new AnimationSystem();
    this.addSystem(this._animationSystem);

    // Add scene and camera entities (scene needs to be added first... hacky, I know)
    this.addEntities(scene, camera);
  }

  /**
   * Initializes the engine rendering system.
   */
  private _initRenderingSystem(): void {

    // If rendering system exists, don't overwrite
    if(this._renderingSystem) {
      return;
    }

    // initialize rendering system with the canvas and camera dependencies, bind resize event listener
    this._renderingSystem = new RenderingSystem(this._canvas, this._camera, { backgroundColor: 0x303030 });
    window.addEventListener('resize', event => { this._renderingSystem.resizeToContainer(); });
    // add rendering system to engine systems and add it to entity listener
    this.addSystem(this._renderingSystem);
    this.addEntityListener(this._renderingSystem);
    // run resize to container to fit the renderer to the canvas dimensions
    this._renderingSystem.resizeToContainer();
  }

  /**
   * Passes raycast controller from front end to the engine.
   * @param raycastController Raycast controller that is handled by the engine.
   */
  public attachRaycaster(raycastController: RaycastController) {
    this._renderingSystem?.attachRaycaster(raycastController);
  }

  /**
   * Adds and registers entity to engine.
   * @param entity Entity to add
   */
  public addEntity(entity: Entity) {
    super.addEntity(entity);
    this._registeredEntities.push(entity);
    return this;
  }

  /**
   * Adds multiple entities
   * @param entities Array of entities to add
   */
  public addEntities(...entities: Entity[]) {
    entities.forEach(entity => this.addEntity(entity));
    return this;
  }

  /**
   * Adds and registers system to the engien.
   * @param system Input system
   */
  public addSystem(system: System) {
    super.addSystem(system);
    this._registeredSystems.push(system);
    return this;
  }

  /**
   * Adds multiple systems.
   * @param systems Array of systems to add.
   */
  public addSystems(...systems: System[]) {
    systems.forEach(system => this.addSystem(system));
    return this;
  }

  /**
   * Pauses rendering of engine
   * @param pause 
   */
  public pauseEngine(pause: boolean) : void {    
    this._paused = pause;
  }

  /**
   * Main render loop that handles the engine update function.
   */
  public render() : void {
    this._frameId = requestAnimationFrame(() => {
      this.render();
    });

    var delta = Date.now() - this._time;
    this.update(delta);
    this._time = Date.now();
  }

  /**
   * Prints registered systems and entities to the console.
   */
  public print(): void {
    console.log(this);
    console.log(this._registeredSystems);
    console.log(this._registeredEntities);
  }

  /**
   * Removes all systems and entities and clears cache.
   */
  public disposeEngine() : void {
    this.removeSystems(...this._registeredSystems);
    this.removeEntities(...this._registeredEntities);
    this._registeredEntities = [];
    this._registeredSystems = [];
  }
}

export { ThreeEngine };
