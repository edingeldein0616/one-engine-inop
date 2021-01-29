import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EngineService } from 'src/app/engine/engine.service';
import { AnimationDriver } from 'src/app/utils/animation/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { environment } from 'src/environments/environment';

import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { SeminoleAnimationAction, PropParts } from 'src/app/utils/animation';
import { MarkingsBase, Pfactor, Accelerated, Slipstream, Torque } from 'src/app/utils/animation/markings';
import { ModelViewComponent } from '../model-view.component';

@Component({
  selector: 'app-view-cef',
  templateUrl: './view-cef.component.html',
  styleUrls: ['./view-cef.component.scss']
})
export class ViewCefComponent extends ModelViewComponent {

  constructor(private ref: ChangeDetectorRef) { super(); }

  protected _aeroModel = null;

  private _loaded = false;

  private _currentState: MarkingsBase;
  private _pfactor: Pfactor;
  private _accelerated: Accelerated;
  private _slipstream: Slipstream;
  private _torque: Torque;

  public ngAfterViewInit() {
    this.viewManagerService.setCurrentView('Critical Engine Factors');

    this._engineService.loadSeminole(environment.seminole);
    this._engineService.loadMarkings(environment.slipstreamMarkings);
    this._engineService.loadMarkings(environment.pfactorMarkings);
    this._engineService.loadMarkings(environment.acceleratedMarkings);
    this._engineService.loadMarkings(environment.torqueMarkings);

    this._pfactor = new Pfactor(this._engineService, this._animationDriver); 
    this._accelerated = new Accelerated(this._engineService, this._animationDriver);
    this._slipstream = new Slipstream(this._engineService, this._animationDriver);
    this._torque = new Torque(this._engineService, this._animationDriver);

    this._pfactor.hide();
    this._accelerated.hide();

    this._disposables = [

      this._seminoleActionModel.inopEngine.subject.subscribe(inopEngine => {
        this._rudder(inopEngine);
        this._cefPropellers(inopEngine, this._seminoleActionModel.engineConfig.property);
        this._opEngine(inopEngine);

        this.factors(this._seminoleActionModel.factors.property, inopEngine, this._seminoleActionModel.engineConfig.property);
      }),

      this._seminoleActionModel.engineConfig.subject.subscribe(engConfig => {
        this.factors(this._seminoleActionModel.factors.property, this._seminoleActionModel.inopEngine.property, engConfig);
        this._cefPropellers(this._seminoleActionModel.inopEngine.property, engConfig);

        if(engConfig === 'COUNTER ROT.') {
          this.onLabelSelected('cef-engine-configuration-cr');
        }
      }),

      this._seminoleActionModel.factors.subject.subscribe(factor => {
        this.factors(factor, this._seminoleActionModel.inopEngine.property, this._seminoleActionModel.engineConfig.property);
      })

    ];

    this._neutralOrientation();
    this._gear(false);
    this._flaps(0);

    this._loaded = true;
  }

  protected _dispose() {}

  public onValueChanged(data: SelectionData) {
    switch(data.label) {
      case 'INOP. ENGINE':
        this._seminoleActionModel.inopEngine.property = data.value;
      break;
      case 'ENGINE CONFIG.':
        this._seminoleActionModel.engineConfig.property = data.value;
      break;
      case 'FACTORS':
        this._seminoleActionModel.factors.property = data.value;
      break;
    }
  }

  public factors(factor: string, inopEngine: string, engineConfig: string) {

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
      this.onLabelSelected(contentLookup);
    }
  }

  private _resetProps() {
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.PropLeft);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.PropRightConv);
    this._animationDriver.stop(environment.seminole, SeminoleAnimationAction.PropRightCr);
  }

  private _cefPropellers(inopEngine: string, engConfig: string) {
    this._resetProps();

    const rightEngineAction = engConfig === 'CONVENTIONAL' ? SeminoleAnimationAction.PropRightConv : SeminoleAnimationAction.PropRightCr;
    this._animationDriver.play(environment.seminole, rightEngineAction);
    this._animationDriver.play(environment.seminole, SeminoleAnimationAction.PropLeft);

    const inopPropVis = inopEngine === 'LEFT' ? PropParts.propLeft : PropParts.propRight;
    const inopPropHide = inopEngine === 'LEFT' ? PropParts.propRight : PropParts.propLeft;
    const opPropVis = inopEngine === 'LEFT' ? PropParts.operativePropRight : PropParts.operativePropLeft;
    const opPropHide = inopEngine === 'LEFT' ? PropParts.operativePropLeft : PropParts.operativePropRight;

    this._engineService.hideObject(inopPropVis, false);
    this._engineService.hideObject(inopPropHide, true);
    this._engineService.hideObject(opPropVis, false);
    this._engineService.hideObject(opPropHide, true);

  }

  private _opEngine(inopEngine: string) {
    const opEngineAction = inopEngine === 'RIGHT' ? 'propLSpinAction' : 'propRSpinAction';
    const opEngineSpin = inopEngine === 'RIGHT' ? 'propLeftSpin' : 'propRightSpin';
    const otherEngineAction = inopEngine === 'RIGHT' ? 'propRSpinAction' : 'propLSpinAction';
    const otherEngineSpin = inopEngine === 'RIGHT' ? 'propRightSpin' : 'propLeftSpin';

    this._animationDriver.stop(environment.seminole, otherEngineAction);

    this._animationDriver.play(environment.seminole, opEngineAction);
    this._engineService.hideObject(opEngineSpin, false)
    this._engineService.hideObject(otherEngineSpin, true);
  }
}

