import { Entity } from '@nova-engine/ecs';
import { SceneComponent, PerspectiveCameraComponent, LightComponent, RootComponent, HideableComponent } from '../components';
import { PerspectiveCamera, DirectionalLight, AmbientLight } from 'three';
import { AnimatorComponent } from '../components/Animation';

class SceneEntity extends Entity {

  constructor() {
    super();
    this.putComponent(SceneComponent);
    return this;
  }

}

class CameraEntity extends Entity {

  constructor() {
    super();
    const cameraComp = this.putComponent(PerspectiveCameraComponent);
    cameraComp.camera = new PerspectiveCamera(75, 1, 0.01, 100);
    cameraComp.camera.addEventListener('onSceneDispose', () => { console.log('camera disposed'); });
    return this;
  }

}

class DirectionalLightEntity extends Entity {
  constructor() {
    super();
    this.putComponent(LightComponent).light = new DirectionalLight(0xFFFFFF, 5);
    return this;
  }
}

class AmbientLightEntity extends Entity {
  constructor() {
    super();
    this.putComponent(LightComponent).light = new AmbientLight(0x404040, 10);
    return this;
  }
}

class ModelEntity extends Entity {
  public name: string;
  constructor() {
    super();
    this.putComponent(RootComponent);
    this.putComponent(AnimatorComponent);
    this.putComponent(HideableComponent);
    return this;
  }
}

interface GenericEntity<T extends Entity> {
  new(): T;
}

export { SceneEntity, CameraEntity, DirectionalLightEntity, AmbientLightEntity, ModelEntity, GenericEntity };
