import { Component, OnInit } from '@angular/core';
import { ViewManagerService } from 'src/app/services/view-manager.service';

@Component({
  selector: 'app-view-menu',
  templateUrl: './view-menu.component.html',
  styleUrls: ['./view-menu.component.scss']
})
export class ViewMenuComponent implements OnInit {

  constructor(private vms: ViewManagerService) { }

  ngOnInit() {
    this.vms.setCurrentView('');
  }

}
