import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { SelectorComponent } from './selector/selector.component';
//import { ControlFactorsComponent } from './control-factors/control-factors.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ToggleComponent } from './toggle/toggle.component';
import { CardButtonComponent } from './card-button/card-button.component';

@NgModule({
  declarations: [
    SelectorComponent,
    //ControlFactorsComponent,
    ToggleComponent,
    CardButtonComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule
  ],
  exports: [
    SelectorComponent,
    //ControlFactorsComponent,
    ToggleComponent,
    MaterialModule,
    CardButtonComponent
  ]
})
export class OeiControlsModule { }
