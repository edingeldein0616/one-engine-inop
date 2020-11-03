import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { ActionPair } from 'src/app/utils/action-pair';
import { Subscription } from 'rxjs';
import { EngineService } from 'src/app/engine/engine.service';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { environment } from 'src/environments/environment';
import { SelectionData } from '../../controls/selector/selection-data';
import { Action } from 'rxjs/internal/scheduler/Action';
import { ZeroSlopeEnding } from 'three';
import { ViewManagerService } from 'src/app/services/view-manager.service';

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

  constructor(private engineService: EngineService,
    private vms: ViewManagerService) { }

  public ngOnInit() {
    this._sam = new SeminoleActionModel();
    this._animationDriver = new AnimationDriver();
    this.vms.setCurrentView('Zero Sideslip Technique');
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadWindPlane(environment.windplane);
    this.engineService.loadMarkings(environment.zerosideslipMarkings);

    this._disposables = [
      this._sam.inopEngine.subject.subscribe(inopEngine => {
        var controlTechnique = this._sam.controlTechnique.property;

        this.inopEngine(inopEngine);
        this.opEngine(inopEngine);
        this.rudder(inopEngine);
        this.controlTechnique(inopEngine, controlTechnique);
        this.markings(inopEngine, controlTechnique);
        this.setImage(inopEngine, controlTechnique);
      }),
      this._sam.controlTechnique.subject.subscribe(controlTechnique => {
        var inopEngine = this._sam.inopEngine.property;

        this.controlTechnique(inopEngine, controlTechnique);
        this.markings(inopEngine, controlTechnique);
        this.setImage(inopEngine, controlTechnique);
      })
    ];

    this._animationDriver.play(environment.windplane, 'windplane-action');
    this.gear();
  }

  public ngOnDestroy() {
    this.engineService.dispose();
    this._disposables.forEach(disp => disp.unsubscribe());
  }

  public onValueSelected(data: SelectionData) {
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
      this._animationDriver.jumpTo(environment.zerosideslipMarkings, yawAction, 100);
    } else {
      const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
      this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
    }
  }

  private markings(inopEngine: string, controlTechnique: string) {
    this.hideZerosideslip();

    let direction: ActionPair = Zerosideslip.directionForward;
    let prop: ActionPair;
    let rudder: ActionPair;
    let slide: ActionPair;

    if(inopEngine === 'LEFT') {
      prop = Zerosideslip.propRight;
      rudder = Zerosideslip.rudderLeft;
      slide = Zerosideslip.slideRight;
    } else {
      prop = Zerosideslip.propLeft;
      rudder = Zerosideslip.rudderRight;
      slide = Zerosideslip.slideLeft;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(prop.obj, false);
    this.engineService.hideObject(rudder.obj, false);
    this._animationDriver.play(environment.zerosideslipMarkings, direction.action);
    this._animationDriver.play(environment.zerosideslipMarkings, prop.action);
    this._animationDriver.play(environment.zerosideslipMarkings, rudder.action);

    if(controlTechnique !== 'WINGS LEVEL') {
      this.engineService.hideObject(slide.obj, false);
      this._animationDriver.play(environment.zerosideslipMarkings, slide.action);
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
    this._animationDriver.stop(environment.zerosideslipMarkings, 'yawRightAction');
    this._animationDriver.stop(environment.seminole, 'yawLeftAction');
    this._animationDriver.stop(environment.zerosideslipMarkings, 'yawLeftAction');
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

  private hideZerosideslip() {
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.directionForward.action);
    this.engineService.hideObject(Zerosideslip.directionForward.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.propLeft.action);
    this.engineService.hideObject(Zerosideslip.propLeft.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.propRight.action);
    this.engineService.hideObject(Zerosideslip.propRight.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.rudderRight.action);
    this.engineService.hideObject(Zerosideslip.rudderRight.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.rudderLeft.action);
    this.engineService.hideObject(Zerosideslip.rudderLeft.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.slideRight.action);
    this.engineService.hideObject(Zerosideslip.slideRight.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, Zerosideslip.slideLeft.action);
    this.engineService.hideObject(Zerosideslip.slideLeft.obj, true);
  }
}

class Zerosideslip {
  public static readonly directionForward = new ActionPair('zerosideslip-direction-arrow-forward', 'zerosideslip-direction-action-forward');
  public static readonly propLeft = new ActionPair('zerosideslip-prop-arrow-left', 'zerosideslip-prop-action-left');
  public static readonly propRight = new ActionPair('zerosideslip-prop-arrow-right', 'zerosideslip-prop-action-right');
  public static readonly rudderRight = new ActionPair('zerosideslip-rudder-arrow-right', 'zerosideslip-rudder-action-right');
  public static readonly rudderLeft = new ActionPair('zerosideslip-rudder-arrow-left', 'zerosideslip-rudder-action-left');
  public static readonly slideRight = new ActionPair('zerosideslip-slide-arrow-right', 'zerosideslip-slide-action-right');
  public static readonly slideLeft = new ActionPair('zerosideslip-slide-arrow-left', 'zerosideslip-slide-action-left');
}
