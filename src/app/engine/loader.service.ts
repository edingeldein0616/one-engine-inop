import { Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import { Scene } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { EngineService } from './engine.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private gltfLoader = new GLTFLoader();
  private path = environment.modelUrl;

  constructor(private engineService: EngineService) {

  }

  private loadModel(filename: string): Observable<Scene> {
    return new Observable<Scene>(sub => {
      const filepath = this.path + filename;
      console.log('model filepath: ' + filepath);
      this.gltfLoader.load(filepath, gltf => {
        sub.next(gltf.scene);
      },
      undefined,
      error => sub.error(error));
    });
  }

  loadScene(sceneName: string) {
    this.loadModel('seminole.gltf')
      .subscribe(scene => {
        this.engineService.setScene(scene);
      }, error => console.error(error));
  }
}
