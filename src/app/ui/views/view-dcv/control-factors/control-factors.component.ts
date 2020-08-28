import { Component, Input, OnInit, Output } from '@angular/core';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { EventBus, Subject } from 'src/app/engine/core/events';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-control-factors',
  templateUrl: './control-factors.component.html',
  styleUrls: ['./control-factors.component.scss']
})
export class ControlFactorsComponent implements OnInit {

  @Input() disablePower: boolean;
  @Input() title: string;

  @Output() controlOutput = new EventEmitter<SelectionData>();

  constructor() { }

  ngOnInit() {
  }

  public selected(eventData: any) {
    this.controlOutput.emit(eventData);
  }

}
