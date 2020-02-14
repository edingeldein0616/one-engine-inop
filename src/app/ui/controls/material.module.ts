import { NgModule } from '@angular/core';

import {
  MatToolbarModule,
  MatMenuModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatIconModule,
  MatCardModule
} from '@angular/material';

@NgModule({
  declarations: [],
  imports: [
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule
  ],
  exports: [
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatCardModule
  ]
})
export class MaterialModule { }
