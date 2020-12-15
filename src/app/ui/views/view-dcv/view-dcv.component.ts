import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Intersection, Object3D } from 'three';
import { Subscription } from 'rxjs';

import { environment } from 'src/environments/environment';

import { EngineService } from 'src/app/engine/engine.service';
import { EventBus, Listener, Subject } from 'src/app/engine/core/events';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { ViewManagerService } from 'src/app/services/view-manager.service';

import { Actions } from 'src/app/utils/animation-actions';
import { TextDictionary } from 'src/app/utils/text-dictionary';
import { ThreeEngineEvent } from 'src/app/utils/custom-events';
import { AnimationDriver } from 'src/app/utils/animation-driver';
import { SeminoleActionModel } from 'src/app/utils/seminole-action-model';
import { DCVAerodynamicsModel } from 'src/app/utils/aerodynamics-model';

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
        this._propellers(this._sam.propeller.property, inopEngine, idle);
        this._controlTechnique(this._sam.controlTechnique.property, inopEngine, idle);
      }),

      this._sam.propeller.subject.subscribe(propeller => {
        const idle = this._sam.power.property < 1;
        this._propellers(propeller, this._sam.inopEngine.property, idle);
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

      this._sam.power.subject.subscribe(power => {
        const idle = power < 1;
        this._propellers(this._sam.propeller.property, this._sam.inopEngine.property, idle);

        this._controlTechnique(this._sam.controlTechnique.property, this._sam.inopEngine.property, idle);
      }),

      this._sam.cog.subject.subscribe(cog => {
        this._centerOfGravity(cog);
      })
    ];

    this._aeroModel.calculateMarkings(this._sam);
    this._sam.inopEngine.property = this._sam.inopEngine.property;

    this._flaps(0);

    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
    this._clearOrientation();
    this._flaps(0);

    EventBus.get().unsubscribe(ThreeEngineEvent.INTERSECT, this);
    this.engineService.dispose();
    while(this._disposables.length > 0) {
      this._disposables.pop().unsubscribe();
    }
    this._disposables = [];
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
    this.content = this._lookupContent(lookup);
    this.cdr.detectChanges();
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

  private _propellers(propeller: string, inopEngine: string, idle: boolean) {
    this._animationDriver.play(environment.seminole, 'prop-left-action');
    this._animationDriver.play(environment.seminole, 'prop-right-cr-action');
    const inopPropAction = inopEngine === 'LEFT' ? 'prop-left-action' : 'prop-right-cr-action';
    const inopPropVis = inopEngine === 'LEFT' ? 'prop-left' : 'prop-right';
    const inopPropHide = inopEngine === 'LEFT' ? 'prop-right' : 'prop-left';
    const opPropVis = inopEngine === 'LEFT' ? 'operative-prop-right' : 'operative-prop-left';
    const opPropHide = inopEngine === 'LEFT' ? 'operative-prop-left' : 'operative-prop-right';

    if(!idle) {
      this.engineService.hideObject(inopPropVis, false);
      this.engineService.hideObject(inopPropHide, true);
      this.engineService.hideObject(opPropVis, false);
      this.engineService.hideObject(opPropHide, true);
    } else {
      this.engineService.hideObject('operative-prop-right', true);
      this.engineService.hideObject('operative-prop-left', true);
      this.engineService.hideObject('prop-right', false);
      this.engineService.hideObject('prop-left', false);
    }

    if(propeller === 'FEATHER') {
      this._animationDriver.stop(environment.seminole, inopPropAction);
    }
  }

  private _rudder(inopEngine: string) {
    const jumpToLocation = inopEngine === 'LEFT' ? 0 : 100;
    this._animationDriver.jumpTo(environment.seminole, 'rudder-action', jumpToLocation);
  }

  private _clearOrientation() {
    this._animationDriver.stop(environment.seminole, Actions.SeminoleYawRight);
    this._animationDriver.stop(environment.attachedMarkings, Actions.AttachedYawRight);
    this._animationDriver.stop(environment.seminole, Actions.SeminoleYawLeft);
    this._animationDriver.stop(environment.attachedMarkings, Actions.AttachedYawLeft);
    this._animationDriver.stop(environment.seminole, Actions.SeminoleRollRight);
    this._animationDriver.stop(environment.attachedMarkings, Actions.AttachedRollRight);
    this._animationDriver.stop(environment.seminole, Actions.SeminoleRollLeft);
    this._animationDriver.stop(environment.attachedMarkings, Actions.AttachedRollLeft);
  }

  private _wingsLevel(inopEngine: string) {
    const yawAction = inopEngine === 'LEFT' ? Actions.SeminoleYawRight : Actions.SeminoleYawLeft;
    const attachedAction = inopEngine === 'LEFT' ? Actions.AttachedYawRight : Actions.AttachedYawLeft;
    this._animationDriver.jumpTo(environment.seminole, yawAction, 100);
    this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);
  }

  private _zeroSideSlip(inopEngine: string) {
    const rollAction = inopEngine === 'LEFT' ? Actions.SeminoleRollRight : Actions.SeminoleRollLeft;
    const attachedAction = inopEngine === 'LEFT' ? Actions.AttachedRollRight : Actions.AttachedRollLeft;
    this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
    this._animationDriver.jumpTo(environment.attachedMarkings, attachedAction, 100);
  }

  private _gear(down: boolean): void {
    this._animationDriver.jumpTo(environment.seminole, 'gear-action', down ? 0 : 100);
  }

  private _flaps(notch: number): void {
    const flapsAction = 'flaps-action';

    if(notch == (0/3) * 100) {
      this._animationDriver.jumpTo(environment.seminole, flapsAction, 0);
    } else if(notch == (1/3) * 100) {
      this._animationDriver.jumpTo(environment.seminole, flapsAction, 33);
    } else if(notch == (2/3) * 100) {
      this._animationDriver.jumpTo(environment.seminole, flapsAction, 66);
    } else if(notch == (3/3) * 100) {
      this._animationDriver.jumpTo(environment.seminole, flapsAction, 100);
    }
  }

  private _centerOfGravity(position: number): void {
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
        this.content = this._lookupContent(firstIntersect.object.name);
        this.cdr.detectChanges();
      }
    }
  }

  private _lookupContent(lookup: string): string {
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
}

