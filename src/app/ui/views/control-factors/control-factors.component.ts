import { Component, Input, Output, forwardRef } from '@angular/core';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { EventBus, Subject } from 'src/app/engine/core/events';
import { EventEmitter } from '@angular/core';

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
export class DcvControlFactorsComponent extends ControlFactorsComponent {}

@Component({
  selector: 'app-sep-control-factors',
  templateUrl: './sep-control-factors/sep-control-factors.component.html',
  styleUrls: ['./sep-control-factors/sep-control-factors.component.scss'],
  providers: [{provide: ControlFactorsComponent, useExisting: forwardRef(() => SepControlFactorsComponent)}]
})
export class SepControlFactorsComponent extends ControlFactorsComponent {}
