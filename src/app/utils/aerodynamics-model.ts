import { Subject, Observable } from 'rxjs';
import { Scale } from 'src/app/utils/scale';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Object3D, Color, Mesh } from 'three';
import { SeminoleActionModel } from './seminole-action-model';
import { Action } from 'rxjs/internal/scheduler/Action';
import { MatHeaderRowDef } from '@angular/material';

export abstract class AerodynamicsModel {

  public abstract unpackMarkings(gltf: GLTF, colorOne: Color, colorTwo: Color);

  protected traverse(object: Object3D, callback: (o: Object3D) => void ) {
    for(let obj of object.children) {
      this.traverse(obj, callback);
    }
    callback(object);
  }
}

export class DCVAerodynamicsModel extends AerodynamicsModel {

  private _scales: Map<string, Scale> = new Map<string, Scale>();
  public unpackMarkings(gltf: GLTF, colorOne: Color, colorTwo: Color) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        this._scales.set(o.name, new Scale(o));
        var color = o.name[0] === 't' ? colorTwo : colorOne;
        (o.material as any).color = color;
      }
    });
  }

  public moveScale(name: string, increment: number) {
    this._scales.get(name).move(increment);
  }

  public setScale(name: string, percent: number) {
    this._scales.get(name)?.set(percent);
  }

  public calculateMarkings(sam: SeminoleActionModel) {
    const power = this.power(sam.power.property);
    const altitude = this.altitude(sam.densityAltitude.property);
    const prop = this.prop(sam.propeller.property);
    const idle = sam.power.property < 1;

    this.calculateYawRudderForce(sam, prop, power, altitude);
    this.calculateThrustForce(sam, power, altitude);
    this.calculateDragForce(sam, idle);
    this.calculateRollForce(sam, power, altitude, prop, idle);
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

  // 1 - 5
  private airspeed(value: number): number {
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

  public rudderEffectiveness(sam: SeminoleActionModel): number {
    const weight = this.weight(sam.weight.property);
    const cg = this.cg(sam.cog.property);
    const bank = this.controlTechnique(sam.controlTechnique.property);
    const flaps = this.flaps(sam.flaps.property);
    const gear = this.gear(sam.gear.property);
    const airspeed = this.airspeed(sam.airspeed.property);

    return weight + cg + airspeed + bank + flaps + gear - 1;
  }

  private calculateYawRudderForce(sam: SeminoleActionModel, prop: number, power: number, altitude: number): void {
    this.leftRudder.property = this.rightRudder.property = this.leftYaw.property = this.rightYaw.property = 0;

    // Calculate yaw
    let yawValue = (power - altitude + prop - 3) / 26;

    // Special case where power is 0
    if(sam.power.property === 0) {
      yawValue = 0;
      if(sam.propeller.property === 'FEATHER') {
        yawValue = 0.1;
        if(sam.inopEngine.property === 'LEFT') { this.rightRudder.property = this.rightYaw.property = yawValue; }
        else this.leftRudder.property = this.leftYaw.property = yawValue;
        return;
      }
    }

    // all other cases
    if(sam.inopEngine.property === 'LEFT') this.leftRudder.property = this.leftYaw.property = yawValue;
    else this.rightRudder.property = this.rightYaw.property = yawValue;
  }

  private calculateThrustForce(sam: SeminoleActionModel, power: number, altitude: number): void {
    this.leftThrust.property = this.rightThrust.property = 0;

    if(power > 4)
    {
      const thrust = ((power / 4) + 6 - altitude) / 10;
      if(sam.inopEngine.property === 'LEFT') this.rightThrust.property = thrust;
      else this.leftThrust.property = thrust;
    }
  }

  private calculateDragForce(sam: SeminoleActionModel, idle: boolean): void {
    this.leftDrag.property = this.rightDrag.property = 0;

    const inopEngine = sam.inopEngine.property;
    const propeller = sam.propeller.property;

    const drag = propeller === 'WINDMILL' ? 1 : 0.15;
    if(inopEngine === 'LEFT') {
      this.leftDrag.property = drag;
      this.rightDrag.property = idle ? 1 : 0;
    } else {
      this.rightDrag.property = drag;
      this.leftDrag.property = idle ? 1 : 0;
    }
  }

  private calculateRollForce(sam: SeminoleActionModel, power: number, altitude: number, prop: number, idle: boolean): void {
    this.leftRoll.property = this.rightRoll.property = 0;

    if(!idle) {
      const inopEngine = sam.inopEngine.property;

      const roll = Math.floor((power - altitude + prop - 3) / 2) / 13;
      if(inopEngine === 'LEFT') this.rightRoll.property = roll;
      else this.leftRoll.property = roll;
    }
  }

}

export class SEPAerodynamicsModel extends AerodynamicsModel {

  public leftThrust: ScaleValue = new ScaleValue('s-thrust-left', (n: string, p: number) => this.setScale(n,p));
  public leftDrag: ScaleValue = new ScaleValue('s-drag-left', (n: string, p: number) => this.setScale(n,p));

  public rightThrust: ScaleValue = new ScaleValue('s-thrust-right', (n: string, p: number) => this.setScale(n,p));
  public rightDrag: ScaleValue = new ScaleValue('s-drag-right', (n: string, p: number) => this.setScale(n,p));

  private _scales: Map<string, Scale> = new Map<string, Scale>();
  public unpackMarkings(gltf: GLTF, colorOne: Color, colorTwo: Color) {
    this.traverse(gltf.scene as Object3D, (o: Object3D) => {
      if(o instanceof Mesh) {
        this._scales.set(o.name, new Scale(o));
        var color = o.name[0] === 't' ? colorTwo : colorOne;
        (o.material as any).color = color;
      }
    });
  }

  public moveScale(name: string, increment: number) {
    this._scales.get(name).move(increment);
  }

  public setScale(name: string, percent: number) {
    this._scales.get(name)?.set(percent);
  }

  public calculateMarkings(sam: SeminoleActionModel) {
    const power = this.scalePower(sam.power.property);
    const altitude = this.scaleAltitude(sam.densityAltitude.property);
    const idle = sam.power.property < 1;

    this.calculateThrustForce(sam, power, altitude);
    this.calculateDragForce(sam, idle);
  }

  private calculateDragForce(sam: SeminoleActionModel, idle: boolean): void {
    this.leftDrag.property = this.rightDrag.property = 0;

    const inopEngine = sam.inopEngine.property;
    const propeller = sam.propeller.property;

    const drag = propeller === 'WINDMILL' ? 1 : 0.15;
    if(inopEngine === 'LEFT') {
      this.leftDrag.property = drag;
      this.rightDrag.property = idle ? 1 : 0;
    } else {
      this.rightDrag.property = drag;
      this.leftDrag.property = idle ? 1 : 0;
    }
  }

  private calculateThrustForce(sam: SeminoleActionModel, power: number, altitude: number): void {
    this.leftThrust.property = this.rightThrust.property = 0;

    if(power > 4)
    {
      const thrust = ((power / 4) + 6 - altitude) / 10;
      if(sam.inopEngine.property === 'LEFT') this.rightThrust.property = thrust;
      else this.leftThrust.property = thrust;
    }
  }

  // 4, 8, 12, 16, 20
  private scalePower(value: number): number {
    return (value / 25 + 1) * 4;
  }

  // 1 - 5
  private scaleAltitude(value: number): number {
    return (value / 25) + 1;
  }

  // 150, 75, 0, -75, -150
  private altitude(value: number) {
    return 150 - (value * 3);
  }

  // -200, 0
  private prop(value: string): number {
    return value === 'WINDMILL' ? -200 : 0;
  }

  // -300, 0 (bank)
  private controlTechnique(value: string): number {
    return value === 'WINGS LEVEL' ? -300 : 0;
  }

  // -50, -25, 0, -50, -100
  private airspeed(value: number): number {
    if(value === 0) { return -50; }
    else if(value <= 25) { return -25; }
    else if(value <= 50) { return 0; }
    else if(value <= 75) { return -50; }
    else { return -100; }
  }

  // 68, 34, 0, -34, -68
  private weight(value: number): number {
    return 68 - (value / 25) * 34;
  }

  // 40, 20, 0, -20, -40
  private cog(value: number): number {
    return 40 - (value / 25) * 20;
  }

  // 1 - 4
  private flaps(value: number): number {
    return Math.floor(value / 33) + 1;
  }

  // 0, -20, -240, -275
  private pflaps(value: number): number {
    value /= 100;
    if(value === 0) {
      return 0;
    } else if (value <= 34 / 100) {
      return -20;
    } else if (value <= 67 / 100) {
      return -240;
    } else {
      return -275;
    }
  }

  // 1 , 3
  private gear(value: string): number {
    return value === 'UP' ? 1 : 3;
  }

  //0, -250
  private pGear(value: string): number {
    return value === 'UP' ? 0 : -250;
  }

  public roc(sam: SeminoleActionModel): number {
    const altitude = this.altitude(sam.densityAltitude.property);
    const prop = this.prop(sam.propeller.property);
    const bank = this.controlTechnique(sam.controlTechnique.property);
    const airspeed = this.airspeed(sam.airspeed.property);
    const weight = this.weight(sam.weight.property);
    const cog = this.cog(sam.cog.property);
    const pflaps = this.pflaps(sam.flaps.property);
    const pgear = this.pGear(sam.gear.property);

    return 170 + altitude + prop + bank + airspeed + weight + cog + pflaps + pgear;
  }

  public serviceCeiling(sam: SeminoleActionModel): number {
    const prop = this.prop(sam.propeller.property);
    const bank = this.controlTechnique(sam.controlTechnique.property);
    const weight = this.weight(sam.weight.property);
    const cog = this.cog(sam.cog.property);
    const pflaps = this.pflaps(sam.flaps.property);
    const pgear = this.pGear(sam.gear.property);

    const sc = 5700 + (weight * 20) + (prop * 22) + (bank * 21) + (cog * 13) + (pflaps * 21) + (pgear * 21);
    return sc < 0 ? NaN : sc;
  }

  public absoluteCeiling(serviceCeiling: number): number {
    const ac = Math.floor(serviceCeiling * 1.102);
    return ac < 0 ? NaN : ac;
  }

  public excessTHP(roc: number): number {
    return Math.floor(roc / 8);
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
