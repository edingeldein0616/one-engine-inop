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
    this._loaderService.loadAsset(environment.staticMarkings, 'gltf');
    this._loaderService.loadAsset(environment.envmap, 'hdr');
  }
}
