import { Component, OnInit, OnDestroy } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { LoaderService } from 'src/app/engine/loader.service';

@Component({
  selector: 'app-view-sep',
  templateUrl: './view-sep.component.html',
  styleUrls: ['./view-sep.component.scss']
})
export class ViewSepComponent implements OnInit, OnDestroy {

  constructor(private engineService: EngineService,
              private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.loadScene('view-sep');
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

}
