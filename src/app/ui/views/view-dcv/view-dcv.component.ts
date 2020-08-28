import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { EngineService } from 'src/app/engine/engine.service';
import { environment } from 'src/environments/environment';
import { EventBus, Subject } from 'src/app/engine/core/events';
import { AnimationData } from 'src/app/engine/core/systems';
import { AnimationAction } from 'three';
import { AnimationDriver, AnimationPosition } from 'src/app/ui/views/AnimationDriver';
import { SelectionData } from '../../controls/selector/selection-data';

@Component({
  selector: 'app-view-dcv',
  templateUrl: './view-dcv.component.html',
  styleUrls: ['./view-dcv.component.scss']
})
export class ViewDcvComponent implements OnInit, AfterViewInit, OnDestroy {

  private _animationDriver: AnimationDriver;

  constructor(private engineService: EngineService) { }

  public ngOnInit() {
    this._animationDriver = new AnimationDriver();
  }

  public ngAfterViewInit() {
    this.engineService.loadModel(environment.seminole);
    this._animationDriver.play('propRAction');
    this._animationDriver.play('propLAction');
  }

  public valueChanged(data: SelectionData) {
    console.log(data);

    switch(data.label) {
      case 'LANDING GEAR':
        this.gear(data.value === 'DOWN');
      break;
    }
  }

  public gear(down: boolean): void {
    if(down) {
      this._animationDriver.jumpTo('GearAction', AnimationPosition.Beginning);
    } else {
      this._animationDriver.jumpTo('GearAction', AnimationPosition.End);
    }
  }

  public ngOnDestroy() {
    this.engineService.dispose();
  }

}
