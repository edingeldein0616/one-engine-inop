import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Action } from 'rxjs/internal/scheduler/Action';
import { EngineService } from 'src/app/engine/engine.service';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { environment } from 'src/environments/environment';
import { SelectionData } from '../../controls/selector/selection-data';

@Component({
  selector: 'app-view-cef',
  templateUrl: './view-cef.component.html',
  styleUrls: ['./view-cef.component.scss']
})
export class ViewCefComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService) { }

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;

  private _disposables: Subscription[] =[];

  ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
  }

  ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadMarkings(environment.slipstreamMarkings);
    this.engineService.loadMarkings(environment.pfactorMarkings);
    this.engineService.loadMarkings(environment.acceleratedMarkings);
    this.engineService.loadMarkings(environment.torqueMarkings);

    this._disposables = [

      this._sam.inopEngine.subject.subscribe(inopEngine => {
        this.clearRudder();
        this.rudder(inopEngine);
        this.inopEngine(inopEngine);
        this.opEngine(inopEngine);

        this.factors(this._sam.factors.property, inopEngine, this._sam.engineConfig.property);
      }),

      this._sam.engineConfig.subject.subscribe(engConfig => {
        this.factors(this._sam.factors.property, this._sam.inopEngine.property, engConfig);
      }),

      this._sam.factors.subject.subscribe(factor => {
        this.factors(factor, this._sam.inopEngine.property, this._sam.engineConfig.property);
      })

    ];

    this.gear();
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

  public labelSelected(lookup: string) {
    console.log(`labelSelected: ${lookup}`);
  }

  public onValueChanged(data: SelectionData) {
    switch(data.label) {
      case 'INOP. ENGINE':
        this._sam.inopEngine.property = data.value;
      break;
      case 'ENGINE CONFIG.':
        this._sam.engineConfig.property = data.value;
      break;
      case 'FACTORS':
        this._sam.factors.property = data.value;
      break;
    }
  }

  public factors(factor: string, inopEngine: string, engConfig: string) {
    this.hide();
    switch(factor) {
      case 'P-FACTOR':
        this.pfactor(inopEngine, engConfig);
      break;
      case 'SPIRALING SLIPSTREAM':
        this.slipstream(inopEngine, engConfig);
      break;
      case 'ACCELERATED SLIPSTREAM':
        this.accelerated(inopEngine, engConfig);
      break;
      case 'TORQUE':
        this.torque(inopEngine, engConfig);
      break;
    }
  }

  private pfactor(inopEngine: string, engConfig: string) {
    let direction: ActionPair;
    let force: ActionPair;
    let lift: ActionPair;
    let scale: ActionPair;
    if(inopEngine === 'LEFT') {
      force = Pfactor.forceRight;
      direction = engConfig === 'CONVENTIONAL' ? Pfactor.directionConvRight : Pfactor.directionCrRight;
      lift = engConfig === 'CONVENTIONAL' ? Pfactor.liftConvRight : Pfactor.liftCrRight;
      scale = engConfig === 'CONVENTIONAL' ? Pfactor.scaleConvRight : Pfactor.scaleCrRight;
    } else {
      force = Pfactor.forceLeft;
      direction = Pfactor.directionLeft;
      lift = Pfactor.liftLeft;
      scale = Pfactor.scaleLeft;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(force.obj, false);
    this.engineService.hideObject(lift.obj, false);
    this.engineService.hideObject(scale.obj, false);
    this._animationDriver.play(environment.pfactorMarkings, lift.action);
    this._animationDriver.play(environment.pfactorMarkings, direction.action);
    this._animationDriver.play(environment.pfactorMarkings, force.action);
  }

  private slipstream(inopEngine: string, engConfig: string) {
    let direction: ActionPair;
    let force: ActionPair;
    let spiral: ActionPair;
    let rudder: ActionPair;
    if(inopEngine === 'LEFT') {
      force = Slipstream.forceRight;
      direction = engConfig === 'CONVENTIONAL' ? Slipstream.directionConvRight : Slipstream.directionCrRight;
      spiral = engConfig === 'CONVENTIONAL' ? Slipstream.spiralConvRight : Slipstream.spiralCrRight;
      rudder = Slipstream.rudderLeft;
    } else {
      force = Slipstream.forceLeft;
      direction = Slipstream.directionLeft;
      spiral = Slipstream.spiralLeft;
      rudder = Slipstream.rudderRight;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(force.obj, false);
    this.engineService.hideObject(spiral.obj, false);
    this._animationDriver.play(environment.slipstreamMarkings, direction.action);
    this._animationDriver.play(environment.slipstreamMarkings, spiral.action);
    this._animationDriver.play(environment.slipstreamMarkings, force.action);

    if(inopEngine === 'RIGHT' || engConfig !== 'CONVENTIONAL') {
      this.engineService.hideObject(rudder.obj, false);
      this._animationDriver.play(environment.slipstreamMarkings, rudder.action);
    }
  }

  private accelerated(inopEngine: string, engConfig: string) {
    let flow: ActionPair;
    let roll: ActionPair;
    let yaw: ActionPair;
    let rudder: ActionPair;
    let scale: ActionPair;
    if(inopEngine === 'LEFT') {
      flow = engConfig === 'CONVENTIONAL' ? Accelerated.flowConvRight : Accelerated.flowCrRight;
      roll = engConfig === 'CONVENTIONAL' ? Accelerated.rollConvRight : Accelerated.rollCrRight;
      yaw = engConfig === 'CONVENTIONAL' ? Accelerated.yawConvRight : Accelerated.yawCrRight;
      rudder = Accelerated.rudderLeft;
      scale = engConfig === 'CONVENTIONAL' ? Accelerated.scaleConvRight : Accelerated.scaleCrRight;
    } else {
      flow = Accelerated.flowLeft;
      roll = Accelerated.rollLeft;
      yaw = Accelerated.yawLeft;
      rudder = Accelerated.rudderRight;
      scale = Accelerated.scaleLeft;
    }

    this.engineService.hideObject(flow.obj, false);
    this.engineService.hideObject(roll.obj, false);
    this.engineService.hideObject(yaw.obj, false);
    this.engineService.hideObject(scale.obj, false);
    this._animationDriver.play(environment.acceleratedMarkings, flow.action);
    this._animationDriver.play(environment.acceleratedMarkings, roll.action);
    this._animationDriver.play(environment.acceleratedMarkings, yaw.action);

    if(inopEngine !== 'LEFT' || engConfig !== 'CONVENTIONAL') {
      this.engineService.hideObject(rudder.obj, false);
      this._animationDriver.play(environment.acceleratedMarkings, rudder.action);
    }
  }

  private torque(inopEngine:string, engConfig: string) {
    let direction: ActionPair;
    let counter: ActionPair;
    let roll: ActionPair;
    if(inopEngine === 'LEFT') {
      direction = engConfig === 'CONVENTIONAL' ? Torque.directionConvRight : Torque.directionCrRight;
      counter = engConfig === 'CONVENTIONAL' ? Torque.counterConvRight : Torque.counterCrRight;
      roll = Torque.rollRight;
    } else {
      direction = Torque.directionLeft;
      counter = Torque.counterLeft;
      roll = Torque.rollLeft;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(counter.obj, false);
    this.engineService.hideObject(roll.obj, false);
    this._animationDriver.play(environment.torqueMarkings, direction.action);
    this._animationDriver.play(environment.torqueMarkings, counter.action);
    this._animationDriver.play(environment.torqueMarkings, roll.action);
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

  private gear() {
    this._animationDriver.jumpTo(environment.seminole, 'GearAction', 100);
  }

  private orientation() {
    this._animationDriver.stop(environment.seminole, 'yawRightAction');
    this._animationDriver.stop(environment.seminole, 'yawLeftAction');
    this._animationDriver.stop(environment.seminole, 'rollRightAction');
    this._animationDriver.stop(environment.seminole, 'rollLeftAction');
  }

  private rudder(inopEngine: string) {
    const rudderAction = inopEngine === 'LEFT' ? 'rudderRightAction' : 'rudderLeftAction';
    this._animationDriver.jumpTo(environment.seminole, rudderAction, 100);
  }

  private clearRudder() {
    this._animationDriver.stop(environment.seminole, 'rudderRightAction');
    this._animationDriver.stop(environment.seminole, 'rudderLeftAction');
  }

  private hide() {
    this.pfactorHide();
    this.slipstreamHide();
    this.acceleratedHide();
    this.torqueHide();
  }

  private pfactorHide() {
    this.engineService.hideObject(Pfactor.directionConvRight.obj, true);
    this.engineService.hideObject(Pfactor.directionCrRight.obj, true);
    this.engineService.hideObject(Pfactor.directionLeft.obj, true);
    this.engineService.hideObject(Pfactor.forceRight.obj, true);
    this.engineService.hideObject(Pfactor.forceLeft.obj, true);
    this.engineService.hideObject(Pfactor.liftConvRight.obj, true);
    this.engineService.hideObject(Pfactor.liftCrRight.obj, true);
    this.engineService.hideObject(Pfactor.liftLeft.obj, true);
    this.engineService.hideObject(Pfactor.scaleConvRight.obj, true);
    this.engineService.hideObject(Pfactor.scaleCrRight.obj, true);
    this.engineService.hideObject(Pfactor.scaleLeft.obj, true);

    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.directionConvRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.directionCrRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.directionLeft.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.forceLeft.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.forceRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.liftConvRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.liftCrRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.liftLeft.action);
  }

  private slipstreamHide() {
    this.engineService.hideObject(Slipstream.directionConvRight.obj, true);
    this.engineService.hideObject(Slipstream.directionCrRight.obj, true);
    this.engineService.hideObject(Slipstream.directionLeft.obj, true);
    this.engineService.hideObject(Slipstream.forceRight.obj, true);
    this.engineService.hideObject(Slipstream.forceLeft.obj, true);
    this.engineService.hideObject(Slipstream.spiralConvRight.obj, true);
    this.engineService.hideObject(Slipstream.spiralCrRight.obj, true);
    this.engineService.hideObject(Slipstream.spiralLeft.obj, true);
    this.engineService.hideObject(Slipstream.rudderLeft.obj, true);
    this.engineService.hideObject(Slipstream.rudderRight.obj, true);

    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.directionConvRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.directionCrRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.directionLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.forceRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.forceLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.spiralConvRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.spiralCrRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.spiralLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.rudderLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, Slipstream.rudderRight.action);
  }

  private acceleratedHide() {
    this.engineService.hideObject(Accelerated.flowConvRight.obj, true);
    this.engineService.hideObject(Accelerated.flowCrRight.obj, true);
    this.engineService.hideObject(Accelerated.flowLeft.obj, true);
    this.engineService.hideObject(Accelerated.rollConvRight.obj, true);
    this.engineService.hideObject(Accelerated.rollCrRight.obj, true);
    this.engineService.hideObject(Accelerated.rollLeft.obj, true);
    this.engineService.hideObject(Accelerated.yawConvRight.obj, true);
    this.engineService.hideObject(Accelerated.yawCrRight.obj, true);
    this.engineService.hideObject(Accelerated.yawLeft.obj, true);
    this.engineService.hideObject(Accelerated.rudderLeft.obj, true);
    this.engineService.hideObject(Accelerated.rudderRight.obj, true);
    this.engineService.hideObject(Accelerated.scaleConvRight.obj, true);
    this.engineService.hideObject(Accelerated.scaleCrRight.obj, true);
    this.engineService.hideObject(Accelerated.scaleLeft.obj, true);

    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.flowConvRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.flowCrRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.flowLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.rollConvRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.rollCrRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.rollLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.yawConvRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.yawCrRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.yawLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.rudderLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, Accelerated.rudderRight.action);
  }

  private torqueHide() {
    this.engineService.hideObject(Torque.directionConvRight.obj, true);
    this.engineService.hideObject(Torque.directionCrRight.obj, true);
    this.engineService.hideObject(Torque.directionLeft.obj, true);
    this.engineService.hideObject(Torque.counterConvRight.obj, true);
    this.engineService.hideObject(Torque.counterCrRight.obj, true);
    this.engineService.hideObject(Torque.counterLeft.obj, true);
    this.engineService.hideObject(Torque.rollRight.obj, true);
    this.engineService.hideObject(Torque.rollLeft.obj, true);

    this._animationDriver.stop(environment.torqueMarkings, Torque.directionConvRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, Torque.directionCrRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, Torque.directionLeft.obj);
    this._animationDriver.stop(environment.torqueMarkings, Torque.counterConvRight.obj)
    this._animationDriver.stop(environment.torqueMarkings, Torque.counterCrRight.obj)
    this._animationDriver.stop(environment.torqueMarkings, Torque.counterLeft.obj)
    this._animationDriver.stop(environment.torqueMarkings, Torque.rollRight.obj)
    this._animationDriver.stop(environment.torqueMarkings, Torque.rollLeft.obj)
  }
}

class ActionPair {
  public readonly obj: string;
  public readonly action: string;
  constructor(obj: string, action: string) {
    this.obj = obj;
    this.action = action;
  }
}

class Pfactor {
  public static readonly directionConvRight = new ActionPair('pfactor-direction-arrow-conv-right', 'pfactor-direction-action-conv-right');
  public static readonly directionCrRight = new ActionPair('pfactor-direction-arrow-cr-right', 'pfactor-direction-action-cr-right');
  public static readonly directionLeft = new ActionPair('pfactor-direction-arrow-left', 'pfactor-direction-action-left');
  public static readonly forceLeft = new ActionPair('pfactor-force-arrow-left', 'pfactor-force-action-left');
  public static readonly forceRight = new ActionPair('pfactor-force-arrow-right', 'pfactor-force-action-right');
  public static readonly liftConvRight = new ActionPair('pfactor-lift-arrow-conv-right', 'pfactor-lift-action-conv-right');
  public static readonly liftCrRight = new ActionPair('pfactor-lift-arrow-cr-right', 'pfactor-lift-action-cr-right');
  public static readonly liftLeft = new ActionPair('pfactor-lift-arrow-left', 'pfactor-lift-action-left');
  public static readonly scaleConvRight = new ActionPair('pfactor-scale-conv-right', '');
  public static readonly scaleCrRight = new ActionPair('pfactor-scale-cr-right', '');
  public static readonly scaleLeft = new ActionPair('pfactor-scale-left', '');
}

class Slipstream {
  public static readonly directionConvRight = new ActionPair('slipstream-direction-arrow-conv-right', 'slipstream-direction-action-conv-right');
  public static readonly directionCrRight = new ActionPair('slipstream-direction-arrow-cr-right', 'slipstream-direction-action-cr-right');
  public static readonly directionLeft = new ActionPair('slipstream-direction-arrow-left', 'slipstream-direction-action-left');
  public static readonly forceLeft = new ActionPair('slipstream-force-arrow-left', 'slipstream-force-action-left');
  public static readonly forceRight = new ActionPair('slipstream-force-arrow-right', 'slipstream-force-action-right');
  public static readonly spiralConvRight = new ActionPair('slipstream-spiral-arrow-conv-right', 'slipstream-spiral-conv-right-action');
  public static readonly spiralCrRight = new ActionPair('slipstream-spiral-arrow-cr-right', 'slipstream-spiral-cr-right-action');
  public static readonly spiralLeft = new ActionPair('slipstream-spiral-arrow-left', 'slipstream-spiral-left-action');
  public static readonly rudderLeft = new ActionPair('slipstream-rudder-arrow-left', 'slipstream-rudder-action-left');
  public static readonly rudderRight = new ActionPair('slipstream-rudder-arrow-right', 'slipstream-rudder-action-right');
}

class Accelerated {
  public static readonly flowConvRight = new ActionPair('accelerated-flow-arrow-conv-right', 'accelerated-flow-action-conv-right');
  public static readonly flowCrRight = new ActionPair('accelerated-flow-arrow-cr-right', 'accelerated-flow-action-cr-right');
  public static readonly flowLeft = new ActionPair('accelerated-flow-arrow-left', 'accelerated-flow-action-left');
  public static readonly rollConvRight = new ActionPair('accelerated-roll-arrow-conv-right', 'accelerated-roll-action-conv-right');
  public static readonly rollCrRight = new ActionPair('accelerated-roll-arrow-cr-right', 'accelerated-roll-action-cr-right');
  public static readonly rollLeft = new ActionPair('accelerated-roll-arrow-left', 'accelerated-roll-action-left');
  public static readonly yawConvRight = new ActionPair('accelerated-yaw-arrow-conv-right', 'accelerated-yaw-action-conv-right');
  public static readonly yawCrRight = new ActionPair('accelerated-yaw-arrow-cr-right', 'accelerated-yaw-action-cr-right');
  public static readonly yawLeft = new ActionPair('accelerated-yaw-arrow-left', 'accelerated-yaw-action-left');
  public static readonly rudderLeft = new ActionPair('accelerated-rudder-arrow-left', 'accelerated-rudder-action-left');
  public static readonly rudderRight = new ActionPair('accelerated-rudder-arrow-right', 'accelerated-rudder-action-right');
  public static readonly scaleConvRight = new ActionPair('accelerated-scale-conv-right', '');
  public static readonly scaleCrRight = new ActionPair('accelerated-scale-cr-right', '');
  public static readonly scaleLeft = new ActionPair('accelerated-scale-left', '');
}

class Torque {
  public static readonly directionConvRight = new ActionPair('torque-direction-arrow-conv-right', 'torque-direction-action-conv-right');
  public static readonly directionCrRight = new ActionPair('torque-direction-arrow-cr-right', 'torque-direction-action-cr-right');
  public static readonly directionLeft = new ActionPair('torque-direction-arrow-left', 'torque-direction-action-left');
  public static readonly counterConvRight = new ActionPair('torque-counter-arrow-conv-right', 'torque-counter-action-conv-right');
  public static readonly counterCrRight = new ActionPair('torque-counter-arrow-cr-right', 'torque-counter-action-cr-right');
  public static readonly counterLeft = new ActionPair('torque-counter-arrow-left', 'torque-counter-action-left');
  public static readonly rollRight = new ActionPair('torque-roll-arrow-right', 'torque-roll-action-right');
  public static readonly rollLeft = new ActionPair('torque-roll-arrow-left', 'torque-roll-action-left');
}
