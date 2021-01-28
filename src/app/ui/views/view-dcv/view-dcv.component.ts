import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Intersection, Object3D } from 'three';
import { Subscription } from 'rxjs';

import { ModelDisplayViewComponent } from '../model-display-view.component';

import { environment } from 'src/environments/environment';

import { EngineService } from 'src/app/engine/engine.service';
import { EventBus, Listener, Subject } from 'src/app/engine/core/events';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { ViewManagerService } from 'src/app/services/view-manager.service';

import { AnimationActions, ThreeEngineEvent, AnimationDriver, SeminoleActionModel, DCVAerodynamicsModel, Parts, StarterTitle} from 'src/app/utils';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent extends ModelDisplayViewComponent {

  public vmca: number;
  public stallSpeed: number;
  public rudderEffectiveness: number;

  private _disposables: Subscription[] = [];

  constructor( private cdr: ChangeDetectorRef,private vms: ViewManagerService) { super(); }

  public ngOnInit() {
    this.vms.setCurrentView('Directional Control and Vmca');
    EventBus.get().subscribe(ThreeEngineEvent.INTERSECT, this);
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadAttachedMarkings(environment.attachedMarkings);

    var staticMarkings = this.engineService.loadMarkings(environment.dcvStaticMarkings, this._aeroModel);
    this._sendRootToRaycaster(...staticMarkings.scene.children);

    this._disposables = [

      this._seminoleActionModel.inopEngine.subject.subscribe(inopEngine => {
        const idle = this._seminoleActionModel.power.property < 1;
        this._propellers(this._seminoleActionModel.propeller.property, inopEngine, idle);
        this._controlTechnique(this._seminoleActionModel.controlTechnique.property, inopEngine, idle);
      }),

      this._seminoleActionModel.propeller.subject.subscribe(propeller => {
        const idle = this._seminoleActionModel.power.property < 1;
        this._propellers(propeller, this._seminoleActionModel.inopEngine.property, idle);
      }),

      this._seminoleActionModel.controlTechnique.subject.subscribe(controlTechnique => {
        const idle = this._seminoleActionModel.power.property < 1;
        this._controlTechnique(controlTechnique, this._seminoleActionModel.inopEngine.property, idle);
      }),

      this._seminoleActionModel.flaps.subject.subscribe(flaps => {
        this._flaps(flaps);
      }),

      this._seminoleActionModel.gear.subject.subscribe(gear => {
        this._gear(gear === 'DOWN');
      }),

      this._seminoleActionModel.power.subject.subscribe(power => {
        const idle = power < 1;
        this._propellers(this._seminoleActionModel.propeller.property, this._seminoleActionModel.inopEngine.property, idle);

        this._controlTechnique(this._seminoleActionModel.controlTechnique.property, this._seminoleActionModel.inopEngine.property, idle);
      }),

      this._seminoleActionModel.cog.subject.subscribe(cog => {
        this._cog(cog);
      })
    ];

    this._aeroModel.calculateMarkings(this._seminoleActionModel);
    this._seminoleActionModel.inopEngine.property = this._seminoleActionModel.inopEngine.property;

    this._flaps(0);

    this.onLabelSelected(StarterTitle.DCV);

    this.cdr.detectChanges();
  }

  public ngOnDestroy() {
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
        this._seminoleActionModel.inopEngine.property = data.value;
      break;
      case 'FLAPS':
        this._seminoleActionModel.flaps.property = Number(data.percent);
      break;
      case 'LANDING GEAR':
        this._seminoleActionModel.gear.property = data.value;
      break;
      case 'CONTROL TECHNIQUE':
        this._seminoleActionModel.controlTechnique.property = data.value;
      break;
      case 'PROPELLER':
        this._seminoleActionModel.propeller.property = data.value;
      break;
      case 'POWER':
        this._seminoleActionModel.power.property = data.percent;
      break;
      case 'AIRSPEED':
        this._seminoleActionModel.airspeed.property = data.percent;
      break;
      case 'WEIGHT':
        this._seminoleActionModel.weight.property = data.percent;
      break;
      case 'CENTER OF GRAVITY':
        this._seminoleActionModel.cog.property = data.percent;
      break;
      case 'DENSITY ALTITUDE':
        this._seminoleActionModel.densityAltitude.property = data.percent;
      break;
    }

    this._aeroModel.calculateMarkings(this._seminoleActionModel);
    this.vmca = this._aeroModel.vmca(this._seminoleActionModel);
    this.stallSpeed = this._aeroModel.stallSpeed(this._seminoleActionModel);
    this.rudderEffectiveness = (this._aeroModel.rudderEffectiveness(this._seminoleActionModel) / 23) * 100;
  }

  public receive(topic: string, subject: Subject) {
    switch(topic) {
      case ThreeEngineEvent.INTERSECT: {
        var firstIntersect = subject.data.shift() as Intersection;
        this.onLabelSelected(firstIntersect.object.name);
        this.cdr.detectChanges();
      }
    }
  }

  private _sendRootToRaycaster(...root: Object3D[]) {
    const sub = new Subject();
    sub.data = root;
    EventBus.get().publish(ThreeEngineEvent.SENDROOTTORAYCASTER, sub);
  }
}

