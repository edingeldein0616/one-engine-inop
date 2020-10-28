import { Component } from '@nova-engine/ecs';
import { Scene, Mesh, Object3D, Light, PerspectiveCamera } from 'three';

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

class HideableComponent extends RootComponent {

  static tag = 'HideableComponent';

  public hide(objectName: string, hide: boolean): void {
    if(this._obj == null ) return;
    const objectToHide = this.find(this._obj, objectName);
    if(objectToHide != null) {
      objectToHide.visible = !hide;
    }
  }

  private find(obj: Object3D, name: string): Object3D {

    if(obj == null) return null;
    if(obj.name === name) return obj;
    var node = null;
    if(obj.children.length > 0) {
      for(let child of obj.children) {
         node = this.find(child, name);
         if(node != null) break;
      }
    }
    return node;
  }


}

export { SceneComponent, RootComponent, MeshComponent, LightComponent, PerspectiveCameraComponent, HideableComponent };
