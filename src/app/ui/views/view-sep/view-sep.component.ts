import { AnimationDriver } from 'src/app/utils/animation-driver';
import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventBus, Listener, Subject } from 'src/app/engine/core/events';
import { EngineService } from 'src/app/engine/engine.service';
import { ThreeEngineEvent } from 'src/app/utils/custom-events';
import { RaycastController } from 'src/app/utils/raycast-controller';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { environment } from 'src/environments/environment';
import { SEPAerodynamicsModel } from 'src/app/utils/aerodynamics-model';
import { SelectionData } from '../../controls/selector/selection-data';
import { TextDictionary } from 'src/app/utils/text-dictionary';
import { Intersection } from 'three';
import { ViewManagerService } from 'src/app/services/view-manager.service';

@Component({
  selector: 'app-view-sep',
  templateUrl: './view-sep.component.html',
  styleUrls: ['./view-sep.component.scss']
})
export class ViewSepComponent implements OnInit, AfterViewInit, OnDestroy, Listener {

  public content: string = `<h3>This section covers single-engine performance.</h3>
  <h2><b>Click on the "Data" and "Performance Factors" text labels to read descriptive text here.</b><h2>
  <h2><b>Clicking on the arrows marking aerodynamic and control forces around the aircraft will display additional text here.</b></h2>`;
  public vyse: number = 21;
  public roc: number;
  public excessThp: number = 170;
  public serviceCeiling: number;
  public absoluteCeiling: number;

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;
  private _aeroModel: SEPAerodynamicsModel;
  private _raycastController: RaycastController;
  private _rayClickListener = (event: MouseEvent) => { EventBus.get().publish(ThreeEngineEvent.MOUSECLICK, null); };
  private _rayMouseMoveListener = (event: MouseEvent) => { this._raycastController.onMouseMove(event); };

  private _currentFlapsAction: string;
  private _currentCgAction: string;

  private _disposables: Subscription[] = [];

  constructor(private engineService: EngineService,
    private cdr: ChangeDetectorRef,
    private vms: ViewManagerService) { }

  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
    this._aeroModel = new SEPAerodynamicsModel();
    this._raycastController = new RaycastController();
    this.vms.setCurrentView('Single Engine Performance');

    EventBus.get().subscribe(ThreeEngineEvent.INTERSECT, this);
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadAttachedMarkings(environment.attachedMarkings);

    this._disposables = [
      this._sam.inopEngine.subject.subscribe(inopEngine => {
        const idle = this._sam.power.property < 1;
        this._propellers(this._sam.propeller.property, inopEngine, idle);
        this._opEngine(inopEngine, idle);
        this._controlTechnique(this._sam.controlTechnique.property, inopEngine, idle);
      }),

      this._sam.propeller.subject.subscribe(propeller => {
        const idle = this._sam.power.property < 1;
        this._propellers(propeller, this._sam.inopEngine.property, idle);
        this._opEngine(this._sam.inopEngine.property, idle);
      }),

      this._sam.controlTechnique.subject.subscribe(controlTechnique => {
        const idle = this._sam.power.property < 1;
        this._controlTechnique(controlTechnique, this._sam.inopEngine.property, idle);
      }),

      this._sam.flaps.subject.subscribe(flaps => {
        this._flaps(flaps);
      }),

      this._sam.gear.subject.subscribe(gear => {
        this._gear(gear === 'DOWN');
      }),

      this._sam.cog.subject.subscribe(cog => {
        this._centerOfGravity(cog);
      })
    ];

    var staticMarkings = this.engineService.loadMarkings(environment.sepStaticMarkings, this._aeroModel);
    this._raycastController = new RaycastController(...staticMarkings.scene.children);
    this.engineService.attachRaycaster(this._raycastController);

    this._sam.inopEngine.property = this._sam.inopEngine.property;
    this._sam.power.property = 100;
    this._aeroModel.calculateMarkings(this._sam);

    window.addEventListener('mousemove', this._rayMouseMoveListener, false);
    window.addEventListener('click', this._rayClickListener, false);

    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this._clearOrientation();
    this._clearRudder();

    while(this._disposables.length > 0) {
      this._disposables.pop().unsubscribe();
    }
    this._disposables = [];
    this.engineService.dispose();
  }

  public onValueChanged(data: SelectionData) {
    console.log(data);
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
    this.roc = this._aeroModel.roc(this._sam);
    this.excessThp = this._aeroModel.excessTHP(this.roc);
    this.serviceCeiling = this._aeroModel.serviceCeiling(this._sam);
    this.absoluteCeiling = this._aeroModel.absoluteCeiling(this.serviceCeiling);
  }

  public onLabelSelected(lookup: string) {
    this.content = TextDictionary.getContent(lookup);
    this.cdr.detectChanges();
  }

  public receive(topic: string, subject: Subject) {
    switch(topic) {
      case ThreeEngineEvent.INTERSECT: {
        var firstIntersect = subject.data.shift() as Intersection;
        console.log(firstIntersect);
        this.content = TextDictionary.getContent(firstIntersect.object.name);
        this.cdr.detectChanges();
      }
    }
  }

  private _propellers(propeller: string, inopEngine: string, idle: boolean) {
    const inopEngineAction = inopEngine === 'LEFT' ? 'propLAction' : 'propRAction';
    const otherEngineAction = inopEngine === 'LEFT' ? 'propRAction' : 'propLAction';

    if(propeller === 'WINDMILL') {
      this._animationDriver.play(environment.seminole, inopEngineAction);
    } else {
      this._animationDriver.stop(environment.seminole, inopEngineAction);
    }

    if(idle) {
      this._animationDriver.play(environment.seminole, otherEngineAction);
    } else {
      this._animationDriver.stop(environment.seminole, otherEngineAction);
    }
  }

  private _opEngine(inopEngine: string, idle: boolean) {
    const opEngineAction = inopEngine === 'RIGHT' ? 'propLSpinAction' : 'propRSpinAction';
    const opEngineSpin = inopEngine === 'RIGHT' ? 'propLeftSpin' : 'propRightSpin';
    const otherEngineAction = inopEngine === 'RIGHT' ? 'propRSpinAction' : 'propLSpinAction';
    const otherEngineSpin = inopEngine === 'RIGHT' ? 'propRightSpin' : 'propLeftSpin';
    this._animationDriver.stop(environment.seminole, otherEngineAction);

    if(!idle) {
      this._animationDriver.play(environment.seminole, opEngineAction);
      this.engineService.hideObject(opEngineSpin, false)
      this.engineService.hideObject(otherEngineSpin, true);
    } else {
      this.engineService.hideObject(opEngineSpin, true);
      this.engineService.hideObject(otherEngineSpin, true);
      this._animationDriver.stop(environment.seminole, opEngineAction);
    }
  }

  private _controlTechnique(controlTechnique: string, inopEngine: string, idle: boolean) {
    this._clearOrientation();
    if(!idle) {
      this._rudder(inopEngine);

      if(controlTechnique === 'WINGS LEVEL') {
        this._wingsLevel(inopEngine);
      } else {
        this._zeroSideSlip(inopEngine);
      }
    }
  }

  private _rudder(inopEngine: string) {
    this._clearRudder();
    const rudderAction = inopEngine === 'LEFT' ? 'rudderRightAction' : 'rudderLeftAction';
    this._animationDriver.jumpTo(environment.seminole, rudderAction, 100);
  }

  private _wingsLevel(inopEngine: string) {
    const yawAction = inopEngine === 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
    const attachedAction = inopEngine === 'LEFT' ? 'attached-yaw-action-right' : 'attached-yaw-action-left';
    this._animationDriver.jumpTo(environment.seminole, yawAction, 100);
    this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);
  }

  private _zeroSideSlip(inopEngine: string) {
    const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
    const attachedAction = inopEngine === 'LEFT' ? 'attached-roll-action-right' : 'attached-roll-action-left';
    this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
    this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);
  }

  private _gear(down: boolean): void {
    this._animationDriver.stop(environment.seminole, 'GearAction');
    this._animationDriver.jumpTo(environment.seminole, 'GearAction', down ? 0 : 100);
  }

  private _flaps(notch: number): void {

    if(this._currentFlapsAction) {
      this._animationDriver.stop(environment.seminole, this._currentFlapsAction);
    }

    if(notch == (0/3) * 100) {
      this._currentFlapsAction = 'flapsTo0Action';
      this._animationDriver.jumpTo(environment.seminole, this._currentFlapsAction, 0);
    } else if(notch == (1/3) * 100) {
      this._currentFlapsAction = 'flapsTo10Action';
      this._animationDriver.jumpTo(environment.seminole, this._currentFlapsAction, 100);
    } else if(notch == (2/3) * 100) {
      this._currentFlapsAction = 'flapsTo25Action';
      this._animationDriver.jumpTo(environment.seminole, this._currentFlapsAction, 100);
    } else if(notch == (3/3) * 100) {
      this._currentFlapsAction = 'flapsTo40Action';
      this._animationDriver.jumpTo(environment.seminole, this._currentFlapsAction, 100);
    }
  }

  public _centerOfGravity(position: number): void {
    if(this._currentCgAction) {
      this._animationDriver.stop(environment.attachedMarkings, this._currentCgAction);
    }

    if(position == (0/4) * 100) {
      this._currentCgAction = 'cg0Action';
      this._animationDriver.jumpTo(environment.attachedMarkings, this._currentCgAction, 0);
    } else if(position == (1/4) * 100) {
      this._currentCgAction = 'cg1Action';
      this._animationDriver.jumpTo(environment.attachedMarkings, this._currentCgAction, 100);
    } else if(position == (2/4) * 100) {
      this._currentCgAction = 'cg2Action';
      this._animationDriver.jumpTo(environment.attachedMarkings, this._currentCgAction, 100);
    } else if(position == (3/4) * 100) {
      this._currentCgAction = 'cg3Action';
      this._animationDriver.jumpTo(environment.attachedMarkings, this._currentCgAction, 100);
    } else if(position == (4/4) * 100) {
      this._currentCgAction = 'cg4Action';
      this._animationDriver.jumpTo(environment.attachedMarkings, this._currentCgAction, 100);
    }
  }

  private _clearOrientation() {
    this._animationDriver.stop(environment.seminole, 'yawRightAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-yaw-action-right');
    this._animationDriver.stop(environment.seminole, 'yawLeftAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-yaw-action-left');
    this._animationDriver.stop(environment.seminole, 'rollRightAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-roll-action-right');
    this._animationDriver.stop(environment.seminole, 'rollLeftAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-roll-action-left');
  }

  private _clearRudder() {
    this._animationDriver.stop(environment.seminole, 'rudderRightAction');
    this._animationDriver.stop(environment.seminole, 'rudderLeftAction');
  }

}
