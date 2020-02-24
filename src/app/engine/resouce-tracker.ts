import * as THREE from 'three';
export class ResourceTracker {

  private resources: Set<any>;

  constructor() {
    this.resources = new Set();
  }

  public track(resource: any) {
    if (!resource) {
      return resource;
    }

    // Handle children and when material is an array of materials
    if (Array.isArray(resource)) {
      resource.forEach(res => this.track(res));
      return resource;
    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }

    if (resource instanceof THREE.Mesh) {
      this.track(resource.geometry);
      this.track(resource.material);
      this.track(resource.children);
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (value instanceof THREE.Texture) {
          this.track(value);
        }
      }
      // Check if any uniforms reference textures or arrays of textures
      if (resource instanceof THREE.ShaderMaterial) {
        if (resource.uniforms) {
          for (const value of Object.values(resource.uniforms)) {
            if (value) {
              const uniformValue = value.value;
              if (uniformValue instanceof THREE.Texture ||
                  Array.isArray(uniformValue)) {
                this.track(uniformValue);
              }
            }
          }
        }
      }
    }
    return resource;
  }

  public untrack(resource) {
    this.resources.delete(resource);
  }

  public dispose() {
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource);
        }
      }
      if (resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.clear();
  }

}
