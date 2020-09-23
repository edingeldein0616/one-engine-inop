import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { AnimationDriver } from 'src/app/ui/views/AnimationDriver';
import { SelectionData } from '../../controls/selector/selection-data';
import { Subscription } from 'rxjs';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { DCVAerodynamicsModel } from 'src/app/utils/aerodynamics-model';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;
  private _aeroModel: DCVAerodynamicsModel;

  public vmca: number;
  public stallSpeed: number;

  private _currentFlapsAction: string;

  private _disposables: Subscription[] = [];

  constructor(private engineService: EngineService,
    private cdr: ChangeDetectorRef) { }

  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
    this._aeroModel = new DCVAerodynamicsModel();

    this._disposables = [

      this._sam.inopEngine.subject.subscribe(inopEngine => {
        this.inopEngine(inopEngine);
        this.clearOrientation();
        this.controlTechnique(this._sam.controlTechnique.property, inopEngine);
      }),

      this._sam.controlTechnique.subject.subscribe(controlTechnique => {
        this.clearOrientation();
        this.controlTechnique(controlTechnique, this._sam.inopEngine.property);
      }),

      this._sam.flaps.subject.subscribe(flaps => {
        this.flaps(flaps);
      }),

      this._sam.gear.subject.subscribe(gear => {
        this.gear(gear === 'DOWN');
      })
    ];
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadMarkings(environment.markings, this._aeroModel);
    this._aeroModel.calculateMarkings(this._sam);
    this.cdr.detectChanges();
  }

  public valueChanged(data: SelectionData) {
    switch(data.label) {
      case 'INOP. ENGINE':
        this._sam.inopEngine.property = data.value;
      break;
      case 'FLAPS':
        this._sam.flaps.property = Number(data.percent);
      break;
      case 'LANDING GEAR':
        this._sam.gear.property = data.value;
      break;
      case 'CONTROL TECHNIQUE':
        this._sam.controlTechnique.property = data.value;
      break;
      case 'PROPELLER':
        this._sam.propeller.property = data.value;
      break;
      case 'POWER':
        this._sam.power.property = data.percent;
      break;
      case 'AIRSPEED':
        this._sam.airspeed.property = data.percent;
      break;
      case 'WEIGHT':
        this._sam.weight.property = data.percent;
      break;
      case 'CENTER OF GRAVITY':
        this._sam.cog.property = data.percent;
      break;
      case 'DENSITY ALTITUDE':
        this._sam.densityAltitude.property = data.percent;
      break;
    }

    this._aeroModel.calculateMarkings(this._sam);
    this.vmca = this._aeroModel.vmca(this._sam);
    this.stallSpeed = this._aeroModel.stallSpeed(this._sam);
  }

  public controlTechnique(controlTechnique: string, inopEngine: string) {
    this.clearRudder();
    this.rudder(controlTechnique, inopEngine);

    if(controlTechnique === 'WINGS LEVEL') {
      this.wingsLevel(inopEngine);
    } else {
      this.zeroSideSlip(inopEngine);
    }
  }

  public inopEngine(inopEngine: string) {
    const inopEngineAction = inopEngine === 'LEFT' ? 'propLAction' : 'propRAction';
    const otherEngineAction = inopEngine === 'LEFT' ? 'propRAction' : 'propLAction';
    this._animationDriver.play(inopEngineAction);
    this._animationDriver.stop(otherEngineAction);
  }

  public rudder(controlTechnique: string, inopEngine: string) {
    if(controlTechnique === 'WINGS LEVEL') {
      const rudderAction = inopEngine === 'LEFT' ? 'rudderRightAction' : 'rudderLeftAction';
      this._animationDriver.jumpTo(rudderAction, 100);
    } else {
      this._animationDriver.jumpTo('rudderLeftAction', 0);
    }
  }

  public clearOrientation() {
    this._animationDriver.stop('yawRightAction');
    this._animationDriver.stop('yawLeftAction');
    this._animationDriver.stop('rollRightAction');
    this._animationDriver.stop('rollLeftAction');
  }

  public clearRudder() {
    this._animationDriver.stop('rudderRightAction');
    this._animationDriver.stop('rudderLeftAction');
  }

  public wingsLevel(inopEngine: string) {
    const yawAction = inopEngine === 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
    this._animationDriver.jumpTo(yawAction, 100);
  }

  public zeroSideSlip(inopEngine: string) {
    const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
    this._animationDriver.jumpTo(rollAction, 100);
  }

  public gear(down: boolean): void {
    this._animationDriver.jumpTo('GearAction', down ? 0 : 100);
  }

  public flaps(notch: number): void {

    if(this._currentFlapsAction) {
      this._animationDriver.stop(this._currentFlapsAction);
    }

    if(notch == (0/3) * 100) {
      this._currentFlapsAction = 'flapsTo0Action';
      this._animationDriver.jumpTo(this._currentFlapsAction, 0);
    } else if(notch == (1/3) * 100) {
      this._currentFlapsAction = 'flapsTo10Action';
      this._animationDriver.jumpTo(this._currentFlapsAction, 100);
    } else if(notch == (2/3) * 100) {
      this._currentFlapsAction = 'flapsTo25Action';
      this._animationDriver.jumpTo(this._currentFlapsAction, 100);
    } else if(notch == (3/3) * 100) {
      this._currentFlapsAction = 'flapsTo40Action';
      this._animationDriver.jumpTo(this._currentFlapsAction, 100);
    }
  }

  public ngOnDestroy() {
    this.engineService.dispose();
    while(this._disposables.length > 0) {
      this._disposables.pop().unsubscribe();
    }
  }

}
