import { Entity } from '@nova-engine/ecs';
import { SceneComponent, PerspectiveCameraComponent, LightComponent, RootComponent, AnimationManagerComponent } from '../../core';
import { PerspectiveCamera, DirectionalLight, AmbientLight } from 'three';

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
  constructor() {
    super();
    this.putComponent(RootComponent);
    this.putComponent(AnimationManagerComponent);
    return this;
  }
}

interface GenericEntity<T extends Entity> {
  new(): T;
}

export { SceneEntity, CameraEntity, DirectionalLightEntity, AmbientLightEntity, ModelEntity, GenericEntity };
