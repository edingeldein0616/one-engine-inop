import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { SelectionData } from './selection-data';
import { MatButtonToggle } from '@angular/material';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class SelectorComponent implements AfterViewInit {

  @Input() label: string;
  @Input() initialValue: number;
  @Input() toggleOptions: Array<string>;
  @Input() useValue: boolean;
  @Input() disableGroup = false;

  @Output() valueOutput = new EventEmitter<SelectionData>();

  @ViewChild('selector') selector: ElementRef<MatButtonToggle>;

  private _currentSelection: SelectionData;

  constructor() { }

  valueChanged(item) {
    const i: number = item.value;
    const v: string = this.useValue
      ? this.toggleOptions[i]
      : null;
    const p: number = (i / (this.toggleOptions.length - 1)) * 100;

    const data: SelectionData = { label: this.label, value: v, percent: p};
    this.valueOutput.emit(data);
  }

  ngAfterViewInit() {
    this.valueChanged({ value: this.initialValue });
  }

}
