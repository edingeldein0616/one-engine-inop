import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { AnimationDriver } from 'src/app/ui/views/AnimationDriver';
import { SelectionData } from '../../controls/selector/selection-data';
import { Subject, Subscription } from 'rxjs';
import { SeminoleActionModel } from './seminole-action-model';
import { withModule } from '@angular/core/testing';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;

  private _currentFlapsAction: string;

  private _disposables: Subscription[] = [];

  constructor(private engineService: EngineService) { }

  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();

    this._disposables = [

      this._sam.inopEngineObservable.subscribe(inopEngine => {
        this.inopEngine(inopEngine);
        this.clearOrientation();
        this.controlTechnique(this._sam.controlTechnique, inopEngine);
      }),

      this._sam.controlTehcniqueObservable.subscribe(controlTechnique => {
        this.clearOrientation()
        this.controlTechnique(controlTechnique, this._sam.inopEngine);
      }),

      this._sam.flapsObservable.subscribe(flaps => {
        this.flaps(flaps);
      }),

      this._sam.gearObservable.subscribe(gear => {
        this.gear(gear === 'DOWN');
      })
    ];
  }

  public ngAfterViewInit() {
    this.engineService.loadModel(environment.seminole);
  }

  public valueChanged(data: SelectionData) {
    switch(data.label) {
      case 'INOP. ENGINE':
        this._sam.inopEngine = data.value;
      break;
      case 'FLAPS':
        this._sam.flaps = Number(data.percent);
      break;
      case 'LANDING GEAR':
        this._sam.gear = data.value;
      break;
      case 'CONTROL TECHNIQUE':
        this._sam.controlTechnique = data.value;
      break;

    }
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
