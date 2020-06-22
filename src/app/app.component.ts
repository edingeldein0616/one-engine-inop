import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssetManager } from './engine/core/AssetManager';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'one-engine-inop';

  constructor(private _router: Router) { }

  public ngOnInit(): void {
    this._router.navigate(['']);
    AssetManager.get().loadModel(environment.assetUrl, environment.seminole, { extension: 'gltf' });
    AssetManager.get().loadTexture(environment.assetUrl, environment.envmap, { extension: 'hdr' });
    //AssetManager.get().loadTexture(environment.assetUrl, environment.skybox, { extension: 'jpg' });
  }

  public ngOnDestroy(): void {
    AssetManager.get().dispose();
  }
}
