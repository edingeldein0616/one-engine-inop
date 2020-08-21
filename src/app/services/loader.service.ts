import { Injectable, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { UnsignedByteType, TextureLoader } from 'three';

@Injectable({
  providedIn: 'root'
})
export class LoaderService implements OnDestroy {

  private readonly url = environment.assetUrl;

  private _isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  public get isLoadingObservable(): Observable<boolean> {
    return this._isLoadingSubject.asObservable();
  }

  private _onLoadedSubject: Subject<any> = new Subject();
  public get onLoadedObservable(): Observable<any> {
    return this._onLoadedSubject.asObservable();
  }

  private _assets: Map<string, any> = new Map<string, any>();

  public getAsset(name: string): any {
    const asset = this._assets.get(name);
    if(!asset) {
      throw Error(`Asset ${name} not found in cache.`);
    }
    return asset;
  }

  public loadAsset(name: string, extension: string): Observable<any> {

    const asset = this._assets.get(name);
    if(asset) {
      return;
    }

    this._isLoadingSubject.next(true);

    switch (extension) {
      case 'gltf':
        this.loadGltf(name);
        break;
      case 'hdr':
        this.loadHdr(name);
        break;
      case 'jpg' || 'png':
        this.loadTexture(name, extension);
        break;
      default:
        this._isLoadingSubject.next(false);
        break;
    }


  }

  private loadGltf(name: string) {
    const loader = new GLTFLoader();
    loader.load(this.url + name + '.gltf',
      gltf => {
        this._assets.set(name, gltf);
        this._onLoadedSubject.next(gltf);
        this._isLoadingSubject.next(false);
      },
      null,
      err => {
        this._isLoadingSubject.next(false);
        throw new Error(`Error loading asset ${name} -- ${err.message}`);
      });
  }

  private loadHdr(name: string) {
    const loader = new RGBELoader();
    loader.setDataType(UnsignedByteType);
    loader.load(this.url + name + '.hdr',
      hdr => {
        this._assets.set(name, hdr);
        this._onLoadedSubject.next(hdr);
        this._isLoadingSubject.next(false);
      },
      null,
      err => {
        this._isLoadingSubject.next(false);
        throw new Error(`Error loading asset ${name} -- ${err.message}`);
      });
  }

  private loadTexture(name: string, ext: string) {
    const loader = new TextureLoader();
    loader.load(this.url + name + `.${ext}`, texture => {
        this._assets.set(name, texture);
        this._isLoadingSubject.next(false);
        this._onLoadedSubject.next(texture);
      },
      () => {},
      err => {
        this._isLoadingSubject.next(false);
        throw new Error(`Error loading asset ${name} -- ${err.message}`);
      });
  }

  public ngOnDestroy(): void {
    for(let asset of this._assets.values()) {
      asset.dispose();
    }
  }

}
