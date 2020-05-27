
/**
 * Data model for the view-dcv component
 */
export class ModelDcv {

  /**
   * Inoperative engine of model dcv
   */
  private _inopEngine : boolean;
  public get inopEngine() : boolean {
    return this._inopEngine;
  }
  public set inopEngine(v : boolean) {
    this._inopEngine = v;
  }

  /**
   * Power  of model dcv
   */
  private _power : number;
  public get power() : number {
    return this._power;
  }
  public set power(v : number) {
    this._power = v;
  }


  /**
   * Density altitude of model dcv
   */
  private _densityAlt : number;
  public get densityAlt() : number {
    return this._densityAlt;
  }
  public set densityAlt(v : number) {
    this._densityAlt = v;
  }

  /**
   * Propeller  of model dcv
   */
  private _propeller : boolean;
  public get propeller() : boolean {
    return this._propeller;
  }
  public set propeller(v : boolean) {
    this._propeller = v;
  }

  /**
   * Control technique of model dcv
   */
  private _controlTech : boolean;
  public get controlTech() : boolean {
    return this._controlTech;
  }
  public set controlTech(v : boolean) {
    this._controlTech = v;
  }

  /**
   * Airspeed  of model dcv
   */
  private _airspeed : number;
  public get airspeed() : number {
    return this._airspeed;
  }
  public set airspeed(v : number) {
    this._airspeed = v;
  }

  /**
   * Weight  of model dcv
   */
  private _weight : number;
  public get weight() : number {
    return this._weight;
  }
  public set weight(v : number) {
    this._weight = v;
  }


  /**
   * Center of gravity  of model dcv
   */
  private _cog : number;
  public get cog() : number {
    return this._cog;
  }
  public set cog(v : number) {
    this._cog = v;
  }


  /**
   * Flaps  of model dcv
   */
  private _flaps : number;
  public get flaps() : number {
    return this._flaps;
  }
  public set flaps(v : number) {
    this._flaps = v;
  }


  /**
   * Landing Gear  of model dcv
   */
  private _gear : boolean;
  public get gear() : boolean {
    return this._gear;
  }
  public set gear(v : boolean) {
    this._gear = v;
  }

}
