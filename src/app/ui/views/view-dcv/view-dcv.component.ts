import { environment } from 'src/environments/environment';

import { Component, ChangeDetectorRef } from '@angular/core';

import { Raycastable } from '../raycastable';

import { SelectionData } from 'src/app/ui/controls/selector/selection-data';

import { DCVAerodynamicsModel, StarterTitle} from 'src/app/utils';
import { InteractableModelViewComponent } from '../interactable-model-view.component';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent extends InteractableModelViewComponent {

  public vmca: number;
  public stallSpeed: number;
  public rudderEffectiveness: number;

  protected _aeroModel: DCVAerodynamicsModel;

  constructor(private ref: ChangeDetectorRef) { 
      super(); 
  
      this._aeroModel = new DCVAerodynamicsModel();
  }

  protected detectChange() {
    this.ref.detectChanges();
  }

  public ngAfterViewInit() {
    this.viewManagerService.setCurrentView('Directional Control and Vmca');

    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadAttachedMarkings(environment.attachedMarkings);

    var staticMarkings = this.engineService.loadMarkings(environment.dcvStaticMarkings, this._aeroModel);
    this.sendRootToRaycaster(...staticMarkings.scene.children);

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
}

