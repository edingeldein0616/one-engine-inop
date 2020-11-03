import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-rudder-effectiveness',
  templateUrl: './rudder-effectiveness.component.html',
  styleUrls: ['./rudder-effectiveness.component.scss']
})
export class RudderEffectivenessComponent implements OnInit {

  @Output() labelSelected: EventEmitter<string> = new EventEmitter<string>();
  @Input() rudderEffectiveness: number;

  constructor() { }

  ngOnInit(): void {
  }

}
