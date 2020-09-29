import { Camera, Intersection, Object3D, Raycaster, Scene, Vector2 } from 'three';
export class RaycastController {

  private _root: Object3D[];
  private _camera: Camera;
  private _canvas: HTMLCanvasElement;
  private _raycaster: Raycaster;
  private _mousePosition: Vector2;
  private _positionUpdated: boolean;

  constructor(camera: Camera, root: Object3D[], canvas: HTMLCanvasElement) {
    this._camera = camera;
    this._root = root;
    this._canvas = canvas;
    console.log(`Canvas position: (${this._canvas.offsetLeft}, ${this._canvas.offsetTop})`);
    this._raycaster = new Raycaster();
    this._raycaster.far = 50;
    this._mousePosition = new Vector2(0, 0);
    this._positionUpdated = false;
  }

  public raycast(): Intersection[] {
    if(!this._positionUpdated) return;
    this._raycaster.setFromCamera(this._mousePosition, this._camera);
    var intersects = this._raycaster.intersectObjects(this._root, true);
    this._positionUpdated = false;
    return intersects;
  }

  public onMouseMove(event: MouseEvent): void {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    if(event.target == this._canvas) {
      this._positionUpdated = true;
      var bounds = this._canvas.getBoundingClientRect();
      this._mousePosition.x = ((event.clientX - bounds.left) / this._canvas.clientWidth) * 2 - 1;
      this._mousePosition.y = ((bounds.bottom - event.clientY) / this._canvas.clientHeight) * 2 - 1;
    }
  }

}
