import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { LoaderService } from 'src/app/engine/loader.service';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService,
              private loaderService: LoaderService) { }

  ngOnInit() {
    this.loaderService.loadScene('view-dcv');
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

}
