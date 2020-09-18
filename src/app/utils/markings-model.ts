import { Subject, Observable } from 'rxjs';
import { Scale } from 'src/app/utils/scale';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Color, Mesh } from 'three';
import { SeminoleActionModel } from './seminole-action-model';

export interface MarkingsModel {
  unpackMarkings(gltf: GLTF, color: Color);
}

export class DCVMarkingsModel implements MarkingsModel {

  private _scales: Map<string, Scale> = new Map<string, Scale>();
  public unpackMarkings(gltf: GLTF, color: Color) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        this._scales.set(o.name, new Scale(o));
        (o.material as any).color = color;
      }
    });
  }

  private traverse(object: Object3D, callback: (o: Object3D) => void ) {
    for(let obj of object.children) {
      this.traverse(obj, callback);
    }
    callback(object);
  }

  public moveScale(name: string, increment: number) {
    this._scales.get(name).move(increment);
  }

  public setScale(name: string, percent: number) {
    this._scales.get(name)?.set(percent);
  }

  public calculateMarkings(sam: SeminoleActionModel) {
    this.calculateYawArrow(sam);

  }

  public leftThrust: ScaleValue = new ScaleValue('s-thrust-left', (n: string, p: number) => this.setScale(n,p));
  public leftDrag: ScaleValue = new ScaleValue('s-drag-left', (n: string, p: number) => this.setScale(n,p));
  public leftRoll: ScaleValue = new ScaleValue('s-roll-left', (n: string, p: number) => this.setScale(n,p));
  public leftRudder: ScaleValue = new ScaleValue('l-rudder-left', (n: string, p: number) => this.setScale(n,p));
  public leftYaw: ScaleValue = new ScaleValue('l-yaw-left', (n: string, p: number) => this.setScale(n,p));

  public rightThrust: ScaleValue = new ScaleValue('s-thrust-right', (n: string, p: number) => this.setScale(n,p));
  public rightDrag: ScaleValue = new ScaleValue('s-drag-right', (n: string, p: number) => this.setScale(n,p));
  public rightRoll: ScaleValue = new ScaleValue('s-roll-right', (n: string, p: number) => this.setScale(n,p));
  public rightRudder: ScaleValue = new ScaleValue('l-rudder-right', (n: string, p: number) => this.setScale(n,p));
  public rightYaw: ScaleValue = new ScaleValue('l-yaw-right', (n: string, p: number) => this.setScale(n,p));

  private prop(value: string): number {
    return value === 'WINDMILL' ? 10 : 5;
  }

  private power(value: number): number {
    return (value / 25 + 1) * 4;
  }

  private altitude(value: number): number {
    return (value / 25) + 1;
  }

  private calculateYawArrow(sam: SeminoleActionModel): void {
    this.leftYaw.property = 0;
    this.rightYaw.property = 0;

    const inopEngine = sam.inopEngine.property;
    const prop = this.prop(sam.propeller.property);
    const power = this.power(sam.power.property);
    const altitude = this.altitude(sam.densityAltitude.property);

    // Calculate yaw
    let yawValue = (power - altitude + prop - 3) / 26;

    // Special case where power is 0
    if(sam.power.property === 0) {
      yawValue = 0;
      if(sam.propeller.property === 'FEATHER') {
        yawValue = 0.1;
        if(inopEngine === 'LEFT') this.rightYaw.property = yawValue;
        else this.leftYaw.property = yawValue;
        return;
      }
    }

    // all other cases
    if(inopEngine === 'LEFT') this.leftYaw.property = yawValue;
    else this.rightYaw.property = yawValue;
  }

}

class ObservableValue<T> {
  private _field: T;
  private _subject: Subject<T> = new Subject();
  public get property(): T { return this._field; }
  public get observable(): Observable<T> { return this._subject.asObservable(); }
  public set property(value: T) {
    this._field = value;
    this._subject.next(value);
  }
}

class ScaleValue {

  constructor(name: string, callback: (name: string, value: number) => void) {
    this._name = name;
    this._callback = callback;
  }

  private _name: string;
  private _field: number;
  public get property(): number { return this._field; }
  public set property(value: number) {
    this._field = value;
    this._callback(this._name, value);
  }
  private _callback: (name: string, value: number) => void;

}
