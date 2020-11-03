import { Component, OnInit } from '@angular/core';
import { ViewManagerService } from 'src/app/services/view-manager.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  constructor(public viewManagerService: ViewManagerService) { }

  ngOnInit() {
  }

}
