import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { SelectorComponent } from './selector/selector.component';
//import { ControlFactorsComponent } from './control-factors/control-factors.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ToggleComponent } from './toggle/toggle.component';
import { CardButtonComponent } from './card-button/card-button.component';
import { SelectableLabelComponent } from './selectable-label/selectable-label.component';
import { SelectorVerticalComponent } from './selector-vertical/selector-vertical.component';
import { RudderEffectivenessComponent } from './rudder-effectiveness/rudder-effectiveness.component';

@NgModule({
  declarations: [
    SelectorComponent,
    //ControlFactorsComponent,
    ToggleComponent,
    CardButtonComponent,
    SelectableLabelComponent,
    SelectorVerticalComponent,
    RudderEffectivenessComponent
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
    CardButtonComponent,
    SelectableLabelComponent,
    SelectorVerticalComponent,
    RudderEffectivenessComponent
  ]
})
export class OeiControlsModule { }
