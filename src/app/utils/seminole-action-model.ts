import { Subject, BehaviorSubject } from 'rxjs';

export class SeminoleActionModel {

  private _validatePercent = (v: number) => { return v >= 0 && v <= 100; }

  public inopEngine: SubjectValue<string> = new SubjectValue<string>('INOP ENGINE', (v: string) => { return v === 'LEFT' || v === 'RIGHT'}, 'LEFT');
  public controlTechnique: SubjectValue<string> = new SubjectValue<string>('CONTROL TECHNIQUE', (v: string) => {return v === 'ZERO SIDE SLIP' || v === 'WINGS LEVEL'}, 'ZERO SIDE SLIP');
  public flaps: SubjectValue<number> = new SubjectValue<number>('FLAPS', (v: number) => { return v >= 0 && v <= 100 }, 0);
  public gear: SubjectValue<string> = new SubjectValue<string>('GEAR', (v: string) => { return v === 'UP' || v === 'DOWN' }, 'UP');
  public propeller: SubjectValue<string> = new SubjectValue<string>('PROPELLER', (v: string) => { return v === 'WINDMILL' || v === 'FEATHER' }, 'WINDMILL');
  public power: SubjectValue<number> = new SubjectValue<number>('POWER', this._validatePercent, 100);
  public densityAltitude: SubjectValue<number> = new SubjectValue<number>('DENSITY ALTITUDE', this._validatePercent, 50);
  public airspeed: SubjectValue<number> = new SubjectValue<number>('AIRSPEED', this._validatePercent, 0);
  public weight: SubjectValue<number> = new SubjectValue<number>('WEIGHT', this._validatePercent, 0);
  public cog: SubjectValue<number> = new SubjectValue<number>('CENTER OF GRAVITY', this._validatePercent, 0);

  public dispose(): void {
  }

}

export class SubjectValue<T> {

  constructor(name: string, validate: (value: T) => boolean, initialValue?: T) {
    this._subject = new BehaviorSubject(initialValue);
    this._name = name;
    this.validate = validate;
  }

  private _name: string;
  private _field: T;
  private _subject: BehaviorSubject<T>;
  public get subject(): Subject<T> {
    return this._subject;
  }
  public get property(): T {
    return this._field;
  }
  public set property(value: T) {
    if(this.validate(value)) {
      this._field = value;
      this._subject.next(value);
    }
  }
  public readonly validate: (value: T) => boolean;

}
