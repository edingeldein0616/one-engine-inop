import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { SelectorComponent } from './selector/selector.component';
import { ControlFactorsComponent } from './control-factors/control-factors.component';

@NgModule({
  declarations: [
    NavBarComponent,
    SelectorComponent,
    ControlFactorsComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  exports: [
    NavBarComponent,
    SelectorComponent,
    ControlFactorsComponent
  ]
})
export class OeiControlsModule { }
