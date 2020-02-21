import { Component, OnInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit {

  constructor(private engineService: EngineService) { }

  ngOnInit() {
  }

  killCube() {
    this.engineService.dispose();
  }

}
