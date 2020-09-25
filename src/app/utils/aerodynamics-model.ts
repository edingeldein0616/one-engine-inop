import { Subject, Observable } from 'rxjs';
import { Scale } from 'src/app/utils/scale';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Color, Mesh } from 'three';
import { SeminoleActionModel } from './seminole-action-model';

export interface AerodynamicsModel {
  unpackMarkings(gltf: GLTF, color: Color);
}

export class DCVAerodynamicsModel implements AerodynamicsModel {

  private _scales: Map<string, Scale> = new Map<string, Scale>();
  public unpackMarkings(gltf: GLTF, color: Color) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        this._scales.set(o.name, new Scale(o));
        if(o.name[0] === 't') return;
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
    this.calculateYawRudderForce(sam);
    this.calculateThrustForce(sam);
    this.calculateDragForce(sam);
    this.calculateRollForce(sam);
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

  // 10, 5
  private prop(value: string): number {
    return value === 'WINDMILL' ? 10 : 5;
  }

  // 4, 8, 12, 16, 20
  private power(value: number): number {
    return (value / 25 + 1) * 4;
  }

  // 1 - 5
  private altitude(value: number): number {
    return (value / 25) + 1;
  }

  // 1 - 5
  private cg(value: number): number {
    return (value / 25) + 1;
  }

  // 1, 3
  private controlTechnique(value: string): number {
    return value === 'WINGS LEVEL' ? 1 : 3;
  }

  // 0 - 3
  private flaps(value: number): number {
    return Math.floor(value / 33);
  }

  // 1 , 3
  private gear(value: string): number {
    return value === 'UP' ? 1 : 3;
  }

  // 1 - 5
  private weight(value: number): number {
    return (value / 25) + 1;
  }

  public vmca(sam: SeminoleActionModel): number {
    const power = this.power(sam.power.property);
    const altitude = this.altitude(sam.densityAltitude.property);
    const prop = this.prop(sam.propeller.property);
    const cg = this.cg(sam.cog.property);
    const bank = this.controlTechnique(sam.controlTechnique.property);
    const flaps = this.flaps(sam.flaps.property);
    const gear = this.gear(sam.gear.property);
    const weight = this.weight(sam.weight.property);

    if(power <= 4) return NaN;

    return ((power - altitude + prop - 3) - (weight + cg + 3 + bank + flaps + gear - 2) + 40);
  }

  public stallSpeed(sam: SeminoleActionModel): number {
    const power = this.power(sam.power.property);
    const prop = this.prop(sam.propeller.property);
    const cg = this.cg(sam.cog.property);
    const bank = this.controlTechnique(sam.controlTechnique.property);
    const flaps = this.flaps(sam.flaps.property);
    const gear = this.gear(sam.gear.property);
    const weight = this.weight(sam.weight.property);

    return (42 - flaps + weight + cg - (power / 4) + prop - bank + gear);
  }

  private calculateYawRudderForce(sam: SeminoleActionModel): void {
    this.leftRudder.property = this.rightRudder.property = this.leftYaw.property = this.rightYaw.property = 0;

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
        if(inopEngine === 'LEFT') { this.rightRudder.property = this.rightYaw.property = yawValue; }
        else this.leftRudder.property = this.leftYaw.property = yawValue;
        return;
      }
    }

    // all other cases
    if(inopEngine === 'LEFT') this.leftRudder.property = this.leftYaw.property = yawValue;
    else this.rightRudder.property = this.rightYaw.property = yawValue;
  }

  private calculateThrustForce(sam: SeminoleActionModel): void {
    this.leftThrust.property = this.rightThrust.property = 0;

    const inopEngine = sam.inopEngine.property;
    const power = this.power(sam.power.property);
    const altitude = this.altitude(sam.densityAltitude.property);

    if(power > 4)
    {
      const thrust = ((power / 4) + 6 - altitude) / 10;
      if(inopEngine === 'LEFT') this.rightThrust.property = thrust;
      else this.leftThrust.property = thrust;
    }
  }

  private calculateDragForce(sam: SeminoleActionModel): void {
    this.leftDrag.property = this.rightDrag.property = 0;

    const inopEngine = sam.inopEngine.property;
    const propeller = sam.propeller.property;

    const drag = propeller === 'WINDMILL' ? 1 : 0.15;
    if(inopEngine === 'LEFT') this.leftDrag.property = drag;
    else this.rightDrag.property = drag;
  }

  private calculateRollForce(sam: SeminoleActionModel): void {
    this.leftRoll.property = this.rightRoll.property = 0;

    const inopEngine = sam.inopEngine.property;
    const power = this.power(sam.power.property);
    const altitude = this.altitude(sam.densityAltitude.property);
    const prop = this.prop(sam.propeller.property);

    const roll = Math.floor((power - altitude + prop - 3) / 2) / 13;
    if(inopEngine === 'LEFT') this.rightRoll.property = roll;
    else this.leftRoll.property = roll;
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
