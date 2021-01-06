import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { EngineService } from 'src/app/engine/engine.service';
import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { ViewManagerService } from 'src/app/services/view-manager.service';

import { environment } from 'src/environments/environment';
import { AnimationDriver, ActionPair, TextDictionary, SeminoleActionModel, AnimationActions, ZerosideslipPair } from 'src/app/utils';

@Component({
  selector: 'app-view-zst',
  templateUrl: './view-zst.component.html',
  styleUrls: ['./view-zst.component.scss']
})
export class ViewZstComponent implements OnInit, AfterViewInit, OnDestroy {

  public inclinometerImages = [
    environment.assetUrl + 'inclinometerLeft.png',
    environment.assetUrl + 'inclinometerCenter.png',
    environment.assetUrl + 'inclinometerRight.png'
  ];
  public image = this.inclinometerImages[1];

  public content = `<h3>This section Covers zero sideslip control technique.</h3>`

  private _sam: SeminoleActionModel;
  private _animationDriver: AnimationDriver;
  private _disposables: Subscription[];
  private _loading: boolean = true;

  constructor(private engineService: EngineService,
    private vms: ViewManagerService) { }

  public ngOnInit() {
    this._sam = new SeminoleActionModel();
    this._animationDriver = new AnimationDriver();
    this.vms.setCurrentView('Zero Sideslip Technique');
  }

  public ngAfterViewInit() {
    this.engineService.loadSeminole(environment.seminole);
    this.engineService.loadWindPlane(environment.windplane);
    this.engineService.loadMarkings(environment.zerosideslipMarkings);

    this._disposables = [
      this._sam.inopEngine.subject.subscribe(inopEngine => {
        var controlTechnique = this._sam.controlTechnique.property;

        this.propellers(inopEngine)
        this.rudder(inopEngine);
        this.controlTechnique(inopEngine, controlTechnique);
        this.markings(inopEngine, controlTechnique);
        this.setImage(inopEngine, controlTechnique);

        const contentLookup = inopEngine === 'LEFT' ? 'zst-inopEngine-left' : 'zst-inopEngine-right';
        if(!this._loading) this.content = TextDictionary.getContent(contentLookup);
      }),
      this._sam.controlTechnique.subject.subscribe(controlTechnique => {
        var inopEngine = this._sam.inopEngine.property;

        this.controlTechnique(inopEngine, controlTechnique);
        this.markings(inopEngine, controlTechnique);
        this.setImage(inopEngine, controlTechnique);

        const contentLookup = controlTechnique === 'WINGS LEVEL' ? 'zst-wingsLevel' : 'zst-zeroSideslip';
        if(!this._loading) this.content = TextDictionary.getContent(contentLookup);
      })
    ];

    this._animationDriver.play(environment.windplane, 'windplane-action');
    this.gear();

    this._loading = false;
  }

  public ngOnDestroy() {
    this.engineService.dispose();
    this._disposables.forEach(disp => disp.unsubscribe());
  }

  public onValueSelected(data: SelectionData) {
    switch (data.label) {
      case 'INOP. ENGINE':
        this._sam.inopEngine.property = data.value;
      break;
      case 'CONTROL TECHNIQUE':
        this._sam.controlTechnique.property = data.value;
      break
    }
  }

  public lookupContent(lookup: string) {
    this.content = TextDictionary.getContent(lookup);
  }

  private propellers(inopEngine: string) {
    this._animationDriver.play(environment.seminole, AnimationActions.PropRightCr);
    this._animationDriver.play(environment.seminole, AnimationActions.PropLeft);

    const inopPropVis = inopEngine === 'LEFT' ? 'prop-left' : 'prop-right';
    const inopPropHide = inopEngine === 'LEFT' ? 'prop-right' : 'prop-left';
    const opPropVis = inopEngine === 'LEFT' ? 'operative-prop-right' : 'operative-prop-left';
    const opPropHide = inopEngine === 'LEFT' ? 'operative-prop-left' : 'operative-prop-right';

    this.engineService.hideObject(inopPropVis, false);
    this.engineService.hideObject(inopPropHide, true);
    this.engineService.hideObject(opPropVis, false);
    this.engineService.hideObject(opPropHide, true);

  }

  private controlTechnique(inopEngine: string, controlTechnique: string) {
    this.clearOrientation();
    if(controlTechnique === 'WINGS LEVEL') {
      const seminoleYawAction = inopEngine === 'LEFT' ? AnimationActions.SeminoleYawRight : AnimationActions.SeminoleYawLeft;
      const zerosideslipYaw = inopEngine === 'LEFT' ? 100 : 0;
      this._animationDriver.jumpTo(environment.seminole, seminoleYawAction, 100);
      this._animationDriver.jumpTo(environment.zerosideslipMarkings, AnimationActions.ZerosideslipYaw, zerosideslipYaw);
    } else {
      this._animationDriver.jumpTo(environment.zerosideslipMarkings, AnimationActions.ZerosideslipYaw, 50);
      const rollAction = inopEngine === 'LEFT' ? AnimationActions.SeminoleRollRight : AnimationActions.SeminoleRollLeft;
      this._animationDriver.jumpTo(environment.seminole, rollAction, 100);
    }
  }

  private markings(inopEngine: string, controlTechnique: string) {
    this.hideZerosideslip();

    let direction: ActionPair = ZerosideslipPair.directionForward;
    let prop: ActionPair;
    let rudder: ActionPair;
    let slide: ActionPair;

    if(inopEngine === 'LEFT') {
      prop = ZerosideslipPair.propRight;
      rudder = ZerosideslipPair.rudderLeft;
      slide = ZerosideslipPair.slideRight;
    } else {
      prop = ZerosideslipPair.propLeft;
      rudder = ZerosideslipPair.rudderRight;
      slide = ZerosideslipPair.slideLeft;
    }

    this.engineService.hideObject(direction.obj, false);
    this.engineService.hideObject(prop.obj, false);
    this.engineService.hideObject(rudder.obj, false);
    this._animationDriver.play(environment.zerosideslipMarkings, direction.action);
    this._animationDriver.play(environment.zerosideslipMarkings, prop.action);
    this._animationDriver.play(environment.zerosideslipMarkings, rudder.action);

    if(controlTechnique !== 'WINGS LEVEL') {
      this.engineService.hideObject(slide.obj, false);
      this._animationDriver.play(environment.zerosideslipMarkings, slide.action);
    }
  }

  private rudder(inopEngine: string) {
    const rudderAction = inopEngine === 'LEFT' ? 100 : 0;
    this._animationDriver.jumpTo(environment.seminole, AnimationActions.Rudder, rudderAction);
  }

  public clearOrientation() {
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleYawRight);
    //this._animationDriver.stop(environment.zerosideslipMarkings, AnimationActions.ZerosideslipYaw);
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleYawLeft);
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleRollRight);
    this._animationDriver.stop(environment.seminole, AnimationActions.SeminoleRollLeft);
  }

  private gear() {
    this._animationDriver.jumpTo(environment.seminole, AnimationActions.Gear, 100);
  }

  private setImage(inopEngine: string, controlTechnique: string) {
    if(controlTechnique === 'ZERO SIDESLIP') {
      this.image = inopEngine === 'LEFT' ? this.inclinometerImages[2] : this.inclinometerImages[0];;
    } else {
      this.image = this.inclinometerImages[1];
    }
  }

  private hideZerosideslip() {
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.directionForward.action);
    this.engineService.hideObject(ZerosideslipPair.directionForward.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.propLeft.action);
    this.engineService.hideObject(ZerosideslipPair.propLeft.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.propRight.action);
    this.engineService.hideObject(ZerosideslipPair.propRight.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.rudderRight.action);
    this.engineService.hideObject(ZerosideslipPair.rudderRight.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.rudderLeft.action);
    this.engineService.hideObject(ZerosideslipPair.rudderLeft.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.slideRight.action);
    this.engineService.hideObject(ZerosideslipPair.slideRight.obj, true);
    this._animationDriver.stop(environment.zerosideslipMarkings, ZerosideslipPair.slideLeft.action);
    this.engineService.hideObject(ZerosideslipPair.slideLeft.obj, true);
  }
}
