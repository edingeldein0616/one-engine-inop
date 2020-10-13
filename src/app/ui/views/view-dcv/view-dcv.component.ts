import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { Subscription } from 'rxjs';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { DCVAerodynamicsModel } from 'src/app/utils/aerodynamics-model';
import { RaycastController } from 'src/app/utils/raycast-controller';
import { EventBus, Listener, Subject } from 'src/app/engine/core/events';
import { ThreeEngineEvent } from 'src/app/utils/custom-events';
import { TextDictionary } from 'src/app/utils/text-dictionary';
import { Intersection } from 'three';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy, Listener {

  private _animationDriver: AnimationDriver;
  private _sam: SeminoleActionModel;
  private _aeroModel: DCVAerodynamicsModel;
  private _raycastController: RaycastController;
  private _rayClickListener = (event: MouseEvent) => { EventBus.get().publish(ThreeEngineEvent.MOUSECLICK, null)};
  private _rayMouseMoveListener = (event: MouseEvent) => { this._raycastController.onMouseMove(event); };

  public vmca: number;
  public stallSpeed: number;
  public content: string;

  private _currentFlapsAction: string;

  private _disposables: Subscription[] = [];

  constructor(private engineService: EngineService,
    private cdr: ChangeDetectorRef) { }



  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
    this._sam = new SeminoleActionModel();
    this._aeroModel = new DCVAerodynamicsModel();
    this._raycastController = new RaycastController();

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
      })
    ];

    EventBus.get().subscribe(ThreeEngineEvent.INTERSECT, this);
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    var gltf = this.engineService.loadMarkings(environment.markings, this._aeroModel);
    this._aeroModel.calculateMarkings(this._sam);
    this._sam.inopEngine.property = this._sam.inopEngine.property;
    this._raycastController = new RaycastController(...gltf.scene.children);
    window.addEventListener('mousemove', this._rayMouseMoveListener, false);
    window.addEventListener('click', this._rayClickListener, false);
    this.engineService.attachRaycaster(this._raycastController);
    this.cdr.detectChanges();
  }

  public valueChanged(data: SelectionData) {
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
  }

  public labelSelected(lookup: string) {
    this.content = this.lookupContent(lookup);
    this.cdr.detectChanges();
  }

  public controlTechnique(controlTechnique: string, inopEngine: string, idle: boolean) {
    this.clearOrientation();
    this.clearRudder();

    if(!idle) {
      this.rudder(controlTechnique, inopEngine);

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
      this._animationDriver.play(inopEngineAction);
    } else {
      this._animationDriver.stop(inopEngineAction);
    }

    if(idle) {
      this._animationDriver.play(otherEngineAction);
    } else {
      this._animationDriver.stop(otherEngineAction);
    }
  }

  public opEngine(inopEngine: string, idle: boolean) {
    const opEngineAction = inopEngine === 'RIGHT' ? 'propLSpinAction' : 'propRSpinAction';
    const opEngineSpin = inopEngine === 'RIGHT' ? 'propLeftSpin' : 'propRightSpin';
    const otherEngineAction = inopEngine === 'RIGHT' ? 'propRSpinAction' : 'propLSpinAction';
    const otherEngineSpin = inopEngine === 'RIGHT' ? 'propRightSpin' : 'propLeftSpin';
    this._animationDriver.stop(otherEngineAction);

    if(!idle) {
      this._animationDriver.play(opEngineAction);
      this.engineService.hideObject(opEngineSpin, false)
      this.engineService.hideObject(otherEngineSpin, true);
    } else {
      this.engineService.hideObject(opEngineSpin, true);
      this.engineService.hideObject(otherEngineSpin, true);
      this._animationDriver.stop(opEngineAction);
    }


  }

  public rudder(controlTechnique: string, inopEngine: string) {
    if(controlTechnique === 'WINGS LEVEL') {
      const rudderAction = inopEngine === 'LEFT' ? 'rudderRightAction' : 'rudderLeftAction';
      this._animationDriver.jumpTo(rudderAction, 100);
    } else {
      this._animationDriver.jumpTo('rudderLeftAction', 0);
    }
  }

  public clearOrientation() {
    this._animationDriver.stop('yawRightAction');
    this._animationDriver.stop('yawLeftAction');
    this._animationDriver.stop('rollRightAction');
    this._animationDriver.stop('rollLeftAction');
  }

  public clearRudder() {
    this._animationDriver.stop('rudderRightAction');
    this._animationDriver.stop('rudderLeftAction');
  }

  public wingsLevel(inopEngine: string) {
    const yawAction = inopEngine === 'LEFT' ? 'yawRightAction' : 'yawLeftAction';
    this._animationDriver.jumpTo(yawAction, 100);
  }

  public zeroSideSlip(inopEngine: string) {
    const rollAction = inopEngine === 'LEFT' ? 'rollRightAction' : 'rollLeftAction';
    this._animationDriver.jumpTo(rollAction, 100);
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
    return TextDictionary.getContent(lookup);
  }

  public ngOnDestroy() {
    window.removeEventListener('mousemove', this._rayMouseMoveListener, false);
    window.removeEventListener('click', this._rayClickListener, false);

    EventBus.get().unsubscribe(ThreeEngineEvent.INTERSECT, this);
    this.engineService.detachRaycaster();
    this.engineService.dispose();
    while(this._disposables.length > 0) {
      this._disposables.pop().unsubscribe();
    }
  }

}
