import { Component } from '@nova-engine/ecs';
import { Euler, Vector3 } from 'three';

class TransformComponent implements Component {
  static tag = 'TransformComponent';

  public rotation: Euler;
  public position: Vector3;

}

class RotateComponent implements Component {
  static tag = 'RotateComponent';

  public target: Euler = new Euler(0, 0, 0);
  public angularVelocity: Euler = new Euler(0, 0, 0);
}

export { TransformComponent, RotateComponent };
