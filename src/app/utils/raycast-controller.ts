import { Camera, Intersection, Object3D, Raycaster, Vector2 } from 'three';
export class RaycastController {

  private _intersects: Intersection[];
  private _pointer: boolean;
  public get pointer() : boolean {
    return this._pointer;
  }
  
  private _root: Object3D[];
  private _camera: Camera;
  private _canvas: HTMLCanvasElement;
  private _raycaster: Raycaster;
  private _mousePosition: Vector2;
  private _positionUpdated: boolean;

  constructor(...root: Object3D[]) {
    if(root) {
      this._root = root;
    }
    this._raycaster = new Raycaster();
    this._raycaster.far = 50;
    this._mousePosition = new Vector2(0, 0);
    this._positionUpdated = false;
  }

  public attachCamera(camera: Camera) {
    this._camera = camera;
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
  }

  public attachRoot(...root: Object3D[]) {
    this._root = root;
  }

  public raycast(): void {
    this._raycaster.setFromCamera(this._mousePosition, this._camera);
    this._intersects = this._raycaster.intersectObjects(this._root, true);
    this._pointer = this._intersects.length > 0;
  }

  public getIntersects(): Intersection[] {
    if(!this._positionUpdated) return;
    this._positionUpdated = false;
    return this._intersects;
  }

  public sense(): boolean {
    var intersects = this._raycaster.intersectObjects(this._root, true);
    return intersects.length > 0;
  }

  public onMouseMove(event: MouseEvent): void {
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    if(event.target == this._canvas) {
      this._positionUpdated = true;
      this._moveCursor(this._canvas, event.clientX, event.clientY);
      // var bounds = this._canvas.getBoundingClientRect();
      // this._mousePosition.x = ((event.clientX - bounds.left) / this._canvas.clientWidth) * 2 - 1;
      // this._mousePosition.y = ((bounds.bottom - event.clientY) / this._canvas.clientHeight) * 2 - 1;
    }
  }

  public onTouchEnd(event: TouchEvent) {
    const touches = event.changedTouches;
    const firstTouch = touches[0];

    if(event.target == this._canvas) {
      this._positionUpdated = true;
      this._moveCursor(this._canvas, firstTouch.pageX, firstTouch.pageY);
    }
  }

  private _moveCursor(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
    var bounds = canvas.getBoundingClientRect();
    this._mousePosition.x = ((clientX - bounds.left) / canvas.width) * 2 - 1;
    this._mousePosition.y = ((bounds.bottom - clientY) / canvas.clientHeight) * 2 - 1;
  }

}
