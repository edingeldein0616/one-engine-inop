import { Component } from '@nova-engine/ecs';
import { Scene, Mesh, Object3D, Light, Color, Material, MeshBasicMaterial, Camera, PerspectiveCamera } from 'three';

class SceneComponent implements Component {
  static tag = 'SceneComponent';

  private _scene: Scene;
  public get scene() { return this._scene; }

  constructor() {
    this._scene = new Scene();
  }
}

class RootComponent implements Component {
  static tag = 'RootComponent';

  protected _obj: Object3D;
  public get obj() { return this._obj; }
  public set obj(v: Object3D) {
    if(!this._obj) {
      this._obj = v;
    }
  }
}

class MeshComponent extends RootComponent {

  public set mesh(value: Mesh) {
    if(!this._obj) {
      this._obj = value;
    }
  }

  public get mesh() { return this._obj as Mesh; }

}

class LightComponent extends RootComponent {

  public set light(value: Light) {
    if(!this._obj) {
      this._obj = value;
    }
  }

  public get light() { return this._obj as Light; }

}

class PerspectiveCameraComponent extends RootComponent {

  public set camera(value: PerspectiveCamera) {
    if(!this._obj) {
      this._obj = value;
    }
  }

  public get camera() { return this._obj as PerspectiveCamera; }

}

export { SceneComponent, RootComponent, MeshComponent, LightComponent, PerspectiveCameraComponent };
