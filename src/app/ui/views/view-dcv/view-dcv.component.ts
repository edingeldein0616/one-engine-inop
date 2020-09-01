import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { AnimationDriver } from 'src/app/ui/views/AnimationDriver';
import { SelectionData } from '../../controls/selector/selection-data';
import { Subject, Subscription } from 'rxjs';
import { SeminoleActionModel } from './seminole-action-model';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;

  private _currentFlapsAction: string;
  private _inopEngine: string;
  private _controlTechnique: string;

  private _disposables: Subscription[] = [];

  constructor(private engineService: EngineService) { }

  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();

    this._disposables = [
      this._sam.inopEngineObservable.subscribe(inopEngine => {
        console.log(inopEngine);
      })
    ];
  }

  public ngAfterViewInit() {
    this.engineService.loadModel(environment.seminole);
  }

  public controlTechnique(inopEngine: string) {
    if(this._controlTechnique === 'WINGS LEVEL') {
      this.wingsLevel(inopEngine);
    } else {
      this.zeroSideSlip(inopEngine);
    }
  }

  public valueChanged(data: SelectionData) {
    console.log(data);

    switch(data.label) {
      case 'INOP. ENGINE':
        this._inopEngine = data.value;
        const inopEngine = this._inopEngine === 'LEFT' ? 'propLAction' : 'propRAction';
        const otherEngine = this._inopEngine === 'LEFT' ? 'propRAction' : 'propLAction';
        this._animationDriver.play(inopEngine);
        this._animationDriver.stop(otherEngine);

        if(this._controlTechnique === 'WINGS LEVEL') {
          this.setYaw(true);
        } else {
          this.setBank(true);
        }

      break;
      case 'FLAPS':
        this.flaps(Number(data.percent));
      break;
      case 'LANDING GEAR':
        this.gear(data.value === 'DOWN');
      break;
      case 'CONTROL TECHNIQUE':
        this._controlTechnique = data.value;
        if(data.value === 'WINGS LEVEL') {
          this.setYaw(true);
        } else {
          this.setBank(true);
        }
      break;

    }
  }

  public wingsLevel(inopEngine: string) {
    const yawAction = inopEngine === 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
    this._animationDriver.jumpTo(yawAction, 100);
  }

  public zeroSideSlip(inopEngine: string) {
    const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
    this._animationDriver.jumpTo(rollAction, 100);
  }

  public setYaw(yaw: boolean): void {
    if(yaw) {
      this.setBank(false);
      const yawAction = this._inopEngine == 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
      this._animationDriver.jumpTo(yawAction, 100);
    } else {
      this._animationDriver.stop('yawRightAction');
      this._animationDriver.stop('yawLeftAction');
    }
  }

  public setBank(bank: boolean): void {
    if(bank) {
      this.setYaw(false);
      const bankAction = this._inopEngine == 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
      this._animationDriver.jumpTo(bankAction, 100);
    } else {
      this._animationDriver.halt('rollRightAction');
      this._animationDriver.halt('rollLeftAction');
    }
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
  }

}
