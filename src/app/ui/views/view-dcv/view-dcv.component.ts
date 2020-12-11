import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { Subscription } from 'rxjs';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { DCVAerodynamicsModel } from 'src/app/utils/aerodynamics-model';
import { EventBus, Listener, Subject } from 'src/app/engine/core/events';
import { ThreeEngineEvent } from 'src/app/utils/custom-events';
import { TextDictionary } from 'src/app/utils/text-dictionary';
import { Intersection, Object3D } from 'three';
import { ViewManagerService } from 'src/app/services/view-manager.service';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy, Listener {

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;
  private _aeroModel: DCVAerodynamicsModel;

  public vmca: number;
  public stallSpeed: number;
  public rudderEffectiveness: number;
  public content: string = `<h3>This section covers single-engine directional control and Vmca.</h3>
    <h3>Click on the "Data" and "Control Factors" text labels to read descriptive text here.<h3>
    <h3>Clicking on the arrows marking aerodynamic and control forces around the aircraft will display additional text here.</h3>`;

  private _currentFlapsAction: string;
  private _currentCgAction: string;

  private _disposables: Subscription[] = [];

  constructor(private engineService: EngineService,
    private cdr: ChangeDetectorRef,
    private vms: ViewManagerService) { }

  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
    this._aeroModel = new DCVAerodynamicsModel();
    this.vms.setCurrentView('Directional Control and Vmca');

    EventBus.get().subscribe(ThreeEngineEvent.INTERSECT, this);
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadAttachedMarkings(environment.attachedMarkings);

    var staticMarkings = this.engineService.loadMarkings(environment.dcvStaticMarkings, this._aeroModel);
    this._sendRootToRaycaster(...staticMarkings.scene.children);

    this._disposables = [

      this._sam.inopEngine.subject.subscribe(inopEngine => {
        const idle = this._sam.power.property < 1;
        this.propellers(this._sam.propeller.property, inopEngine, idle);
        this.opEngine(inopEngine, idle);
        this.controlTechnique(this._sam.controlTechnique.property, inopEngine, idle);
      }),

      this._sam.propeller.subject.subscribe(propeller => {
        const idle = this._sam.power.property < 1;
        this.propellers(propeller, this._sam.inopEngine.property, idle);
        this.opEngine(this._sam.inopEngine.property, idle);
      }),

      this._sam.controlTechnique.subject.subscribe(controlTechnique => {
        const idle = this._sam.power.property < 1;
        this.controlTechnique(controlTechnique, this._sam.inopEngine.property, idle);
      }),

      this._sam.flaps.subject.subscribe(flaps => {
        this.flaps(flaps);
      }),

      this._sam.gear.subject.subscribe(gear => {
        this.gear(gear === 'DOWN');
      }),

      this._sam.power.subject.subscribe(power => {
        const idle = power < 1;
        this.propellers(this._sam.propeller.property, this._sam.inopEngine.property, idle);
        this.opEngine(this._sam.inopEngine.property, idle);

        this.controlTechnique(this._sam.controlTechnique.property, this._sam.inopEngine.property, idle);
      }),

      this._sam.cog.subject.subscribe(cog => {
        this.centerOfGravity(cog);
      })
    ];

    this._aeroModel.calculateMarkings(this._sam);
    this._sam.inopEngine.property = this._sam.inopEngine.property;

    this.flaps(0);

    this.cdr.detectChanges();
  }

  public onValueChanged(data: SelectionData) {

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
      case 'POWER':
        this._sam.power.property = data.percent;
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
    this.vmca = this._aeroModel.vmca(this._sam);
    this.stallSpeed = this._aeroModel.stallSpeed(this._sam);
    this.rudderEffectiveness = (this._aeroModel.rudderEffectiveness(this._sam) / 23) * 100;
  }

  public labelSelected(lookup: string) {
    this.content = this.lookupContent(lookup);
    this.cdr.detectChanges();
  }

  public controlTechnique(controlTechnique: string, inopEngine: string, idle: boolean) {
    this.clearOrientation();
    if(!idle) {
      this.rudder(inopEngine);

      if(controlTechnique === 'WINGS LEVEL') {
        this.wingsLevel(inopEngine);
      } else {
        this.zeroSideSlip(inopEngine);
      }
    }

  }

  public propellers(propeller: string, inopEngine: string, idle: boolean) {
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

  public opEngine(inopEngine: string, idle: boolean) {
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

  public rudder(inopEngine: string) {
    this.clearRudder();
    const rudderAction = inopEngine === 'LEFT' ? 'rudderRightAction' : 'rudderLeftAction';
    this._animationDriver.jumpTo(environment.seminole, rudderAction, 100);
  }

  public clearOrientation() {

    this._animationDriver.stop(environment.seminole, 'yawRightAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-yaw-action-right');
    this._animationDriver.stop(environment.seminole, 'yawLeftAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-yaw-action-left');
    this._animationDriver.stop(environment.seminole, 'rollRightAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-roll-action-right');
    this._animationDriver.stop(environment.seminole, 'rollLeftAction');
    this._animationDriver.stop(environment.attachedMarkings, 'attached-roll-action-left');
  }

  public clearRudder() {
    this._animationDriver.stop(environment.seminole, 'rudderRightAction');
    this._animationDriver.stop(environment.seminole, 'rudderLeftAction');
  }

  public wingsLevel(inopEngine: string) {
    const yawAction = inopEngine === 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
    const attachedAction = inopEngine === 'LEFT' ? 'attached-yaw-action-right' : 'attached-yaw-action-left';
    this._animationDriver.jumpTo(environment.seminole, yawAction, 100);
    this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);
  }

  public zeroSideSlip(inopEngine: string) {
    const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
    const attachedAction = inopEngine === 'LEFT' ? 'attached-roll-action-right' : 'attached-roll-action-left';
    this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
    this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);
  }

  public gear(down: boolean): void {
    this._animationDriver.jumpTo(environment.seminole, 'GearAction', down ? 0 : 100);
  }

  public flaps(notch: number): void {

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

  public centerOfGravity(position: number): void {
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

  public receive(topic: string, subject: Subject) {
    switch(topic) {
      case ThreeEngineEvent.INTERSECT: {
        var firstIntersect = subject.data.shift() as Intersection;
        this.content = this.lookupContent(firstIntersect.object.name);
        this.cdr.detectChanges();
      }
    }
  }

  public lookupContent(lookup: string): string {
    const content = TextDictionary.getContent(lookup);
    if(content === undefined || content === '') {
      return this.content;
    }
    return TextDictionary.getContent(lookup);
  }

  private _sendRootToRaycaster(...root: Object3D[]) {
    const sub = new Subject();
    sub.data = root;
    EventBus.get().publish(ThreeEngineEvent.SENDROOTTORAYCASTER, sub);
  }

  public ngOnDestroy() {
    this.clearOrientation();
    this.clearRudder();
    this.flaps(0);

    EventBus.get().unsubscribe(ThreeEngineEvent.INTERSECT, this);
    this.engineService.dispose();
    while(this._disposables.length > 0) {
      this._disposables.pop().unsubscribe();
    }
    this._disposables = [];
  }

}
