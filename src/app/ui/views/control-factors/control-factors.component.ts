import { Component, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { DCVTitle, SEPTitle } from 'src/app/utils/static-text-data/content-titles';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';

export class ControlFactorsComponent {

  @Input() public disablePower: boolean;
  @Input() public title: string;

  @Output() public controlOutput = new EventEmitter<SelectionData>();
  @Output() public labelOutput = new EventEmitter<string>();

  constructor() { }

  public selected(eventData: any) {
    this.controlOutput.emit(eventData);
  }

  public labelSelected(content: string) {
    this.labelOutput.emit(content);
  }

}

@Component({
  selector: 'app-dcv-control-factors',
  templateUrl: './dcv-control-factors/dcv-control-factors.component.html',
  styleUrls: ['./dcv-control-factors/dcv-control-factors.component.scss'],
  providers: [{provide: ControlFactorsComponent, useExisting: forwardRef(() => DcvControlFactorsComponent)}]
})
export class DcvControlFactorsComponent extends ControlFactorsComponent {
  inopEngine = DCVTitle.InopEngine;
  stallSpeed = DCVTitle.StallSpeed;
  vmca = DCVTitle.VMCA;
  power = DCVTitle.Power;
  densityAltitude = DCVTitle.DensityAltitude;
  propeller = DCVTitle.Propeller;
  controlTechnique = DCVTitle.ControlTechnique;
  airspeed = DCVTitle.Airspeed;
  weight = DCVTitle.Weight;
  cog = DCVTitle.COG;
  flaps = DCVTitle.Flaps
  gear = DCVTitle.LandingGear;
}

@Component({
  selector: 'app-sep-control-factors',
  templateUrl: './sep-control-factors/sep-control-factors.component.html',
  styleUrls: ['./sep-control-factors/sep-control-factors.component.scss'],
  providers: [{provide: ControlFactorsComponent, useExisting: forwardRef(() => SepControlFactorsComponent)}]
})
export class SepControlFactorsComponent extends ControlFactorsComponent {
  
  
  inopEngine = SEPTitle.InopEngine;
  power = SEPTitle.Power;
  densityAltitude = SEPTitle.DensityAltitude;
  propeller = SEPTitle.Propeller;
  controlTechnique = SEPTitle.ControlTechnique;
  airspeed = SEPTitle.Airspeed;
  weight = SEPTitle.Weight;
  cog = SEPTitle.COG;
  flaps = SEPTitle.Flaps;
  gear = SEPTitle.LandingGear;
}
