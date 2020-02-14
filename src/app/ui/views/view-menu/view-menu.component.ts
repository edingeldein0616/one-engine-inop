import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss']
})
export class ViewMenuComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  onClick() {
    console.log('sup homie.');
  }

}
