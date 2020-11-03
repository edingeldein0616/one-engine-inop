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

  private _loadingSemiphore: number = 0;
  public set loadingSemiphore(v : number) {
    if(v >= 0) this._loadingSemiphore = v;
  }
  public get loadingSemiphore() : number {
    return this._loadingSemiphore;
  }

  public incSemiphore() {
    this.loadingSemiphore = this.loadingSemiphore + 1;
    if(this._loadingSemiphore > 0) this._isLoadingSubject.next(true);
    else this._isLoadingSubject.next(false);
  }
  public decSemiphore() {
    this.loadingSemiphore = this.loadingSemiphore - 1;
    if(this._loadingSemiphore > 0) this._isLoadingSubject.next(true);
    else this._isLoadingSubject.next(false);
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

    this.incSemiphore();
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
        this.decSemiphore();
        break;
    }


  }

  private loadGltf(name: string) {
    const loader = new GLTFLoader();
    loader.load(this.url + name + '.gltf',
      gltf => {
        this._assets.set(name, gltf);
        this._onLoadedSubject.next(gltf);
        this.decSemiphore();
      },
      null,
      err => {
        this.decSemiphore();
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
        this.decSemiphore();
      },
      null,
      err => {
        this.decSemiphore();
        throw new Error(`Error loading asset ${name} -- ${err.message}`);
      });
  }

  private loadTexture(name: string, ext: string) {
    const loader = new TextureLoader();
    loader.load(this.url + name + `.${ext}`, texture => {
        this._assets.set(name, texture);
        this.decSemiphore();
        this._onLoadedSubject.next(texture);
      },
      () => {},
      err => {
        this.decSemiphore();
        throw new Error(`Error loading asset ${name} -- ${err.message}`);
      });
  }

  public ngOnDestroy(): void {
    for(let asset of this._assets.values()) {
      asset.dispose();
    }
  }

}
