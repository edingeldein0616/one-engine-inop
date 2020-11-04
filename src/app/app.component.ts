import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'one-engine-inop';

  constructor(private _router: Router,
    private _loaderService: LoaderService) { }

  public ngOnInit(): void {
    this._router.navigate(['']);

    this._loaderService.loadAsset(environment.seminole, 'gltf');
    this._loaderService.loadAsset(environment.attachedMarkings, 'gltf');
    this._loaderService.loadAsset(environment.sepStaticMarkings, 'gltf');
    this._loaderService.loadAsset(environment.dcvStaticMarkings, 'gltf');
    this._loaderService.loadAsset(environment.slipstreamMarkings, 'gltf');
    this._loaderService.loadAsset(environment.pfactorMarkings, 'gltf');
    this._loaderService.loadAsset(environment.acceleratedMarkings, 'gltf');
    this._loaderService.loadAsset(environment.torqueMarkings, 'gltf');
    this._loaderService.loadAsset(environment.zerosideslipMarkings, 'gltf');
    this._loaderService.loadAsset(environment.windplane, 'gltf');
  }
}
