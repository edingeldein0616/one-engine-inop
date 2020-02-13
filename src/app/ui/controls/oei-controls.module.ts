import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { SelectorComponent } from './selector/selector.component';
import { ControlFactorsComponent } from './control-factors/control-factors.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ToggleComponent } from './toggle/toggle.component';

@NgModule({
  declarations: [
    SelectorComponent,
    ControlFactorsComponent,
    ToggleComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    AppRoutingModule
  ],
  exports: [
    SelectorComponent,
    ControlFactorsComponent,
    ToggleComponent,
    MaterialModule
  ]
})
export class OeiControlsModule { }
