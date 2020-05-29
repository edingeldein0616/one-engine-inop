import { Object3D, Material, Geometry, Texture, Mesh, MaterialLoader } from 'three';

let instance = null;

export class ResourceManager {

  private _resources: Set<any>;

  private constructor() {
    this._resources = new Set();
  }

  public static get(): ResourceManager {
    if(instance == null) {
      instance = new ResourceManager();
    }
    return instance;
  }

  public register(resource: any) {

    if(!resource) {
      return resource;
    }

    // handle children and when material is an array of materials or
    // uniform is array of textures
    if(Array.isArray(resource)) {
      resource.forEach(resource => this.register(resource));
      return resource;
    }

    if(resource.dispose || resource instanceof Object3D) {
      this._resources.add(resource);
    }
    if (resource instanceof Object3D) {
      this.register(resource.children);
    } else if(resource instanceof Material) {
      // Check for any textures on material
      for(const value of Object.values(resource)) {
        if (value instanceof Texture) {
          this.register(value);
        }
      }
    }
    return resource;
  }

  public unregister(resource: any) : void {
    this._resources.delete(resource);
  }

  public dispose() : void {
    for(const object of this._resources) {
      if(object instanceof Mesh) {
        if(object.geometry) {
          object.geometry.dispose()
          console.log(`DISPOSE GEOMETRY - ${object.name}`, object)
        }
        var material = object.material;
        if(Array.isArray(material)) {
          material.forEach(mat => this._cleanMaterial(mat));
        } else {
          this._cleanMaterial(material);
        }
      }
    }
    this._resources.clear();
  }

  public viewResources() : void {
    console.log('-- RESOURCES --', this._resources);
  }

  private _cleanMaterial(material: Material) {

    material.dispose();
    console.log(`DISPOSE MATERIAL - ${material.name}`, material);

    // dispose texture
    for(const key of Object.keys(material)) {
      const value = material[key];
      if(value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose();
        console.log(`DISPOSE TEXTURE`, value);
      }
    }
  }

}
