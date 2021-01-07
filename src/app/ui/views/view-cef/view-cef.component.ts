import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EngineService } from 'src/app/engine/engine.service';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { TextDictionary } from 'src/app/utils/text-dictionary';
import { environment } from 'src/environments/environment';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { ViewManagerService } from 'src/app/services/view-manager.service';

import { ActionPair, AnimationActions, SlipstreamPair, AcceleratedPair, TorquePair, PfactorPair, Parts } from 'src/app/utils';

@Component({
  selector: 'app-view-cef',
  templateUrl: './view-cef.component.html',
  styleUrls: ['./view-cef.component.scss']
})
export class ViewCefComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService,
    private vms: ViewManagerService) { }

  public content: string = `<h3>This section covers critical engine factors that affect multiengine aircraft without counterrotating propellers.
    In most US-designed multiengine aircraft, both engines rotate to the right (clockwise) when viewed from the rear. Select a critical engine
    factor to see how each one makes the left engine the critical engine. The critical engine is the engine whose failure will most adversely affect
    the performance and handling characterstics of the aircraft. The "Counter-Rotating" option can be used to compare a conventional vs.
    counter-rotating configuration.</h3>`;

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;
  private _loaded = false;

  private _disposables: Subscription[] =[];

  ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
    this.vms.setCurrentView('Critical Engine Factors');
  }

  ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadMarkings(environment.slipstreamMarkings);
    this.engineService.loadMarkings(environment.pfactorMarkings);
    this.engineService.loadMarkings(environment.acceleratedMarkings);
    this.engineService.loadMarkings(environment.torqueMarkings);

    this._disposables = [

      this._sam.inopEngine.subject.subscribe(inopEngine => {
        this.rudder(inopEngine);
        this.propellers(inopEngine, this._sam.engineConfig.property);
        this.opEngine(inopEngine);

        this.factors(this._sam.factors.property, inopEngine, this._sam.engineConfig.property);
      }),

      this._sam.engineConfig.subject.subscribe(engConfig => {
        this.factors(this._sam.factors.property, this._sam.inopEngine.property, engConfig);
        this.propellers(this._sam.inopEngine.property, engConfig);
      }),

      this._sam.factors.subject.subscribe(factor => {
        this.factors(factor, this._sam.inopEngine.property, this._sam.engineConfig.property);
      })

    ];

    this.orientation();
    this.gear();
    this.flapsToZero();

    this._loaded = true;
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

  public lookupContent(lookup: string): string {
    const content = TextDictionary.getContent(lookup);
    if(content === undefined || content === '') {
      return this.content;
    }
    return TextDictionary.getContent(lookup);
  }

  public onClick(something: any) {
    console.log(something);
  }

  public onValueChanged(data: SelectionData) {
    this.orientation();
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
    let contentLookup: string;
    switch(factor) {
      case 'P-FACTOR':
        contentLookup = 'cef-pfactor';
        this.pfactor(inopEngine, engConfig);
      break;
      case 'SPIRALING SLIPSTREAM':
        contentLookup = 'cef-slipstream';
        this.slipstream(inopEngine, engConfig);
      break;
      case 'ACCELERATED SLIPSTREAM':
        contentLookup = 'cef-accelerated';
        this.accelerated(inopEngine, engConfig);
      break;
      case 'TORQUE':
        contentLookup = 'cef-torque';
        this.torque(inopEngine, engConfig);
      break;
    }

    if(this._loaded) {
      this.content = TextDictionary.getContent(contentLookup);
    }
  }

  private pfactor(inopEngine: string, engConfig: string) {
    let direction: ActionPair;
    let force: ActionPair;
    let lift: ActionPair;
    let scale: ActionPair;
    if(inopEngine === 'LEFT') {
      force = PfactorPair.forceRight;
      direction = engConfig === 'CONVENTIONAL' ? PfactorPair.directionConvRight : PfactorPair.directionCrRight;
      lift = engConfig === 'CONVENTIONAL' ? PfactorPair.liftConvRight : PfactorPair.liftCrRight;
      scale = engConfig === 'CONVENTIONAL' ? PfactorPair.scaleConvRight : PfactorPair.scaleCrRight;
    } else {
      force = PfactorPair.forceLeft;
      direction = PfactorPair.directionLeft;
      lift = PfactorPair.liftLeft;
      scale = PfactorPair.scaleLeft;
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
      force = SlipstreamPair.forceRight;
      direction = engConfig === 'CONVENTIONAL' ? SlipstreamPair.directionConvRight : SlipstreamPair.directionCrRight;
      spiral = engConfig === 'CONVENTIONAL' ? SlipstreamPair.spiralConvRight : SlipstreamPair.spiralCrRight;
      rudder = SlipstreamPair.rudderLeft;
    } else {
      force = SlipstreamPair.forceLeft;
      direction = SlipstreamPair.directionLeft;
      spiral = SlipstreamPair.spiralLeft;
      rudder = SlipstreamPair.rudderRight;
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
      flow = engConfig === 'CONVENTIONAL' ? AcceleratedPair.flowConvRight : AcceleratedPair.flowCrRight;
      roll = engConfig === 'CONVENTIONAL' ? AcceleratedPair.rollConvRight : AcceleratedPair.rollCrRight;
      yaw = engConfig === 'CONVENTIONAL' ? AcceleratedPair.yawConvRight : AcceleratedPair.yawCrRight;
      rudder = AcceleratedPair.rudderLeft;
      scale = engConfig === 'CONVENTIONAL' ? AcceleratedPair.scaleConvRight : AcceleratedPair.scaleCrRight;
    } else {
      flow = AcceleratedPair.flowLeft;
      roll = AcceleratedPair.rollLeft;
      yaw = AcceleratedPair.yawLeft;
      rudder = AcceleratedPair.rudderRight;
      scale = AcceleratedPair.scaleLeft;
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
      direction = engConfig === 'CONVENTIONAL' ? TorquePair.directionConvRight : TorquePair.directionCrRight;
      counter = engConfig === 'CONVENTIONAL' ? TorquePair.counterConvRight : TorquePair.counterCrRight;
      roll = engConfig === 'CONVENTIONAL' ? TorquePair.rollConvRight : TorquePair.rollCrRight;
    } else {
      direction = TorquePair.directionLeft;
      counter = TorquePair.counterLeft;
      roll = TorquePair.rollLeft;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(counter.obj, false);
    this.engineService.hideObject(roll.obj, false);
    this._animationDriver.play(environment.torqueMarkings, direction.action);
    this._animationDriver.play(environment.torqueMarkings, counter.action);
    this._animationDriver.play(environment.torqueMarkings, roll.action);
  }

  private propellers(inopEngine: string, engConfig: string) {
    this.resetProps();

    const rightEngineAction = engConfig === 'CONVENTIONAL' ? AnimationActions.PropRightConv : AnimationActions.PropRightCr;
    this._animationDriver.play(environment.seminole, rightEngineAction);
    this._animationDriver.play(environment.seminole, AnimationActions.PropLeft);

    const inopPropVis = inopEngine === 'LEFT' ? Parts.propLeft : Parts.propRight;
    const inopPropHide = inopEngine === 'LEFT' ? Parts.propRight : Parts.propLeft;
    const opPropVis = inopEngine === 'LEFT' ? Parts.operativePropRight : Parts.operativePropLeft;
    const opPropHide = inopEngine === 'LEFT' ? Parts.operativePropLeft : Parts.operativePropRight;

    this.engineService.hideObject(inopPropVis, false);
    this.engineService.hideObject(inopPropHide, true);
    this.engineService.hideObject(opPropVis, false);
    this.engineService.hideObject(opPropHide, true);

  }

  private flapsToZero() {
    this._animationDriver.jumpTo(environment.seminole, AnimationActions.Flaps, 0);
  }

  private resetProps() {
    this._animationDriver.stop(environment.seminole, AnimationActions.PropLeft);
    this._animationDriver.stop(environment.seminole, AnimationActions.PropRightConv);
    this._animationDriver.stop(environment.seminole, AnimationActions.PropRightCr);
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
    this._animationDriver.jumpTo(environment.seminole, 'gear-action', 100);
  }

  private orientation() {
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleYawRight);
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleYawLeft);
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleRollRight);
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleRollLeft);
    this._animationDriver.jumpTo(environment.seminole, AnimationActions.SeminoleRollLeft, 0);
  }

  private rudder(inopEngine: string) {
    const rudderAction = inopEngine === 'LEFT' ? 100 : 0;
    this._animationDriver.jumpTo(environment.seminole, 'rudder-action', rudderAction);
  }

  private hide() {
    this.pfactorHide();
    this.slipstreamHide();
    this.acceleratedHide();
    this.torqueHide();
  }

  private pfactorHide() {
    this.engineService.hideObject(PfactorPair.directionConvRight.obj, true);
    this.engineService.hideObject(PfactorPair.directionCrRight.obj, true);
    this.engineService.hideObject(PfactorPair.directionLeft.obj, true);
    this.engineService.hideObject(PfactorPair.forceRight.obj, true);
    this.engineService.hideObject(PfactorPair.forceLeft.obj, true);
    this.engineService.hideObject(PfactorPair.liftConvRight.obj, true);
    this.engineService.hideObject(PfactorPair.liftCrRight.obj, true);
    this.engineService.hideObject(PfactorPair.liftLeft.obj, true);
    this.engineService.hideObject(PfactorPair.scaleConvRight.obj, true);
    this.engineService.hideObject(PfactorPair.scaleCrRight.obj, true);
    this.engineService.hideObject(PfactorPair.scaleLeft.obj, true);

    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.directionConvRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.directionCrRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.directionLeft.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.forceLeft.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.forceRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.liftConvRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.liftCrRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, PfactorPair.liftLeft.action);
  }

  private slipstreamHide() {
    this.engineService.hideObject(SlipstreamPair.directionConvRight.obj, true);
    this.engineService.hideObject(SlipstreamPair.directionCrRight.obj, true);
    this.engineService.hideObject(SlipstreamPair.directionLeft.obj, true);
    this.engineService.hideObject(SlipstreamPair.forceRight.obj, true);
    this.engineService.hideObject(SlipstreamPair.forceLeft.obj, true);
    this.engineService.hideObject(SlipstreamPair.spiralConvRight.obj, true);
    this.engineService.hideObject(SlipstreamPair.spiralCrRight.obj, true);
    this.engineService.hideObject(SlipstreamPair.spiralLeft.obj, true);
    this.engineService.hideObject(SlipstreamPair.rudderLeft.obj, true);
    this.engineService.hideObject(SlipstreamPair.rudderRight.obj, true);

    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.directionConvRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.directionCrRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.directionLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.forceRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.forceLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.spiralConvRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.spiralCrRight.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.spiralLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.rudderLeft.action);
    this._animationDriver.stop(environment.slipstreamMarkings, SlipstreamPair.rudderRight.action);
  }

  private acceleratedHide() {
    this.engineService.hideObject(AcceleratedPair.flowConvRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.flowCrRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.flowLeft.obj, true);
    this.engineService.hideObject(AcceleratedPair.rollConvRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.rollCrRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.rollLeft.obj, true);
    this.engineService.hideObject(AcceleratedPair.yawConvRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.yawCrRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.yawLeft.obj, true);
    this.engineService.hideObject(AcceleratedPair.rudderLeft.obj, true);
    this.engineService.hideObject(AcceleratedPair.rudderRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.scaleConvRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.scaleCrRight.obj, true);
    this.engineService.hideObject(AcceleratedPair.scaleLeft.obj, true);

    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.flowConvRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.flowCrRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.flowLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.rollConvRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.rollCrRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.rollLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.yawConvRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.yawCrRight.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.yawLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.rudderLeft.action);
    this._animationDriver.stop(environment.acceleratedMarkings, AcceleratedPair.rudderRight.action);
  }

  private torqueHide() {
    this.engineService.hideObject(TorquePair.directionConvRight.obj, true);
    this.engineService.hideObject(TorquePair.directionCrRight.obj, true);
    this.engineService.hideObject(TorquePair.directionLeft.obj, true);
    this.engineService.hideObject(TorquePair.counterConvRight.obj, true);
    this.engineService.hideObject(TorquePair.counterCrRight.obj, true);
    this.engineService.hideObject(TorquePair.counterLeft.obj, true);
    this.engineService.hideObject(TorquePair.rollConvRight.obj, true);
    this.engineService.hideObject(TorquePair.rollCrRight.obj, true);
    this.engineService.hideObject(TorquePair.rollLeft.obj, true);

    this._animationDriver.stop(environment.torqueMarkings, TorquePair.directionConvRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.directionCrRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.directionLeft.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.counterConvRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.counterCrRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.counterLeft.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.rollConvRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.rollCrRight.obj);
    this._animationDriver.stop(environment.torqueMarkings, TorquePair.rollLeft.obj);
  }
}

