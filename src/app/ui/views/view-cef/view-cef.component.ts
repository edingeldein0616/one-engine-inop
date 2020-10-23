import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
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
    //this.engineService.loadMarkings(environment.slipstreamMarkings);
    this.engineService.loadMarkings(environment.pfactorMarkings);

    this._disposables = [

      this._sam.inopEngine.subject.subscribe(inopEngine => {
        this.clearRudder();
        this.rudder(inopEngine);
        this.inopEngine(inopEngine);
        this.opEngine(inopEngine);

        this.pfactor(inopEngine, this._sam.engineConfig.property);
      }),

      this._sam.engineConfig.subject.subscribe(engConfig => {
        this.pfactor(this._sam.inopEngine.property, engConfig);
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
    }
  }

  private pfactor(inopEngine: string, engConfig) {
    this.pfactorHide();
    let direction: ActionPair;
    let force: ActionPair;
    let lift: ActionPair;
    if(inopEngine === 'LEFT') {
      force = Pfactor.forceRight;
      direction = engConfig === 'CONVENTIONAL' ? Pfactor.directionConvRight : Pfactor.directionCrRight;
      lift = engConfig === 'CONVENTIONAL' ? Pfactor.liftConvRight : Pfactor.liftCrRight;
    } else {
      force = Pfactor.forceLeft;
      direction = Pfactor.directionLeft;
      lift = Pfactor.liftLeft;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(force.obj, false);
    this.engineService.hideObject(lift.obj, false);
    this._animationDriver.play(environment.pfactorMarkings, lift.action);
    this._animationDriver.play(environment.pfactorMarkings, direction.action);
    this._animationDriver.play(environment.pfactorMarkings, force.action);
  }

  private pfactorHide() {
    console.log('hide');
    this.engineService.hideObject(Pfactor.directionConvRight.obj, true);
    this.engineService.hideObject(Pfactor.directionCrRight.obj, true);
    this.engineService.hideObject(Pfactor.directionLeft.obj, true);
    this.engineService.hideObject(Pfactor.forceRight.obj, true);
    this.engineService.hideObject(Pfactor.forceLeft.obj, true);
    this.engineService.hideObject(Pfactor.liftConvRight.obj, true);
    this.engineService.hideObject(Pfactor.liftCrRight.obj, true);
    this.engineService.hideObject(Pfactor.liftLeft.obj, true);

    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.directionConvRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.directionCrRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.directionLeft.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.forceLeft.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.forceRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.liftConvRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.liftCrRight.action);
    this._animationDriver.stop(environment.pfactorMarkings, Pfactor.liftLeft.action);
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
  public static readonly directionConvRight = new ActionPair('pfactor-direction-conv-right-arrow', 'pfactor-direction-conv-right-action');
  public static readonly directionCrRight = new ActionPair('pfactor-direction-cr-right-arrow', 'pfactor-direction-cr-right-action');
  public static readonly directionLeft = new ActionPair('pfactor-direction-left-arrow', 'pfactor-direction-left-action');
  public static readonly forceLeft = new ActionPair('pfactor-force-left-arrow', 'pfactor-force-left-action');
  public static readonly forceRight = new ActionPair('pfactor-force-right-arrow', 'pfactor-force-right-action');
  public static readonly liftConvRight = new ActionPair('pfactor-lift-conv-right-arrow', 'pfactor-lift-conv-right-action');
  public static readonly liftCrRight = new ActionPair('pfactor-lift-cr-right-arrow', 'pfactor-lift-cr-right-action');
  public static readonly liftLeft = new ActionPair('pfactor-lift-left-arrow', 'pfactor-lift-left-action');
}
