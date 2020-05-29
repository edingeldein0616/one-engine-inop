import { SceneEntity, GenericEntity, CameraEntity, ModelEntity } from './BaseEntities';
import { SceneComponent, PerspectiveCameraComponent, RootComponent, AnimationManagerComponent, LightComponent } from '../components';
import { PerspectiveCamera, AnimationMixer, DirectionalLight, AmbientLight } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Entity } from '@nova-engine/ecs';

class EntityFactory {

  static build<T extends Entity>(entityClass: GenericEntity<T>): T {
    return new entityClass();
  }

}

export { EntityFactory };
