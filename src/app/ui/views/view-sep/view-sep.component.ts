import { Component, ChangeDetectorRef } from '@angular/core';

import { environment } from 'src/environments/environment';

import { SelectionData } from 'src/app/ui/controls/selector/selection-data';

import { InteractableModelViewComponent } from '../interactable-model-view.component';
import { SEPAerodynamicsModel, StarterTitle } from 'src/app/utils';

@Component({
  selector: 'app-view-sep',
  templateUrl: './view-sep.component.html',
  styleUrls: ['./view-sep.component.scss']
})
export class ViewSepComponent extends InteractableModelViewComponent {

  public vyse: number = 21;
  public roc: number;
  public excessThp: number = 170;
  public serviceCeiling: string;
  public absoluteCeiling: string;

  protected _aeroModel: SEPAerodynamicsModel;

  constructor(private cdr: ChangeDetectorRef) {
    super();

    this._aeroModel = new SEPAerodynamicsModel();
  }

  protected detectChange() { this.cdr.detectChanges(); }

  public ngAfterViewInit() {
    this.viewManagerService.setCurrentView('Single Engine Performance');

    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadAttachedMarkings(environment.attachedMarkings);

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

      this._seminoleActionModel.cog.subject.subscribe(cog => {
        this._cog(cog);
      })
    ];

    var staticMarkings = this.engineService.loadMarkings(environment.sepStaticMarkings, this._aeroModel);
    this.sendRootToRaycaster(...staticMarkings.scene.children);

    this._seminoleActionModel.inopEngine.property = this._seminoleActionModel.inopEngine.property;
    this._seminoleActionModel.power.property = 100;
    this._aeroModel.calculateMarkings(this._seminoleActionModel);

    this._flaps(0);

    this.onLabelSelected(StarterTitle.SEP);
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
    this.roc = this._aeroModel.roc(this._seminoleActionModel);
    this.excessThp = this._aeroModel.excessTHP(this.roc);
    this.serviceCeiling = this._aeroModel.serviceCeiling(this._seminoleActionModel);
    this.absoluteCeiling = this._aeroModel.absoluteCeiling(this.serviceCeiling);
  }

}
