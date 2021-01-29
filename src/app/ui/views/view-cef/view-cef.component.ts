import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EngineService } from 'src/app/engine/engine.service';
import { AnimationDriver } from 'src/app/utils/animation/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { TextDictionary } from 'src/app/utils/text-dictionary';
import { environment } from 'src/environments/environment';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { ViewManagerService } from 'src/app/services/view-manager.service';

import { SeminoleAnimationAction, PropParts } from 'src/app/utils';
import { MarkingsBase, Pfactor, Accelerated, Slipstream, Torque } from 'src/app/utils/animation/markings';

@Component({
  selector: 'app-view-cef',
  templateUrl: './view-cef.component.html',
  styleUrls: ['./view-cef.component.scss']
})
export class ViewCefComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService,
    private vms: ViewManagerService) {
      
    }

  public content: string = `<h3>This section covers critical engine factors that affect multiengine aircraft without counterrotating propellers.
    In most US-designed multiengine aircraft, both engines rotate to the right (clockwise) when viewed from the rear. Select a critical engine
    factor to see how each one makes the left engine the critical engine. The critical engine is the engine whose failure will most adversely affect
    the performance and handling characterstics of the aircraft. The "Counter-Rotating" option can be used to compare a conventional vs.
    counter-rotating configuration.</h3>`;

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;
  private _loaded = false;

  private _currentState: MarkingsBase;
  private _pfactor: Pfactor;
  private _accelerated: Accelerated;
  private _slipstream: Slipstream;
  private _torque: Torque;

  private _disposables: Subscription[] =[];

  ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
    this._pfactor = new Pfactor(this.engineService, this._animationDriver); 
    this._accelerated = new Accelerated(this.engineService, this._animationDriver);
    this._slipstream = new Slipstream(this.engineService, this._animationDriver);
    this._torque = new Torque(this.engineService, this._animationDriver);
    this.vms.setCurrentView('Critical Engine Factors');
  }

  ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadMarkings(environment.slipstreamMarkings);
    this.engineService.loadMarkings(environment.pfactorMarkings);
    this.engineService.loadMarkings(environment.acceleratedMarkings);
    this.engineService.loadMarkings(environment.torqueMarkings);

    this._pfactor.hide();
    this._accelerated.hide();

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

        if(engConfig === 'COUNTER ROT.') {
          this.content = TextDictionary.getContent('cef-engine-configuration-cr');
        }
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

  public factors(factor: string, inopEngine: string, engineConfig: string) {
    // this.hide();
    if(this._currentState) this._currentState.hide();
    let contentLookup: string;
    switch(factor) {
      case 'P-FACTOR':
        contentLookup = 'cef-pfactor';
        this._currentState = this._pfactor;
        this._pfactor.animate(inopEngine, engineConfig);
      break;
      case 'SPIRALING SLIPSTREAM':
        contentLookup = 'cef-slipstream';
        this._currentState = this._slipstream;
        this._slipstream.animate(inopEngine, engineConfig);
        console.log(inopEngine, engineConfig);
      break;
      case 'ACCELERATED SLIPSTREAM':
        contentLookup = 'cef-accelerated';
        this._currentState = this._accelerated;
        this._accelerated.animate(inopEngine, engineConfig);
      break;
      case 'TORQUE':
        contentLookup = 'cef-torque';
        this._currentState = this._torque;
        this._torque.animate(inopEngine, engineConfig);
      break;
    }

    if(this._loaded) {
      this.content = TextDictionary.getContent(contentLookup);
    }
  }

  private propellers(inopEngine: string, engConfig: string) {
    this.resetProps();

    const rightEngineAction = engConfig === 'CONVENTIONAL' ? SeminoleAnimationAction.PropRightConv : SeminoleAnimationAction.PropRightCr;
    this._animationDriver.play(environment.seminole, rightEngineAction);
    this._animationDriver.play(environment.seminole, SeminoleAnimationAction.PropLeft);

    const inopPropVis = inopEngine === 'LEFT' ? PropParts.propLeft : PropParts.propRight;
    const inopPropHide = inopEngine === 'LEFT' ? PropParts.propRight : PropParts.propLeft;
    const opPropVis = inopEngine === 'LEFT' ? PropParts.operativePropRight : PropParts.operativePropLeft;
    const opPropHide = inopEngine === 'LEFT' ? PropParts.operativePropLeft : PropParts.operativePropRight;

    this.engineService.hideObject(inopPropVis, false);
    this.engineService.hideObject(inopPropHide, true);
    this.engineService.hideObject(opPropVis, false);
    this.engineService.hideObject(opPropHide, true);

  }

  private flapsToZero() {
    this._animationDriver.jumpTo(environment.seminole, SeminoleAnimationAction.Flaps, 0);
  }

  private resetProps() {
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.PropLeft);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.PropRightConv);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.PropRightCr);
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
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleYawRight);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleYawLeft);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleRollRight);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.SeminoleRollLeft);
    this._animationDriver.jumpTo(environment.seminole, SeminoleAnimationAction.SeminoleRollLeft, 0);
  }

  private rudder(inopEngine: string) {
    const rudderAction = inopEngine === 'LEFT' ? 100 : 0;
    this._animationDriver.jumpTo(environment.seminole, 'rudder-action', rudderAction);
  }
}

