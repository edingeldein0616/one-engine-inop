import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { ModelDcv } from './model-dcv';
import { environment } from 'src/environments/environment';
import { AssetManager } from 'src/app/engine/core/AssetManager';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  private _model: ModelDcv;

  constructor(private engineService: EngineService) { }

  onNotify() {

  }

  ngOnInit() {
    if(!environment.production) {
      AssetManager.get().print();
    }
  }

  ngAfterViewInit() {
    this.engineService.loadModel(environment.assetUrl, environment.seminole);
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

}
