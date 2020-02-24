import { Injectable, NgZone, ElementRef, OnDestroy } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ResourceTracker } from './resouce-tracker';

@Injectable({
  providedIn: 'root'
})
export class EngineService implements OnDestroy {

  private resourceTracker: ResourceTracker;
  private track;

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;

  private meshes: THREE.Mesh[];
  private lights: THREE.Light[];

  private frameId: number = null;

  constructor(private ngZone: NgZone) {
    this.resourceTracker = new ResourceTracker();
    this.track = this.resourceTracker.track.bind(this.resourceTracker);
    this.meshes = new Array<THREE.Mesh>();
    this.lights = new Array<THREE.Light>();
  }

  public ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    // Get canvas element reference
    this.canvas = canvas.nativeElement;

    // Set up renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,  // transparent background
      antialias: true
    });

    // Set the scene
    this.setScene(null);

    // Resize camera to fit canvas
    this.resize();
  }

  public setScene(scene: THREE.Scene) {

    // create the scene
    if (!scene) {
      scene = new THREE.Scene();
    }
    this.scene = scene;

    // Initialize the camera
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      75, width / height, 0.1, 1000
    );
    this.camera.position.z = 5;
    this.addToScene([this.camera]);

    const controls = new OrbitControls(this.camera, this.renderer.domElement);

    // Add lighting
    const light = this.track(new THREE.AmbientLight(0x404040));
    light.position.z = 10;
    this.lights.push(light);
    this.addToScene(this.lights);

    // Add meshes
    // const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    // const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    // const mesh: THREE.Mesh = this.track(new THREE.Mesh(geometry, material));
    // this.meshes.push(mesh);
    // this.addToScene(this.meshes);
  }

  public addToScene(objects: THREE.Object3D[]) {
    objects.forEach(obj => {
      this.track(obj);
      this.scene.add(obj);
    });
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
    this.canvas.remove();
    this.canvas = null;
  }

}
