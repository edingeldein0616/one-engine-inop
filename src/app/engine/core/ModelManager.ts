import { Object3D, Group } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';

let instance = null;

/**
 * Models implementation for loading 3D models.
 */
export class Models {

  /**
   * enforces singleton instance of Models
   * @returns  {Models}
   */
  public static get(): Models {
    if(!instance) {
      instance = new Models();
    }
    return instance;
  }

  // Loaded models
  private _models: Map<string, any>;

  /**
   * Stores all models loaded.
   */
  constructor() {
    this._models = new Map<string, any>();
  }

  /**
   * Gets a saved model.
   * @param name Name of the model.
   * @throws Error if no model is found with name parameter.
   */
  public model(name: string): GLTF {
    var model = this._models.get(name) as GLTF;
    if(model === null) {
      console.error(this._models);
      throw new Error(`${name} model not found.`);
    }
    return model;
  }

  /**
   * Loads gltf model
   * @param dir file directory
   * @param filename file name
   * @returns gltf model
   */
  public async loadModel(directory: string, name: string, options = { extension: null }) {
    const extension = options.extension ? options.extension : 'gltf';
    const path = `${directory}${name}.${extension}`;
    let root;
    switch (extension) {
      case 'gltf':
        const gltf = await this._loadGltfModel(path);
        root = gltf;
        break;
      case 'fbx':
        root = await this._loadFbxModel(path);
        break;
    }
    this._models.set(name, root);
    return root;
  }

  /**
   * Gets GLTF model
   * @param path full filepath
   * @returns model
   */
  private async _loadGltfModel(path: string): Promise<GLTF> {
    return new Promise(resolve => {
      const loader = new GLTFLoader();
      loader.load(path, gltf => {
        resolve(gltf);
      },
      () => {},
      err => {
        throw err;
      });
    });
  }

  private async _loadFbxModel(path: string): Promise<Group> {
    return new Promise(resolve => {
      const loader = new FBXLoader();
      loader.load(path, fbx => {
        resolve(fbx);
      },
      () => {},
      err => {
        throw new Error(err.message);
      });
    })
  }

}
