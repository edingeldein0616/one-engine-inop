import { Mesh, Object3D, Color } from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

export class ModelPainter {

  public static undPrimary: number = 0x009A44;
  public static undWarn: number = 0xFF671F;

  public static paintStaticMarkings(gltf: GLTF) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        var color = o.name[0] === 't' ? new Color(0xFFFFFF) : new Color(this.undPrimary);
        (o.material as any).color = color;
        (o.material as any).emissive = color;
        (o.material as any).emissiveIntensity = .6;
      }
    });
  }

  public static paintAttachedMarkings(gltf: GLTF) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        var color = new Color(this.undPrimary);
        (o.material as any).color = color;
        (o.material as any).emissive = color;
        (o.material as any).emissiveIntensity = .6;
      }
    });
  }

  public static paintZerosideslipMarkings(gltf: GLTF) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        if(o.name[0] !== 'w') {
          var color = new Color(this.undPrimary);
          (o.material as any).color = color;
          (o.material as any).emissive = color;
          (o.material as any).emissiveIntensity = .6;
        }
      }
    });
  }

  private static traverse(object: Object3D, callback: (o: Object3D) => void ) {
    for(let obj of object.children) {
      this.traverse(obj, callback);
    }
    callback(object);
  }
}
