import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.scss']
})
export class SelectorComponent {

  @Input() initialValue: number;
  @Input() toggleOptions: Array<string>;

  @Output() valueOutput = new EventEmitter<any>();

  constructor() { }

  valueChanged(item) {
    this.valueOutput.emit(item.value);
    console.log(`Value changed: ${item.value}`);
  }

}
