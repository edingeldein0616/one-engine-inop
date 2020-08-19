import { Scene, Group, Texture, UnsignedByteType, DataTexture, PMREMGenerator, TextureLoader, Object3D } from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

let instance = null;

/**
 * Assets implementation for loading 3D assets.
 */
export class AssetManager {

  /**
   * enforces singleton instance of Assets
   * @returns  {AssetManager}
   */
  public static get(): AssetManager {
    if(!instance) {
      instance = new AssetManager();
    }
    return instance;
  }

  /**
   * Determines if assets are currently being loaded. Loading semphore.
   */
  private _loading: boolean = false;
  private set loading(value: boolean) {
    this._loading = value;
    this._loadingSubject.next(this._loading);
  }
  private _loadingSubject: BehaviorSubject<boolean>;
  public get loadingObservable(): Observable<boolean> {
    return this._loadingSubject.asObservable();
  };

  // Loaded assets
  private _assets: Map<string, any>;

  /**
   * Stores all assets loaded.
   */
  constructor() {
    this._assets = new Map<string, any>();
    this._loadingSubject = new BehaviorSubject<boolean>(this._loading);
  }

  /**
   * Gets a saved model.
   * @param name Name of the model.
   * @throws Error if no model is found with name parameter.
   */
  public model(name: string): GLTF {
    var model = this._assets.get(name) as GLTF;
    if(model === null) {
      console.error(this._assets);
      throw new Error(`${name} model not found.`);
    }
    return model;
  }

  /**
   * Gets a saved texture.
   * @param name Name of the texture.
   * @returns Error if no texture is found matching name parameter.
   */
  public texture(name: string): Texture {
    var texture = this._assets.get(name) as Texture;
    if(texture === null) {
      console.error(this._assets);
      throw new Error(`${name} texture not found.`);
    }
    return texture;
  }

  /**
   * Loads gltf model
   * @param dir file path
   * @param filename file name
   * @returns gltf model
   */
  public async loadModel(path: string, name: string, options = { extension: null }) {
    const extension = options.extension ? options.extension : 'gltf';
    const fullPath = `${path}${name}.${extension}`;
    let root;
    switch (extension) {
      case 'gltf':
        this.loading = true;
        const gltf = await this._loadGltfModel(fullPath);
        root = gltf;
        break;
      case 'fbx':
        this.loading = true;
        root = await this._loadFbxModel(fullPath);
        break;
    }
    this._assets.set(name, root);
    return root;
  }

  public async loadTexture(path: string, name: string, options = { extension: null}) {
    const extension = options.extension ? options.extension: 'hdr';
    const fullPath = `${path}${name}.${extension}`;
    let texture;
    switch(extension) {
      case 'hdr':
        this.loading = true;
        texture = await this._loadHDR(fullPath);
        break;
      case 'jpg' || 'png':
        this.loading = true;
        texture = await this._loadTexture(fullPath);
        break;
      default:
        break;
    }
    if(texture) {
      this._assets.set(name, texture);
    }
    return texture;
  }

  public print(): void {
    console.log('ASSET VALUES - ', this._assets);
  }

  public dispose(): void {

    this._assets.forEach(asset => {
      this._dispose(asset);
    });

  }

  private _dispose(obj: any): void {
    console.log('DISPOSING - ' + obj.name);
    if(obj.children) {
      obj.children.foreach(child => this._dispose(child));
    }

    if(obj.dispose) {
      obj.dispose();
    }
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
        this.loading = false;
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
        this.loading = false;
        resolve(fbx);

      },
      () => {},
      err => {
        throw new Error(err.message);
      });
    })
  }

  private async _loadHDR(path: string): Promise<DataTexture> {
    return new Promise(resolve => {
      new RGBELoader()
        .setDataType(UnsignedByteType)
        .load(path, texture => {
          this.loading = false;
          resolve(texture);
        },
        () => {},
        err => {
          throw new Error(err.message);
        });
    });
  }

  private async _loadTexture(path: string): Promise<Texture> {
    return new Promise(resolve => {
      new TextureLoader()
        .load(path, texture => {
          this.loading = false;
          resolve(texture);
        },
        () => {},
        err => {
          throw new Error(err.message);
        });
    });
  }

}
