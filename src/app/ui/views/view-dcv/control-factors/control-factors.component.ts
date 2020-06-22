import { Component, Input, OnInit } from '@angular/core';

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

}