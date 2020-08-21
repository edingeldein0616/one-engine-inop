import { Component, Input, OnInit } from '@angular/core';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { EventBus, Subject } from 'src/app/engine/core/events';
import { AnimationData } from 'src/app/engine/core/systems';

@Component({
  selector: 'app-control-factors',
  templateUrl: './control-factors.component.html',
  styleUrls: ['./control-factors.component.scss']
})
export class ControlFactorsComponent implements OnInit {

  @Input() disablePower: boolean;
  @Input() title: string;

  constructor() { }

  ngOnInit() {
  }

  public selected(eventData: any) {
    var subject = new Subject();
    subject.data = eventData as SelectionData;
    // console.log(`{ label: ${selection.label}, value: ${selection.value}, percent: ${selection.percent} }`);
    // EventBus.get().publish(subject.data.label, subject);
  }

}
