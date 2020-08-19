import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { AssetManager } from 'src/app/engine/core/AssetManager';

@Component({
  selector: 'app-view-zst',
  templateUrl: './view-zst.component.html',
  styleUrls: ['./view-zst.component.scss']
})
export class ViewZstComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService) { }

  ngOnInit() {
    if(!environment.production) {
      AssetManager.get().print();
    }
  }

  ngAfterViewInit() {
    this.engineService.loadModel(environment.seminole);
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }
}
