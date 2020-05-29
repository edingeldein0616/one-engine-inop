import { System, Engine, Entity, Family, FamilyBuilder, EngineEntityListener } from '@nova-engine/ecs';
import { WebGLRenderer, PerspectiveCamera, Object3D } from 'three';
import { SceneComponent, RootComponent, SceneEntity, Listener, EventBus, Subject } from '../../core';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * @class RenderingSystem
 * @extends System nova-engine ECS System class
 * @implements EngineEntityListener nova-engine ECS interface
 * A system build to wrap the WebGLRenderer's 'render()' function that draws a THREE.Scene on an html canvas.
 */
class RenderingSystem extends System implements EngineEntityListener, Listener {

  private _canvas: HTMLCanvasElement;
  private _renderer: WebGLRenderer;
  private _camera: PerspectiveCamera;
  private _family: Family;
  private _objects: Object3D[] = [];

  public get camera() { return this._camera};

  /**
   * Creates instance of RenderingSystem. Calls super(), assigns canvas and camera fields.
   * @param canvas Canvas to render to.
   * @param camera Camera's view to render.
   */
  constructor(canvas: HTMLCanvasElement, camera: PerspectiveCamera) {
    super();
    this._canvas = canvas;
    this._camera = camera;
  }


  /**
   * Called when an entity is added to the engine. Adds the entity to the underlying scene.
   * @param entity The entity recently added to the engine.
   */
  public onEntityAdded(entity: Entity): void {
    // If the entity is an instance of a SceneEntity, attach the camera to the scene.
    if(entity instanceof SceneEntity) {
      entity.getComponent(SceneComponent).scene
        .add(this._camera);
    } else {
      // Entity is not of type SceneEntity
      // If the entity has a RootComponent (meaning it is an entity that contains a THREE.Object3D)
      if(entity.hasComponent(RootComponent)) {
        // Loop through all entites in the family.
        this._family.entities.forEach(sceneEntity => {
          // Get reference to the THREE.Object3D
          const obj = entity.getComponent(RootComponent).obj;
          // Add THREE.Object3D to scene
          sceneEntity.getComponent(SceneComponent).scene
            .add(obj);
          console.log('Object added to scene...', obj, sceneEntity.getComponent(SceneComponent).scene);
          // Register in list of THREE.Object3D[]
          this._objects.push(obj);
        });
      }
    }
  }

  /**
   * Called when an entity is removed from the engine. Remvoes the entity from the underlying scene.
   * @param entity The entity recently removed from the engine.
   */
  public onEntityRemoved(entity: Entity): void {
    // If the entity isn't a scene entity
    if(entity !instanceof SceneEntity) {
      // If the entity has a RootComponent
      if(entity.hasComponent(RootComponent)) {
        // Loop through entites in the family
        this._family.entities.forEach(sceneEntity => {
          // Remove the entity
          var scene = sceneEntity.getComponent(SceneComponent).scene;
          scene.remove(entity.getComponent(RootComponent).obj);
        });
      }
      console.log(`Entity removed from RenderingSystem.`, entity);
    }
  }

  /**
   * Called when the system is attached to the engine. Calls super.onAttach(). Builds the scene family and creates the WebGLRenderer.
   * @param engine The engine this system is being attached to.
   */
  public onAttach(engine: Engine) {
    super.onAttach(engine);

    // Builds a family of all entities that contain a SceneComponent.
    this._family = new FamilyBuilder(engine).include(SceneComponent).build();
    // Creates the WebGLRenderer that the rendring system will utilize.
    this._renderer = new WebGLRenderer({
      canvas: this._canvas,
      alpha: false,
      antialias: true,
    });
    this._renderer.setClearColor(0xFF00FF);

    var orbitControls = new OrbitControls(this._camera, this._canvas);

    // Subscribe to state-check event.
    EventBus.get().subscribe('state-check', this);

    console.log('Rendering system attached to engine', this, engine);
  }

  /**
   * Called when the system is detached from the engine. Calls super.onDetach(). Disposes of all scene entities. Clears the renderer instance and disposes of it.
   * @param engine The engine the system is being detached from.
   */
  public onDetach(engine: Engine) {

    // Set renderer to white and clear buffer.
    this._renderer.setClearColor(0xFFFFFF);
    this._renderer.clear();

    // Remvoe THREE.Object3Ds from the THREE.Scene component contained in SceneEntity and dispose of scene.
    this._family.entities.forEach(sceneEntity => {
      const scene = sceneEntity.getComponent(SceneComponent).scene;
      this._objects.forEach(obj => {
        console.log('Object removed from scene', obj);
        scene.remove(obj);
      });
      scene.dispose();
    });

    const gl = this._canvas.getContext('webgl');
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
    this._renderer.dispose();

    // Unsubscribe from stat-check event
    EventBus.get().unsubscribe('state-check', this);

    // Dispose of renderer and call super.
    // this._renderer.dispose(); This does not work properly
    super.onDetach(engine);
  }

  /**
   * IListener Event Listener implementation.
   * @param topic topic to listen to.
   * @param subject subject of the topic.
   */
  receive(topic: string, subject: Subject) {
    switch (topic) {
      case 'state-check':
        console.log('STATE CHECK', this._renderer.state);
        break;
      default:
        console.log(`Unknown event passed: ${topic}`, subject);
        break;
    }
  }

  /**
   * Resizes the canvas to fill the browser window.
   */
  public resizeToWindow(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.resize(width, height);
  }

  /**
   * Resizes the canvas to fill the canvas renderer element.
   */
  public resizeToContainer(): void {
    const canvas = this._canvas;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.resize(width, height);
  }

  /**
   * Resizes the canvas to the height and width parameters.
   * @param width width to resize to in pixels.
   * @param height height to resize to in pixels.
   */
  public resize(width: number, height: number) : void {
    console.log(`resize - (${width}, ${height})`);
    if(width !== this._canvas.width || height !== this._canvas.height) {
      this._renderer.setSize(width, height, false);
      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();
    }
  }

  /**
   * The update loop for the RenderingSystem. Calls the WebGLRenderer's render() function. Extra system logic goes here.
   * @param engine The engine this system is running in.
   * @param delta The time delta since last update.
   */
  public update(engine: Engine, delta: number): void {
    // Check if family is initialized
    if(this._family) {
      // For each entity in the family (Entities that contain SceneComponent)
      for(const entity of this._family.entities) {
        // Call the render function and pass in the entity's scene and camera
        this._renderer.render(
          entity.getComponent(SceneComponent).scene,
          this._camera
          );
      }
    }
  }

}

export { RenderingSystem };
