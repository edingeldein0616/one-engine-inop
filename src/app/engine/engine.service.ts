import { Injectable, NgZone, ElementRef, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { ResourceTracker } from './resouce-tracker';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {

  private resourceTracker: ResourceTracker;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;

  private meshes: THREE.Mesh[];

  private frameId: number = null;

  constructor(private ngZone: NgZone) {
    this.resourceTracker = new ResourceTracker();
    this.meshes = new Array<THREE.Mesh>();
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // The first step is to get teh reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;
    const track = this.resourceTracker.track.bind(this.resourceTracker);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,  // transparent background
      antialias: true
    });

    // create the scene
    this.scene = new THREE.Scene();

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      75, width / height, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight(0x404040);
    this.light.position.z = 10;
    this.scene.add(this.light);

    const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const mesh: THREE.Mesh = track(new THREE.Mesh(geometry, material));
    this.meshes.push(mesh);
    this.meshes.forEach(m => this.scene.add(m));

    this.resize();
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.ngZone.runOutsideAngular(() => {
      this.resize();
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }

      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.meshes.forEach(model =>  {
      model.rotation.x += 0.01;
      model.rotation.y += 0.01;
    });
    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  public dispose() {
    this.resourceTracker.dispose();
    this.meshes.length = 0;
  }

}
