import { GenericEntity } from './BaseEntities';
import { Entity } from '@nova-engine/ecs';

class EntityFactory {

  static build<T extends Entity>(entityClass: GenericEntity<T>): T {
    return new entityClass();
  }

}

export { EntityFactory };
