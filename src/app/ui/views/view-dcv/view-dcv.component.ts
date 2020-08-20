import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { ModelDcv } from './model-dcv';
import { environment } from 'src/environments/environment';
import { AssetManager } from 'src/app/engine/core/AssetManager';
import { EventBus, Subject } from 'src/app/engine/core/events';
import { AnimationData } from 'src/app/engine/core/systems';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(private engineService: EngineService) { }

  onNotify() {

  }

  ngOnInit() {
    if(!environment.production) {
      AssetManager.get().print();
    }
  }

  ngAfterViewInit() {
    this.engineService.loadModel(environment.seminole);
    const propRPlay = new Subject()
    propRPlay.data = new AnimationData('propRAction', action => action.play());
    EventBus.get().publish('animation', propRPlay);
    EventBus.get().publish('gey', null);
  }

  ngOnDestroy() {
    this.engineService.dispose();
  }

}
