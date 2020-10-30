import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EngineService } from 'src/app/engine/engine.service';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { environment } from 'src/environments/environment';
import { SelectionData } from '../../controls/selector/selection-data';

@Component({
  selector: 'app-view-zst',
  templateUrl: './view-zst.component.html',
  styleUrls: ['./view-zst.component.scss']
})
export class ViewZstComponent implements OnInit, AfterViewInit, OnDestroy {

  public inclinometerImages = [
    environment.assetUrl + 'inclinometerLeft.png',
    environment.assetUrl + 'inclinometerCenter.png',
    environment.assetUrl + 'inclinometerRight.png'
  ];
  public image = this.inclinometerImages[1];

  private _sam: SeminoleActionModel;
  private _animationDriver: AnimationDriver;
  private _disposables: Subscription[];

  constructor(private engineService: EngineService) { }

  public ngOnInit() {
    this._sam = new SeminoleActionModel();
    this._animationDriver = new AnimationDriver();
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);

    this._disposables = [
      this._sam.inopEngine.subject.subscribe(inopEngine => {
        var controlTechnique = this._sam.controlTechnique.property;

        this.inopEngine(inopEngine);
        this.opEngine(inopEngine);
        this.rudder(inopEngine);
        this.controlTechnique(inopEngine, controlTechnique);
        this.setImage(inopEngine, controlTechnique);
      }),
      this._sam.controlTechnique.subject.subscribe(controlTechnique => {
        var inopEngine = this._sam.inopEngine.property;

        this.controlTechnique(inopEngine, controlTechnique);
        this.setImage(inopEngine, controlTechnique);
      })
    ];

    this.gear();
  }

  public ngOnDestroy() {
    this.engineService.dispose();
    this._disposables.forEach(disp => disp.unsubscribe());
  }

  public onValueSelected(data: SelectionData) {
    console.log(data);
    switch (data.label) {
      case 'INOP. ENGINE':
        this._sam.inopEngine.property = data.value;
      break;
      case 'CONTROL TECHNIQUE':
        this._sam.controlTechnique.property = data.value;
      break
    }
  }

  private inopEngine(inopEngine: string) {
    const inopEngineAction = inopEngine === 'LEFT' ? 'propLAction' : 'propRAction';
    const otherEngineAction = inopEngine === 'LEFT' ? 'propRAction' : 'propLAction';
    this._animationDriver.play(environment.seminole, inopEngineAction);
    this._animationDriver.stop(environment.seminole, otherEngineAction);
  }

  private opEngine(inopEngine: string) {
    const opEngineAction = inopEngine === 'RIGHT' ? 'propLSpinAction' : 'propRSpinAction';
    const opEngineSpin = inopEngine === 'RIGHT' ? 'propLeftSpin' : 'propRightSpin';
    const otherEngineAction = inopEngine === 'RIGHT' ? 'propRSpinAction' : 'propLSpinAction';
    const otherEngineSpin = inopEngine === 'RIGHT' ? 'propRightSpin' : 'propLeftSpin';
    this._animationDriver.stop(environment.seminole, otherEngineAction);
    this._animationDriver.play(environment.seminole, opEngineAction);
    this.engineService.hideObject(opEngineSpin, false)
    this.engineService.hideObject(otherEngineSpin, true);
  }

  private controlTechnique(inopEngine: string, controlTechnique: string) {
    this.clearOrientation();
    if(controlTechnique === 'WINGS LEVEL') {
      const yawAction = inopEngine === 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
      this._animationDriver.jumpTo(environment.seminole, yawAction, 100);
    } else {
      const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
      this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
    }
  }

  private rudder(inopEngine: string) {
    this.clearRudder();
    const rudderAction = inopEngine === 'LEFT' ? 'rudderRightAction' : 'rudderLeftAction';
    this._animationDriver.jumpTo(environment.seminole, rudderAction, 100);
  }

  private clearRudder() {
    this._animationDriver.stop(environment.seminole, 'rudderRightAction');
    this._animationDriver.stop(environment.seminole, 'rudderLeftAction');
  }

  public clearOrientation() {
    this._animationDriver.stop(environment.seminole, 'yawRightAction');
    this._animationDriver.stop(environment.seminole, 'yawLeftAction');
    this._animationDriver.stop(environment.seminole, 'rollRightAction');
    this._animationDriver.stop(environment.seminole, 'rollLeftAction');
  }

  private gear() {
    this._animationDriver.jumpTo(environment.seminole, 'GearAction', 100);
  }

  private setImage(inopEngine: string, controlTechnique: string) {
    if(controlTechnique === 'ZERO SIDESLIP') {
      this.image = inopEngine === 'LEFT' ? this.inclinometerImages[2] : this.inclinometerImages[0];;
    } else {
      this.image = this.inclinometerImages[1];
    }
  }
}
