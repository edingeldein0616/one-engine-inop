import { Component, OnInit, OnDestroy } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';

@Component({
  selector: 'app-view-sep',
  templateUrl: './view-sep.component.html',
  styleUrls: ['./view-sep.component.scss']
})
export class ViewSepComponent implements OnInit, OnDestroy {

  constructor(private engineService: EngineService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

}
