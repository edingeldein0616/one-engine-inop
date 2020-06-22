import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { AssetManager } from 'src/app/engine/core/AssetManager';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-cef',
  templateUrl: './view-cef.component.html',
  styleUrls: ['./view-cef.component.scss']
})
export class ViewCefComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService) { }

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
