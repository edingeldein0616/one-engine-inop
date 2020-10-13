import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selectable-label',
  templateUrl: './selectable-label.component.html',
  styleUrls: ['./selectable-label.component.scss']
})
export class SelectableLabelComponent implements OnInit {

  @Input() label: string;
  @Input() lookupValue: string;
  @Input() size: string;
  @Output() contentClicked: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  public onClick() {
    this.contentClicked.emit(this.lookupValue);
  }

  ngOnInit(): void {
  }

}
