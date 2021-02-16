import { environment } from 'src/environments/environment';
import { ChangeDetectorRef, Component } from '@angular/core';

import { ZeroSideslip } from 'src/app/utils/animation/markings';
import { SeminoleAnimationAction } from 'src/app/utils/animation';
import { StarterTitle, ZSTTitle } from 'src/app/utils/static-text-data';

import { SelectionData } from 'src/app/ui/controls/selector/selection-data';
import { ModelViewComponent } from '../model-view.component';
import { MatDialog } from '@angular/material';
import { ExerciseDialogComponent } from '../exercise-dialog/exercise-dialog.component';

@Component({
  selector: 'app-view-zst',
  templateUrl: './view-zst.component.html',
  styleUrls: ['./view-zst.component.scss']
})
export class ViewZstComponent extends ModelViewComponent {
  
  protected _aeroModel = null;
  private _zeroSideslip: ZeroSideslip;
  
  public inclinometerImages = [
    environment.assetUrl + 'inclinometerLeft.png',
    environment.assetUrl + 'inclinometerCenter.png',
    environment.assetUrl + 'inclinometerRight.png'
  ];
  public image = this.inclinometerImages[1];
  
  private _loading: boolean = true;
  
  constructor(private ref: ChangeDetectorRef, public dialog: MatDialog) { super(); }

  public ngAfterViewInit() {
    this.viewManagerService.setCurrentView('Zero Sideslip Technique');
    
    this._engineService.loadSeminole(environment.seminole);
    this._engineService.loadWindPlane(environment.windplane);
    this._engineService.loadMarkings(environment.zerosideslipMarkings);

    this._zeroSideslip = new ZeroSideslip(this._engineService, this._animationDriver);
    this._zeroSideslip.hide();

    this._disposables = [
      this._seminoleActionModel.inopEngine.subject.subscribe(inopEngine => {
        var controlTechnique = this._seminoleActionModel.controlTechnique.property;

        this._propellers('WINDMILL', inopEngine, false);
       
        this._rudder(inopEngine);
       
        this._controlTechnique(controlTechnique, inopEngine, false);
        this._zstControlTechnique(inopEngine, controlTechnique);
       
        this._zeroSideslip.animate(inopEngine, controlTechnique);
       
        this._setImage(inopEngine, controlTechnique);

        const contentLookup = inopEngine === 'LEFT' ? this.inopEngineLeft : this.inopEngineRight;
       
        if(!this._loading) this.onLabelSelected(contentLookup);

      }),
      this._seminoleActionModel.controlTechnique.subject.subscribe(controlTechnique => {
        var inopEngine = this._seminoleActionModel.inopEngine.property;

        this._controlTechnique(controlTechnique, inopEngine, false);
        this._zstControlTechnique(inopEngine, controlTechnique);
        
        this._zeroSideslip.animate(inopEngine, controlTechnique);

        this._setImage(inopEngine, controlTechnique);

        console.log(controlTechnique);
        const contentLookup = controlTechnique === 'WINGS LEVEL' ? this.wingsLevel : this.zeroSideslip;
        
        this.onLabelSelected(contentLookup);

      })
    ];

    this._animationDriver.play(environment.windplane, 'windplane-action');
    this._gear(false);
    this._flaps(0);

    this._loading = false;

    this.onLabelSelected(StarterTitle.ZST);

    this.ref.detectChanges();
  }

  protected _dispose() {}

  private _zstControlTechnique(inopEngine: string, controlTechnique: string) {
    this._animationDriver.stop(environment.zerosideslipMarkings, SeminoleAnimationAction.ZerosideslipYaw);

    if(controlTechnique === 'WINGS LEVEL') {
      const zerosideslipYaw = inopEngine === 'LEFT' ? 100 : 0;
      this._animationDriver.jumpTo(environment.zerosideslipMarkings, SeminoleAnimationAction.ZerosideslipYaw, zerosideslipYaw);
    } else {
      this._animationDriver.jumpTo(environment.zerosideslipMarkings, SeminoleAnimationAction.ZerosideslipYaw, 50);
    }
  }

  private _setImage(inopEngine: string, controlTechnique: string) {
    if(controlTechnique === 'ZERO SIDESLIP') {
      this.image = inopEngine === 'LEFT' ? this.inclinometerImages[2] : this.inclinometerImages[0];;
    } else {
      this.image = this.inclinometerImages[1];
    }
  }
  
  public onValueChanged(data: SelectionData) {
    
    if(this._zeroSideslip) this._zeroSideslip.hide();

    switch (data.label) {
      case 'INOP. ENGINE':
        this._seminoleActionModel.inopEngine.property = data.value;
      break;
      case 'CONTROL TECHNIQUE':
        this._seminoleActionModel.controlTechnique.property = data.value;
      break
    }
  }

  public openExercise(): void {
    this._engineService.pause(true);
    const dialogRef = this.dialog.open(ExerciseDialogComponent, {
      width: '100vh',
      height: '90vh',
      panelClass: 'app-dialog'
    });

    dialogRef.afterClosed().subscribe(_ => {
      this._engineService.pause(false);
    });
  }

  public inopEngineLeft = ZSTTitle.InopEngineLeft;
  public inopEngineRight = ZSTTitle.InopEngineRight;
  public wingsLevel = ZSTTitle.WingsLevel;
  public zeroSideslip = ZSTTitle.ZeroSideslip;
  public inclinometer = ZSTTitle.Inclinometer;
  public controlTechnique = ZSTTitle.ControlTechnique;

}
